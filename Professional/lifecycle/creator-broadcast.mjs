// Regtest-only submission state machine. Transport is explicitly injected;
// the HTTP CLI never supplies a broadcast transport in this implementation step.
import {randomUUID} from 'node:crypto';
import {digest,finalizeCreation} from './public-model.mjs';
import {assertRegtest,confirmedOutpoints} from './coordinator.mjs';
import {PlanRequestError} from './creator-plan-store.mjs';
const fail=(m,s=409)=>{throw new PlanRequestError(m,s);};
const missing=e=>e?.code===-5||e?.rpcCode===-5;
export class CreatorBroadcast {
 constructor(preflight,{rpc=null,enabled=false,clock=()=>Date.now()}={}){
  this.preflight=preflight;this.sessions=preflight.sessions;this.db=preflight.db;this.enabled=enabled===true;this.clock=clock;
  const allowed=new Set(['getblockchaininfo','getblockhash','getbestblockhash','getblockheader','getrawtransaction','gettxout','getmempoolentry','gettxspendingprevout','testmempoolaccept','sendrawtransaction']);
  this.rpc=async(m,p=[])=>{if(!allowed.has(m)||typeof rpc!=='function')throw Error('Explicit regtest broadcast adapter unavailable');return rpc(m,p);};
  this.db.exec('CREATE TABLE IF NOT EXISTS creator_submission_events (sequence INTEGER PRIMARY KEY, submission_id TEXT NOT NULL, status TEXT NOT NULL, phase TEXT NOT NULL, evidence TEXT NOT NULL)');
  this.db.exec('CREATE TABLE IF NOT EXISTS creator_submissions (id TEXT PRIMARY KEY, session_id TEXT UNIQUE NOT NULL, txid TEXT UNIQUE NOT NULL, authorization_id TEXT UNIQUE NOT NULL, binding TEXT NOT NULL, preflight_id TEXT NOT NULL, expires INTEGER NOT NULL, consumed INTEGER NOT NULL, attempted INTEGER NOT NULL, phase TEXT NOT NULL, status TEXT NOT NULL, evidence TEXT)');
 }
 context(body,extras=[]){
  if(!this.enabled)fail('Broadcast workflow disabled by operator.',403);
  const keys=['sessionId','transactionId','requestDigest','receiptDigest','authorizationId','preflightId',...extras];
  if(!body||Object.keys(body).sort().join(',')!==keys.sort().join(',')||typeof body.authorizationId!=='string'||! /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(body.authorizationId))fail('Exact broadcast request required.',400);
  const c=this.sessions.artifactContext(body.sessionId);
  if(body.transactionId!==c.receipt.txid||body.requestDigest!==c.receipt.requestDigest||body.receiptDigest!==digest(c.receipt))fail('Broadcast transaction/receipt mismatch.');
  return c;
 }
 binding(c,body){return digest({intent:this.preflight.binding(c),preflightId:body.preflightId});}
 authorize(body){
  const c=this.context(body,['explicitBroadcastApproval']);
  const expected=digest({transactionId:body.transactionId,requestDigest:body.requestDigest,receiptDigest:body.receiptDigest,preflightId:body.preflightId});
  if(body.explicitBroadcastApproval!==expected)fail('Separate explicit broadcast authorization required.',400);
  const pf=this.db.prepare('SELECT * FROM creator_preflights WHERE id=?').get(body.preflightId);
  if(!pf||pf.session_id!==body.sessionId||pf.state!=='ACCEPTED'||pf.binding!==this.preflight.binding(c))fail('Matching successful preflight required.');
  const r=JSON.parse(pf.result);if(r.transactionId!==body.transactionId||r.coreResponse?.[0]?.allowed!==true||this.clock()-r.recordedAt>600000||r.recordedAt>this.clock())fail('Successful preflight is stale or invalid.');
  this.sessions.recoverArtifact(body.sessionId);
  this.db.exec('BEGIN IMMEDIATE');
  try{
   if(this.db.prepare('SELECT id FROM creator_submissions WHERE session_id=? OR txid=? OR authorization_id=?').get(body.sessionId,body.transactionId,body.authorizationId))fail('Duplicate or conflicting submission intent.');
   const id=randomUUID();this.db.prepare('INSERT INTO creator_submissions VALUES (?,?,?,?,?,?,?,0,0,?,?,NULL)').run(id,body.sessionId,body.transactionId,body.authorizationId,this.binding(c,body),body.preflightId,this.clock()+600000,'AUTHORIZED','NOT SUBMITTED');
   this.event(id,'NOT SUBMITTED','AUTHORIZED',{recordedAt:this.clock(),reason:'Explicit immutable submission intent recorded.'});this.db.exec('COMMIT');return this.latest(body.sessionId);
  }catch(e){this.db.exec('ROLLBACK');throw e;}
 }
 event(id,status,phase,evidence){this.db.prepare('INSERT INTO creator_submission_events(submission_id,status,phase,evidence) VALUES (?,?,?,?)').run(id,status,phase,JSON.stringify(evidence));}
 update(id,status,evidence,phase='RECONCILED'){
  const record={observedAt:this.clock(),...evidence};this.db.exec('BEGIN IMMEDIATE');
  try{this.db.prepare('UPDATE creator_submissions SET status=?, phase=?, evidence=? WHERE id=?').run(status,phase,JSON.stringify(record),id);this.event(id,status,phase,record);this.db.exec('COMMIT');return this.byId(id);}catch(e){this.db.exec('ROLLBACK');throw e;}
 }
 byId(id){const r=this.db.prepare('SELECT * FROM creator_submissions WHERE id=?').get(id);return r?{submissionId:r.id,authorizationId:r.authorization_id,preflightId:r.preflight_id,transactionId:r.txid,status:r.status,phase:r.phase,consumed:Boolean(r.consumed),attempted:Boolean(r.attempted),expiresAt:r.expires,evidence:r.evidence?JSON.parse(r.evidence):null,giftCompleted:false,recipientDeliveryAvailable:false}:null;}
 latest(sessionId){const r=this.db.prepare('SELECT id FROM creator_submissions WHERE session_id=?').get(sessionId);return r?this.byId(r.id):null;}
 async observe(row,final,engine){
  const chain=await assertRegtest(this.rpc),start=chain.bestblockhash;
  let raw=null,entry=null;
  try{raw=await this.rpc('getrawtransaction',[row.txid,true]);}catch(e){if(!missing(e))throw e;}
  if(raw){
   if(raw.txid!==row.txid||raw.hex!==final.rawTransactionHex)throw Error('Observed transaction bytes mismatch');
   if(Number.isSafeInteger(raw.confirmations)&&raw.confirmations>0&&raw.blockhash){
    const h=await this.rpc('getblockheader',[raw.blockhash,true]);
    if(h.hash!==raw.blockhash||h.confirmations!==raw.confirmations||chain.blocks-h.height+1!==raw.confirmations||await this.rpc('getbestblockhash',[])!==start)throw Error('Unstable confirmation evidence');
    return {status:'CONFIRMED',tip:start,blockhash:raw.blockhash,confirmations:raw.confirmations};
   }
   try{entry=await this.rpc('getmempoolentry',[row.txid]);}catch(e){if(!missing(e))throw e;}
   if(entry&&Number.isSafeInteger(entry.vsize)&&entry.vsize>0&&await this.rpc('getbestblockhash',[])===start)return {status:'MEMPOOL OBSERVED',tip:start,entry};
  }
  for(const input of engine.intent.inputs){
   const u=await this.rpc('gettxout',[input.txid,input.vout,true]);
   if(!u){
    const spending=await this.rpc('gettxspendingprevout',[[{txid:input.txid,vout:input.vout}]]);
    if(await this.rpc('getbestblockhash',[])!==start)throw Error('Chain changed');
    const other=spending?.[0]?.spendingtxid;
    if(typeof other==='string'&&/^[a-f0-9]{64}$/.test(other)&&other!==row.txid)return {status:'CONFLICTED',tip:start,conflictingTxid:other,reason:'A different mempool transaction spends a selected input. No replacement authorized.'};
    return {status:row.attempted?'SUBMISSION UNKNOWN':'NOT SUBMITTED',tip:start,reason:'Input unavailable; no independently identified conflicting spender. Reconciliation required; no retry.'};
   }
  }
  if(await this.rpc('getbestblockhash',[])!==start)throw Error('Chain changed');
  return {status:row.status==='REJECTED'?'REJECTED':row.attempted?'SUBMISSION UNKNOWN':'NOT SUBMITTED',tip:start,reason:'Expected transaction not observed. Absence does not authorize retry.'};
 }
 async reconcile(body){
  const c=this.context(body),row=this.db.prepare('SELECT * FROM creator_submissions WHERE session_id=?').get(body.sessionId);
  if(!row||row.authorization_id!==body.authorizationId||row.binding!==this.binding(c,body))fail('Submission identity mismatch.');
  try{
   this.sessions.recoverArtifact(body.sessionId);const v=this.sessions.verifyArtifact(body.sessionId,this.sessions.artifactStore.get(c.receipt.signedPsbtSha256)),final=finalizeCreation(c.engine,v.bytes.toString('base64'));
   const observed=await this.observe(row,final,c.engine);
   return this.update(row.id,observed.status,observed);
  }catch{return this.update(row.id,row.attempted?'SUBMISSION UNKNOWN':'NOT SUBMITTED',{reason:'Reconciliation unavailable or inconsistent; no retry is authorized.'},'RECONCILIATION_UNAVAILABLE');}
 }
 async run(body){
  const c=this.context(body),binding=this.binding(c,body);
  this.db.exec('BEGIN IMMEDIATE');let row;
  try{
   row=this.db.prepare('SELECT * FROM creator_submissions WHERE session_id=?').get(body.sessionId);
   if(!row||row.authorization_id!==body.authorizationId||row.binding!==binding||row.consumed||this.clock()>=row.expires)fail('Broadcast authorization expired, consumed or mismatched.');
   this.db.prepare("UPDATE creator_submissions SET consumed=1,phase='CHECKING' WHERE id=?").run(row.id);this.event(row.id,'NOT SUBMITTED','CHECKING',{recordedAt:this.clock(),reason:'Authorization consumed before fresh checks.'});this.db.exec('COMMIT');
  }catch(e){this.db.exec('ROLLBACK');throw e;}
  let final;
  try{
   this.sessions.recoverArtifact(body.sessionId);const v=this.sessions.verifyArtifact(body.sessionId,this.sessions.artifactStore.get(c.receipt.signedPsbtSha256));final=finalizeCreation(c.engine,v.bytes.toString('base64'));
   const observed=await this.observe(row,final,c.engine);
   if(observed.status!=='NOT SUBMITTED')return this.update(row.id,observed.status,observed);
   await confirmedOutpoints(this.rpc,c.engine.intent.inputs);
   const pf=await this.rpc('testmempoolaccept',[[final.rawTransactionHex]]);
   if(!Array.isArray(pf)||pf.length!==1||pf[0].txid!==row.txid||typeof pf[0].allowed!=='boolean')throw Error('Invalid fresh preflight');
   if(!pf[0].allowed)return this.update(row.id,'REJECTED',{preflight:pf,reason:pf[0]['reject-reason']||'Core rejected transaction.'});
   if(await this.rpc('getbestblockhash',[])!==observed.tip||this.clock()>=row.expires)throw Error('Fresh checks expired or tip changed');
  }catch{return this.update(row.id,'NOT SUBMITTED',{reason:'Fresh integrity/funding/Core checks failed; no submission attempted.'},'CHECK_FAILED');}
  // Irreversible boundary: record UNKNOWN/attempted durably BEFORE external call.
  this.db.exec('BEGIN IMMEDIATE');try{this.db.prepare("UPDATE creator_submissions SET attempted=1,status='SUBMISSION UNKNOWN',phase='ATTEMPT_RECORDED' WHERE id=?").run(row.id);this.event(row.id,'SUBMISSION UNKNOWN','ATTEMPT_RECORDED',{recordedAt:this.clock(),reason:'Intent persisted before external send.'});this.db.exec('COMMIT');}catch(e){this.db.exec('ROLLBACK');throw e;}
  let rejection=null;
  try{const txid=await this.rpc('sendrawtransaction',[final.rawTransactionHex]);if(txid!==row.txid)throw Error('Ambiguous transaction ID response');}
  catch(e){if([-22,-25,-26].includes(e?.rpcCode??e?.code))rejection=e?.rpcCode??e?.code;}
  const reconciled=await this.reconcile(body);
  if(rejection&&reconciled.status==='SUBMISSION UNKNOWN'&&reconciled.phase==='RECONCILED')return this.update(row.id,'REJECTED',{rpcCode:rejection,reason:'Explicit Core rejection; expected transaction not observed.'});
  return reconciled;
 }
}

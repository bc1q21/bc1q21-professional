// Non-broadcast preflight only. No transaction-submission method exists here.
import {digest} from './public-model.mjs';
import {finalizeCreation} from './public-model.mjs';
import {assertRegtest,confirmedOutpoints} from './coordinator.mjs';
import {PlanRequestError} from './creator-plan-store.mjs';
const fail=(m,s=409)=>{throw new PlanRequestError(m,s);};
const fields=(o,extra=[])=>o&&Object.keys(o).sort().join(',')===['sessionId','transactionId','requestDigest','receiptDigest','authorizationId',...extra].sort().join(',');
export class CreatorSubmissionPreflight {
 constructor(sessions,{rpc=null,enabled=false,clock=()=>Date.now()}={}){
  this.sessions=sessions;this.db=sessions.db;this.enabled=enabled===true;this.clock=clock;
  const allowed=new Set(['getblockchaininfo','getblockhash','getbestblockhash','getblockheader','getrawtransaction','gettxout','testmempoolaccept']);
  this.rpc=async(m,p=[])=>{if(!allowed.has(m))throw Error('Preflight RPC prohibited');if(!rpc){const e=Error('Read-only Core adapter unavailable');e.coreUnavailable=true;throw e;}try{return await rpc(m,p);}catch(cause){const e=Error('Core transport unavailable');e.coreUnavailable=true;throw e;}};
  this.db.exec("CREATE TABLE IF NOT EXISTS creator_preflights (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, binding TEXT NOT NULL, expires INTEGER NOT NULL, state TEXT NOT NULL, result TEXT); CREATE UNIQUE INDEX IF NOT EXISTS one_active_creator_preflight ON creator_preflights(session_id) WHERE state IN ('AUTHORIZED','RUNNING')");
 }
 context(body,extra=[]){
  if(!this.enabled)fail('Submission preflight disabled by operator.',403);
  if(!fields(body,extra)||typeof body.authorizationId!=='string'||! /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(body.authorizationId))fail('Exact preflight request required.',400);
  const c=this.sessions.artifactContext(body.sessionId);
  if(c.receipt.txid!==body.transactionId||c.receipt.requestDigest!==body.requestDigest||digest(c.receipt)!==body.receiptDigest)fail('Preflight receipt or transaction binding mismatch.');
  return c;
 }
 binding(c){return digest({receipt:c.receipt,requestDigest:c.engine.requestDigest,planDigest:c.receipt.planDigest,walletDigest:c.receipt.walletDigest,inputs:c.engine.intent.inputs,outputs:c.engine.intent.gifts,service:c.engine.intent.serviceFee,change:c.engine.intent.change,fee:c.engine.feeSats});}
 authorize(body){
  const c=this.context(body,['explicitPreflightApproval']);
  if(body.explicitPreflightApproval!==digest({transactionId:body.transactionId,requestDigest:body.requestDigest,receiptDigest:body.receiptDigest}))fail('Explicit transaction-specific preflight approval required.',400);
  this.sessions.recoverArtifact(body.sessionId);
  this.db.exec('BEGIN IMMEDIATE');
  try{
   if(this.db.prepare('SELECT id FROM creator_preflights WHERE id=?').get(body.authorizationId)||this.db.prepare("SELECT id FROM creator_preflights WHERE session_id=? AND state IN ('AUTHORIZED','RUNNING')").get(body.sessionId))fail('Duplicate or conflicting preflight authorization.');
   this.db.prepare('INSERT INTO creator_preflights VALUES (?,?,?,?,?,NULL)').run(body.authorizationId,body.sessionId,this.binding(c),this.clock()+600000,'AUTHORIZED');
   const expiresAt=this.db.prepare('SELECT expires FROM creator_preflights WHERE id=?').get(body.authorizationId).expires;this.db.exec('COMMIT');return {status:'authorized',authorizationId:body.authorizationId,expiresAt,broadcastAuthorized:false};
  }catch(e){this.db.exec('ROLLBACK');throw e;}
 }
 async run(body){
  const c=this.context(body),binding=this.binding(c);
  this.db.exec('BEGIN IMMEDIATE');
  try{
   const a=this.db.prepare('SELECT * FROM creator_preflights WHERE id=?').get(body.authorizationId);
   if(!a||a.session_id!==body.sessionId||a.binding!==binding||a.state!=='AUTHORIZED'||this.clock()>=a.expires)fail('Preflight unauthorized, expired, conflicting or already consumed.');
   this.db.prepare("UPDATE creator_preflights SET state='RUNNING' WHERE id=?").run(a.id);this.db.exec('COMMIT');
  }catch(e){this.db.exec('ROLLBACK');throw e;}
  let state='UNAVAILABLE',coreResponse=null,chainTip=null,reason=null;
  try{
   this.sessions.recoverArtifact(body.sessionId);
   const verified=this.sessions.verifyArtifact(body.sessionId,this.sessions.artifactStore.get(c.receipt.signedPsbtSha256));
   const final=finalizeCreation(c.engine,verified.bytes.toString('base64'));
   if(final.txid!==body.transactionId)fail('Finalized transaction identity changed.');
   await assertRegtest(this.rpc);
   const checked=await confirmedOutpoints(this.rpc,c.engine.intent.inputs);chainTip=checked[0].tip;
   const auth=this.db.prepare('SELECT expires FROM creator_preflights WHERE id=?').get(body.authorizationId);if(this.clock()>=auth.expires)fail('Authorization expired during fresh checks.');
   coreResponse=await this.rpc('testmempoolaccept',[[final.rawTransactionHex]]);
   if(!Array.isArray(coreResponse)||coreResponse.length!==1||coreResponse[0].txid!==body.transactionId||typeof coreResponse[0].allowed!=='boolean'){const e=Error('Invalid Core preflight response');e.coreUnavailable=true;throw e;}
   state=coreResponse[0].allowed?'ACCEPTED':'REJECTED';reason=coreResponse[0]['reject-reason']||null;
   if(await this.rpc('getbestblockhash',[])!==chainTip.bestblockhash){state='STALE';reason='Chain tip changed during preflight.';}
   if(this.clock()>=auth.expires){state='STALE';reason='Authorization expired during preflight.';}
  }catch(e){state=e.coreUnavailable||e.code==='ENOENT'?'UNAVAILABLE':'STALE';reason=e.coreUnavailable?'Read-only Core unavailable or invalid response.':e.code==='ENOENT'?'Private artifact unavailable.':e.message;}
  const result={status:state,authorizationId:body.authorizationId,sessionId:body.sessionId,transactionId:body.transactionId,requestDigest:body.requestDigest,receiptDigest:body.receiptDigest,recordedAt:this.clock(),chainTip,coreResponse,reason,broadcast:false,mempoolSubmitted:false,confirmed:false,giftCompleted:false};
  this.db.prepare('UPDATE creator_preflights SET state=?, result=? WHERE id=?').run(state,JSON.stringify(result),body.authorizationId);return result;
 }
 latest(sessionId){
  const a=this.db.prepare('SELECT * FROM creator_preflights WHERE session_id=? ORDER BY rowid DESC LIMIT 1').get(sessionId);
  if(!a)return null;
  return a.result?JSON.parse(a.result):{status:a.state==='AUTHORIZED'&&this.clock()>=a.expires?'EXPIRED':a.state,authorizationId:a.id,expiresAt:a.expires,broadcast:false,mempoolSubmitted:false,confirmed:false,giftCompleted:false};
 }
}

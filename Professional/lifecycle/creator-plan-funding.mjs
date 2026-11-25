// Plan-bound public registration and read-only funding inspection. No submission.
import {verifyWalletRegistration,confirmedOutpoints,assertRegtest} from './coordinator.mjs';
import {digest,keyScript,coreSats,sum,canonical,publicWallet,prepareCreation,GENESIS} from './public-model.mjs';
import {approveCreatorPlan} from './coordinator.mjs';
import {verifyJadeRequest} from './jade-signed-return.mjs';
import {offlineTransfer,decodeOfflineTransfer} from './offline-transfer.mjs';
import {PlanRequestError} from './creator-plan-store.mjs';
const fail=(message,status=400)=>{throw new PlanRequestError(message,status);};
const hash=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const uuid=x=>typeof x==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(x);
const fields=(o,keys)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).sort().join(',')===keys.sort().join(',');
function noSecrets(o){
 if(o&&typeof o==='object')for(const [k,v] of Object.entries(o)){
  if(/seed|mnemonic|private|secret|password|wif|xprv|tprv|recoverywords/i.test(k))fail('Secret-bearing fields are prohibited.');noSecrets(v);
 }
 else if(typeof o==='string'&&/^(?:xprv|tprv)[1-9A-HJ-NP-Za-km-z]+$/.test(o))fail('Private material prohibited.');
}
export class CreatorPlanFunding {
 constructor(store,{walletPins=[],rpc=null}={}){
  this.db=store.db;
  const allowed=new Set(['getblockchaininfo','getblockhash','getbestblockhash','getblockheader','getrawtransaction','gettxout']);
  this.rpc=rpc?async(method,params=[])=>{if(!allowed.has(method))throw Error('Read-only funding RPC prohibited');return rpc(method,params);}:null;
  if(!Array.isArray(walletPins)||walletPins.some(x=>!fields(x,['planDigest','walletDigest'])||!hash(x.planDigest)||!hash(x.walletDigest)))throw Error('Invalid operator wallet pins');
  this.pins=JSON.parse(JSON.stringify(walletPins));
  this.db.exec('CREATE TABLE IF NOT EXISTS creator_reviews (preparation_id TEXT PRIMARY KEY, acknowledgement_id TEXT UNIQUE NOT NULL, binding_digest TEXT NOT NULL, state TEXT NOT NULL, handoff_id TEXT UNIQUE, acknowledged_at TEXT NOT NULL)');
  this.db.exec('CREATE TABLE IF NOT EXISTS creator_requests (operation_id TEXT PRIMARY KEY, plan_id TEXT UNIQUE NOT NULL, plan_digest TEXT NOT NULL, wallet_digest TEXT NOT NULL, funding_operation_id TEXT NOT NULL, selected_inputs TEXT NOT NULL, request_digest TEXT NOT NULL, request_json TEXT NOT NULL, approval_state TEXT NOT NULL); CREATE TABLE IF NOT EXISTS creator_input_reservations (txid TEXT NOT NULL, vout INTEGER NOT NULL, operation_id TEXT NOT NULL, PRIMARY KEY(txid,vout))');
  this.db.exec('CREATE TABLE IF NOT EXISTS registrations (plan_id TEXT PRIMARY KEY, digest TEXT NOT NULL, wallet TEXT NOT NULL); CREATE TABLE IF NOT EXISTS plan_operations (id TEXT PRIMARY KEY, binding TEXT NOT NULL, state TEXT NOT NULL, receipt TEXT)');
 }
 bound(body,keys){
  if(!fields(body,['network','operationId','requestId','planDigest',...keys])||body.network!=='regtest'||!uuid(body.operationId)||!uuid(body.requestId)||!hash(body.planDigest))fail('Invalid plan-bound regtest request.');
  const row=this.db.prepare('SELECT * FROM plans WHERE id=?').get(body.requestId);
  if(!row||row.digest!==body.planDigest)fail('Saved plan identity or digest mismatch.',409);
  return {...row,plan:JSON.parse(row.plan)};
 }
 operation(body,kind){
  const binding=digest({kind,body});
  this.db.exec('BEGIN IMMEDIATE');
  try{
   const old=this.db.prepare('SELECT * FROM plan_operations WHERE id=?').get(body.operationId);
   if(old&&old.binding!==binding)fail('Operation ID belongs to different content.',409);
   if(!old)this.db.prepare('INSERT INTO plan_operations VALUES (?,?,?,NULL)').run(body.operationId,binding,'pending');
   this.db.exec('COMMIT');
   return old?.state==='complete'?{...JSON.parse(old.receipt),status:'already-processed',historicalReceipt:true}:null;
  }catch(e){this.db.exec('ROLLBACK');throw e;}
 }
 receipt(body,kind,data){
  const result={status:'accepted',kind,requestId:body.requestId,operationId:body.operationId,planDigest:body.planDigest,network:'regtest',recordedAt:new Date().toISOString(),fundingAuthorized:false,signingAuthorized:false,broadcastAuthorized:false,...data};
  this.db.prepare("UPDATE plan_operations SET state='complete', receipt=? WHERE id=? AND state='pending'").run(JSON.stringify(result),body.operationId);
  // Parallel read-only retries all receive the first durably recorded receipt.
  return JSON.parse(this.db.prepare('SELECT receipt FROM plan_operations WHERE id=?').get(body.operationId).receipt);
 }
 register(body){
  const row=this.bound(body,['registration']);noSecrets(body.registration);
  const allowed=['wallet','walletDigest','proofs','signedRegistrationPsbtBase64','fundedRegistrationRequest','fundedRegistrationRequestDigest','priorFundedPossession'];
  if(!body.registration||Object.keys(body.registration).some(k=>!allowed.includes(k)))fail('Unexpected registration fields.');
  const pin=this.pins.find(p=>p.planDigest===row.digest&&p.walletDigest===body.registration.walletDigest);
  if(!pin)fail('Operator-pinned wallet identity for this exact plan is required.',403);
  let wallet;try{wallet=verifyWalletRegistration(body.registration,pin.walletDigest);}catch{fail('Wallet possession or identity verification failed.');}
  if(wallet.recipient.length!==row.plan.releases.length)fail('Recipient-key count does not match the plan.');
  const replay=this.operation(body,'registration');if(replay)return replay;
  this.db.exec('BEGIN IMMEDIATE');
  try{
   const old=this.db.prepare('SELECT digest FROM registrations WHERE plan_id=?').get(row.id);
   if(old&&old.digest!==pin.walletDigest)fail('This plan is already bound to a different wallet.',409);
   this.db.prepare('INSERT OR IGNORE INTO registrations VALUES (?,?,?)').run(row.id,pin.walletDigest,canonical(wallet));
   const result=this.receipt(body,'registration',{walletDigest:pin.walletDigest,identityVerified:true});
   this.db.exec('COMMIT');return result;
  }catch(e){this.db.exec('ROLLBACK');throw e;}
 }
 async inspect(body){
  const row=this.bound(body,['walletDigest','outpoints']);
  if(!hash(body.walletDigest)||!Array.isArray(body.outpoints)||body.outpoints.length<1||body.outpoints.length>32||body.outpoints.some(o=>!fields(o,['txid','vout'])||!hash(o.txid)||!Number.isSafeInteger(o.vout)||o.vout<0)||new Set(body.outpoints.map(o=>o.txid+':'+o.vout)).size!==body.outpoints.length)fail('Invalid funding outpoints.');
  const reg=this.db.prepare('SELECT * FROM registrations WHERE plan_id=?').get(row.id);
  if(!reg||reg.digest!==body.walletDigest||!this.pins.some(p=>p.planDigest===row.digest&&p.walletDigest===reg.digest))fail('Verified, currently pinned wallet registration required.',403);
  const replay=this.operation(body,'inspection');if(replay)return replay;
  if(typeof this.rpc!=='function')fail('Read-only regtest adapter is not configured.',503);
  const request=JSON.parse(JSON.stringify(body));
  const observed=await this.readFunding(request.outpoints,JSON.parse(reg.wallet));
  return this.receipt(request,'inspection',{walletDigest:reg.digest,...observed,historicalReceipt:false,inspectionOnly:true});
 }
 async readFunding(outpoints,wallet){
  if(typeof this.rpc!=='function')fail('Read-only regtest adapter is not configured.',503);
  const script=keyScript(wallet.creator);
  try{
   const start=await assertRegtest(this.rpc),utxos=[];
   for(const o of outpoints){
    const tx=await this.rpc('getrawtransaction',[o.txid,true]),out=tx.vout?.[o.vout];
    if(!out||out.scriptPubKey?.hex!==script)throw Error('Funding belongs to a different wallet.');
    utxos.push({...o,valueSats:coreSats(out.value),scriptPubKeyHex:script});
   }
   const checked=await confirmedOutpoints(this.rpc,utxos);
   if(checked[0].tip.bestblockhash!==start.bestblockhash)throw Error('Chain changed during inspection.');
   return {chainTip:checked[0].tip,outpoints:utxos,totalFundingSats:sum(utxos.map(o=>o.valueSats))};
  }catch{fail('Funding inspection failed: require confirmed, unspent, wallet-owned outputs on a stable isolated regtest chain. Retry the same operation after resolving the cause.',422);}
 }
 async prepare(body){
  const row=this.bound(body,['walletDigest','fundingOperationId']);
  if(!hash(body.walletDigest)||!uuid(body.fundingOperationId))fail('Valid registered wallet and funding inspection required.');
  const request=JSON.parse(JSON.stringify(body));
  const approved=approveCreatorPlan(row.plan);
  if(approved.planDigest!==row.digest)fail('Stored plan binding changed.',409);
  const reg=this.db.prepare('SELECT * FROM registrations WHERE plan_id=?').get(row.id);
  if(!reg||reg.digest!==request.walletDigest||!this.pins.some(p=>p.planDigest===row.digest&&p.walletDigest===reg.digest))fail('Verified, currently pinned wallet registration required.',403);
  let wallet;try{wallet=publicWallet(JSON.parse(reg.wallet));}catch{fail('Stored public wallet is invalid.',409);}
  if(digest(wallet)!==reg.digest||wallet.recipient.length!==approved.plan.releases.length)fail('Stored wallet identity changed.',409);
  const funding=this.db.prepare('SELECT * FROM plan_operations WHERE id=?').get(request.fundingOperationId);
  if(!funding||funding.state!=='complete')fail('Completed funding inspection required.',409);
  const prior=JSON.parse(funding.receipt);
  if(prior.kind!=='inspection'||prior.requestId!==row.id||prior.planDigest!==row.digest||prior.walletDigest!==reg.digest)fail('Funding inspection belongs to a different plan or wallet.',409);
  const replay=this.operation(request,'preparation');
  // Never reuse a cached funding observation, even for a completed retry.
  const fresh=await this.readFunding(prior.outpoints.map(({txid,vout})=>({txid,vout})),wallet);
  if(canonical(fresh.outpoints)!==canonical(prior.outpoints))fail('Funding changed since inspection.',409);
  let engine;
  try{
   const payload=prepareCreation({plan:approved.plan,wallet,utxos:fresh.outpoints,rate:2,feeEstimate:null});
   const b={format:'professional-offline-signing-request-v1',network:'regtest',genesis:GENESIS,revision:1,...payload};
   engine={...b,requestDigest:digest(b)};verifyJadeRequest(engine,engine.requestDigest);
  }catch{fail('Unsigned preparation rejected by existing fee, dust, CLTV or PSBT verification. No signing approval.',422);}
  if(await this.rpc('getbestblockhash',[])!==fresh.chainTip.bestblockhash)fail('Chain changed during preparation; retry.',409);
  if(replay){
   const saved=this.db.prepare('SELECT * FROM creator_requests WHERE operation_id=?').get(request.operationId);
   if(!saved||saved.request_digest!==engine.requestDigest||saved.request_json!==canonical(engine)||!['PREPARED_NOT_AUTHORIZED','ACKNOWLEDGED_REVIEW_ONLY','REVIEW_HANDOFF_CONSUMED'].includes(saved.approval_state))fail('Persisted unsigned request mismatch.',409);
   verifyJadeRequest(JSON.parse(saved.request_json),saved.request_digest);
   return {...replay,approvalState:saved.approval_state,freshFundingChecked:true,validationChainTip:fresh.chainTip};
  }
  this.db.exec('BEGIN IMMEDIATE');
  try{
   const existing=this.db.prepare('SELECT * FROM creator_requests WHERE plan_id=?').get(row.id);
   if(existing&&existing.operation_id!==request.operationId)fail('An unsigned request already exists for this plan. Retry its original operation ID.',409);
   if(!existing){
    for(const input of fresh.outpoints){
     const reserved=this.db.prepare('SELECT operation_id FROM creator_input_reservations WHERE txid=? AND vout=?').get(input.txid,input.vout);
     if(reserved)fail('Funding already reserved by another prepared request.',409);
    }
    this.db.prepare('INSERT INTO creator_requests VALUES (?,?,?,?,?,?,?,?,?)').run(request.operationId,row.id,row.digest,reg.digest,request.fundingOperationId,canonical(fresh.outpoints),engine.requestDigest,canonical(engine),'PREPARED_NOT_AUTHORIZED');
    for(const input of fresh.outpoints)this.db.prepare('INSERT INTO creator_input_reservations VALUES (?,?,?)').run(input.txid,input.vout,request.operationId);
   }else if(existing.request_digest!==engine.requestDigest)fail('Concurrent preparation changed intent.',409);
   const result=this.receipt(request,'preparation',{walletDigest:reg.digest,requestDigest:engine.requestDigest,approvalState:'PREPARED_NOT_AUTHORIZED',freshFundingChecked:true,validationChainTip:fresh.chainTip,summary:{fundingSats:engine.fundingSats,principalSats:engine.principalSats,serviceFeeSats:engine.serviceFeeSats,miningFeeSats:engine.feeSats,changeSats:engine.changeSats,inputCount:fresh.outpoints.length,releaseCount:approved.plan.releases.length,feeSource:engine.quote.source}});
   this.db.exec('COMMIT');return result;
  }catch(e){this.db.exec('ROLLBACK');throw e;}
 }
 async reviewBinding(body,extras=[]){
  const row=this.bound(body,['walletDigest','preparationOperationId','requestDigest',...extras]);
  if(!hash(body.walletDigest)||!uuid(body.preparationOperationId)||!hash(body.requestDigest))fail('Exact unsigned preparation identity required.');
  const saved=this.db.prepare('SELECT * FROM creator_requests WHERE operation_id=?').get(body.preparationOperationId);
  if(!saved||saved.plan_id!==row.id||saved.plan_digest!==body.planDigest||saved.wallet_digest!==body.walletDigest||saved.request_digest!==body.requestDigest)fail('Prepared transaction binding mismatch.',409);
  await this.prepare({network:'regtest',requestId:row.id,planDigest:row.digest,walletDigest:saved.wallet_digest,fundingOperationId:saved.funding_operation_id,operationId:saved.operation_id});
  const engine=JSON.parse(saved.request_json);verifyJadeRequest(engine,body.requestDigest);
  const bindingDigest=digest({planDigest:row.digest,walletDigest:saved.wallet_digest,requestDigest:engine.requestDigest,inputs:engine.intent.inputs,outputs:engine.intent.gifts,service:engine.intent.serviceFee,change:engine.intent.change,feeSats:engine.feeSats});
  return {saved,engine,bindingDigest};
 }
 async acknowledge(body){
  const request=JSON.parse(JSON.stringify(body));
  const checked=await this.reviewBinding(request,['acknowledged']);
  if(request.acknowledged!==true)fail('Explicit transaction acknowledgement required.');
  this.db.exec('BEGIN IMMEDIATE');
  try{
   const old=this.db.prepare('SELECT * FROM creator_reviews WHERE preparation_id=?').get(request.preparationOperationId);
   if(old&&(old.state!=='ACKNOWLEDGED_REVIEW_ONLY'||old.acknowledgement_id!==request.operationId||old.binding_digest!==checked.bindingDigest))fail('Acknowledgement conflicts or has already been consumed.',409);
   if(!old){
    if(this.db.prepare('SELECT id FROM plan_operations WHERE id=?').get(request.operationId))fail('Operation ID already used.',409);
    this.operationInTransaction(request,'acknowledgement');
    this.db.prepare('INSERT INTO creator_reviews VALUES (?,?,?,?,NULL,?)').run(request.preparationOperationId,request.operationId,checked.bindingDigest,'ACKNOWLEDGED_REVIEW_ONLY',new Date().toISOString());
    this.db.prepare('UPDATE creator_requests SET approval_state=? WHERE operation_id=?').run('ACKNOWLEDGED_REVIEW_ONLY',request.preparationOperationId);
   }
   this.db.exec('COMMIT');
   return {status:old?'already-processed':'accepted',network:'regtest',requestId:request.requestId,planDigest:request.planDigest,walletDigest:request.walletDigest,requestDigest:request.requestDigest,acknowledgementId:request.operationId,bindingDigest:checked.bindingDigest,reviewOnly:true,fundingAuthorized:false,signingAuthorized:false,broadcastAuthorized:false};
  }catch(e){this.db.exec('ROLLBACK');throw e;}
 }
 operationInTransaction(request,kind){
  this.db.prepare('INSERT INTO plan_operations VALUES (?,?,?,NULL)').run(request.operationId,digest({kind,body:request}),'consumed-review-only');
 }
 async handoff(body){
  const request=JSON.parse(JSON.stringify(body));const checked=await this.reviewBinding(request,['acknowledgementId']);
  const response=this.reviewReceipt(request,checked,false);
  this.db.exec('BEGIN IMMEDIATE');
  try{
   const ack=this.db.prepare('SELECT * FROM creator_reviews WHERE preparation_id=?').get(request.preparationOperationId);
   if(!ack||ack.state!=='ACKNOWLEDGED_REVIEW_ONLY'||ack.acknowledgement_id!==request.acknowledgementId||ack.binding_digest!==checked.bindingDigest)fail('Exact acknowledgement required; handoff missing or already consumed.',409);
   if(this.db.prepare('SELECT id FROM plan_operations WHERE id=?').get(request.operationId))fail('Operation ID already used.',409);
   this.operationInTransaction(request,'review-handoff');
   this.db.prepare('UPDATE creator_reviews SET state=?,handoff_id=? WHERE preparation_id=?').run('REVIEW_HANDOFF_CONSUMED',request.operationId,request.preparationOperationId);
   this.db.prepare('UPDATE creator_requests SET approval_state=? WHERE operation_id=?').run('REVIEW_HANDOFF_CONSUMED',request.preparationOperationId);
   this.db.exec('COMMIT');
   return response;
  }catch(e){this.db.exec('ROLLBACK');throw e;}
 }
 async restoreReview(body){
  const request=JSON.parse(JSON.stringify(body));const checked=await this.reviewBinding(request,['handoffId']);
  const ack=this.db.prepare('SELECT * FROM creator_reviews WHERE preparation_id=?').get(request.preparationOperationId);
  if(!ack||ack.state!=='REVIEW_HANDOFF_CONSUMED'||ack.handoff_id!==request.handoffId||ack.binding_digest!==checked.bindingDigest)fail('Matching consumed review handoff required.',409);
  return this.reviewReceipt(request,checked,true);
 }
 reviewReceipt(request,{engine,bindingDigest},restored){
  // Reuse the proven QR codec internally; never expose a signing QR in review mode.
  const transfer=offlineTransfer(engine);
  if(decodeOfflineTransfer(transfer.frames)!==engine.unsigned.unsignedPsbtBase64)fail('Review transport verification failed.',409);
  return {status:restored?'already-processed':'accepted',network:'regtest',requestId:request.requestId,planDigest:request.planDigest,walletDigest:request.walletDigest,requestDigest:request.requestDigest,preparationOperationId:request.preparationOperationId,handoffId:restored?request.handoffId:request.operationId,bindingDigest,reviewOnly:true,qrTransportVerified:true,unsigned:engine.unsigned,intent:engine.intent,fundingAuthorized:false,signingAuthorized:false,broadcastAuthorized:false};
 }

}

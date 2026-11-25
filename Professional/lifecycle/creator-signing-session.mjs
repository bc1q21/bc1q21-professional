// Regtest signing authorization and verification only. No broadcast/RPC write path.
import {createHash} from 'node:crypto';
import {canonical,digest,publicWallet} from './public-model.mjs';
import bitcoin from 'bitcoinjs-lib';
import {verifyJadeRequest} from './jade-signed-return.mjs';
import {readJadeSignedPayload,verifyLifecycleJadeReturn} from './jade-signed-return.mjs';
import {PlanRequestError} from './creator-plan-store.mjs';
const fail=(m,s=409)=>{throw new PlanRequestError(m,s);};
const sha=b=>createHash('sha256').update(b).digest('hex');
export class CreatorSigningSessions {
 constructor(funding,{enabled=false,clock=()=>Date.now(),artifactStore=null}={}){
  this.funding=funding;this.db=funding.db;this.enabled=enabled===true;this.clock=clock;this.artifactStore=artifactStore;
  this.db.exec('CREATE TABLE IF NOT EXISTS creator_signed_artifacts (session_id TEXT PRIMARY KEY, payload_sha TEXT NOT NULL, payload_size INTEGER NOT NULL, receipt_digest TEXT NOT NULL)');
  this.db.exec('CREATE TABLE IF NOT EXISTS creator_signing_sessions (id TEXT PRIMARY KEY, preparation_id TEXT UNIQUE NOT NULL, authorization_json TEXT NOT NULL, request_digest TEXT NOT NULL, binding_digest TEXT NOT NULL, expires INTEGER NOT NULL, state TEXT NOT NULL, receipt TEXT)');
 }
 async checked(body,extras){
  if(!this.enabled)fail('Signing sessions disabled by operator.',403);
  const checked=await this.funding.reviewBinding(body,['handoffId',...extras]);
  const review=this.db.prepare('SELECT * FROM creator_reviews WHERE preparation_id=?').get(body.preparationOperationId);
  if(!review||review.state!=='REVIEW_HANDOFF_CONSUMED'||review.handoff_id!==body.handoffId||review.binding_digest!==checked.bindingDigest)fail('Exact acknowledged review handoff required.');
  return checked;
 }
 assertActive(row){if(!row||row.state!=='AUTHORIZED'||this.clock()>=row.expires)fail('Signing session missing, expired or already consumed.');}
 publicState(row){return {status:'accepted',network:'regtest',sessionId:row.id,requestDigest:row.request_digest,expiresAt:row.expires,state:row.state,signingAuthorized:row.state==='AUTHORIZED'&&this.clock()<row.expires,broadcastAuthorized:false,fundingAuthorized:false};}
 async authorize(body){
  const request=JSON.parse(JSON.stringify(body)),checked=await this.checked(request,['explicitSigningApproval']);
  if(request.explicitSigningApproval!==request.requestDigest)fail('Separate explicit approval of exact signing request required.',400);
  this.db.exec('BEGIN IMMEDIATE');
  try{
   const old=this.db.prepare('SELECT * FROM creator_signing_sessions WHERE preparation_id=?').get(request.preparationOperationId);
   if(old){this.assertActive(old);if(old.id!==request.operationId||old.authorization_json!==canonical(request))fail('Conflicting signing session.');this.db.exec('COMMIT');return {...this.publicState(old),status:'already-processed',unsigned:checked.engine.unsigned};}
   if(this.db.prepare('SELECT id FROM plan_operations WHERE id=?').get(request.operationId))fail('Operation ID already used.');
   this.funding.operationInTransaction(request,'signing-authorization');
   this.db.prepare('INSERT INTO creator_signing_sessions VALUES (?,?,?,?,?,?,?,NULL)').run(request.operationId,request.preparationOperationId,canonical(request),request.requestDigest,checked.bindingDigest,this.clock()+10*60*1000,'AUTHORIZED');
   const row=this.db.prepare('SELECT * FROM creator_signing_sessions WHERE id=?').get(request.operationId);this.db.exec('COMMIT');return {...this.publicState(row),unsigned:checked.engine.unsigned};
  }catch(e){this.db.exec('ROLLBACK');throw e;}
 }
 async restore(body){
  const request=JSON.parse(JSON.stringify(body)),checked=await this.checked(request,['sessionId']);
  const row=this.db.prepare('SELECT * FROM creator_signing_sessions WHERE id=?').get(request.sessionId);
  if(!row||row.preparation_id!==request.preparationOperationId||row.request_digest!==request.requestDigest||row.binding_digest!==checked.bindingDigest)fail('Signing session identity mismatch.');
  if(row.state==='VERIFIED_RETURN')return {...this.publicState(row),receipt:JSON.parse(row.receipt)};
  this.assertActive(row);return {...this.publicState(row),unsigned:checked.engine.unsigned};
 }
 async acceptReturn(body){
  const request=JSON.parse(JSON.stringify(body));
  // A completed/expired session is not revived by decoding or a valid signature.
  const initial=this.db.prepare('SELECT * FROM creator_signing_sessions WHERE id=?').get(request?.sessionId);this.assertActive(initial);
  const checked=await this.checked(request,['sessionId','signedPayload']);
  if(initial.preparation_id!==request.preparationOperationId||initial.request_digest!==request.requestDigest||initial.binding_digest!==checked.bindingDigest)fail('Signed-return session mismatch.');
  if(typeof request.signedPayload!=='string'||request.signedPayload.length>262144)fail('Bounded signed PSBT or saved crypto-psbt frames required.',400);
  let signed,verified;
  try{
   if(/^cHNidP/.test(request.signedPayload)){
    const b=Buffer.from(request.signedPayload,'base64');if(b.toString('base64')!==request.signedPayload)throw Error('Noncanonical PSBT');signed=readJadeSignedPayload(b);
   }else signed=readJadeSignedPayload(Buffer.from(request.signedPayload,'utf8'));
   verified=verifyLifecycleJadeReturn({request:checked.engine,independentRequestDigest:initial.request_digest,signedPsbtBase64:signed});
  }catch{fail('Returned PSBT does not match the authorized transaction or valid signatures.',422);}
  const receipt={network:'regtest',sessionId:initial.id,requestId:request.requestId,planDigest:request.planDigest,walletDigest:request.walletDigest,requestDigest:initial.request_digest,bindingDigest:initial.binding_digest,signedPsbtSha256:sha(Buffer.from(signed,'base64')),txid:verified.txid,vsize:verified.vsize,feeSats:verified.feeSats,signatureCryptographicallyVerified:true,transactionMatchesApprovedRequest:true,hardwareOriginAttested:false,verifiedAt:this.clock(),broadcast:false,broadcastAuthorized:false,signingAuthorized:false};
  this.db.exec('BEGIN IMMEDIATE');
  try{
   this.assertActive(this.db.prepare('SELECT * FROM creator_signing_sessions WHERE id=?').get(initial.id));
   if(this.artifactStore){const blob=this.artifactStore.put(Buffer.from(signed,'base64'));this.db.prepare('INSERT INTO creator_signed_artifacts VALUES (?,?,?,?)').run(initial.id,blob.hash,blob.size,digest(receipt));}
   this.db.prepare('UPDATE creator_signing_sessions SET state=?,receipt=? WHERE id=?').run('VERIFIED_RETURN',JSON.stringify(receipt),initial.id);this.db.exec('COMMIT');
   return {status:'accepted',network:'regtest',state:'VERIFIED_RETURN',sessionId:initial.id,receipt,artifactRetained:Boolean(this.artifactStore),signingAuthorized:false,broadcastAuthorized:false};
  }catch(e){this.db.exec('ROLLBACK');throw e;}
 }
 finish(body){
  const plan=this.funding.bound(body,['walletDigest','preparationOperationId','requestDigest','handoffId','sessionId','transactionId']);
  const session=this.db.prepare('SELECT * FROM creator_signing_sessions WHERE id=?').get(body.sessionId);
  const prepared=this.db.prepare('SELECT * FROM creator_requests WHERE operation_id=?').get(body.preparationOperationId);
  const review=this.db.prepare('SELECT * FROM creator_reviews WHERE preparation_id=?').get(body.preparationOperationId);
  const reg=this.db.prepare('SELECT * FROM registrations WHERE plan_id=?').get(body.requestId);
  if(!session||session.state!=='VERIFIED_RETURN'||session.preparation_id!==body.preparationOperationId||session.request_digest!==body.requestDigest||!prepared||prepared.plan_id!==plan.id||prepared.plan_digest!==plan.digest||prepared.wallet_digest!==body.walletDigest||prepared.request_digest!==body.requestDigest||!review||review.state!=='REVIEW_HANDOFF_CONSUMED'||review.handoff_id!==body.handoffId||session.binding_digest!==review.binding_digest)fail('No matching verified Finish receipt.');
  if(!reg||reg.digest!==body.walletDigest||!this.funding.pins.some(p=>p.planDigest===plan.digest&&p.walletDigest===reg.digest))fail('Current pinned wallet binding required.',403);
  let engine,receipt;
  try{
   engine=JSON.parse(prepared.request_json);receipt=JSON.parse(session.receipt);
   const receiptKeys=['network','sessionId','requestId','planDigest','walletDigest','requestDigest','bindingDigest','signedPsbtSha256','txid','vsize','feeSats','signatureCryptographicallyVerified','transactionMatchesApprovedRequest','hardwareOriginAttested','verifiedAt','broadcast','broadcastAuthorized','signingAuthorized'];
   if(Object.keys(receipt).sort().join(',')!==receiptKeys.sort().join(',')||receipt.hardwareOriginAttested!==false||receipt.verifiedAt>=session.expires)throw Error('Receipt schema or verification time mismatch');
   verifyJadeRequest(engine,body.requestDigest);
   if(digest(engine.plan)!==plan.digest||canonical(engine.plan)!==canonical(plan.plan)||digest(publicWallet(JSON.parse(reg.wallet)))!==reg.digest||digest(engine.wallet)!==reg.digest)throw Error('Stored identity mismatch');
   const psbt=bitcoin.Psbt.fromBase64(engine.unsigned.unsignedPsbtBase64);
   const txid=bitcoin.Transaction.fromBuffer(psbt.data.globalMap.unsignedTx.toBuffer()).getId();
   // Creator inputs are native SegWit; signatures affect witness, not TXID.
   if(body.transactionId!==txid||receipt.txid!==txid||receipt.sessionId!==session.id||receipt.requestId!==plan.id||receipt.planDigest!==plan.digest||receipt.walletDigest!==reg.digest||receipt.requestDigest!==engine.requestDigest||receipt.bindingDigest!==session.binding_digest||receipt.network!=='regtest'||receipt.signatureCryptographicallyVerified!==true||receipt.transactionMatchesApprovedRequest!==true||receipt.broadcast!==false||receipt.broadcastAuthorized!==false||receipt.signingAuthorized!==false||receipt.feeSats!==engine.feeSats||!Number.isSafeInteger(receipt.verifiedAt)||!Number.isSafeInteger(receipt.vsize)||receipt.vsize<=0||! /^[a-f0-9]{64}$/.test(receipt.signedPsbtSha256))throw Error('Invalid verification receipt');
  }catch{fail('Persisted Finish receipt or transaction identity is invalid.');}
  return {status:'accepted',network:'regtest',stage:'SIGNED_NOT_BROADCAST',requestId:plan.id,planDigest:plan.digest,walletDigest:reg.digest,requestDigest:engine.requestDigest,sessionId:session.id,transactionId:receipt.txid,receipt,receiptDigest:digest(receipt),summary:{releases:engine.plan.releases,totalSats:engine.principalSats,serviceFeeSats:engine.serviceFeeSats,miningFeeSats:engine.feeSats,changeSats:engine.changeSats,fundingInputCount:engine.intent.inputs.length,totalOutputCount:engine.unsigned.totalOutputCount},mempoolAcceptance:'NOT_CHECKED',confirmationStatus:'NOT_CHECKED',fundingStatus:'NOT_CHECKED',giftCompleted:false,recipientDeliveryAvailable:false,signingAuthorized:false,broadcastAuthorized:false};
 }

 artifactContext(sessionId){
  const s=this.db.prepare('SELECT * FROM creator_signing_sessions WHERE id=?').get(sessionId);
  if(!s||s.state!=='VERIFIED_RETURN')fail('Verified signing session required.');
  const auth=JSON.parse(s.authorization_json),receipt=JSON.parse(s.receipt);
  const {explicitSigningApproval,...binding}=auth;
  const finishBinding={...binding,sessionId,transactionId:receipt.txid};
  this.finish(finishBinding); // Historical receipt, current pin and transaction identity; no Core.
  const saved=this.db.prepare('SELECT request_json FROM creator_requests WHERE operation_id=?').get(s.preparation_id);
  return {session:s,receipt,engine:JSON.parse(saved.request_json),finishBinding};
 }
 verifyArtifact(sessionId,bytes){
  const c=this.artifactContext(sessionId);
  const signed=readJadeSignedPayload(bytes);
  if(sha(Buffer.from(signed,'base64'))!==c.receipt.signedPsbtSha256)fail('Artifact does not match authoritative signed receipt.');
  const verified=verifyLifecycleJadeReturn({request:c.engine,independentRequestDigest:c.receipt.requestDigest,signedPsbtBase64:signed});
  if(verified.txid!==c.receipt.txid||verified.feeSats!==c.receipt.feeSats||verified.vsize!==c.receipt.vsize)fail('Artifact transaction differs from verified receipt.');
  return {...c,bytes:Buffer.from(signed,'base64')};
 }
 recoverArtifact(sessionId){
  if(!this.artifactStore)fail('Private artifact storage not configured.');
  const c=this.artifactContext(sessionId),record=this.db.prepare('SELECT * FROM creator_signed_artifacts WHERE session_id=?').get(sessionId);
  if(!record||record.payload_sha!==c.receipt.signedPsbtSha256||record.receipt_digest!==digest(c.receipt))fail('Artifact receipt binding missing or invalid.');
  const verified=this.verifyArtifact(sessionId,this.artifactStore.get(record.payload_sha));
  if(verified.bytes.length!==record.payload_size)fail('Artifact length mismatch.');
  return {status:'accepted',network:'regtest',stage:'SIGNED_NOT_BROADCAST',plan:verified.engine.plan,finishBinding:verified.finishBinding,transactionId:c.receipt.txid,artifactVerified:true,broadcastAuthorized:false};
 }
 importArtifact(sessionId,signedPayload){
  if(!this.artifactStore||typeof signedPayload!=='string'||signedPayload.length>262144)fail('Bounded private artifact import required.');
  let bytes;try{const raw=/^cHNidP/.test(signedPayload)?Buffer.from(signedPayload,'base64'):Buffer.from(signedPayload);if(/^cHNidP/.test(signedPayload)&&raw.toString('base64')!==signedPayload)throw Error('Noncanonical PSBT');bytes=Buffer.from(readJadeSignedPayload(raw),'base64');}catch{fail('Invalid signed PSBT import.');}
  const verified=this.verifyArtifact(sessionId,bytes),old=this.db.prepare('SELECT * FROM creator_signed_artifacts WHERE session_id=?').get(sessionId);
  if(old&&(old.payload_sha!==verified.receipt.signedPsbtSha256||old.receipt_digest!==digest(verified.receipt)))fail('Conflicting artifact binding.');
  // An identical private file is reusable; an existing corrupt/conflicting file is never overwritten.
  const blob=this.artifactStore.put(bytes);
  this.db.prepare('INSERT OR IGNORE INTO creator_signed_artifacts VALUES (?,?,?,?)').run(sessionId,blob.hash,blob.size,digest(verified.receipt));
  return this.recoverArtifact(sessionId);
 }

}

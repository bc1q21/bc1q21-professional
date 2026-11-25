// Explicit regtest recipient signing sessions and private artifacts. No broadcast.
import {createHash} from 'node:crypto';
import {canonical,digest,GENESIS} from './public-model.mjs';
import {readJadeSignedPayload,verifyLifecycleJadeReturn} from './jade-signed-return.mjs';
import {PlanRequestError} from './creator-plan-store.mjs';
const fail=(m,s=409)=>{throw new PlanRequestError(m,s);};
const fields=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).sort().join(',')===keys.sort().join(',');
const uuid=x=>typeof x==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(x);
const sha=b=>createHash('sha256').update(b).digest('hex');
const baseKeys=['expectedDigest','recipientPin','claimId','requestDigest','reviewId','acknowledgementDigest','sessionId'];
export class RecipientClaimSigning {
 constructor(review,{enabled=false,clock=()=>Date.now(),artifactStore=null}={}){
  this.review=review;this.db=review.db;this.enabled=enabled===true;this.clock=clock;this.artifactStore=artifactStore;
  this.db.exec('CREATE TABLE IF NOT EXISTS recipient_signed_artifacts (session_id TEXT PRIMARY KEY, payload_sha TEXT NOT NULL, payload_size INTEGER NOT NULL, receipt_digest TEXT NOT NULL)');
  this.db.exec('CREATE TABLE IF NOT EXISTS recipient_claim_signing (session_id TEXT PRIMARY KEY, claim_id TEXT UNIQUE NOT NULL, review_id TEXT UNIQUE NOT NULL, binding_digest TEXT NOT NULL, authorized_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, state TEXT NOT NULL, authorization_json TEXT NOT NULL, receipt_json TEXT, receipt_digest TEXT)');
 }
 checked(body,extras=[],historicalReceipt=false){
  if(!fields(body,[...baseKeys,...extras])||!uuid(body.sessionId))fail('Exact recipient signing-session identity required.',400);
  const {sessionId,...all}=body,reviewBinding=Object.fromEntries(['expectedDigest','recipientPin','claimId','requestDigest','reviewId','acknowledgementDigest'].map(k=>[k,all[k]]));
  const c=this.review.bound(reviewBinding,'CONSUMED',{historicalReceipt});
  const engine=this.review.claims.engine(c.c,c.claim.releaseNumber),unsigned={format:'professional-offline-signing-request-v1',network:'regtest',genesis:GENESIS,revision:0,...engine};
  const signingRequest={...unsigned,requestDigest:digest(unsigned)};
  const bindingDigest=digest({reviewBinding,sessionId,signingRequestDigest:signingRequest.requestDigest,intent:c.intent});
  return {c,reviewBinding,signingRequest,bindingDigest};
 }
 active(row){if(!this.enabled)fail('Recipient signing sessions disabled by operator.',403);if(!row||row.state!=='AUTHORIZED'||this.clock()>=row.expires_at)fail('Recipient signing session missing, expired or consumed.');}
 boundRow(body,extras=[]){
  const row=this.db.prepare('SELECT * FROM recipient_claim_signing WHERE session_id=?').get(body?.sessionId);
  const c=this.checked(body,extras,row?.state==='VERIFIED_RETURN');
  if(!row||row.claim_id!==body.claimId||row.review_id!==body.reviewId||row.binding_digest!==c.bindingDigest)fail('Recipient signing-session binding mismatch.');
  const auth=JSON.parse(row.authorization_json);if(canonical(auth)!==canonical({...c.reviewBinding,sessionId:body.sessionId,explicitSigningApproval:c.c.acknowledgementDigest}))fail('Stored signing authorization mismatch.');
  return {...c,row};
 }
 verifiedReceipt(c){
  if(c.row.state!=='VERIFIED_RETURN')fail('Verified recipient receipt required.');
   const receipt=JSON.parse(c.row.receipt_json);
   if(digest(receipt)!==c.row.receipt_digest||receipt.status!=='CLAIM SIGNED — NOT BROADCAST'||receipt.sessionId!==c.row.session_id||receipt.claimId!==c.row.claim_id||receipt.reviewId!==c.row.review_id||receipt.bindingDigest!==c.bindingDigest||receipt.signingRequestDigest!==c.signingRequest.requestDigest||canonical(receipt.intent)!==canonical(c.c.intent)||receipt.network!=='regtest'||receipt.signatureCryptographicallyVerified!==true||receipt.transactionMatchesApprovedRequest!==true||receipt.hardwareOriginAttested!==false||receipt.broadcast!==false||receipt.broadcastAuthorized!==false||receipt.signingAuthorized!==false||typeof receipt.artifactRetained!=='boolean'||!Number.isSafeInteger(receipt.verifiedAt)||receipt.verifiedAt<c.row.authorized_at||receipt.verifiedAt>=c.row.expires_at||!Number.isSafeInteger(receipt.vsize)||receipt.vsize<1||receipt.feeSats!==c.c.intent.miningFeeSats||! /^[a-f0-9]{64}$/.test(receipt.txid)||! /^[a-f0-9]{64}$/.test(receipt.signedPsbtSha256))fail('Stored recipient signature receipt is invalid.');
  return receipt;
 }
 result(c){
  if(c.row.state==='VERIFIED_RETURN'){
   const receipt=this.verifiedReceipt(c);
   const artifact=this.db.prepare('SELECT * FROM recipient_signed_artifacts WHERE session_id=?').get(c.row.session_id);
   if(receipt.artifactRetained&&!artifact)fail('Verified retention receipt has no artifact binding.');
   if(artifact)this.readArtifact(c,receipt,artifact);
   return {status:receipt.status,state:'VERIFIED_RETURN',sessionId:c.row.session_id,expiresAt:c.row.expires_at,receipt,receiptDigest:c.row.receipt_digest,review:{...this.review.payload(c.c),status:receipt.status,claimSigned:true,historical:true},claimSigned:true,signingAuthorized:false,broadcastAuthorized:false,artifactRetained:Boolean(artifact),artifactIntegrityVerified:Boolean(artifact)};
  }
  this.active(c.row);
  return {status:'SIGNING AUTHORIZED',state:'AUTHORIZED',sessionId:c.row.session_id,expiresAt:c.row.expires_at,bindingDigest:c.bindingDigest,signingRequestDigest:c.signingRequest.requestDigest,review:this.review.payload(c.c),claimSigned:false,signingAuthorized:true,broadcastAuthorized:false};
 }
 async authorize(body){
  if(!this.enabled)fail('Recipient signing sessions disabled by operator.',403);
  body=JSON.parse(JSON.stringify(body));const c=this.checked(body,['explicitSigningApproval']);
  if(body.explicitSigningApproval!==c.c.acknowledgementDigest)fail('Separate explicit signing approval for the exact reviewed claim required.',400);
  if(this.db.prepare('SELECT session_id FROM recipient_claim_signing WHERE session_id=? OR claim_id=? OR review_id=?').get(body.sessionId,body.claimId,body.reviewId))fail('Duplicate/conflicting signing session. Restore the original; no renewal.');
  await this.review.fresh(c.c);this.checked(body,['explicitSigningApproval']);
  const now=this.clock(),expires=Math.min(now+300000,c.c.row.expires_at);if(expires<=now)fail('Review expired before signing authorization.');
  this.db.exec('BEGIN IMMEDIATE');
  try{
   if(this.db.prepare('SELECT session_id FROM recipient_claim_signing WHERE session_id=? OR claim_id=? OR review_id=?').get(body.sessionId,body.claimId,body.reviewId))fail('Concurrent duplicate signing session.');
   this.db.prepare('INSERT INTO recipient_claim_signing VALUES (?,?,?,?,?,?,?,?,NULL,NULL)').run(body.sessionId,body.claimId,body.reviewId,c.bindingDigest,now,expires,'AUTHORIZED',canonical(body));this.db.exec('COMMIT');
  }catch(e){this.db.exec('ROLLBACK');throw e;}
  return this.result(this.boundRow({...c.reviewBinding,sessionId:body.sessionId}));
 }
 async restore(body){
  body=JSON.parse(JSON.stringify(body));let c=this.boundRow(body);
  if(c.row.state==='VERIFIED_RETURN')return this.result(c); // Historical receipt only: no renewed authority.
  this.active(c.row);await this.review.fresh(c.c);c=this.boundRow(body);return this.result(c);
 }
 async acceptReturn(body){
  body=JSON.parse(JSON.stringify(body));const c=this.boundRow(body,['signedPayload']);this.active(c.row);
  if(typeof body.signedPayload!=='string'||body.signedPayload.length>262144)fail('Bounded signed PSBT or saved crypto-psbt frames required.',400);
  let signed,verified;
  try{
   if(/^cHNidP/.test(body.signedPayload)){const bytes=Buffer.from(body.signedPayload,'base64');if(bytes.toString('base64')!==body.signedPayload)throw Error('Noncanonical PSBT');signed=readJadeSignedPayload(bytes);}
   else signed=readJadeSignedPayload(Buffer.from(body.signedPayload,'utf8'));
   verified=verifyLifecycleJadeReturn({request:c.signingRequest,independentRequestDigest:c.signingRequest.requestDigest,signedPsbtBase64:signed});
  }catch{fail('Returned recipient PSBT differs from the authorized claim or has invalid signatures.',422);}
  await this.review.fresh(c.c);
  const receipt={status:'CLAIM SIGNED — NOT BROADCAST',network:'regtest',sessionId:body.sessionId,claimId:body.claimId,reviewId:body.reviewId,bindingDigest:c.bindingDigest,signingRequestDigest:c.signingRequest.requestDigest,intent:c.c.intent,signedPsbtSha256:sha(Buffer.from(signed,'base64')),txid:verified.txid,vsize:verified.vsize,feeSats:verified.feeSats,verifiedAt:this.clock(),signatureCryptographicallyVerified:true,transactionMatchesApprovedRequest:true,hardwareOriginAttested:false,artifactRetained:Boolean(this.artifactStore),signingAuthorized:false,broadcast:false,broadcastAuthorized:false};
  this.db.exec('BEGIN IMMEDIATE');
  try{
   const current=this.boundRow(body,['signedPayload']);this.active(current.row);
   if(this.artifactStore){const blob=this.artifactStore.put(Buffer.from(signed,'base64'));this.active(current.row);this.db.prepare('INSERT INTO recipient_signed_artifacts VALUES (?,?,?,?)').run(body.sessionId,blob.hash,blob.size,digest(receipt));}
   this.db.prepare("UPDATE recipient_claim_signing SET state='VERIFIED_RETURN',receipt_json=?,receipt_digest=? WHERE session_id=? AND state='AUTHORIZED'").run(JSON.stringify(receipt),digest(receipt),body.sessionId);this.db.exec('COMMIT');
  }catch(e){this.db.exec('ROLLBACK');throw e;}
  return this.result(this.boundRow({...c.reviewBinding,sessionId:body.sessionId}));
 }
 artifactContext(sessionId){
  if(!uuid(sessionId))fail('Exact recipient signing-session ID required.',400);
  const row=this.db.prepare('SELECT * FROM recipient_claim_signing WHERE session_id=?').get(sessionId);
  if(!row||row.state!=='VERIFIED_RETURN')fail('Verified recipient signing receipt required.');
  const {explicitSigningApproval,...binding}=JSON.parse(row.authorization_json),c=this.boundRow(binding),receipt=this.verifiedReceipt(c);
  // Validate historical receipt without recursing through artifact storage.
  const artifact=this.db.prepare('SELECT * FROM recipient_signed_artifacts WHERE session_id=?').get(sessionId);
  if(artifact&&(artifact.payload_sha!==receipt.signedPsbtSha256||artifact.receipt_digest!==row.receipt_digest))fail('Conflicting recipient artifact identity.');
  return {...c,binding,receipt};
 }
 verifyArtifactBytes(c,receipt,bytes){
  if(sha(bytes)!==receipt.signedPsbtSha256)fail('Signed claim artifact differs from the exact verified receipt.');
  let signed,verified;try{signed=readJadeSignedPayload(bytes);verified=verifyLifecycleJadeReturn({request:c.signingRequest,independentRequestDigest:c.signingRequest.requestDigest,signedPsbtBase64:signed});}catch{fail('Retained recipient claim signature/transaction verification failed.');}
  if(verified.txid!==receipt.txid||verified.vsize!==receipt.vsize||verified.feeSats!==receipt.feeSats)fail('Recipient artifact transaction identity mismatch.');
  return Buffer.from(signed,'base64');
 }
 readArtifact(c,receipt,record){
  if(!this.artifactStore||record.payload_sha!==receipt.signedPsbtSha256||record.receipt_digest!==c.row.receipt_digest)fail('Recipient artifact receipt binding invalid.');
  let bytes;try{bytes=this.artifactStore.get(record.payload_sha);}catch{fail('Private recipient artifact missing, corrupt or unsafe; preserve evidence and use authorized recovery.');}
  if(bytes.length!==record.payload_size)fail('Recipient artifact length mismatch.');
  return this.verifyArtifactBytes(c,receipt,bytes);
 }
 recoverArtifact(sessionId){
  if(!this.artifactStore)fail('Private recipient artifact store not configured.');
  const c=this.artifactContext(sessionId),record=this.db.prepare('SELECT * FROM recipient_signed_artifacts WHERE session_id=?').get(sessionId);
  if(!record||record.payload_sha!==c.receipt.signedPsbtSha256||record.receipt_digest!==c.row.receipt_digest)fail('No matching retained recipient artifact. Re-import the exact signed capture.');
  const signedState=this.result(c); // Reverify permissions, exact bytes and signatures once.
  return {status:'CLAIM SIGNED — NOT BROADCAST',network:'regtest',artifactVerified:true,transactionId:c.receipt.txid,artifactSha256:record.payload_sha,receiptDigest:c.row.receipt_digest,signingBinding:c.binding,reviewBinding:c.reviewBinding,packagePins:{expectedDigest:c.binding.expectedDigest,recipientPin:c.binding.recipientPin},claimLocator:{claimId:c.binding.claimId,packageDigest:c.binding.expectedDigest,releaseNumber:c.c.claim.releaseNumber},signedState,signingAuthorized:false,broadcastAuthorized:false};
 }
 importArtifact(sessionId,signedPayload){
  if(!this.artifactStore||typeof signedPayload!=='string'||signedPayload.length>262144)fail('Private recipient store and bounded signed capture required.',400);
  const c=this.artifactContext(sessionId);let bytes;
  try{const raw=/^cHNidP/.test(signedPayload)?Buffer.from(signedPayload,'base64'):Buffer.from(signedPayload,'utf8');if(/^cHNidP/.test(signedPayload)&&raw.toString('base64')!==signedPayload)throw Error('Noncanonical PSBT');bytes=Buffer.from(readJadeSignedPayload(raw),'base64');}catch{fail('Invalid recipient signed capture.');}
  this.verifyArtifactBytes(c,c.receipt,bytes);
  const old=this.db.prepare('SELECT * FROM recipient_signed_artifacts WHERE session_id=?').get(sessionId);
  if(old&&(old.payload_sha!==c.receipt.signedPsbtSha256||old.receipt_digest!==c.row.receipt_digest))fail('Conflicting retained recipient artifact.');
  const blob=this.artifactStore.put(bytes);
  this.db.prepare('INSERT OR IGNORE INTO recipient_signed_artifacts VALUES (?,?,?,?)').run(sessionId,blob.hash,blob.size,c.row.receipt_digest);
  return this.recoverArtifact(sessionId);
 }

}

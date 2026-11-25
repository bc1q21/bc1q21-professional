// Review authorization only. No QR signing permission or signed-return/broadcast path.
import bitcoin from 'bitcoinjs-lib';
import {canonical,digest,network} from './public-model.mjs';
import {confirmedOutpoints} from './coordinator.mjs';
import {verifyGiftReleaseBinding} from '../browser-integration/verify-gift-release-binding.mjs';
import {PlanRequestError} from './creator-plan-store.mjs';
const fail=(m,s=409)=>{throw new PlanRequestError(m,s);};
const fields=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).sort().join(',')===keys.sort().join(',');
const uuid=x=>typeof x==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(x);
export class RecipientClaimReview {
 constructor(claims,{clock=()=>Date.now()}={}){
  this.claims=claims;this.db=claims.db;this.clock=clock;
  this.db.exec('CREATE TABLE IF NOT EXISTS recipient_claim_reviews (review_id TEXT PRIMARY KEY, claim_id TEXT UNIQUE NOT NULL, acknowledgement_digest TEXT NOT NULL, intent_json TEXT NOT NULL, expires_at INTEGER NOT NULL, state TEXT NOT NULL, evidence_json TEXT NOT NULL, consumed_at INTEGER)');
 }
 context(body){
  const pins={expectedDigest:body.expectedDigest,recipientPin:body.recipientPin};
  const claim=this.claims.recover({...pins,claimId:body.claimId});
  if(claim.requestDigest!==body.requestDigest)fail('Prepared claim request digest mismatch.');
  const c=this.claims.context(pins),r=c.manifest.releases[claim.releaseNumber-1],engine=this.claims.engine(c,claim.releaseNumber);
  const intent={claimId:claim.claimId,requestDigest:claim.requestDigest,packageDigest:claim.packageDigest,manifestDigest:claim.manifestDigest,recipientPin:claim.recipientPin,walletDigest:claim.walletDigest,signer:claim.signer,releaseNumbers:[claim.releaseNumber],inputs:[{txid:claim.creatorTxid,vout:r.vout,valueSats:r.valueSats,scriptPubKeyHex:r.scriptPubKeyHex,redeemScriptHex:r.redeemScriptHex,sequence:claim.sequence}],outputs:[{valueSats:engine.payoutSats,scriptPubKeyHex:engine.destinationScriptHex,address:bitcoin.address.fromOutputScript(Buffer.from(engine.destinationScriptHex,'hex'),network)}],miningFeeSats:engine.feeSats,locktime:r.locktime,unsignedPsbtSha256:claim.unsignedPsbtSha256};
  return {pins,claim,c,r,intent,acknowledgementDigest:digest(intent)};
 }
 intent(body){
  if(!fields(body,['expectedDigest','recipientPin','claimId','requestDigest']))fail('Exact prepared claim identity required.',400);
  const c=this.context(body);
  return {status:'CLAIM PREPARED',intent:c.intent,acknowledgementDigest:c.acknowledgementDigest,reviewOnly:true,claimSigned:false,signingAuthorized:false,broadcastAuthorized:false};
 }
 async fresh(c){
  const observation=await this.claims.funding.verify(c.pins),release=observation.releases.find(r=>r.releaseNumber===c.claim.releaseNumber);
  if(!observation.fresh||!observation.fundingVerified||!release?.unspent||!release.mature)fail('Fresh confirmed, unspent, mature claim evidence required.',422);
  try{
   const checked=await confirmedOutpoints(this.claims.funding.rpc,[c.intent.inputs[0]]);
   if(checked[0].tip.bestblockhash!==observation.tip)throw Error('Changed tip');
  }catch{fail('Selected claim input changed or is unavailable.',422);}
  return {...observation,fresh:false,historical:true};
 }
 async acknowledge(body){
  if(!fields(body,['expectedDigest','recipientPin','claimId','requestDigest','reviewId','acknowledgementDigest','acknowledgedIntent'])||!uuid(body.reviewId))fail('Explicit exact-claim acknowledgement required.',400);
  body=JSON.parse(JSON.stringify(body));const c=this.context(body);
  if(body.acknowledgementDigest!==c.acknowledgementDigest||canonical(body.acknowledgedIntent)!==canonical(c.intent))fail('Acknowledged outputs, fees, identity or claim details changed.');
  if(this.db.prepare('SELECT review_id FROM recipient_claim_reviews WHERE review_id=? OR claim_id=?').get(body.reviewId,body.claimId))fail('Duplicate/conflicting review authorization. No automatic renewal.');
  const evidence=await this.fresh(c),expires=this.clock()+600000;
  this.db.exec('BEGIN IMMEDIATE');
  try{
   if(this.db.prepare('SELECT review_id FROM recipient_claim_reviews WHERE review_id=? OR claim_id=?').get(body.reviewId,body.claimId))fail('Concurrent duplicate claim review.');
   this.db.prepare('INSERT INTO recipient_claim_reviews VALUES (?,?,?,?,?,?,?,NULL)').run(body.reviewId,body.claimId,c.acknowledgementDigest,JSON.stringify(c.intent),expires,'AUTHORIZED',JSON.stringify({acknowledgement:evidence}));this.db.exec('COMMIT');
  }catch(e){this.db.exec('ROLLBACK');throw e;}
  return {status:'REVIEW AUTHORIZED',reviewId:body.reviewId,claimId:body.claimId,requestDigest:body.requestDigest,acknowledgementDigest:c.acknowledgementDigest,expiresAt:expires,reviewOnly:true,claimSigned:false,signingAuthorized:false,broadcastAuthorized:false};
 }
 bound(body,state,{historicalReceipt=false}={}){
  if(!fields(body,['expectedDigest','recipientPin','claimId','requestDigest','reviewId','acknowledgementDigest'])||!uuid(body.reviewId))fail('Exact authorized review identity required.',400);
  const c=this.context(body),row=this.db.prepare('SELECT * FROM recipient_claim_reviews WHERE review_id=?').get(body.reviewId);
  if(!row||row.claim_id!==body.claimId||row.state!==state||row.acknowledgement_digest!==body.acknowledgementDigest||row.acknowledgement_digest!==c.acknowledgementDigest||canonical(JSON.parse(row.intent_json))!==canonical(c.intent))fail('Review binding/state mismatch or already consumed.');
  if(!historicalReceipt&&this.clock()>=row.expires_at)fail('Review authorization expired; no automatic renewal.');
  return {...c,row};
 }
 payload(c){
  const gift=c.c.accepted.package.body.customerHandoff.gift,release=gift.releases.find(r=>r.releaseNumber===c.claim.releaseNumber);
  verifyGiftReleaseBinding({gift,release,approvedUnsignedBase64:c.claim.unsignedPsbtBase64,expectedApprovedSha256:c.claim.unsignedPsbtSha256});
  return {status:'REVIEW AUTHORIZED',reviewId:c.row.review_id,expiresAt:c.row.expires_at,acknowledgementDigest:c.acknowledgementDigest,intent:c.intent,gift,release,unsignedPsbtBase64:c.claim.unsignedPsbtBase64,reviewOnly:true,claimSigned:false,signingAuthorized:false,broadcastAuthorized:false};
 }
 async handoff(body){
  body=JSON.parse(JSON.stringify(body));const c=this.bound(body,'AUTHORIZED'),evidence=await this.fresh(c),payload=this.payload(c);
  this.db.exec('BEGIN IMMEDIATE');
  try{
   this.bound(body,'AUTHORIZED');
   const old=JSON.parse(c.row.evidence_json);
   this.db.prepare("UPDATE recipient_claim_reviews SET state='CONSUMED',consumed_at=?,evidence_json=? WHERE review_id=? AND state='AUTHORIZED'").run(this.clock(),JSON.stringify({...old,handoff:evidence}),body.reviewId);this.db.exec('COMMIT');
  }catch(e){this.db.exec('ROLLBACK');throw e;}
  return payload;
 }
 async restore(body){
  body=JSON.parse(JSON.stringify(body));const c=this.bound(body,'CONSUMED');await this.fresh(c);
  // Restoration is read-only: never refresh expiry or mint another authorization.
  this.bound(body,'CONSUMED');return {...this.payload(c),restored:true};
 }
}

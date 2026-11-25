// Controlled unsigned preparation only. No signing session, QR, Core mutation or broadcast.
import bitcoin from 'bitcoinjs-lib';
import {createHash,randomUUID} from 'node:crypto';
import {canonical,digest,prepareClaim,network} from './public-model.mjs';
import {confirmedOutpoints,verifyWalletRegistration} from './coordinator.mjs';
import {PlanRequestError} from './creator-plan-store.mjs';
const fail=(m,s=409)=>{throw new PlanRequestError(m,s);};
const fields=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).sort().join(',')===keys.sort().join(',');
const hash=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const uuid=x=>typeof x==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(x);
function publicOnly(value){
 const pending=[value];let budget=10000;
 while(pending.length){
  if(--budget<0)fail('Public registration too complex.',400);
  const v=pending.pop();
  if(v&&typeof v==='object')for(const [key,item] of Object.entries(v)){
   if(/seed|mnemonic|private|secret|password|wif|xprv|tprv|recoverywords/i.test(key))fail('Secret-bearing fields prohibited.',400);pending.push(item);
  }else if(typeof v==='string'&&/^(?:xprv|tprv)[1-9A-HJ-NP-Za-km-z]+$/.test(v))fail('Private material prohibited.',400);
 }
}
export class RecipientClaimPreparation {
 constructor(funding,{claimPins=[]}={}){
  this.funding=funding;this.imports=funding.imports;this.db=funding.db;this.pins=JSON.parse(JSON.stringify(claimPins));
  if(!Array.isArray(claimPins)||claimPins.some(p=>!fields(p,['packageDigest','recipientId','walletDigest'])||!hash(p.packageDigest)||!hash(p.walletDigest)||! /^[a-z0-9][a-z0-9-]{0,63}$/.test(p.recipientId)))throw Error('Invalid independent recipient claim pins');
  this.db.exec('CREATE TABLE IF NOT EXISTS recipient_claim_preparations (claim_id TEXT PRIMARY KEY, operation_id TEXT UNIQUE NOT NULL, package_digest TEXT NOT NULL, creator_txid TEXT NOT NULL, release_number INTEGER NOT NULL, request_digest TEXT NOT NULL, record_json TEXT NOT NULL, UNIQUE(creator_txid,release_number))');
 }
 context(pins){
  const accepted=this.imports.recover(pins),manifest=accepted.package.body.manifest;
  const pin=this.pins.find(p=>p.packageDigest===pins.expectedDigest&&p.recipientId===pins.recipientPin.recipientId&&p.walletDigest===accepted.package.body.walletDigest);
  if(!pin)fail('Independent operator-pinned recipient wallet required.',403);
  return {accepted,manifest,pin};
 }
 engine(context,releaseNumber){
  const request=prepareClaim({manifest:context.manifest,releaseNumbers:[releaseNumber],destinationScriptHex:context.accepted.package.body.recipient.destinationScriptHex,rate:2});
  const approved=context.accepted.package.body.customerHandoff.psbts.find(p=>p.releaseNumber===releaseNumber);
  if(!approved||request.unsignedPsbtBase64!==approved.approvedUnsignedBase64||createHash('sha256').update(Buffer.from(request.unsignedPsbtBase64,'base64')).digest('hex')!==approved.expectedApprovedSha256)fail('Claim differs from package-approved transaction.');
  const psbt=bitcoin.Psbt.fromBase64(request.unsignedPsbtBase64,{network}),tx=bitcoin.Transaction.fromBuffer(psbt.data.globalMap.unsignedTx.toBuffer()),r=request.releases[0];
  if(tx.version!==2||tx.locktime!==r.locktime||tx.ins.length!==1||tx.outs.length!==1||tx.ins[0].sequence!==0xfffffffd||Buffer.from(tx.ins[0].hash).reverse().toString('hex')!==context.manifest.creatorTxid||tx.ins[0].index!==r.vout||tx.outs[0].value!==request.payoutSats||tx.outs[0].script.toString('hex')!==request.destinationScriptHex||request.principalSats!==request.payoutSats+request.feeSats||psbt.data.inputs[0].partialSig)fail('Unsigned claim policy mismatch.');
  return request;
 }
 async prepare(body){
  if(!fields(body,['expectedDigest','recipientPin','operationId','releaseNumber','signer','registration','explicitPreparationApproval'])||!uuid(body.operationId)||body.explicitPreparationApproval!==true||!Number.isSafeInteger(body.releaseNumber)||body.releaseNumber<1)fail('Explicit single-release unsigned preparation request required.',400);
  // Freeze caller data before asynchronous evidence collection.
  body=JSON.parse(JSON.stringify(body));const pins={expectedDigest:body.expectedDigest,recipientPin:body.recipientPin},c=this.context(pins);
  const release=c.manifest.releases[body.releaseNumber-1];if(!release)fail('Unsupported release selection.',400);
  if(canonical(body.signer)!==canonical(release.key))fail('Recipient signer origin/key differs from selected release.',403);
  publicOnly(body.registration);
  const allowed=['wallet','walletDigest','proofs','signedRegistrationPsbtBase64','fundedRegistrationRequest','fundedRegistrationRequestDigest','priorFundedPossession'];
  if(!body.registration||Object.keys(body.registration).some(k=>!allowed.includes(k)))fail('Public wallet registration required.',400);
  try{if(canonical(verifyWalletRegistration(body.registration,c.pin.walletDigest))!==canonical(c.manifest.wallet))throw Error('Different public wallet');}catch{fail('Recipient wallet identity/possession verification failed.',403);}
  if(this.db.prepare('SELECT claim_id FROM recipient_claim_preparations WHERE operation_id=? OR (creator_txid=? AND release_number=?)').get(body.operationId,c.manifest.creatorTxid,body.releaseNumber))fail('Duplicate/conflicting claim preparation. Recover the original request.');
  const observation=await this.funding.verify(pins),eligible=observation.releases.find(r=>r.releaseNumber===body.releaseNumber);
  if(!observation.fresh||!observation.fundingVerified||!eligible?.unspent||!eligible.mature||!eligible.claimPreparationEligible)fail('Fresh confirmed, unspent, mature release required.',422);
  const engine=this.engine(c,body.releaseNumber);
  // Reverify the selected input immediately before persistence, including mempool spends.
  try{
   if(await this.funding.rpc('getbestblockhash',[])!==observation.tip)throw Error('Changed tip');
   const checked=await confirmedOutpoints(this.funding.rpc,[{txid:c.manifest.creatorTxid,vout:release.vout,valueSats:release.valueSats,scriptPubKeyHex:release.scriptPubKeyHex}]);
   if(checked[0].tip.bestblockhash!==observation.tip)throw Error('Changed funding tip');
  }catch{fail('Selected funding changed or became unavailable before persistence.',422);}
  const record={claimId:randomUUID(),operationId:body.operationId,packageDigest:pins.expectedDigest,recipientPin:pins.recipientPin,walletDigest:c.pin.walletDigest,signer:body.signer,releaseNumber:body.releaseNumber,creatorTxid:c.manifest.creatorTxid,manifestDigest:c.manifest.digest,registrationProofDigest:digest(body.registration),unsignedPsbtBase64:engine.unsignedPsbtBase64,unsignedPsbtSha256:createHash('sha256').update(Buffer.from(engine.unsignedPsbtBase64,'base64')).digest('hex'),principalSats:engine.principalSats,payoutSats:engine.payoutSats,miningFeeSats:engine.feeSats,destinationScriptHex:engine.destinationScriptHex,locktime:release.locktime,sequence:0xfffffffd,preparationEvidence:{...observation,fresh:false,historical:true},status:'CLAIM PREPARED',claimSigned:false,claimAvailable:false,signingAuthorized:false,broadcastAuthorized:false};
  const binding=digest(record);
  this.db.exec('BEGIN IMMEDIATE');
  try{
   if(this.db.prepare('SELECT claim_id FROM recipient_claim_preparations WHERE operation_id=? OR (creator_txid=? AND release_number=?)').get(body.operationId,c.manifest.creatorTxid,body.releaseNumber))fail('Duplicate/conflicting concurrent claim request.');
   this.db.prepare('INSERT INTO recipient_claim_preparations VALUES (?,?,?,?,?,?,?)').run(record.claimId,record.operationId,record.packageDigest,record.creatorTxid,record.releaseNumber,binding,JSON.stringify(record));this.db.exec('COMMIT');
  }catch(e){this.db.exec('ROLLBACK');throw e;}
  return {...record,requestDigest:binding,currentEligibilityUnverified:true};
 }
 recover(body){
  if(!fields(body,['expectedDigest','recipientPin','claimId'])||!uuid(body.claimId))fail('Exact claim recovery request required.',400);
  const pins={expectedDigest:body.expectedDigest,recipientPin:body.recipientPin},c=this.context(pins),row=this.db.prepare('SELECT * FROM recipient_claim_preparations WHERE claim_id=?').get(body.claimId);
  if(!row||row.package_digest!==body.expectedDigest)fail('No matching recipient claim request.');
  const record=JSON.parse(row.record_json),engine=this.engine(c,row.release_number);
  if(digest(record)!==row.request_digest||record.claimId!==row.claim_id||record.operationId!==row.operation_id||record.creatorTxid!==c.manifest.creatorTxid||record.creatorTxid!==row.creator_txid||record.packageDigest!==row.package_digest||record.releaseNumber!==row.release_number||canonical(record.recipientPin)!==canonical(pins.recipientPin)||record.walletDigest!==c.pin.walletDigest||canonical(record.signer)!==canonical(engine.releases[0].key)||record.unsignedPsbtBase64!==engine.unsignedPsbtBase64)fail('Persisted claim integrity/binding mismatch.');
  return {...record,requestDigest:row.request_digest,currentEligibilityUnverified:true,signingAuthorized:false,broadcastAuthorized:false,claimSigned:false,claimAvailable:false};
 }
}

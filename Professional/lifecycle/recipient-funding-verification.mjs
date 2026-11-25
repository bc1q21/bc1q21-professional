// Observation only. Never authorizes signing/submission and never mutates Core.
import bitcoin from 'bitcoinjs-lib';
import {randomUUID} from 'node:crypto';
import {assertRegtest,recoverPublicGift,confirmedOutpoints} from './coordinator.mjs';
import {coreSats,prepareClaim} from './public-model.mjs';
const allowed=new Set(['getblockchaininfo','getblockhash','getbestblockhash','getblockheader','getrawtransaction','gettxout']);
class EvidenceError extends Error {constructor(status,message){super(message);this.status=status;}}
const requireEvidence=(ok,message)=>{if(!ok)throw new EvidenceError('MISMATCHED',message);};
export function recipientCltvMature(locktime,height,medianTimePast){
 if(!Number.isSafeInteger(locktime)||locktime<0||!Number.isSafeInteger(height)||height<0||!Number.isSafeInteger(medianTimePast)||medianTimePast<0)throw Error('Invalid CLTV observation');
 // Candidate block height is tip+1; BIP113 uses tip MTP, not wall-clock time.
 return locktime<500000000?locktime<height+1:locktime<medianTimePast;
}
export class RecipientFundingVerification {
 constructor(imports,{rpc=null,minimumConfirmations=1,clock=()=>Date.now()}={}){
  if(!Number.isSafeInteger(minimumConfirmations)||minimumConfirmations<1)throw Error('Invalid recipient confirmation policy');
  this.imports=imports;this.db=imports.db;this.minimum=minimumConfirmations;this.clock=clock;
  this.rpc=async(m,p=[])=>{
   if(!allowed.has(m))throw Error('Prohibited recipient RPC');
   if(typeof rpc!=='function')throw new EvidenceError('UNAVAILABLE','Read-only Core adapter unavailable');
   try{return await rpc(m,p);}catch(e){throw new EvidenceError(e.code===-5?'MISSING':'UNAVAILABLE',e.code===-5?'Core transaction/block not found':'Core read unavailable');}
  };
  this.db.exec('CREATE TABLE IF NOT EXISTS recipient_funding_observations (observation_id TEXT PRIMARY KEY, package_digest TEXT NOT NULL, observed_at INTEGER NOT NULL, evidence_json TEXT NOT NULL)');
 }
 historical(pins){
  this.imports.recover(pins);
  const row=this.db.prepare('SELECT evidence_json FROM recipient_funding_observations WHERE package_digest=? ORDER BY rowid DESC LIMIT 1').get(pins.expectedDigest);
  return {status:'REVERIFY REQUIRED',fresh:false,fundingVerified:false,claimAvailable:false,signingAuthorized:false,broadcastAuthorized:false,historicalObservation:row?JSON.parse(row.evidence_json):null};
 }
 async verify(pins){
  const accepted=this.imports.recover(pins),manifest=accepted.package.body.manifest;
  const result={observationId:randomUUID(),packageDigest:accepted.packageDigest,transactionId:accepted.transactionId,recipientId:accepted.recipientId,observedAt:this.clock(),status:'UNAVAILABLE',fresh:false,fundingVerified:false,claimAvailable:false,signingAuthorized:false,broadcastAuthorized:false,releases:[]};
  try{
   const chain=await assertRegtest(this.rpc),start=chain.bestblockhash;
   if(await this.rpc('getbestblockhash',[])!==start)throw new EvidenceError('STALE','Chain tip moved before observation');
   const tip=await this.rpc('getblockheader',[start,true]);
   requireEvidence(tip.hash===start&&tip.height===chain.blocks&&tip.confirmations===1&&Number.isSafeInteger(tip.mediantime)&&tip.mediantime>=0,'Invalid active tip');
   const raw=await this.rpc('getrawtransaction',[manifest.creatorTxid,true]);
   requireEvidence(raw.txid===manifest.creatorTxid&&raw.hex===manifest.creatorRawHex,'Creator transaction bytes/identity mismatch');
   requireEvidence(Number.isSafeInteger(raw.confirmations),'Invalid confirmation count');
   if(raw.confirmations<0)throw new EvidenceError('CONFLICTED','Creator transaction is conflicted');
   if(!raw.blockhash)throw new EvidenceError('UNCONFIRMED','Creator transaction is not confirmed');
   if(raw.blockhash!==accepted.package.body.confirmation.blockhash)throw new EvidenceError('REORGANIZED','Packaged creator confirmation block changed; explicit review required');
   const block=await this.rpc('getblockheader',[raw.blockhash,true]);
   if(block.confirmations<1||await this.rpc('getblockhash',[block.height])!==raw.blockhash)throw new EvidenceError('REORGANIZED','Creator block is not on the active chain');
   if(!raw.confirmations)throw new EvidenceError('UNCONFIRMED','Creator transaction is not confirmed');
   requireEvidence(block.hash===raw.blockhash&&block.confirmations===raw.confirmations&&chain.blocks-block.height+1===raw.confirmations,'Inconsistent funding depth');
   if(raw.confirmations<this.minimum)throw new EvidenceError('INSUFFICIENT CONFIRMATIONS','Required funding confirmation depth not reached');
   // Validate every RPC-reported gift/service/change output against the authenticated raw transaction.
   const expected=accepted.package.body.manifest;
   const tx=bitcoin.Transaction.fromHex(expected.creatorRawHex);
   requireEvidence(Array.isArray(raw.vout)&&raw.vout.length===tx.outs.length,'Creator output count mismatch');
   tx.outs.forEach((out,i)=>requireEvidence(coreSats(raw.vout[i].value)===out.value&&raw.vout[i].scriptPubKey.hex===out.script.toString('hex'),'Creator output amount/script mismatch'));
   const recovered=await recoverPublicGift({manifest,independentDigest:manifest.digest,rpc:this.rpc});
   requireEvidence(recovered.chainTip===start&&recovered.medianTimePast===tip.mediantime,'Inconsistent recovery observation');
   const unspent=manifest.releases.filter((r,i)=>recovered.releases[i].status==='CONFIRMED_UNSPENT');
   if(unspent.length)await confirmedOutpoints(this.rpc,unspent.map(r=>({txid:manifest.creatorTxid,vout:r.vout,valueSats:r.valueSats,scriptPubKeyHex:r.scriptPubKeyHex})));
   if(await this.rpc('getbestblockhash',[])!==start)throw new EvidenceError('STALE','Chain tip moved during observation');
   result.releases=manifest.releases.map((r,i)=>{
    const unspent=recovered.releases[i].status==='CONFIRMED_UNSPENT',mature=recipientCltvMature(r.locktime,tip.height,tip.mediantime);
    const claim=prepareClaim({manifest,releaseNumbers:[i+1],destinationScriptHex:pins.recipientPin.destinationScriptHex,rate:2});
    return {releaseNumber:i+1,outpoint:manifest.creatorTxid+':'+r.vout,valueSats:r.valueSats,locktime:r.locktime,unspent,mature,claimPreparationEligible:unspent&&mature,claimAvailable:false,payoutSats:claim.payoutSats,miningFeeSats:claim.feeSats,status:!unspent?'UNAVAILABLE — SPENT OR MEMPOOL SPEND':mature?'MATURE — CLAIM DISABLED':'IMMATURE — CLAIM DISABLED'};
   });
   Object.assign(result,{status:'FUNDING VERIFIED',fresh:true,fundingVerified:true,confirmations:raw.confirmations,minimumConfirmations:this.minimum,tip:start,height:tip.height,medianTimePast:tip.mediantime,allRecipientOutputsUnspent:result.releases.every(r=>r.unspent),validUntil:this.clock()+60000});
  }catch(error){result.status=error instanceof EvidenceError?error.status:'MISMATCHED';result.reason=error instanceof EvidenceError?error.message:'Fresh recovery/output verification failed';}
  this.db.prepare('INSERT INTO recipient_funding_observations VALUES (?,?,?,?)').run(result.observationId,result.packageDigest,result.observedAt,JSON.stringify(result));
  return result;
 }
}

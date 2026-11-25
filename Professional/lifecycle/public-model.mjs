import {CREATOR_SERVICE_POLICY} from '../creator-service-policy.mjs';
import {discoveryForPlan,validateDiscoveryIntent} from '../independent-recovery-profile.mjs';
// Public-only, regtest-only lifecycle model. No key derivation or signing.
import assert from 'node:assert/strict';
import {sha256} from '@noble/hashes/sha256';
import {Buffer} from 'buffer';
import bitcoin from 'bitcoinjs-lib';
import {secp256k1} from '@noble/curves/secp256k1';
import {validatePublicPlan,previewFees,MAX_SATS} from '../public-date-planner.mjs';
import {snapshotFundedDistributionIntent} from '../funded-distribution-intent.mjs';
import {buildUnsignedFundedDistributionPsbt} from '../unsigned-funded-distribution-psbt.mjs';
import {verifyGiftCltvOutputs} from '../verify-gift-cltv-outputs.mjs';
import {finalizeVerifiedCreatorRegtestTransaction} from '../verify-signed-funded-distribution.mjs';
export const GENESIS='0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206';
export const network=bitcoin.networks.regtest;
const equal=(a,b)=>Buffer.from(a).equals(Buffer.from(b));
export function canonical(value){
 if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
 if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
 assert.ok(value!==undefined&&!(typeof value==='number'&&!Number.isSafeInteger(value)),'Canonical values must be exact integers');
 return JSON.stringify(value);
}
export const digest=value=>Buffer.from(sha256(new TextEncoder().encode(canonical(value)))).toString('hex');
export function sats(n,allowZero=false){assert.ok(Number.isSafeInteger(n)&&n>=(allowZero?0:1)&&n<=MAX_SATS,'Invalid integer satoshis');return n;}
export function sum(ns){return sats(ns.reduce((a,b)=>a+sats(b,true),0),true);}
export function coreSats(btc){
 assert.equal(typeof btc,'number');const n=Math.round(btc*1e8);
 assert.ok(Number.isSafeInteger(n)&&Math.abs(btc*1e8-n)<0.001,'Imprecise Core amount');return sats(n,true);
}
const hex=(s,n)=>typeof s==='string'&&new RegExp(`^[0-9a-f]{${n*2}}$`).test(s);
export function publicWallet(wallet){
 assert.deepEqual(Object.keys(wallet).sort(),['change','creator','format','genesis','network','recipient','service'].sort(),'Unexpected wallet fields');
 assert.equal(wallet.format,'professional-regtest-public-wallet-v1');assert.equal(wallet.network,'regtest');assert.equal(wallet.genesis,GENESIS);
 assert.ok(Array.isArray(wallet.recipient)&&wallet.recipient.length>=1&&wallet.recipient.length<=24);
 const keys=[wallet.creator,wallet.change,wallet.service,...wallet.recipient];
 const seen=new Set();
 for(const k of keys){
  assert.deepEqual(Object.keys(k).sort(),['publicKeyHex','masterFingerprintHex','path'].sort());
  assert.ok(hex(k.publicKeyHex,33)&&hex(k.masterFingerprintHex,4)&&/^m\/84'\/[01]'\/0'\/[01]\/\d+$/.test(k.path),'Invalid regtest public identity');
  secp256k1.ProjectivePoint.fromHex(k.publicKeyHex);
  assert.ok(!seen.has(k.publicKeyHex),'Wallet roles and release keys must be distinct');seen.add(k.publicKeyHex);
 }
 const origin=k=>k.path.split('/').slice(0,4).join('/');
 assert.equal(origin(wallet.creator),origin(wallet.change),'Mixed account origins prohibited within creator/change roles');
 assert.equal(wallet.creator.masterFingerprintHex,wallet.change.masterFingerprintHex,'Creator/change wallet fingerprints differ');
 assert.equal(new Set(wallet.recipient.map(origin)).size,1,'Mixed account origins prohibited within recipient roles');
 assert.equal(new Set(wallet.recipient.map(k=>k.masterFingerprintHex)).size,1,'Recipient wallet fingerprints differ');
 // A mixed-origin wallet may use ONLY the independently trusted build service
 // key. Do not reinterpret the service key as belonging to the customer account.
 if(new Set(keys.map(origin)).size>1){
  assert.equal(CREATOR_SERVICE_POLICY.approved,true,'Mixed-origin service policy not approved');
  assert.equal(CREATOR_SERVICE_POLICY.network,'regtest');assert.equal(CREATOR_SERVICE_POLICY.genesis,GENESIS);
  assert.equal(canonical(wallet.service),canonical(CREATOR_SERVICE_POLICY.key),'Mixed-origin service destination differs from approved build policy');
 }
 return JSON.parse(canonical(wallet));
}
export const keyScript=k=>bitcoin.payments.p2wpkh({pubkey:Buffer.from(k.publicKeyHex,'hex'),network}).output.toString('hex');
export const keyAddress=k=>bitcoin.payments.p2wpkh({pubkey:Buffer.from(k.publicKeyHex,'hex'),network}).address;
export function giftScripts(plan,wallet){
 plan=validatePublicPlan(plan.releases,plan.totalSats);wallet=publicWallet(wallet);
 assert.equal(wallet.recipient.length,plan.releases.length);
 return plan.releases.map((r,i)=>{
  const key=wallet.recipient[i],locktime=Date.parse(r.date+'T00:00:00Z')/1000;
  const redeem=bitcoin.script.compile([bitcoin.script.number.encode(locktime),bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
   bitcoin.opcodes.OP_DROP,Buffer.from(key.publicKeyHex,'hex'),bitcoin.opcodes.OP_CHECKSIG]);
  const p2sh=bitcoin.payments.p2sh({redeem:{output:redeem},network});
  return {date:r.date,locktime,valueSats:r.amountSats,scriptPubKeyHex:p2sh.output.toString('hex'),
   redeemScriptHex:redeem.toString('hex'),address:p2sh.address,key};
 });
}
export function feeRate(estimate){
 const rate=estimate?.normal?.sat_vb;
 // Same Retail normal estimate / 2 sat-vB fallback. Rate and source are explicit.
 return typeof rate==='number'&&Number.isFinite(rate)&&rate>0?Math.ceil(rate):2;
}
// Retail SchedulePlanner + onFinishScheduleEnter, pinned in SOURCES.md.
// Optional trusted public rate snapshot, never described as a fetched live quote.
export function distributionFeeQuote(plan,estimate=null){
 const fallback=previewFees(plan);
 if(estimate===null)return {...fallback,source:'RETAIL_FALLBACK_NO_LIVE_RATE'};
 assert.deepEqual(Object.keys(estimate).sort(),['success','normal','low_priority'].sort(),'Unexpected fee snapshot fields');
 assert.deepEqual(Object.keys(estimate.normal).sort(),['sat_vb']);assert.deepEqual(Object.keys(estimate.low_priority).sort(),['sat_vb']);
 assert.equal(estimate.success,true,'Invalid fee estimate snapshot');
 const normal=estimate.normal?.sat_vb,low=estimate.low_priority?.sat_vb;
 ratePolicy(normal);ratePolicy(low);
 const retailEstimatedVsize=300+100*plan.releases.length;
 const normalSats=boundedFee(Math.ceil(retailEstimatedVsize*normal));
 return {serviceFeeSats:fallback.serviceFeeSats,estimatedMiningFeeSats:normalSats,
  estimatedLowPriorityMiningFeeSats:Math.min(normalSats,Math.ceil(retailEstimatedVsize*low)),
  estimatedTotalSats:sum([plan.totalSats,fallback.serviceFeeSats,normalSats]),
  source:'CALLER_SUPPLIED_RETAIL_RATE_SNAPSHOT_NOT_LIVE_QUOTE'};
}
function ratePolicy(rate){assert.ok(Number.isSafeInteger(rate)&&rate>=1&&rate<=1000,'Invalid fee rate');}
export function claimSize(inputs,destinationScriptHex){
 assert.ok(inputs.length>=1&&inputs.length<=24);
 const tx=new bitcoin.Transaction();tx.version=2;
 for(const r of inputs){
  tx.addInput(Buffer.alloc(32),0,0xfffffffd);
  // 73 bytes is a conservative DER+SIGHASH bound, not a fabricated signature.
  tx.setInputScript(tx.ins.length-1,bitcoin.script.compile([Buffer.alloc(73),Buffer.from(r.redeemScriptHex,'hex')]));
 }
 tx.addOutput(Buffer.from(destinationScriptHex,'hex'),546);return tx.virtualSize();
}
export function creatorSize(inputCount,gifts,withChange=true,discovery=null){
 const tx=new bitcoin.Transaction();tx.version=2;
 for(let i=0;i<inputCount;i++){
  tx.addInput(Buffer.alloc(32),i);
  tx.setWitness(i,[Buffer.alloc(73),Buffer.alloc(33)]);
 }
 for(const g of gifts)tx.addOutput(Buffer.from(g.scriptPubKeyHex,'hex'),g.valueSats);
 tx.addOutput(Buffer.from('0014'+'00'.repeat(20),'hex'),1000);
 if(discovery)tx.addOutput(Buffer.from(discovery.scriptPubKeyHex,'hex'),discovery.valueSats);
 if(withChange)tx.addOutput(Buffer.from('0014'+'00'.repeat(20),'hex'),546);
 return tx.virtualSize();
}
function boundedFee(n){sats(n);assert.ok(n<=100000,'Fee exceeds Retail claim safety ceiling');return n;}
// New beta quote is explicit; legacy/historical quote semantics are unchanged.
export function betaFundingQuote(plan,{rate=2,feeEstimate=null}={}){
 ratePolicy(rate);plan=validatePublicPlan(plan.releases,plan.totalSats);
 const base=distributionFeeQuote(plan,feeEstimate),discoveryValueSats=546,discoveryMiningFeeSats=31*Math.max(rate,feeEstimate?.normal?.sat_vb??rate);
 return {...base,baseMiningFeeSats:base.estimatedMiningFeeSats,discoveryValueSats,discoveryMiningFeeSats,
  estimatedMiningFeeSats:boundedFee(base.estimatedMiningFeeSats+discoveryMiningFeeSats),
  ...(base.estimatedLowPriorityMiningFeeSats===undefined?{}:{estimatedLowPriorityMiningFeeSats:boundedFee(Math.min(base.estimatedMiningFeeSats+discoveryMiningFeeSats,base.estimatedLowPriorityMiningFeeSats+31*feeEstimate.low_priority.sat_vb))}),
  estimatedTotalSats:sum([base.estimatedTotalSats,discoveryValueSats,discoveryMiningFeeSats])};
}
export function prepareCreation({plan,wallet,utxos,rate=2,feeEstimate=null,discovery=null}){
 ratePolicy(rate);plan=validatePublicPlan(plan.releases,plan.totalSats);wallet=publicWallet(wallet);
 const gifts=giftScripts(plan,wallet);
 const locator=discovery?discoveryForPlan({plan,wallet,publicAccount:discovery.publicAccount,index:discovery.index}):null;
 const fees=locator?betaFundingQuote(plan,{rate,feeEstimate}):distributionFeeQuote(plan,feeEstimate);
 assert.ok(utxos.length>=1&&utxos.length<=20,'Unsupported input count');
 const total=sum(utxos.map(u=>u.valueSats));
 for(const u of utxos)assert.equal(u.scriptPubKeyHex,keyScript(wallet.creator),'Funding key ownership mismatch');
 // Retail uses the approved mining quote as the distribution fee, not a
 // new discount/reserve model. Verify it against conservative actual size.
 const quotedFee=boundedFee(fees.estimatedMiningFeeSats);
 const minimumFee=Math.ceil(creatorSize(utxos.length,gifts,true,locator)*rate);
 assert.ok(quotedFee>=minimumFee,'Approved Retail mining quote is below size-based fee requirement; refresh quote');
 assert.ok(plan.totalSats-Math.ceil(claimSize(gifts,keyScript(wallet.change))*rate)>=546,
  'Gift cannot cover accumulated estimated claim fee and dust');
 const accumulationRequired=gifts.flatMap((g,i)=>g.valueSats-Math.ceil(claimSize([g],keyScript(wallet.change))*rate)<546?[i+1]:[]);
 let change=total-plan.totalSats-fees.serviceFeeSats-(locator?.valueSats??0)-quotedFee,networkFeeSats=quotedFee;
 assert.ok(change>=0,'Insufficient funding for approved Retail mining quote');
 let changeOutput=null;
 if(change>=546)changeOutput={valueSats:change,scriptPubKeyHex:keyScript(wallet.change)};
 else {
  // Explicitly expose any uneconomic remainder as mining fee; never hide it.
  networkFeeSats=boundedFee(total-plan.totalSats-fees.serviceFeeSats-(locator?.valueSats??0));change=0;
 }
 const intent=snapshotFundedDistributionIntent({network:'regtest',plan,utxos,giftOutputs:gifts,
  changeOutput,discovery:locator,serviceFeeOutput:{valueSats:fees.serviceFeeSats,scriptPubKeyHex:keyScript(wallet.service)},networkFeeSats});
 verifyGiftCltvOutputs({intent,plan,recipientPublicKeys:wallet.recipient.map(k=>k.publicKeyHex)});
 const unsigned=buildUnsignedFundedDistributionPsbt(intent,wallet.creator);
 return {kind:'create',plan,wallet,intent,unsigned,rate,feeEstimate,...(locator?{discovery:locator}:{}),feeSats:networkFeeSats,
  fundingSats:total,principalSats:plan.totalSats,serviceFeeSats:fees.serviceFeeSats,changeSats:change,
  quote:fees,accumulationRequired};
}
export function prepareBetaCreation(options){
 assert.ok(options?.discovery,'Beta creation requires bounded beneficiary discovery');
 assert.deepEqual(Object.keys(options.discovery).sort(),['index','publicAccount'],'Exact public discovery options required');
 return prepareCreation(options);
}
export function prepareClaim({manifest,releaseNumbers,destinationScriptHex,rate=2}){
 ratePolicy(rate);validateRecovery(manifest,manifest.digest);
 assert.ok(/^(0014[0-9a-f]{40}|76a914[0-9a-f]{40}88ac)$/.test(destinationScriptHex),'Unsupported beneficiary destination');
 assert.ok(Array.isArray(releaseNumbers)&&releaseNumbers.length>=1&&new Set(releaseNumbers).size===releaseNumbers.length,'Duplicate or empty claims');
 const releases=releaseNumbers.map(n=>{assert.ok(Number.isInteger(n)&&n>=1&&n<=manifest.releases.length,'Invalid release number');return manifest.releases[n-1];});
 const built=prepareRecoveredClaim({creatorTxid:manifest.creatorTxid,creatorRawHex:manifest.creatorRawHex,releases,destinationScriptHex,rate});
 const {chainVerified,signingAuthorized,broadcastAuthorized,creatorTxid,...payload}=built;
 return {...payload,kind:'claim',manifest,manifestDigest:manifest.digest,releaseNumbers:[...releaseNumbers]};
}
// Shared unsigned construction; no manifest fabrication, authorization, chain
// observation or signing. Recovery callers must independently establish those.
export function prepareRecoveredClaim({creatorTxid,creatorRawHex,releases,destinationScriptHex,rate=2}){
 ratePolicy(rate);
 assert.ok(/^(0014[0-9a-f]{40}|76a914[0-9a-f]{40}88ac)$/.test(destinationScriptHex),'Unsupported beneficiary destination');
 assert.ok(Array.isArray(releases)&&releases.length>=1&&releases.length<=24,'Invalid release count');
 const creator=bitcoin.Transaction.fromHex(creatorRawHex);assert.equal(creator.getId(),creatorTxid,'Recovery funding TXID mismatch');
 const seen=new Set();
 for(const r of releases){
  assert.ok(Number.isInteger(r.vout)&&r.vout>=0&&!seen.has(r.vout),'Duplicate or invalid recovery outpoint');seen.add(r.vout);
  assert.ok(r.key&&hex(r.key.publicKeyHex,33)&&hex(r.key.masterFingerprintHex,4)&&/^m\/84'\/[01]'\/0'\/[01]\/\d+$/.test(r.key.path),'Invalid recovery signer');
  secp256k1.ProjectivePoint.fromHex(r.key.publicKeyHex);
  const locktime=Date.parse(r.date+'T00:00:00Z')/1000;
  assert.ok(Number.isInteger(locktime)&&locktime>=500000000&&locktime<=0xffffffff&&r.date<='2105-12-31'&&new Date(locktime*1000).toISOString().slice(0,10)===r.date,'Invalid recovery date');
  assert.equal(r.locktime,locktime);
  const redeem=bitcoin.script.compile([bitcoin.script.number.encode(locktime),bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,bitcoin.opcodes.OP_DROP,Buffer.from(r.key.publicKeyHex,'hex'),bitcoin.opcodes.OP_CHECKSIG]);
  const payment=bitcoin.payments.p2sh({redeem:{output:redeem},network});
  assert.equal(r.redeemScriptHex,redeem.toString('hex'),'Recovery redeem script mismatch');
  assert.equal(r.scriptPubKeyHex,payment.output.toString('hex'),'Recovery P2SH mismatch');
  assert.ok(creator.outs[r.vout],'Recovery output missing');
  assert.equal(creator.outs[r.vout].script.toString('hex'),r.scriptPubKeyHex,'Recovery funding script mismatch');
  sats(r.valueSats);assert.equal(creator.outs[r.vout].value,r.valueSats,'Recovery funding amount mismatch');
 }
 const feeSats=boundedFee(Math.ceil(claimSize(releases,destinationScriptHex)*rate));
 const principalSats=sum(releases.map(r=>r.valueSats)),payoutSats=principalSats-feeSats;
 assert.ok(payoutSats>=546,'Claim fee leaves dust or nonpositive payout');
 const psbt=new bitcoin.Psbt({network});psbt.setVersion(2);psbt.setLocktime(Math.max(...releases.map(r=>r.locktime)));
 for(const r of releases)psbt.addInput({hash:creatorTxid,index:r.vout,sequence:0xfffffffd,
  nonWitnessUtxo:Buffer.from(creatorRawHex,'hex'),redeemScript:Buffer.from(r.redeemScriptHex,'hex'),
  bip32Derivation:[{pubkey:Buffer.from(r.key.publicKeyHex,'hex'),masterFingerprint:Buffer.from(r.key.masterFingerprintHex,'hex'),path:r.key.path}]});
 psbt.addOutput({script:Buffer.from(destinationScriptHex,'hex'),value:payoutSats});
 return {kind:'recovered-unsigned-claim',unsignedPsbtBase64:psbt.toBase64(),principalSats,payoutSats,feeSats,rate,destinationScriptHex,
  releases,creatorRawHex,creatorTxid,chainVerified:false,signingAuthorized:false,broadcastAuthorized:false};
}
export function finalizeRecoveredClaim(request,signedBase64){
 const rebuilt=prepareRecoveredClaim(request);
 for(const field of ['unsignedPsbtBase64','principalSats','payoutSats','feeSats','destinationScriptHex','creatorTxid','creatorRawHex'])assert.equal(request[field],rebuilt[field],'Recovered claim changed: '+field);
 return finalizePreparedClaim(rebuilt,signedBase64);
}
export function finalizeClaim(request,signedBase64){
 validateRecovery(request.manifest,request.manifestDigest);
 return finalizePreparedClaim(request,signedBase64);
}
function finalizePreparedClaim(request,signedBase64){
 if(request.manifest)assert.equal(request.creatorRawHex,request.manifest.creatorRawHex,'Trusted creator record changed');
 const trustedBytes=Buffer.from(request.creatorRawHex,'hex');
 const trustedCreator=bitcoin.Transaction.fromBuffer(trustedBytes);
 assert.equal(trustedCreator.getId(),request.creatorTxid??request.manifest.creatorTxid,'Trusted creator TXID mismatch');
 const strippedCreator=bitcoin.Transaction.fromBuffer(trustedBytes);
 strippedCreator.ins.forEach((_,i)=>strippedCreator.setWitness(i,[]));
 const strippedBytes=strippedCreator.toBuffer();
 const before=bitcoin.Psbt.fromBase64(request.unsignedPsbtBase64,{network});
 const after=bitcoin.Psbt.fromBase64(signedBase64,{network});
 assert.ok(equal(before.data.globalMap.unsignedTx.toBuffer(),after.data.globalMap.unsignedTx.toBuffer()),'Signed claim differs from approved transaction');
 assert.deepEqual(Object.keys(after.data.globalMap),['unsignedTx'],'Unexpected global metadata');
 assert.equal(after.inputCount,request.releases.length);assert.equal(after.txOutputs.length,1);
 assert.equal(after.txOutputs[0].value,request.payoutSats);assert.equal(after.txOutputs[0].script.toString('hex'),request.destinationScriptHex);
 assert.deepEqual(after.data.outputs,before.data.outputs,'Output metadata changed');
 const tx=bitcoin.Transaction.fromBuffer(before.data.globalMap.unsignedTx.toBuffer());
 for(let i=0;i<after.inputCount;i++){
  const b=before.data.inputs[i],a=after.data.inputs[i],r=request.releases[i];
  assert.ok(Object.keys(a).every(k=>['nonWitnessUtxo','redeemScript','bip32Derivation','partialSig'].includes(k)),'Unexpected claim input metadata');
  // PSBT nonWitnessUtxo identifies the prior transaction by TXID, not WTXID.
  // Jade can legitimately omit its witness. Accept ONLY the trusted full bytes
  // or their exact witness-stripped serialization, never arbitrary new witness.
  assert.ok(equal(b.nonWitnessUtxo,trustedBytes),'Approved funding metadata differs from trusted creator');
  assert.ok(a.nonWitnessUtxo,'Missing previous transaction');
  const returnedCreator=bitcoin.Transaction.fromBuffer(a.nonWitnessUtxo);
  assert.equal(returnedCreator.getId(),trustedCreator.getId(),'Previous transaction TXID changed');
  assert.ok(equal(a.nonWitnessUtxo,trustedBytes)||equal(a.nonWitnessUtxo,strippedBytes),'Previous transaction representation changed');
  const input=tx.ins[i];
  assert.equal(Buffer.from(input.hash).reverse().toString('hex'),trustedCreator.getId(),'Claim funding TXID changed');
  assert.equal(input.index,r.vout,'Claim funding output index changed');
  if(request.manifest)assert.deepEqual(r,request.manifest.releases[input.index],'Claim release differs from trusted manifest');
  const expectedOutput=trustedCreator.outs[input.index],returnedOutput=returnedCreator.outs[input.index];
  assert.ok(expectedOutput&&returnedOutput,'Claim previous output missing');
  for(const output of [expectedOutput,returnedOutput]){
   assert.equal(output.value,r.valueSats,'Previous output value changed');
   assert.equal(output.script.toString('hex'),r.scriptPubKeyHex,'Previous output locking script changed');
  }
  assert.ok(equal(b.redeemScript,a.redeemScript),'Redeem script changed');
  assert.deepEqual(a.bip32Derivation,b.bip32Derivation,'Signer origin changed');
  assert.equal(a.partialSig?.length,1,'One valid signature per claim input required');
  const sig=a.partialSig[0];assert.equal(sig.pubkey.toString('hex'),r.key.publicKeyHex,'Wrong beneficiary signing key');
  const decoded=bitcoin.script.signature.decode(sig.signature);assert.equal(decoded.hashType,bitcoin.Transaction.SIGHASH_ALL);
  const hash=tx.hashForSignature(i,b.redeemScript,decoded.hashType);
  assert.ok(secp256k1.verify(decoded.signature,hash,sig.pubkey,{lowS:true}),'Invalid claim signature');
  after.finalizeInput(i,()=>({finalScriptSig:bitcoin.script.compile([sig.signature,b.redeemScript])}));
 }
 assert.equal(sum(request.releases.map(r=>r.valueSats))-sum(after.txOutputs.map(o=>o.value)),request.feeSats,'Claim mining fee changed');
 const raw=after.extractTransaction(true);
 assert.ok(raw.virtualSize()<=claimSize(request.releases,request.destinationScriptHex),'Signed size exceeded conservative estimate');
 assert.ok(request.feeSats>=raw.virtualSize()*request.rate,'Insufficient signed claim fee');
 return {txid:raw.getId(),rawTransactionHex:raw.toHex(),vsize:raw.virtualSize(),feeSats:request.feeSats};
}
export function finalizeCreation(request,signedBase64){
 const result=finalizeVerifiedCreatorRegtestTransaction(request.unsigned,signedBase64);
 const tx=bitcoin.Transaction.fromHex(result.rawTransactionHex);
 assert.ok(request.feeSats>=tx.virtualSize()*request.rate,'Insufficient creator fee');
 return {...result,vsize:tx.virtualSize(),feeSats:request.feeSats};
}
export function recoveryManifest(creation,creatorRawHex){
 const tx=bitcoin.Transaction.fromHex(creatorRawHex);
 const unsigned=bitcoin.Psbt.fromBase64(creation.unsigned.unsignedPsbtBase64,{network});
 // Unsigned transaction identity remains equal for native-segwit creator inputs.
 assert.equal(tx.getId(),bitcoin.Transaction.fromBuffer(unsigned.data.globalMap.unsignedTx.toBuffer()).getId());
 const body={format:creation.discovery?'professional-public-recovery-v2':'professional-public-recovery-v1',...(creation.discovery?{discovery:creation.discovery}:{}),network:'regtest',genesis:GENESIS,
  plan:creation.plan,wallet:creation.wallet,creatorTxid:tx.getId(),creatorRawHex,
  releases:giftScripts(creation.plan,creation.wallet).map((g,vout)=>({...g,vout})),
  ledger:{fundingSats:creation.fundingSats,principalSats:creation.principalSats,
   serviceFeeSats:creation.serviceFeeSats,creatorFeeSats:creation.feeSats,changeSats:creation.changeSats,...(creation.discovery?{discoverySats:creation.discovery.valueSats}:{})}};
 const result={...body,digest:digest(body)};validateRecovery(result,result.digest);return result;
}
export function validateRecovery(manifest,independentDigest){
 const {digest:claimed,...body}=manifest;
 const v2=body.format==='professional-public-recovery-v2';
 assert.deepEqual(Object.keys(body).sort(),['format','network','genesis','plan','wallet','creatorTxid','creatorRawHex','releases','ledger',...(v2?['discovery']:[])].sort(),'Unexpected recovery fields');
 assert.ok(v2||body.format==='professional-public-recovery-v1');assert.equal(body.network,'regtest');assert.equal(body.genesis,GENESIS);
 assert.ok(hex(independentDigest,32),'Independent authenticated recovery digest required');
 assert.equal(digest(body),claimed,'Recovery record changed');assert.equal(claimed,independentDigest,'Independent recovery digest mismatch');
 const wallet=publicWallet(body.wallet),plan=validatePublicPlan(body.plan.releases,body.plan.totalSats);
 assert.equal(canonical(body.plan),canonical(plan),'Noncanonical recovery plan');
 assert.deepEqual(body.releases,giftScripts(plan,wallet).map((g,vout)=>({...g,vout})),'Recovery script or public wallet mismatch');
 if(v2){const expected=discoveryForPlan({plan,wallet,publicAccount:body.discovery.publicAccount,index:body.discovery.index});assert.equal(canonical(body.discovery),canonical(expected),'Recovery discovery changed');validateDiscoveryIntent({gifts:body.releases,discovery:body.discovery});}
 const tx=bitcoin.Transaction.fromHex(body.creatorRawHex);assert.equal(tx.getId(),body.creatorTxid);
 const l=body.ledger,fees=previewFees(plan);
 assert.deepEqual(Object.keys(l).sort(),['fundingSats','principalSats','serviceFeeSats','creatorFeeSats','changeSats',...(v2?['discoverySats']:[])].sort());
 Object.values(l).forEach(n=>sats(n,true));assert.equal(l.principalSats,plan.totalSats);assert.equal(l.serviceFeeSats,fees.serviceFeeSats);
 assert.equal(l.fundingSats,sum([l.principalSats,l.serviceFeeSats,l.creatorFeeSats,l.changeSats,...(v2?[l.discoverySats]:[])]));
 assert.ok(l.creatorFeeSats>0&&l.creatorFeeSats<=100000);
 assert.equal(tx.outs.length,body.releases.length+1+(v2?1:0)+(l.changeSats?1:0));
 body.releases.forEach(r=>{assert.equal(tx.outs[r.vout].value,r.valueSats);assert.equal(tx.outs[r.vout].script.toString('hex'),r.scriptPubKeyHex);});
 const service=tx.outs[body.releases.length];assert.equal(service.value,l.serviceFeeSats);assert.equal(service.script.toString('hex'),keyScript(wallet.service));
 if(v2){const o=tx.outs[body.releases.length+1];assert.equal(l.discoverySats,body.discovery.valueSats);assert.equal(o.value,l.discoverySats);assert.equal(o.script.toString('hex'),body.discovery.scriptPubKeyHex);}
 if(l.changeSats){const change=tx.outs.at(-1);assert.ok(l.changeSats>=546);assert.equal(change.value,l.changeSats);assert.equal(change.script.toString('hex'),keyScript(wallet.change));}
 return body;
}

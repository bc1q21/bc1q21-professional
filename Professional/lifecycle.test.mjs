import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import bitcoin from 'bitcoinjs-lib';
import {createPublicPlan,validatePublicPlan,previewFees,btcToSats} from './public-date-planner.mjs';
import {previewServiceFeeOutput} from './public-service-output.mjs';
import {readFileSync} from 'node:fs';
import {usdToSats} from './planner-amounts.mjs';
import {offlineTransfer,decodeOfflineTransfer} from './lifecycle/offline-transfer.mjs';
import {GENESIS,canonical,distributionFeeQuote,digest,keyScript,prepareCreation,prepareClaim,finalizeCreation,finalizeClaim,recoveryManifest,validateRecovery,feeRate,claimSize} from './lifecycle/public-model.mjs';
import {verifyWalletRegistration,RegtestGiftCoordinator,assertRegtest} from './lifecycle/coordinator.mjs';
import {initializeDisposableSigner,signDisposableRequest} from './lifecycle/disposable-offline-signer.mjs';
// Scan secret fields/encodings, not arbitrary substrings in base58 addresses.
function assertPublicData(value){
 if(value&&typeof value==='object'){
  for(const [key,child] of Object.entries(value)){
   assert.doesNotMatch(key,/seed|privatekey|xprv|wif|mnemonic|recoverywords/i);
   assertPublicData(child);
  }
 }else if(typeof value==='string'){
  assert.doesNotMatch(value,/^(?:(?:xprv|tprv)[1-9A-HJ-NP-Za-km-z]+|[59][1-9A-HJ-NP-Za-km-z]{50}|[KLc][1-9A-HJ-NP-Za-km-z]{51})$/);
 }
}
function fixture(){
 const directory=mkdtempSync(join(tmpdir(),'professional-lifecycle-unit-')),file=join(directory,'disposable.json');
 const registration=initializeDisposableSigner(file,5),wallet=registration.wallet;
 const plan=createPublicPlan({btc:'0.00100002',count:5,period:'yearly',start:'2030-01-02'});
 const funding=new bitcoin.Transaction();funding.addInput(Buffer.alloc(32,1),0);funding.addOutput(Buffer.from(keyScript(wallet.creator),'hex'),103752);
 const utxos=[{txid:funding.getId(),vout:0,valueSats:103752,scriptPubKeyHex:keyScript(wallet.creator)}];
 const body={format:'professional-offline-signing-request-v1',network:'regtest',genesis:GENESIS,revision:1,
  ...prepareCreation({plan,wallet,utxos,rate:2})};
 const request={...body,requestDigest:digest(body)};
 return {directory,file,registration,wallet,plan,utxos,request,close:()=>rmSync(directory,{recursive:true,force:true})};
}
function withFixture(fn){const f=fixture();try{return fn(f)}finally{f.close()}}
function claimFixture(f,numbers=[1]){
 const returned=signDisposableRequest(f.file,f.request,f.request.requestDigest),final=finalizeCreation(f.request,returned.signedPsbtBase64);
 const manifest=recoveryManifest(f.request,final.rawTransactionHex);
 const body={format:'professional-offline-signing-request-v1',network:'regtest',genesis:GENESIS,revision:1,
  ...prepareClaim({manifest,releaseNumbers:numbers,destinationScriptHex:keyScript(f.wallet.change),rate:2})};
 return {manifest,request:{...body,requestDigest:digest(body)}};
}
test('gross principal, Retail fees, exact remainder and actual creator fee conserve sats',()=>withFixture(f=>{
 assert.deepEqual(f.plan.releases.map(r=>r.amountSats),[20001,20001,20000,20000,20000]);
 assert.deepEqual(previewFees(f.plan),{serviceFeeSats:2000,estimatedMiningFeeSats:1750,estimatedTotalSats:103752});
 assert.equal(f.request.feeSats,1750);
 assert.equal(f.request.principalSats+f.request.serviceFeeSats+f.request.feeSats+f.request.changeSats,103752);
 assert.equal(f.request.intent.serviceFee.scriptPubKeyHex,keyScript(f.wallet.service));
 assert.notEqual(f.request.intent.serviceFee.scriptPubKeyHex,'0014'+'ab'.repeat(20));
 assert.equal(btcToSats('0.00100002'),100002);assert.equal(usdToSats('80.0016','80000'),100002);
 assert.equal(feeRate({}),2);assert.equal(feeRate({normal:{sat_vb:2.1}}),3);
}));
test('public registration requires pinned identity and possession of each distinct role key',()=>withFixture(f=>{
 assert.deepEqual(verifyWalletRegistration(f.registration,f.registration.walletDigest),f.wallet);
 assert.throws(()=>verifyWalletRegistration(f.registration,'00'.repeat(32)),/pinned/);
 assert.throws(()=>verifyWalletRegistration({...f.registration,proofs:f.registration.proofs.map(()=> '00'.repeat(64))},f.registration.walletDigest),/proof/);
 const changed=structuredClone(f.wallet);changed.service=changed.creator;
 assert.throws(()=>prepareCreation({plan:f.plan,wallet:changed,utxos:f.utxos}),/distinct/);
}));
test('offline signing independently reconstructs fees, service, change, principal and plan',()=>withFixture(f=>{
 for(const key of ['feeSats','serviceFeeSats','changeSats','principalSats']){
  const {requestDigest,...body}=structuredClone(f.request);body[key]++;
  const tampered={...body,requestDigest:digest(body)};
  assert.throws(()=>signDisposableRequest(f.file,tampered,tampered.requestDigest),/financial intent/);
 }
 const changed=structuredClone(f.request);changed.plan.releases[0].date='2031-01-01';
 assert.throws(()=>signDisposableRequest(f.file,changed,f.request.requestDigest),/altered/);
 assert.throws(()=>signDisposableRequest(f.file,f.request,'00'.repeat(32)),/fingerprint/);
}));
test('creator return rejects changed output, signature, metadata and wrong wallet',()=>withFixture(f=>{
 const returned=signDisposableRequest(f.file,f.request,f.request.requestDigest);
 const base=bitcoin.Psbt.fromBase64(returned.signedPsbtBase64);
 for(const mutate of [p=>{p.data.inputs[0].partialSig[0].signature[5]^=1},p=>{p.data.inputs[0].bip32Derivation[0].path="m/84'/1'/0'/0/9"},p=>{p.data.inputs[0].unknownKeyVals=[{key:Buffer.from('fc00','hex'),value:Buffer.from('01','hex')}] }]){
  const p=bitcoin.Psbt.fromBuffer(base.toBuffer());mutate(p);
  assert.throws(()=>finalizeCreation(f.request,p.toBase64()));
 }
 const p=bitcoin.Psbt.fromBase64(f.request.unsigned.unsignedPsbtBase64);p.addOutput({script:Buffer.from(keyScript(f.wallet.service),'hex'),value:546});
 assert.throws(()=>finalizeCreation(f.request,p.toBase64()),/differs/);
}));
test('single and accumulated claims deduct bounded fees from gross principal, not gift outputs',()=>withFixture(f=>{
 for(const numbers of [[1],[2,3],[1,2,3,4,5]]){
  const {request}=claimFixture(f,numbers),signed=signDisposableRequest(f.file,request,request.requestDigest);
  const final=finalizeClaim(request,signed.signedPsbtBase64);
  assert.equal(request.payoutSats+request.feeSats,request.principalSats);
  assert.equal(request.feeSats,claimSize(request.releases,request.destinationScriptHex)*2);
  assert.ok(final.feeSats>=2*final.vsize);
 }
}));
test('claim return rejects signature, redeem, origin, destination and final-script substitution',()=>withFixture(f=>{
 const {request}=claimFixture(f,[1,2]),signed=signDisposableRequest(f.file,request,request.requestDigest);
 for(const mutate of [p=>{p.data.inputs[0].partialSig[0].signature[5]^=1},p=>{p.data.inputs[0].redeemScript[3]^=1},p=>{p.data.inputs[0].bip32Derivation[0].masterFingerprint[0]^=1},p=>{p.data.inputs[0].finalScriptSig=Buffer.from('00','hex')}]){
  const p=bitcoin.Psbt.fromBase64(signed.signedPsbtBase64);mutate(p);
  assert.throws(()=>finalizeClaim(request,p.toBase64()));
 }
 const {requestDigest,...body}=structuredClone(request);body.destinationScriptHex=keyScript(f.wallet.service);
 const tampered={...body,requestDigest:digest(body)};
 assert.throws(()=>signDisposableRequest(f.file,tampered,tampered.requestDigest),/financial intent/);
}));
test('recovery is public, independently pinned and cryptographically bound to all scripts and amounts',()=>withFixture(f=>{
 const {manifest}=claimFixture(f);
 assert.equal(validateRecovery(manifest,manifest.digest).ledger.principalSats,100002);
 assert.throws(()=>validateRecovery(manifest),/Independent/);
 assert.throws(()=>validateRecovery(manifest,'00'.repeat(32)),/mismatch/);
 for(const mutation of [m=>m.releases[0].valueSats++,m=>m.releases[0].redeemScriptHex='00',m=>m.ledger.creatorFeeSats++,m=>m.wallet.service.publicKeyHex=m.wallet.creator.publicKeyHex]){
  const m=structuredClone(manifest);mutation(m);assert.throws(()=>validateRecovery(m,manifest.digest));
 }
 assertPublicData(manifest);
 assert.throws(()=>prepareClaim({manifest,releaseNumbers:[1,1],destinationScriptHex:keyScript(f.wallet.change)}),/Duplicate/);
 assert.throws(()=>prepareClaim({manifest,releaseNumbers:[0],destinationScriptHex:keyScript(f.wallet.change)}),/number/);
}));
test('fee, dust and input ownership checks reject unfundable or uneconomic gifts',()=>withFixture(f=>{
 assert.throws(()=>prepareCreation({plan:f.plan,wallet:f.wallet,utxos:f.utxos,rate:0}),/fee rate/);
 assert.throws(()=>prepareCreation({plan:f.plan,wallet:f.wallet,utxos:f.utxos.map(u=>({...u,valueSats:100002}))}),/Insufficient/);
 assert.throws(()=>prepareCreation({plan:f.plan,wallet:f.wallet,utxos:f.utxos.map(u=>({...u,scriptPubKeyHex:keyScript(f.wallet.service)}))}),/ownership/);
 const small=validatePublicPlan([{...f.plan.releases[0],amountSats:546}],546);
 assert.throws(()=>prepareCreation({plan:small,wallet:{...f.wallet,recipient:f.wallet.recipient.slice(0,1)},utxos:f.utxos}),/cannot cover/);
 const accumulated=validatePublicPlan(f.plan.releases.map(r=>({...r,amountSats:546})),2730);
 assert.deepEqual(prepareCreation({plan:accumulated,wallet:f.wallet,utxos:f.utxos}).accumulationRequired,[1,2,3,4,5]);
 const duplicate=[...f.utxos,...f.utxos];assert.throws(()=>prepareCreation({plan:f.plan,wallet:f.wallet,utxos:duplicate}),/Duplicate/);
}));
test('mainnet, wrong genesis, unsynchronized node and unapproved execution fail closed',async()=>{
 await assert.rejects(()=>assertRegtest(async()=>({chain:'main'})),/regtest/);
 await assert.rejects(()=>assertRegtest(async m=>m==='getblockchaininfo'?{chain:'regtest'}:'00'.repeat(32)),/genesis/);
 await assert.rejects(()=>assertRegtest(async m=>m==='getblockchaininfo'?{chain:'regtest',initialblockdownload:true}:GENESIS),/synchronized/);
 const f=fixture();try{
  const c=new RegtestGiftCoordinator({rpc:async()=>{throw Error('Must not call Core')},registration:f.registration,independentWalletDigest:f.registration.walletDigest});
  await assert.rejects(()=>c.broadcastSigned({requestDigest:'00'.repeat(32),explicitRequestApproval:'00'.repeat(32)}),/explicitly authorized/);
 }finally{f.close()}
});

test('browser diagnostic has no synthetic service destination and edits invalidate its unsigned review',()=>withFixture(f=>{
 const html=readFileSync(new URL('./funding-workspace.html',import.meta.url),'utf8');
 assert.doesNotMatch(html,/scriptPubKeyHex:'0014'\+'ab'\.repeat/);
 assert.match(html,/\['network-fee','jade-fingerprint','service-public-key'\]/);
 assert.match(html,/<button disabled>Show funding QR/);
 assert.deepEqual(previewServiceFeeOutput({publicKeyHex:f.wallet.service.publicKeyHex,valueSats:2000}),f.request.intent.serviceFee);
 for(const key of ['', 'ab'.repeat(33),'02'+'ff'.repeat(32)])assert.throws(()=>previewServiceFeeOutput({publicKeyHex:key,valueSats:2000}));
}));

test('existing Jade crypto-psbt codec round-trips creator and accumulated-claim transfer bytes',()=>withFixture(f=>{
 for(const request of [f.request,claimFixture(f,[1,2,3]).request]){
  const transfer=offlineTransfer(request);
  assert.equal(decodeOfflineTransfer([...transfer.frames].reverse()),transfer.psbtBase64);
  assert.equal(transfer.signingAuthorized,false);assert.equal(transfer.hardwareTested,false);
 }
}));

test('Retail rate snapshot quote, change, and explicit dust remainder retain exact fee accounting',()=>withFixture(f=>{
 const snapshot={success:true,normal:{sat_vb:2},low_priority:{sat_vb:1}};
 const quote=distributionFeeQuote(f.plan,snapshot);
 assert.equal(quote.estimatedMiningFeeSats,1600);assert.equal(quote.estimatedLowPriorityMiningFeeSats,800);
 const usingSnapshot=prepareCreation({plan:f.plan,wallet:f.wallet,utxos:f.utxos,rate:2,feeEstimate:snapshot});
 assert.equal(usingSnapshot.feeSats,1750); // 150-sat dust remainder is explicit mining fee.
 assert.equal(usingSnapshot.quote.estimatedMiningFeeSats,1600);
 for(const extra of [0,545,546,600]){
  const r=prepareCreation({plan:f.plan,wallet:f.wallet,utxos:f.utxos.map(u=>({...u,valueSats:u.valueSats+extra}))});
  assert.equal(r.feeSats,1750+(extra<546?extra:0));
  assert.equal(r.changeSats,extra<546?0:extra);
  assert.equal(r.principalSats+r.serviceFeeSats+r.feeSats+r.changeSats,r.fundingSats);
 }
 assert.throws(()=>prepareCreation({plan:f.plan,wallet:f.wallet,utxos:f.utxos,rate:100}),/refresh quote/);
}));

test('coordinator approval snapshots cannot be rewritten through returned objects or async input edits',async()=>{
 const f=fixture();try{
  const funding=structuredClone(f.utxos[0]),tip='a'.repeat(64),block='b'.repeat(64);
  let sends=0,edited=false;
  const rpc=async(m,a)=>{
   if(!edited){edited=true;f.utxos[0].valueSats++;}
   switch(m){
    case 'getblockhash':return GENESIS;
    case 'getbestblockhash':return tip;
    case 'getblockchaininfo':return {chain:'regtest',initialblockdownload:false,blocks:100,bestblockhash:tip};
    case 'getblockheader':return a[0]===tip?{hash:tip,height:100,mediantime:1893500000,confirmations:1}:{hash:block,height:50,confirmations:51};
    case 'getrawtransaction':return {txid:funding.txid,blockhash:block,confirmations:51,vout:[{value:funding.valueSats/1e8,scriptPubKey:{hex:funding.scriptPubKeyHex}}]};
    case 'gettxout':return {bestblock:tip,confirmations:51,value:funding.valueSats/1e8,scriptPubKey:{hex:funding.scriptPubKeyHex}};
    case 'testmempoolaccept':return [{txid:bitcoin.Transaction.fromHex(a[0][0]).getId(),allowed:true}];
    case 'sendrawtransaction':sends++;return bitcoin.Transaction.fromHex(a[0]).getId();
    default:throw Error('Forbidden unit RPC');
   }
  };
  const c=new RegtestGiftCoordinator({rpc,registration:f.registration,independentWalletDigest:f.registration.walletDigest,isolatedRegtestAuthorization:true});
  const approvedPlanDigest=c.approvePlan(f.plan),returned=await c.create({utxos:f.utxos,approvedPlanDigest});
  assert.equal(returned.intent.inputs[0].valueSats,103752);
  const original=structuredClone(returned),signed=signDisposableRequest(f.file,original,original.requestDigest);
  returned.intent.serviceFee.valueSats++;returned.plan.releases[0].date='2040-01-01';returned.unsigned.psbtSha256='00'.repeat(32);
  const result=await c.broadcastSigned({...signed,explicitRequestApproval:signed.requestDigest});
  assert.equal(sends,1);assert.equal(result.broadcastSubmitted,true);assert.equal(result.confirmed,false);assert.equal(result.manifest.plan.releases[0].date,'2030-01-02');
  assert.equal(result.manifest.ledger.serviceFeeSats,2000);
 }finally{f.close()}
});

test('public recovery and rate snapshots reject unexpected private or misleading metadata',()=>withFixture(f=>{
 const {manifest}=claimFixture(f),{digest:old,...body}=manifest;
 const extra={...body,privateKey:'never-accept-this-field'};
 assert.throws(()=>validateRecovery({...extra,digest:digest(extra)},digest(extra)),/Unexpected recovery/);
 const changed=structuredClone(body);changed.plan.seedHex='never-accept-this-field';
 assert.throws(()=>validateRecovery({...changed,digest:digest(changed)},digest(changed)),/Noncanonical/);
 assert.throws(()=>distributionFeeQuote(f.plan,{success:true,normal:{sat_vb:2,privateKey:'invalid'},low_priority:{sat_vb:1}}),/deep-equal/);
}));

test('public-data secrecy check rejects secret fields and key encodings without mistaking address fragments',()=>{
 assert.doesNotThrow(()=>assertPublicData({address:'2NabcWifaaaaaaaaaaaaaaaaaaaaaaaaaa'}));
 for(const value of [{privateKey:'secret'},{nested:{seedHex:'secret'}},{WIF:'secret'},
  {value:'xprv'+'1'.repeat(107)},{value:'K'+'1'.repeat(51)},{value:'9'+'1'.repeat(50)}])
  assert.throws(()=>assertPublicData(value));
});

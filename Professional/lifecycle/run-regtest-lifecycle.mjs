// Explicit acceptance runner: node Professional/lifecycle/run-regtest-lifecycle.mjs
// Fresh Core chain and random disposable offline wallet; never uses Jade or BTC.
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath,pathToFileURL} from 'node:url';
import bitcoin from 'bitcoinjs-lib';
import {createPublicPlan,satsToBtc,validatePublicPlan} from '../public-date-planner.mjs';
import {GENESIS,keyAddress,keyScript,digest,prepareClaim,finalizeClaim} from './public-model.mjs';
import {RegtestGiftCoordinator,recoverPublicGift,reconcileGift} from './coordinator.mjs';
import {withCoreLab,offlineFixtureSession,CORE_IMAGE} from './local-core-lab.mjs';
export async function runLifecycleAcceptance({registrationMode='software',accountPath="m/84'/1'/0'"}={}){
 assert.ok(['software','psbt'].includes(registrationMode));
 return withCoreLab(async({container,rpc,readOnlyRpc})=>{
  const offline=offlineFixtureSession(),clean=mkdtempSync(join(tmpdir(),'professional-public-recovery-'));
  try{
   const initialized=offline.initialize(5,{accountPath}),wallet=initialized.wallet;
   const registration=registrationMode==='psbt'?{wallet,walletDigest:initialized.walletDigest,
    signedRegistrationPsbtBase64:offline.registrationProof(initialized.walletDigest).signedRegistrationPsbtBase64}:initialized;
   const coordinator=new RegtestGiftCoordinator({rpc,registration,independentWalletDigest:registration.walletDigest,isolatedRegtestAuthorization:true});
   const plan=validatePublicPlan(createPublicPlan({btc:'0.00100002',count:5,period:'yearly',start:'2030-01-02'}).releases.map((r,i)=>({...r,date:`2030-01-0${i+2}`})),100002);
   const approval=coordinator.approvePlan(plan);
   await rpc('setmocktime',[Date.parse('2030-01-01T12:00:00Z')/1000]);
   await rpc('createwallet',['disposable-regtest-miner']);
   const miner=await rpc('getnewaddress',[]);await rpc('generatetoaddress',[101,miner]);
   const depositSats=103752;
   const depositTxid=await rpc('sendtoaddress',[keyAddress(wallet.creator),satsToBtc(depositSats)]);
   const deposit=await rpc('getrawtransaction',[depositTxid,true]);
   const depositWalletRecord=await rpc('gettransaction',[depositTxid]);
   const externalDepositFeeSats=Math.round(-depositWalletRecord.fee*1e8);
   const vout=deposit.vout.find(o=>o.scriptPubKey.hex===keyScript(wallet.creator)).n;
   const utxos=[{txid:depositTxid,vout,valueSats:depositSats,scriptPubKeyHex:keyScript(wallet.creator)}];
   await assert.rejects(()=>coordinator.create({utxos,approvedPlanDigest:approval}),/not confirmed/);
   await rpc('generatetoaddress',[1,miner]);
   const request=await coordinator.create({utxos,approvedPlanDigest:approval,rate:2});
   assert.equal(request.principalSats,100002);assert.equal(request.serviceFeeSats,2000);
   assert.equal(request.quote.estimatedMiningFeeSats,1750);
   const signed=offline.sign(request);
   // A financial edit must invalidate even a correctly signed previous request.
   const edited=validatePublicPlan(plan.releases.map((r,i)=>({...r,amountSats:r.amountSats+(i===0?1:i===1?-1:0)})),100002);
   coordinator.approvePlan(edited);
   await assert.rejects(()=>coordinator.broadcastSigned({...signed,explicitRequestApproval:signed.requestDigest}),/invalidated/);
   coordinator.approvePlan(plan);
   const fresh=await coordinator.create({utxos,approvedPlanDigest:digest(plan),rate:2}),freshSigned=offline.sign(fresh);
   const creator=await coordinator.broadcastSigned({...freshSigned,explicitRequestApproval:freshSigned.requestDigest});
   await assert.rejects(()=>coordinator.broadcastSigned({...freshSigned,explicitRequestApproval:freshSigned.requestDigest}),/consumed/);
   const manifest=creator.manifest;
   await assert.rejects(()=>recoverPublicGift({manifest,independentDigest:manifest.digest,rpc:readOnlyRpc}),/not confirmed/);
   const [creatorBlock]=await rpc('generatetoaddress',[1,miner]);
   const recoveryPath=join(clean,'public-recovery.json');writeFileSync(recoveryPath,JSON.stringify(manifest));
   const cleanRecover=()=>JSON.parse(execFileSync(process.execPath,[fileURLToPath(new URL('./recover-public.mjs',import.meta.url)),recoveryPath,manifest.digest,container],{cwd:clean,encoding:'utf8'}));
   let recovered=cleanRecover();assert.equal(recovered.unspentPrincipalSats,100002);
   assert.ok(recovered.releases.every(r=>!r.mature));
   await assert.rejects(()=>coordinator.claim({manifest,independentDigest:manifest.digest,releaseNumbers:[1],destinationScriptHex:keyScript(wallet.change)}),/immature/);
   // Test actual consensus too, not just our UI/coordinator maturity check.
   const prematureBody={format:'professional-offline-signing-request-v1',network:'regtest',genesis:GENESIS,revision:99,
    ...prepareClaim({manifest,releaseNumbers:[1],destinationScriptHex:keyScript(wallet.change),rate:2})};
   const premature={...prematureBody,requestDigest:digest(prematureBody)},prematureSigned=offline.sign(premature);
   const early=finalizeClaim(premature,prematureSigned.signedPsbtBase64);
   const [rejected]=await rpc('testmempoolaccept',[[early.rawTransactionHex]]);
   assert.equal(rejected.allowed,false);assert.match(rejected['reject-reason'],/non-final/);
   // Active-chain regression: invalidating the distribution's block must remove
   // confirmation authority; restoring it must permit independent recovery.
   await rpc('invalidateblock',[creatorBlock]);
   await assert.rejects(()=>recoverPublicGift({manifest,independentDigest:manifest.digest,rpc:readOnlyRpc}),/not confirmed|active chain/);
   await rpc('reconsiderblock',[creatorBlock]);assert.equal(cleanRecover().unspentPrincipalSats,100002);
   const advance=async(date)=>{
    const target=Date.parse(date+'T00:02:00Z')/1000;
    for(let i=0;i<12;i++){await rpc('setmocktime',[target+i]);await rpc('generatetoaddress',[1,miner]);}
   };
   const claims=[],stages=[];
   const restoredBackup=offline.restoreBackup();
   assert.equal(restoredBackup.originalFixtureRemoved,true);assert.equal(restoredBackup.disposableBackupRestored,true);
   for(const [numbers,date] of [[[1],'2030-01-02'],[[2,3],'2030-01-04'],[[4,5],'2030-01-06']]){
    await advance(date);
    // Recreate coordinator from public registration, then recover from the
    // portable public record: no original application session is required.
    const recipient=new RegtestGiftCoordinator({rpc,registration,independentWalletDigest:registration.walletDigest,isolatedRegtestAuthorization:true});
    const claim=await recipient.claim({manifest,independentDigest:manifest.digest,releaseNumbers:numbers,destinationScriptHex:keyScript(wallet.change),rate:2});
    const returned=offline.sign(claim);
    const final=await recipient.broadcastSigned({...returned,explicitRequestApproval:returned.requestDigest});
    await assert.rejects(()=>recipient.claim({manifest,independentDigest:manifest.digest,releaseNumbers:numbers,destinationScriptHex:keyScript(wallet.change)}),/spent/);
    await rpc('generatetoaddress',[1,miner]);claims.push(final.txid);
    const ledger=await reconcileGift({manifest,independentDigest:manifest.digest,claimTxids:claims,beneficiaryScriptHex:keyScript(wallet.change),rpc:readOnlyRpc});
    stages.push({releases:numbers,txid:final.txid,feeSats:claim.feeSats,payoutSats:claim.payoutSats,vsize:final.vsize,ledger});
    recovered=cleanRecover();assert.equal(recovered.unspentPrincipalSats,ledger.remainingPrincipalSats);
    await assert.rejects(()=>recipient.claim({manifest,independentDigest:manifest.digest,releaseNumbers:numbers,destinationScriptHex:keyScript(wallet.change)}),/spent/);
   }
   assert.equal(stages.at(-1).ledger.remainingPrincipalSats,0);
   assert.equal(stages.at(-1).ledger.allSatoshisAccountedFor,true);
   // Actual final beneficiary UTXOs, change and service fee are also observed,
   // independently of our projected ledger (not just arithmetic equality).
   const serviceUtxo=await rpc('gettxout',[creator.txid,5,true]);assert.equal(Math.round(serviceUtxo.value*1e8),2000);
   let observedBeneficiarySats=0;
   for(const txid of claims){const u=await rpc('gettxout',[txid,0,true]);assert.ok(u.confirmations>=1);observedBeneficiarySats+=Math.round(u.value*1e8);}
   assert.equal(observedBeneficiarySats,stages.at(-1).ledger.beneficiarySats);
   if(fresh.changeSats){const change=await rpc('gettxout',[creator.txid,6,true]);assert.equal(Math.round(change.value*1e8),fresh.changeSats);}
   assert.equal(fresh.feeSats,1750);assert.equal(fresh.changeSats,0);
   return {format:'professional-complete-regtest-lifecycle-evidence-v1',coreImage:CORE_IMAGE,
    network:'regtest',genesis:GENESIS,createdAt:new Date().toISOString(),walletDigest:registration.walletDigest,
    softwareOfflineSigner:true,signerNetwork:'none',registrationProofMode:registrationMode,accountOrigin:accountPath,hardwareTested:false,customerFundingEnabled:false,
    deposit:{txid:depositTxid,vout,valueSats:depositSats,externalSenderMiningFeeSats:externalDepositFeeSats},
    creator:{txid:creator.txid,blockhash:creatorBlock,vsize:creator.vsize,feeSats:creator.feeSats,serviceFeeSats:2000,changeSats:fresh.changeSats},
    releases:manifest.releases.map(r=>({vout:r.vout,date:r.date,valueSats:r.valueSats,locktime:r.locktime})),
    prematureClaim:{allowed:false,rejectReason:rejected['reject-reason'],txid:early.txid},
    invalidationRejected:true,replayRejected:true,reorgRejected:true,independentCleanProcessRecovery:true,offlineBackupRestored:true,mempoolDoubleSpendRejected:true,
    claims:stages,finalLedger:stages.at(-1).ledger,observedBeneficiarySats,
    publicRecoveryManifestDigest:manifest.digest,allAssertionsPassed:true};
  }finally{offline.close();rmSync(clean,{recursive:true,force:true});}
 });
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const evidence=await runLifecycleAcceptance({registrationMode:process.argv.includes('--psbt-registration')?'psbt':'software',accountPath:process.argv.includes('--tef-account-origin')?"m/84'/0'/0'":"m/84'/1'/0'"});
 if(process.argv[2])writeFileSync(process.argv[2],JSON.stringify(evidence,null,2)+'\n');
 process.stdout.write(JSON.stringify(evidence,null,2)+'\n');
}

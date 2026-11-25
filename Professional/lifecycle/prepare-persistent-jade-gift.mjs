// Actual creator request, using prior TEF signatures ONLY as possession proof.
// No software TEF signing and no creator/claim broadcast path is imported here.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import bitcoin from 'bitcoinjs-lib';
import {createPublicPlan,validatePublicPlan,satsToBtc} from '../public-date-planner.mjs';
import {GENESIS,digest,keyAddress,keyScript} from './public-model.mjs';
import {RegtestGiftCoordinator,verifyWalletRegistration,confirmedOutpoints} from './coordinator.mjs';
import {verifyJadeRequest,readJadeSignedPayload} from './jade-signed-return.mjs';
import {jadeDisplayHtml,jadeOutputReview} from './jade-compatibility.mjs';
import {persistentCore,sha256} from './persistent-core.mjs';
export function priorRegistration(unsignedBytes,signedBytes,independentUnsignedSha256,independentWalletDigest){
 const p=bitcoin.Psbt.fromBuffer(unsignedBytes);assert.equal(p.inputCount,8);
 const keys=p.data.inputs.map(i=>{assert.equal(i.bip32Derivation.length,1);const k=i.bip32Derivation[0];return {path:k.path,publicKeyHex:k.pubkey.toString('hex'),masterFingerprintHex:k.masterFingerprint.toString('hex')};});
 const wallet={format:'professional-regtest-public-wallet-v1',network:'regtest',genesis:GENESIS,creator:keys[0],change:keys[1],service:keys[2],recipient:keys.slice(3)};
 const registration={wallet,walletDigest:independentWalletDigest,priorFundedPossession:{unsignedPsbtBase64:Buffer.from(unsignedBytes).toString('base64'),signedPsbtBase64:readJadeSignedPayload(signedBytes),independentUnsignedSha256}};
 verifyWalletRegistration(registration,independentWalletDigest);return registration;
}
export async function preparePersistentGift({directory,registration}){
 const lab=persistentCore(directory);await lab.start();const {wallet,walletDigest}=registration;
 const coordinator=new RegtestGiftCoordinator({rpc:lab.readOnlyRpc,registration,independentWalletDigest:walletDigest});
 // Reuse the five-release timestamp acceptance plan already documented in PR #3.
 const equal=createPublicPlan({btc:'0.00100002',count:5,period:'yearly',start:'2030-01-02'});
 const plan=validatePublicPlan(equal.releases.map((r,i)=>({...r,date:`2030-01-0${i+2}`})),100002);
 const approvedPlanDigest=coordinator.approvePlan(plan),evidence=join(lab.root,'evidence');
 const requestFile=join(evidence,'creator-request.json'),fundingFile=join(evidence,'funding.json');
 let funding;
 if(existsSync(fundingFile))funding=JSON.parse(readFileSync(fundingFile));
 else {
  const chain=await lab.readOnlyRpc('getblockchaininfo');assert.equal(chain.blocks,0,'Use a dedicated fresh chain or restore its funding evidence');
  await lab.rpc('setmocktime',[Date.parse('2030-01-01T12:00:00Z')/1000]);
  await lab.rpc('createwallet',['disposable-regtest-miner',false,false,'',false,true,true]);
  const miner=await lab.rpc('getnewaddress');await lab.rpc('generatetoaddress',[101,miner]);
  // Only the disposable miner's own deposit is sent inside network=none Core.
  // No TEF transaction is signed, submitted or broadcast by this preparer.
  const txid=await lab.rpc('sendtoaddress',[keyAddress(wallet.creator),satsToBtc(103752)]);
  const raw=await lab.readOnlyRpc('getrawtransaction',[txid,true]);
  const record=await lab.rpc('gettransaction',[txid]);
  const matches=raw.vout.filter(o=>o.scriptPubKey.hex===keyScript(wallet.creator));assert.equal(matches.length,1);
  const utxo={txid,vout:matches[0].n,valueSats:103752,scriptPubKeyHex:keyScript(wallet.creator)};
  funding={format:'professional-regtest-creator-funding-v1',network:'regtest',genesis:GENESIS,miner,utxos:[utxo],fundingRawHex:raw.hex,
   externalSenderMiningFeeSats:Math.round(-record.fee*1e8),walletDigest};
  writeFileSync(fundingFile,JSON.stringify(funding,null,2),{mode:0o600,flag:'wx'});
  await lab.rpc('generatetoaddress',[1,miner]);
 }
 assert.equal(funding.walletDigest,walletDigest);assert.equal(funding.genesis,GENESIS);
 await confirmedOutpoints(lab.readOnlyRpc,funding.utxos);
 const request=await coordinator.create({utxos:funding.utxos,approvedPlanDigest,rate:2});
 verifyJadeRequest(request,request.requestDigest);
 if(existsSync(requestFile))assert.deepEqual(JSON.parse(readFileSync(requestFile)),request,'Persisted request changed');
 else writeFileSync(requestFile,JSON.stringify(request,null,2),{mode:0o600,flag:'wx'});
 const psbt=request.unsigned.unsignedPsbtBase64;
 const review={purpose:'ACTUAL GIFT CREATION — disposable isolated regtest only',network:'regtest',genesis:GENESIS,
  historicalHardwarePossession:'PASS; original funding revalidation BLOCKED; no historical broadcast',walletDigest,
  plan:request.plan.releases,fundingSats:request.fundingSats,principalSats:request.principalSats,
  serviceFeeSats:request.serviceFeeSats,creatorMiningFeeSats:request.feeSats,changeSats:request.changeSats,
  source:funding.utxos,outputs:jadeOutputReview(psbt),psbtSha256:sha256(Buffer.from(psbt,'base64')),
  state:'AWAITING_PHYSICAL_CREATOR_SIGNATURE',broadcastAuthorized:false};
 writeFileSync(join(evidence,'creator-review.json'),JSON.stringify(review,null,2),{mode:0o600});
 writeFileSync(join(evidence,'TEF-Gift-Creation-Review.html'),await jadeDisplayHtml({unsignedPsbtBase64:psbt,fingerprint:request.requestDigest,review:JSON.stringify(review,null,2)}),{mode:0o600});
 // Public registration includes the owner's signature response: PRIVATE artifact,
 // never a checked-in fixture. The backup helper excludes it by filename.
 writeFileSync(join(lab.root,'private-registration.json'),JSON.stringify(registration),{mode:0o600});
 await lab.checkpoint(funding.utxos);
 return {lab,request,review};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const [directory,unsignedFile,signedFile,unsignedPin,walletPin]=process.argv.slice(2);
 const registration=priorRegistration(readFileSync(unsignedFile),readFileSync(signedFile),unsignedPin,walletPin);
 const {request,review}=await preparePersistentGift({directory,registration});
 console.log(JSON.stringify({requestDigest:request.requestDigest,...review},null,2));
}

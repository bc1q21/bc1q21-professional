// Starts a private, retained Core regtest for a physical Jade role proof.
// NO TEF/software signing implementation is imported or invoked. Core's own
// disposable miner signs ONLY regtest funding deposits, never this PSBT.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {decodeJadeRegtestAccount,publicWalletFromJadeAccount} from './jade-public-wallet.mjs';
import {fundedJadeRegistration,validateFundedJadeRequest} from './jade-funded-registration.mjs';
import {confirmedOutpoints,assertRegtest} from './coordinator.mjs';
import {keyAddress,keyScript,coreSats} from './public-model.mjs';
import {docker,dockerCoreRpc,CORE_IMAGE} from './local-core-lab.mjs';
import {jadeDisplayHtml,jadeOutputReview} from './jade-compatibility.mjs';
export async function preparePhysicalJadeProof({publicFrames,expectedFingerprint,accountPath,outputDirectory}){
 assert.match(expectedFingerprint,/^[0-9a-f]{8}$/);const account=decodeJadeRegtestAccount(publicFrames,{expectedAccountPath:accountPath});
 assert.equal(account.masterFingerprintHex,expectedFingerprint,'Owner-confirmed device fingerprint mismatch');
 const registered=publicWalletFromJadeAccount(account,5),wallet=registered.wallet;
 const directory=resolve(outputDirectory);mkdirSync(directory,{recursive:true,mode:0o700});
 const container='professional-lifecycle-tef-'+Date.now();let started=false,retained=false;
 try{
  docker(['run','--detach','--name',container,'--network=none',CORE_IMAGE,'-regtest','-server','-txindex=1','-listen=0','-discover=0','-dnsseed=0','-fixedseeds=0','-fallbackfee=0.00002','-printtoconsole=0']);started=true;
  const rpc=dockerCoreRpc(container);let ready=false;
  for(let i=0;i<100;i++){try{await rpc('getblockchaininfo',[]);ready=true;break;}catch{await new Promise(r=>setTimeout(r,100));}}
  assert.equal(ready,true,'Core startup failed');
  await rpc('setmocktime',[Date.parse('2030-01-01T12:00:00Z')/1000]);
  await rpc('createwallet',['disposable-regtest-miner']);const miner=await rpc('getnewaddress',[]);
  await rpc('generatetoaddress',[101,miner]);await assertRegtest(rpc);
  const keys=[wallet.creator,wallet.change,wallet.service,...wallet.recipient],utxos=[];
  for(const key of keys){
   const txid=await rpc('sendtoaddress',[keyAddress(key),'0.00100000']);
   const tx=await rpc('getrawtransaction',[txid,true]);
   const candidates=tx.vout.filter(o=>o.scriptPubKey.hex===keyScript(key));assert.equal(candidates.length,1);
   assert.equal(coreSats(candidates[0].value),100000);
   utxos.push({txid,vout:candidates[0].n,valueSats:100000,scriptPubKeyHex:keyScript(key),fundingTxHex:tx.hex});
  }
  const [confirmedBlock]=await rpc('generatetoaddress',[1,miner]);
  const snapshots=await confirmedOutpoints(rpc,utxos);
  const request=fundedJadeRegistration({wallet,independentWalletDigest:registered.walletDigest,utxos});
  validateFundedJadeRequest(request,request.requestDigest);
  const review={purpose:'FIRST PHYSICAL JADE KEY-POSSESSION TEST — not a gift payment',
   network:'regtest',masterFingerprint:expectedFingerprint.toUpperCase(),accountPath,
   funding:'8 confirmed regtest P2WPKH outpoints; no synthetic inputs',
   inputCount:utxos.length,inputTotalSats:request.totalInputSats,feeSats:request.feeSats,
   selfReturnSats:request.returnSats,selfReturnPath:wallet.change.path,
   publicCommitment:request.walletDigest,inputs:keys.map((key,i)=>({path:key.path,txid:utxos[i].txid,vout:utxos[i].vout,valueSats:utxos[i].valueSats})),
   outputs:jadeOutputReview(request.unsignedPsbtBase64),
   status:'UNSIGNED — pending actual Jade signatures; no broadcast authorized',
   giftFees:'Gift principal/service/claim formulas are unchanged; this is a separate ownership gate.'};
  const html=await jadeDisplayHtml({unsignedPsbtBase64:request.unsignedPsbtBase64,fingerprint:request.requestDigest,review:JSON.stringify(review,null,2),fragmentLength:60});
  writeFileSync(join(directory,'TEF-First-Funded-Jade-Request.json'),JSON.stringify(request,null,2)+'\n',{mode:0o600,flag:'wx'});
  writeFileSync(join(directory,'TEF-First-Funded-Jade-Review.html'),html,{mode:0o600,flag:'wx'});
  const checkpoint={format:'professional-physical-jade-core-session-v1',container,network:'regtest',confirmedBlock,
   requestDigest:request.requestDigest,walletDigest:registered.walletDigest,createdAt:new Date().toISOString(),
   state:'AWAITING_PHYSICAL_JADE_SIGNATURE',TEFSoftwareSignaturesCreated:0,
   sourceConfirmations:snapshots.map(s=>s.confirmations),coreRetained:true,broadcastAuthorized:false};
  writeFileSync(join(directory,'hardware-session.json'),JSON.stringify(checkpoint,null,2)+'\n',{mode:0o600,flag:'wx'});
  retained=true;return {request,checkpoint};
 }finally{
  if(started&&!retained)docker(['rm','--force','--volumes',container]);
 }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const [input,output,expectedFingerprint,accountPath]=process.argv.slice(2);
 const result=await preparePhysicalJadeProof({publicFrames:readFileSync(input,'utf8'),outputDirectory:output,expectedFingerprint,accountPath});
 console.log(JSON.stringify({requestDigest:result.request.requestDigest,inputCount:result.request.inputs.length,
  inputSats:result.request.totalInputSats,returnSats:result.request.returnSats,feeSats:result.request.feeSats,
  state:result.checkpoint.state,container:result.checkpoint.container},null,2));
}

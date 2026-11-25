// TEST FIXTURE ONLY. Run in a separate network-disabled container, never in the
// customer app. Random disposable regtest seed stays in the offline directory.
// This is a software stand-in for PSBT transfer, NOT Jade hardware evidence.
import assert from 'node:assert/strict';
import {createHmac,randomBytes} from 'node:crypto';
import {readFileSync,writeFileSync,copyFileSync,unlinkSync,constants} from 'node:fs';
import {pathToFileURL} from 'node:url';
import bitcoin from 'bitcoinjs-lib';
import {secp256k1} from '@noble/curves/secp256k1';
import {jadeRegistrationChallenge} from './jade-registration.mjs';
import {GENESIS,canonical,digest,publicWallet,prepareCreation,prepareClaim} from './public-model.mjs';
const N=secp256k1.CURVE.n;
const num=b=>BigInt('0x'+Buffer.from(b).toString('hex'));
const bytes=n=>Buffer.from(n.toString(16).padStart(64,'0'),'hex');
const hmac=(k,b)=>createHmac('sha512',k).update(b).digest();
function master(seed){const h=hmac('Bitcoin seed',seed);assert.ok(num(h.subarray(0,32))>0n&&num(h.subarray(0,32))<N);return {key:h.subarray(0,32),chain:h.subarray(32)};}
function derive(root,path){
 let node=root;
 for(const part of path.split('/').slice(1)){
  const hardened=part.endsWith("'"),i=Number(part.replace("'",''))+(hardened?0x80000000:0);
  assert.ok(Number.isInteger(i)&&i>=0&&i<=0xffffffff);
  const index=Buffer.alloc(4);index.writeUInt32BE(i);
  const data=Buffer.concat([hardened?Buffer.concat([Buffer.from([0]),node.key]):Buffer.from(secp256k1.getPublicKey(node.key)),index]);
  const h=hmac(node.chain,data),left=num(h.subarray(0,32)),key=(left+num(node.key))%N;
  // Invalid BIP32 child is astronomically unlikely. Fail instead of silently
  // changing the path that is independently bound into the signing request.
  assert.ok(left<N&&key>0n,'Invalid disposable BIP32 child');node={key:bytes(key),chain:h.subarray(32)};
 }
 return node;
}
function fixtureWallet(seed,count,accountPath="m/84'/1'/0'"){
 assert.ok(["m/84'/0'/0'","m/84'/1'/0'"].includes(accountPath));
 assert.ok(Number.isInteger(count)&&count>=1&&count<=24);
 const root=master(seed),rootPub=Buffer.from(secp256k1.getPublicKey(root.key));
 const fingerprint=bitcoin.crypto.hash160(rootPub).subarray(0,4).toString('hex');
 const record=path=>({publicKeyHex:Buffer.from(secp256k1.getPublicKey(derive(root,path).key)).toString('hex'),masterFingerprintHex:fingerprint,path});
 return {root,wallet:{format:'professional-regtest-public-wallet-v1',network:'regtest',genesis:GENESIS,
  creator:record(accountPath+"/0/0"),change:record(accountPath+"/0/1"),service:record(accountPath+"/0/2"),
  recipient:Array.from({length:count},(_,i)=>record(`${accountPath}/1/${i}`))}};
}
export function initializeDisposableSigner(file,count,{accountPath="m/84'/1'/0'"}={}){
 const seed=randomBytes(32),{root,wallet}=fixtureWallet(seed,count,accountPath);
 writeFileSync(file,JSON.stringify({format:'DISPOSABLE_REGTEST_SOFTWARE_FIXTURE_NOT_A_REAL_WALLET',seedHex:seed.toString('hex'),count,accountPath}),{mode:0o600,flag:'wx'});
 const hash=digest(wallet),keys=[wallet.creator,wallet.change,wallet.service,...wallet.recipient];
 return {wallet,walletDigest:hash,proofs:keys.map(k=>secp256k1.sign(hash,derive(root,k.path).key,{lowS:true}).toCompactHex()),
  evidence:'DISPOSABLE_SOFTWARE_POSSESSION_ONLY_NOT_HARDWARE_OR_LEGAL_IDENTITY'};
}
export function signDisposableRequest(file,request,independentRequestDigest){
 const {requestDigest,...body}=request;
 assert.equal(digest(body),requestDigest,'Signing request altered');
 assert.equal(requestDigest,independentRequestDigest,'Offline operator must approve exact request fingerprint');
 assert.equal(body.format,'professional-offline-signing-request-v1');assert.equal(body.network,'regtest');assert.equal(body.genesis,GENESIS);
 const saved=JSON.parse(readFileSync(file,'utf8'));
 assert.equal(saved.format,'DISPOSABLE_REGTEST_SOFTWARE_FIXTURE_NOT_A_REAL_WALLET');
 const {root,wallet}=fixtureWallet(Buffer.from(saved.seedHex,'hex'),saved.count,saved.accountPath);
 let rebuilt,original;
 if(body.kind==='create'){
  assert.deepEqual(publicWallet(body.wallet),publicWallet(wallet),'Registered creator identity mismatch');
  rebuilt=prepareCreation({plan:body.plan,wallet,utxos:body.intent.inputs,rate:body.rate,feeEstimate:body.feeEstimate});
  original=body.unsigned.unsignedPsbtBase64;
 }else{
  assert.equal(body.kind,'claim');assert.deepEqual(publicWallet(body.manifest.wallet),publicWallet(wallet),'Registered beneficiary identity mismatch');
  rebuilt=prepareClaim({manifest:body.manifest,releaseNumbers:body.releaseNumbers,destinationScriptHex:body.destinationScriptHex,rate:body.rate});
  original=body.unsignedPsbtBase64;
 }
 const {format,network,genesis,revision,...payload}=body;
 assert.equal(canonical(payload),canonical(rebuilt),'Offline review failed: request differs from independently reconstructed financial intent');
 const psbt=bitcoin.Psbt.fromBase64(original,{network:bitcoin.networks.regtest});
 for(let i=0;i<psbt.inputCount;i++){
  const origin=psbt.data.inputs[i].bip32Derivation;
  assert.equal(origin?.length,1);
  const key=derive(root,origin[0].path).key,pub=Buffer.from(secp256k1.getPublicKey(key));
  assert.ok(pub.equals(origin[0].pubkey),'Wrong offline key path');
  psbt.signInput(i,{publicKey:pub,sign:hash=>Buffer.from(secp256k1.sign(hash,key,{lowS:true}).toCompactRawBytes())},[bitcoin.Transaction.SIGHASH_ALL]);
 }
 return {requestDigest,signedPsbtBase64:psbt.toBase64(),softwareFixtureOnly:true,hardwareTested:false};
}
// Test-only public account export for parity checks; no private material returned.
export function disposablePublicAccount(file){
 const saved=JSON.parse(readFileSync(file,'utf8'));
 assert.equal(saved.format,'DISPOSABLE_REGTEST_SOFTWARE_FIXTURE_NOT_A_REAL_WALLET');
 const {root,wallet}=fixtureWallet(Buffer.from(saved.seedHex,'hex'),saved.count,saved.accountPath);
 const accountPath=saved.accountPath||"m/84'/1'/0'";
 const node=derive(root,accountPath);
 return {format:'professional-jade-public-account-v1',accountPath,
  publicKeyHex:Buffer.from(secp256k1.getPublicKey(node.key)).toString('hex'),chainCodeHex:node.chain.toString('hex'),
  masterFingerprintHex:wallet.creator.masterFingerprintHex};
}
// Standard-PSBT registration proof stand-in, for automated tests only.
export function disposableRegistrationProof(file,independentWalletDigest){
 const saved=JSON.parse(readFileSync(file,'utf8'));
 assert.equal(saved.format,'DISPOSABLE_REGTEST_SOFTWARE_FIXTURE_NOT_A_REAL_WALLET');
 const {root,wallet}=fixtureWallet(Buffer.from(saved.seedHex,'hex'),saved.count,saved.accountPath);
 const challenge=jadeRegistrationChallenge(wallet,independentWalletDigest);
 const psbt=bitcoin.Psbt.fromBase64(challenge.unsignedPsbtBase64,{network:bitcoin.networks.regtest});
 for(let i=0;i<psbt.inputCount;i++){
  const key=derive(root,psbt.data.inputs[i].bip32Derivation[0].path).key;
  psbt.signInput(i,{publicKey:Buffer.from(secp256k1.getPublicKey(key)),
   sign:hash=>Buffer.from(secp256k1.sign(hash,key,{lowS:true}).toCompactRawBytes())},[bitcoin.Transaction.SIGHASH_ALL]);
 }
 return psbt.toBase64();
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const [mode,file,arg,pinned]=process.argv.slice(2);
 const result=mode==='proof'?{signedRegistrationPsbtBase64:disposableRegistrationProof(file,arg),softwareFixtureOnly:true}:
  mode==='backup'?(()=>{copyFileSync(file,arg,constants.COPYFILE_EXCL);unlinkSync(file);return {disposableBackupCreated:true,originalFixtureRemoved:true};})():
  mode==='restore'?(()=>{copyFileSync(arg,file,constants.COPYFILE_EXCL);return {disposableBackupRestored:true};})():
  mode==='init'?initializeDisposableSigner(file,Number(arg),{accountPath:pinned||"m/84'/1'/0'"}):
  mode==='sign'?signDisposableRequest(file,JSON.parse(readFileSync(arg,'utf8')),pinned):(()=>{throw Error('init or sign only')})();
 process.stdout.write(JSON.stringify(result)+'\n');
}

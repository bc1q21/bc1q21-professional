import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import bitcoin from 'bitcoinjs-lib';
import {PNG} from 'pngjs';
import jsQR from 'jsqr';
import {UR,UREncoder} from '@ngraveio/bc-ur';
import {createPublicPlan} from './public-date-planner.mjs';
import {digest,keyScript,prepareCreation,recoveryManifest,finalizeCreation,prepareClaim,GENESIS} from './lifecycle/public-model.mjs';
import {initializeDisposableSigner,signDisposableRequest,disposableRegistrationProof} from './lifecycle/disposable-offline-signer.mjs';
import {jadeRegistrationChallenge,verifyJadeRegistration} from './lifecycle/jade-registration.mjs';
import {verifyWalletRegistration} from './lifecycle/coordinator.mjs';
import {verifyJadeRequest,readJadeSignedPayload,verifyLifecycleJadeReturn} from './lifecycle/jade-signed-return.mjs';
import {offlineTransfer,decodeOfflineTransfer} from './lifecycle/offline-transfer.mjs';
import {jadeDisplayHtml,jadeCaptureHtml,jadeOutputReview} from './lifecycle/jade-compatibility.mjs';
import {decodeCryptoPsbtCbor,decodeCryptoPsbtFrames,decodeSavedCryptoPsbtFrames} from './crypto-psbt-transport.mjs';
function fixture(){
 const directory=mkdtempSync(join(tmpdir(),'professional-jade-unit-')),file=join(directory,'software-fixture.json');
 const registration=initializeDisposableSigner(file,5),wallet=registration.wallet;
 const plan=createPublicPlan({btc:'0.00100002',count:5,period:'yearly',start:'2030-01-02'});
 const funding=new bitcoin.Transaction();funding.addInput(Buffer.alloc(32,1),0);funding.addOutput(Buffer.from(keyScript(wallet.creator),'hex'),103752);
 const body={format:'professional-offline-signing-request-v1',network:'regtest',genesis:GENESIS,revision:1,
  ...prepareCreation({plan,wallet,utxos:[{txid:funding.getId(),vout:0,valueSats:103752,scriptPubKeyHex:keyScript(wallet.creator)}]})};
 const request={...body,requestDigest:digest(body)};
 const signed=signDisposableRequest(file,request,request.requestDigest),creator=finalizeCreation(request,signed.signedPsbtBase64);
 const manifest=recoveryManifest(request,creator.rawTransactionHex);
 const b={format:body.format,network:'regtest',genesis:GENESIS,revision:1,
  ...prepareClaim({manifest,releaseNumbers:[1,2,3],destinationScriptHex:keyScript(wallet.change)})};
 return {file,registration,wallet,request,signed,claim:{...b,requestDigest:digest(b)},close:()=>rmSync(directory,{recursive:true,force:true})};
}
async function useFixture(fn){const f=fixture();try{return await fn(f)}finally{f.close()}}
test('historical 60-byte and current 120-byte QR profiles preserve creator and accumulated PSBTs',()=>useFixture(f=>{
 for(const request of [f.request,f.claim])for(const fragmentLength of [60,120]){
  const transport=offlineTransfer(request,{fragmentLength});
  assert.equal(decodeOfflineTransfer([...transport.frames].reverse()),transport.psbtBase64);
 }
}));
test('saved historical capture format supports comments, uppercase and duplicate frames',()=>useFixture(f=>{
 const frames=offlineTransfer(f.request,{fragmentLength:60}).frames;
 const text='# disposable capture\r\n\r\n'+[...frames,...frames.slice(0,2)].map(x=>x.toUpperCase()).join('\r\n');
 assert.equal(decodeSavedCryptoPsbtFrames(text).toString('base64'),f.request.unsigned.unsignedPsbtBase64);
 assert.equal(readJadeSignedPayload(Buffer.from(text)),f.request.unsigned.unsignedPsbtBase64);
 assert.throws(()=>verifyLifecycleJadeReturn({request:f.request,independentRequestDigest:f.request.requestDigest,signedPsbtBase64:readJadeSignedPayload(Buffer.from(text))}),/signature/i);
}));
test('QR transport rejects unrelated QR types, oversize frames, truncation, noncanonical CBOR and appended seed QR',()=>useFixture(f=>{
 const frames=offlineTransfer(f.request).frames;
 for(const input of [[],Array(513).fill(frames[0]),['ur:crypto-seed/abcd'],['ur:crypto-psbt/1-999999999/abcd'],[frames[0]+'a'.repeat(8193)],[...frames,'ur:crypto-hdkey/abcd']])assert.throws(()=>decodeCryptoPsbtFrames(input));
 for(const b of ['','5f','580150','590000','5a00000001','59010000','4401020304'])assert.throws(()=>decodeCryptoPsbtCbor(Buffer.from(b,'hex')));
 assert.throws(()=>decodeSavedCryptoPsbtFrames('cHNidP8='));
 const ur=new UR(Buffer.from('43010203','hex'),'crypto-psbt'),encoder=new UREncoder(ur,60);
 assert.throws(()=>decodeCryptoPsbtFrames([encoder.nextPart()]));
}));
test('standard PSBT key-possession registration keeps independent pin and every-role proof gates',()=>useFixture(f=>{
 const pin=f.registration.walletDigest,challenge=jadeRegistrationChallenge(f.wallet,pin);
 assert.equal(challenge.synthetic,true);assert.equal(challenge.broadcastAuthorized,false);
 const proof=disposableRegistrationProof(f.file,pin);
 assert.equal(verifyJadeRegistration(f.wallet,pin,proof).publicKeyPossessionVerified,true);
 assert.deepEqual(verifyWalletRegistration({wallet:f.wallet,walletDigest:pin,signedRegistrationPsbtBase64:proof},pin),f.wallet);
 assert.throws(()=>verifyWalletRegistration({wallet:f.wallet,walletDigest:pin,signedRegistrationPsbtBase64:proof,proofs:f.registration.proofs},pin),/Ambiguous/);
 assert.throws(()=>verifyJadeRegistration(f.wallet,'00'.repeat(32),proof),/pinned/);
 assert.throws(()=>verifyJadeRegistration(f.wallet,pin,challenge.unsignedPsbtBase64),/Every registered/);
 for(const mutate of [p=>{p.data.inputs[0].partialSig[0].signature[8]^=1},p=>{p.data.inputs[1].bip32Derivation[0].path="m/84'/0'/0'/0/0"},p=>{p.data.inputs[2].witnessUtxo.value++},p=>{delete p.data.inputs.at(-1).partialSig},p=>{p.data.inputs[0].finalScriptWitness=Buffer.from('00','hex')}]){
  const p=bitcoin.Psbt.fromBase64(proof);mutate(p);assert.throws(()=>verifyJadeRegistration(f.wallet,pin,p.toBase64()));
 }
}));
test('generic Jade return verifier accepts creator and accumulated signatures without chain/broadcast authority',()=>useFixture(f=>{
 for(const request of [f.request,f.claim]){
  const signed=signDisposableRequest(f.file,request,request.requestDigest);
  const result=verifyLifecycleJadeReturn({request,independentRequestDigest:request.requestDigest,signedPsbtBase64:signed.signedPsbtBase64});
  assert.equal(result.signatureCryptographicallyVerified,true);assert.equal(result.chainVerified,false);assert.equal(result.broadcastAuthorized,false);assert.equal(result.hardwareOriginAttested,false);
  assert.throws(()=>verifyLifecycleJadeReturn({request,independentRequestDigest:'00'.repeat(32),signedPsbtBase64:signed.signedPsbtBase64}),/mismatch/);
 }
 const tampered=structuredClone(f.request);tampered.serviceFeeSats++;
 assert.throws(()=>verifyJadeRequest(tampered,f.request.requestDigest),/changed/);
 assert.throws(()=>verifyLifecycleJadeReturn({request:f.claim,independentRequestDigest:f.claim.requestDigest,signedPsbtBase64:f.signed.signedPsbtBase64}),/differs/);
}));
test('self-contained QR page has real decodable unsigned images, no external assets and historical timing controls',()=>useFixture(async f=>{
 const html=await jadeDisplayHtml({unsignedPsbtBase64:f.request.unsigned.unsignedPsbtBase64,fingerprint:f.request.requestDigest,review:'<script>not executable</script>'});
 assert.doesNotMatch(html,/(?:src|href)="https?:/);assert.match(html,/value="750"/);assert.match(html,/&lt;script&gt;/);
 const images=JSON.parse(html.match(/const images=(\[.*?\]);/s)[1]);
 const frames=images.map(url=>{const png=PNG.sync.read(Buffer.from(url.split(',')[1],'base64'));const qr=jsQR(new Uint8ClampedArray(png.data),png.width,png.height);assert.ok(qr);return qr.data;});
 assert.equal(decodeCryptoPsbtFrames(frames).toString('base64'),f.request.unsigned.unsignedPsbtBase64);
}));
test('reusable local capture page bundles the existing camera and has no fixed historical fixture or remote CDN',async()=>{
 const html=await jadeCaptureHtml();assert.match(html,/Capture is not signature verification/);
 assert.doesNotMatch(html,/<script[^>]+src=|cdn\.jsdelivr\.net|cHNidP8/);
 assert.match(html,/127\.0\.0\.1/);assert.match(html,/sha256-/);
});

test('public Jade testnet account derives the exact existing software fixture keys without private data',()=>useFixture(async f=>{
 const {disposablePublicAccount}=await import('./lifecycle/disposable-offline-signer.mjs');
 const {publicWalletFromJadeAccount,decodeJadeRegtestAccount}=await import('./lifecycle/jade-public-wallet.mjs');
 const {default:cbor}=await import('cbor');const account=disposablePublicAccount(f.file);
 assert.deepEqual(publicWalletFromJadeAccount(account,5).wallet,f.wallet);
 const node=new Map([[2,false],[3,Buffer.from(account.publicKeyHex,'hex')],[4,Buffer.from(account.chainCodeHex,'hex')],
  [5,new cbor.Tagged(305,new Map([[1,0],[2,1]]))],
  [6,new cbor.Tagged(304,new Map([[1,[84,true,1,true,0,true]],[2,parseInt(account.masterFingerprintHex,16)],[3,3]]))]]);
 const encode=n=>{const ur=new UR(cbor.encode(new cbor.Tagged(303,n)),'crypto-hdkey');return new UREncoder(ur,60).encodeWhole().map(x=>x).join('\n');};
 assert.deepEqual(decodeJadeRegtestAccount(encode(node)),account);
 const accountBody=new Map([[1,parseInt(account.masterFingerprintHex,16)],
  [2,[new cbor.Tagged(308,new cbor.Tagged(404,new cbor.Tagged(303,node)))]]]);
 const accountFrames=body=>new UREncoder(new UR(cbor.encode(body),'crypto-account'),60).encodeWhole().join('\n');
 assert.deepEqual(decodeJadeRegtestAccount(accountFrames(accountBody)),account);
 const wrongRoot=new Map(accountBody);wrongRoot.set(1,(parseInt(account.masterFingerprintHex,16)+1)%0x100000000);
 assert.throws(()=>decodeJadeRegtestAccount(accountFrames(wrongRoot)),/fingerprint disagree/);
 const modified=new Map(node);modified.set(2,true);assert.throws(()=>decodeJadeRegtestAccount(encode(modified)),/Private/);
 const wrongOrigin=new Map(node);wrongOrigin.set(6,new cbor.Tagged(304,new Map([[1,[84,true,0,true,0,true]],[2,1],[3,3]])));
 assert.throws(()=>decodeJadeRegtestAccount(encode(wrongOrigin)),/selected account origin/);
 assert.throws(()=>decodeJadeRegtestAccount('ur:crypto-seed/abcd'),/Only public/);
 assert.throws(()=>publicWalletFromJadeAccount({...account,privateKey:'invalid'},5));
}));

test('Jade testnet address aliases map to identical approved regtest output scripts',()=>useFixture(f=>{
 for(const request of [f.request,f.claim]){
  const reviewed=jadeOutputReview(verifyJadeRequest(request,request.requestDigest).unsignedPsbtBase64);
  for(const o of reviewed){
   assert.equal(bitcoin.address.toOutputScript(o.regtestAddress,bitcoin.networks.regtest).toString('hex'),o.scriptPubKeyHex);
   assert.equal(bitcoin.address.toOutputScript(o.testnetDisplayAlias,bitcoin.networks.testnet).toString('hex'),o.scriptPubKeyHex);
   assert.equal(bitcoin.address.toOutputScript(o.coinType0DeviceDisplayAlias,bitcoin.networks.bitcoin).toString('hex'),o.scriptPubKeyHex);
  }
 }
}));

test('explicit TEF coin-type-0 export retains its real origin with regtest chain guards',async()=>{
 const directory=mkdtempSync(join(tmpdir(),'professional-tef-origin-')),file=join(directory,'disposable.json');
 try{
  const {disposablePublicAccount}=await import('./lifecycle/disposable-offline-signer.mjs');
  const {publicWalletFromJadeAccount,decodeJadeRegtestAccount}=await import('./lifecycle/jade-public-wallet.mjs');
  const {publicWallet}=await import('./lifecycle/public-model.mjs');
  const {default:cbor}=await import('cbor');
  const registration=initializeDisposableSigner(file,5,{accountPath:"m/84'/0'/0'"}),account=disposablePublicAccount(file);
  const node=new Map([[2,false],[3,Buffer.from(account.publicKeyHex,'hex')],[4,Buffer.from(account.chainCodeHex,'hex')],
   [5,new cbor.Tagged(305,new Map([[1,0],[2,0]]))],
   [6,new cbor.Tagged(304,new Map([[1,[84,true,0,true,0,true]],[2,parseInt(account.masterFingerprintHex,16)],[3,3]]))]]);
  const encode=n=>new UREncoder(new UR(cbor.encode(new cbor.Tagged(303,n)),'crypto-hdkey'),60).encodeWhole().join('\n');
  assert.throws(()=>decodeJadeRegtestAccount(encode(node)),/selected account origin/);
  const decoded=decodeJadeRegtestAccount(encode(node),{expectedAccountPath:"m/84'/0'/0'"});
  assert.equal(decoded.accountPath,"m/84'/0'/0'");
  const derived=publicWalletFromJadeAccount(decoded,5);assert.deepEqual(derived.wallet,registration.wallet);
  assert.equal(derived.wallet.network,'regtest');assert.equal(derived.wallet.genesis,GENESIS);
  assert.ok(derived.wallet.recipient.every(k=>k.path.startsWith("m/84'/0'/0'/1/")));
  const proof=disposableRegistrationProof(file,derived.walletDigest);
  assert.deepEqual(verifyWalletRegistration({wallet:derived.wallet,walletDigest:derived.walletDigest,signedRegistrationPsbtBase64:proof},derived.walletDigest),derived.wallet);
  const mixed=structuredClone(derived.wallet);mixed.creator.path="m/84'/1'/0'/0/0";
  assert.throws(()=>publicWallet(mixed),/Mixed account origins/);
  assert.throws(()=>publicWallet({...derived.wallet,network:'mainnet'}));
  assert.throws(()=>publicWallet({...derived.wallet,genesis:'00'.repeat(32)}));
  const contradictory=new Map(node);contradictory.set(5,new cbor.Tagged(305,new Map([[1,0],[2,1]])));
  assert.throws(()=>decodeJadeRegtestAccount(encode(contradictory),{expectedAccountPath:"m/84'/0'/0'"}),/contradicts/);
 }finally{rmSync(directory,{recursive:true,force:true})}
});

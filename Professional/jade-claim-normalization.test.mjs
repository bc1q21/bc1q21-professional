// Disposable software UNIT fixtures, never replacements for physical evidence.
// The real capture test is opt-in and reads owner files outside source control.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import bitcoin from 'bitcoinjs-lib';
import {createPublicPlan} from './public-date-planner.mjs';
import {initializeDisposableSigner,signDisposableRequest} from './lifecycle/disposable-offline-signer.mjs';
import {GENESIS,digest,keyScript,prepareCreation,finalizeCreation,recoveryManifest,prepareClaim,finalizeClaim} from './lifecycle/public-model.mjs';
import {verifyLifecycleJadeReturn} from './lifecycle/jade-signed-return.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
function fixture(numbers=[1]){
 const directory=mkdtempSync(join(tmpdir(),'professional-normalization-unit-')),file=join(directory,'unrelated-test-keys.json');
 const {wallet}=initializeDisposableSigner(file,5,{accountPath:"m/84'/0'/0'"});
 const plan=createPublicPlan({btc:'0.00100002',count:5,period:'yearly',start:'2030-01-02'});
 const funding=new bitcoin.Transaction();funding.addInput(Buffer.alloc(32,1),0);funding.addOutput(Buffer.from(keyScript(wallet.creator),'hex'),103752);
 const wrap=body=>{const r={format:'professional-offline-signing-request-v1',network:'regtest',genesis:GENESIS,revision:1,...body};return {...r,requestDigest:digest(r)};};
 const creation=wrap(prepareCreation({plan,wallet,utxos:[{txid:funding.getId(),vout:0,valueSats:103752,scriptPubKeyHex:keyScript(wallet.creator)}]}));
 const creator=finalizeCreation(creation,signDisposableRequest(file,creation,creation.requestDigest).signedPsbtBase64);
 assert.ok(bitcoin.Transaction.fromHex(creator.rawTransactionHex).hasWitnesses());
 const request=wrap(prepareClaim({manifest:recoveryManifest(creation,creator.rawTransactionHex),releaseNumbers:numbers,destinationScriptHex:keyScript(wallet.change)}));
 const signed=signDisposableRequest(file,request,request.requestDigest).signedPsbtBase64;
 return {request,signed,close:()=>rmSync(directory,{recursive:true,force:true})};
}
function using(fn,numbers){const f=fixture(numbers);try{return fn(f)}finally{f.close();}}
function prior(p,mutate){const tx=bitcoin.Transaction.fromBuffer(p.data.inputs[0].nonWitnessUtxo);mutate(tx);p.data.inputs[0].nonWitnessUtxo=tx.toBuffer();}
const verify=(f,p)=>verifyLifecycleJadeReturn({request:f.request,independentRequestDigest:f.request.requestDigest,signedPsbtBase64:p.toBase64()});
test('claim importer accepts unchanged full-witness and exact witness-stripped previous transactions',()=>using(f=>{
 const full=bitcoin.Psbt.fromBase64(f.signed),stripped=bitcoin.Psbt.fromBase64(f.signed);
 prior(stripped,t=>t.ins.forEach((_,i)=>t.setWitness(i,[])));
 assert.notDeepEqual(full.data.inputs[0].nonWitnessUtxo,stripped.data.inputs[0].nonWitnessUtxo);
 const a=verify(f,full),b=verify(f,stripped);assert.equal(a.txid,b.txid);assert.equal(a.feeSats,b.feeSats);
 assert.equal(b.signatureCryptographicallyVerified,true);assert.equal(b.chainVerified,false);assert.equal(b.broadcastAuthorized,false);
}));
test('accumulated claim checks every previous transaction independently',()=>using(f=>{
 const p=bitcoin.Psbt.fromBase64(f.signed);
 for(const input of p.data.inputs){const tx=bitcoin.Transaction.fromBuffer(input.nonWitnessUtxo);tx.ins.forEach((_,i)=>tx.setWitness(i,[]));input.nonWitnessUtxo=tx.toBuffer();}
 assert.equal(verify(f,p).signatureCryptographicallyVerified,true);
 const tx=bitcoin.Transaction.fromBuffer(p.data.inputs[2].nonWitnessUtxo);tx.outs[2].value++;p.data.inputs[2].nonWitnessUtxo=tx.toBuffer();
 assert.throws(()=>verify(f,p));
},[1,2,3]));
const attacks={
 'previous TXID/version changed':p=>prior(p,t=>t.version++),
 'previous output value changed':p=>prior(p,t=>t.outs[0].value++),
 'previous locking script changed':p=>prior(p,t=>t.outs[0].script[2]^=1),
 'previous input changed':p=>prior(p,t=>t.ins[0].hash[0]^=1),
 'previous locktime changed':p=>prior(p,t=>t.locktime++),
 'different witness with unchanged TXID':p=>prior(p,t=>{t.ins[0].witness[0][8]^=1;}),
 'unrelated previous transaction':p=>{const t=new bitcoin.Transaction();t.addInput(Buffer.alloc(32,2),0);t.addOutput(Buffer.from('0014'+'ab'.repeat(20),'hex'),20001);p.data.inputs[0].nonWitnessUtxo=t.toBuffer();},
 'missing previous transaction':p=>{delete p.data.inputs[0].nonWitnessUtxo;},
 'malformed previous transaction':p=>{p.data.inputs[0].nonWitnessUtxo=Buffer.from('010203','hex');},
 'recipient signing key substituted':p=>{p.data.inputs[0].partialSig[0].pubkey=Buffer.from('02'+'11'.repeat(32),'hex');},
 'recipient derivation changed':p=>{p.data.inputs[0].bip32Derivation[0].path="m/84'/0'/0'/0/0";},
 'recipient fingerprint changed':p=>{p.data.inputs[0].bip32Derivation[0].masterFingerprint[0]^=1;},
 'invalid signature':p=>{p.data.inputs[0].partialSig[0].signature[7]^=1;},
 'missing signature':p=>{delete p.data.inputs[0].partialSig;},
 'wrong sighash':p=>{const s=p.data.inputs[0].partialSig[0].signature;s[s.length-1]=2;},
 'claim destination changed':p=>{p.data.globalMap.unsignedTx.tx.outs[0].script[2]^=1;},
 'claim payout/actual mining fee changed':p=>{p.data.globalMap.unsignedTx.tx.outs[0].value--;},
 'CLTV locktime changed':p=>{p.data.globalMap.unsignedTx.tx.locktime--;},
 'input sequence changed':p=>{p.data.globalMap.unsignedTx.tx.ins[0].sequence=0xffffffff;},
 'outpoint output index changed':p=>{p.data.globalMap.unsignedTx.tx.ins[0].index=1;},
 'redeem script changed':p=>{p.data.inputs[0].redeemScript[2]^=1;},
 'unexpected witnessUTXO metadata':p=>{p.data.inputs[0].witnessUtxo={value:20001,script:Buffer.from('0014'+'ab'.repeat(20),'hex')};},
 'unexpected final script':p=>{p.data.inputs[0].finalScriptSig=Buffer.from('00','hex');},
};
for(const [name,mutate] of Object.entries(attacks))test('normalized claim rejects '+name,()=>using(f=>{
 const p=bitcoin.Psbt.fromBase64(f.signed);mutate(p);assert.throws(()=>verify(f,p));
}));
test('claim importer rejects changed fee declaration, missing manifest, malformed PSBT and altered approval',()=>using(f=>{
 assert.throws(()=>finalizeClaim({...f.request,feeSats:f.request.feeSats+1},f.signed),/mining fee changed/);
 assert.throws(()=>finalizeClaim({...f.request,creatorRawHex:'00'},f.signed),/creator record changed/);
 assert.throws(()=>finalizeClaim({...f.request,manifest:undefined},f.signed));
 assert.throws(()=>verifyLifecycleJadeReturn({request:f.request,independentRequestDigest:f.request.requestDigest,signedPsbtBase64:'not-a-psbt'}));
 assert.throws(()=>verifyLifecycleJadeReturn({request:f.request,independentRequestDigest:'00'.repeat(32),signedPsbtBase64:f.signed}));
}));
const realDirectory=process.env.BC1Q21_JADE_CAPTURE_DIR;
test('actual private physical Jade recipient capture imports without witness or request rewriting',{skip:!realDirectory},()=>{
 const request=JSON.parse(readFileSync(join(realDirectory,'premature-claim-request.json'))),signed=readFileSync(join(realDirectory,'premature-claim-signed.psbt'));
 assert.equal(hash(signed),'600cb1eb0fcf8f4796566b9e2ad5332b736288f3903171a1cccf7e8569180928');
 assert.equal(hash(Buffer.from(request.unsignedPsbtBase64,'base64')),'725ccc4111246a554506e7693a40eb7368b37320e0b811d10d8a4550eed9ae20');
 const result=verifyLifecycleJadeReturn({request,independentRequestDigest:'64f4a223d6ea3d34b6f4982dd3513fc0a7590d600287c8ed2c595f65abf165dc',signedPsbtBase64:signed.toString('base64')});
 assert.equal(result.txid,'ebf0482fc87da0795d795883b84138a55dfffc4730badd9ca4e90197cd9f513f');
 assert.equal(result.signatureCryptographicallyVerified,true);assert.equal(result.vsize,197);assert.equal(result.feeSats,398);assert.equal(result.broadcastAuthorized,false);
});

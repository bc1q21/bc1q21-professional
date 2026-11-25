// Deterministic UNIT fixtures only: these keys never represent TEF/Jade.
import test from 'node:test';
import assert from 'node:assert/strict';
import bitcoin from 'bitcoinjs-lib';
import {secp256k1} from '@noble/curves/secp256k1';
import {GENESIS,digest,keyScript,network} from './lifecycle/public-model.mjs';
import {fundedJadeRegistration,validateFundedJadeRequest,verifyFundedJadeRegistration} from './lifecycle/jade-funded-registration.mjs';
import {verifyWalletRegistration} from './lifecycle/coordinator.mjs';
import {createHash} from 'node:crypto';
import {verifyPriorJadePossession} from './lifecycle/prior-jade-possession.mjs';
function fixture(){
 const privateKeys=Array.from({length:8},(_,i)=>{const b=Buffer.alloc(32);b[31]=i+1;return b;});
 const keys=privateKeys.map((k,i)=>({publicKeyHex:Buffer.from(secp256k1.getPublicKey(k)).toString('hex'),masterFingerprintHex:'abcdef01',path:"m/84'/0'/0'/"+(i<3?'0/'+i:'1/'+(i-3))}));
 const wallet={format:'professional-regtest-public-wallet-v1',network:'regtest',genesis:GENESIS,creator:keys[0],change:keys[1],service:keys[2],recipient:keys.slice(3)};
 const tx=new bitcoin.Transaction();tx.addInput(Buffer.alloc(32,1),0);keys.forEach(k=>tx.addOutput(Buffer.from(keyScript(k),'hex'),100000));
 const utxos=keys.map((k,vout)=>({txid:tx.getId(),vout,valueSats:100000,scriptPubKeyHex:keyScript(k),fundingTxHex:tx.toHex()}));
 const request=fundedJadeRegistration({wallet,independentWalletDigest:digest(wallet),utxos});
 const psbt=bitcoin.Psbt.fromBase64(request.unsignedPsbtBase64,{network});
 privateKeys.forEach((k,i)=>psbt.signInput(i,{publicKey:Buffer.from(secp256k1.getPublicKey(k)),sign:hash=>Buffer.from(secp256k1.sign(hash,k,{lowS:true}).toCompactRawBytes())},[bitcoin.Transaction.SIGHASH_ALL]));
 return {request,utxos,wallet,signed:psbt.toBase64()};
}
test('prior funded signatures retain possession only, with independent pins and no historical funding claim',()=>{
 const {request,wallet,signed}=fixture();
 const proof={unsignedPsbtBase64:request.unsignedPsbtBase64,signedPsbtBase64:signed,
  independentUnsignedSha256:createHash('sha256').update(Buffer.from(request.unsignedPsbtBase64,'base64')).digest('hex')};
 const args={...proof,wallet,independentWalletDigest:request.walletDigest};
 const result=verifyPriorJadePossession(args);assert.equal(result.inputSignaturesVerified,8);
 for(const key of ['chainVerified','historicalFundingRevalidated','fundingAuthorized','broadcastAuthorized'])assert.equal(result[key],false);
 const registration={wallet,walletDigest:request.walletDigest,priorFundedPossession:proof};
 assert.deepEqual(verifyWalletRegistration(registration,request.walletDigest),wallet);
 assert.throws(()=>verifyWalletRegistration({...registration,proofs:[]},request.walletDigest),/Ambiguous/);
 for(const change of [{independentWalletDigest:'00'.repeat(32)},{independentUnsignedSha256:'00'.repeat(32)},
  {signedPsbtBase64:request.unsignedPsbtBase64},{wallet:{...wallet,network:'mainnet'}}])assert.throws(()=>verifyPriorJadePossession({...args,...change}));
 const missing=bitcoin.Psbt.fromBase64(signed);delete missing.data.inputs[7].partialSig;
 assert.throws(()=>verifyPriorJadePossession({...args,signedPsbtBase64:missing.toBase64()}));
 const changed=bitcoin.Psbt.fromBase64(request.unsignedPsbtBase64);changed.data.inputs[0].witnessUtxo.value++;
 const altered=changed.toBuffer();assert.throws(()=>verifyPriorJadePossession({...args,unsignedPsbtBase64:altered.toString('base64'),independentUnsignedSha256:createHash('sha256').update(altered).digest('hex')}),/template/);
});
test('funded role proof conserves sats, binds wallet digest and remains non-authorizing',()=>{
 const {request,wallet}=fixture(),p=bitcoin.Psbt.fromBase64(request.unsignedPsbtBase64);
 assert.equal(request.synthetic,false);assert.equal(request.signed,false);assert.equal(request.broadcastAuthorized,false);
 assert.equal(request.totalInputSats,800000);assert.equal(request.returnSats,797500);assert.equal(request.feeSats,2500);
 assert.equal(p.inputCount,8);assert.equal(p.txOutputs.length,2);
 assert.equal(p.txOutputs[0].script.toString('hex'),keyScript(wallet.change));assert.equal(p.txOutputs[0].value,797500);
 assert.equal(p.txOutputs[1].script.toString('hex'),'6a20'+request.walletDigest);assert.equal(p.txOutputs[1].value,0);
 assert.ok(p.data.inputs.every(i=>!i.partialSig&&!i.finalScriptSig&&!i.finalScriptWitness&&i.sighashType===1));
 assert.equal(validateFundedJadeRequest(request,request.requestDigest).requestDigest,request.requestDigest);
});
test('funding transaction bytes, amounts, roles and unique outpoints are mandatory',()=>{
 const {request,utxos,wallet}=fixture();
 for(const mutate of [u=>{u[0].valueSats++},u=>{u[0].txid='00'.repeat(32)},u=>{u[0].fundingTxHex=u[0].fundingTxHex.slice(0,-2)+'ff'},u=>{u[1]={...u[0]}},u=>{u[0].scriptPubKeyHex=keyScript(wallet.change)}]){
  const changed=structuredClone(utxos);mutate(changed);assert.throws(()=>fundedJadeRegistration({wallet,independentWalletDigest:request.walletDigest,utxos:changed}));
 }
 assert.throws(()=>fundedJadeRegistration({wallet:{...wallet,network:'mainnet'},independentWalletDigest:request.walletDigest,utxos}));
});
test('all eight signatures are required and accepted through the existing registration gate',()=>{
 const {request,signed,wallet}=fixture();
 const args={request,independentRequestDigest:request.requestDigest,independentWalletDigest:request.walletDigest,signedPsbtBase64:signed};
 const v=verifyFundedJadeRegistration(args);assert.equal(v.inputSignaturesVerified,8);assert.equal(v.broadcastAuthorized,false);assert.equal(v.chainVerified,false);
 assert.deepEqual(verifyWalletRegistration({wallet,walletDigest:request.walletDigest,fundedRegistrationRequest:request,fundedRegistrationRequestDigest:request.requestDigest,signedRegistrationPsbtBase64:signed},request.walletDigest),wallet);
 for(const mutate of [p=>{delete p.data.inputs[7].partialSig},p=>{p.data.inputs[0].partialSig[0].signature[7]^=1},p=>{p.data.inputs[0].witnessUtxo.value++},p=>{p.data.inputs[0].bip32Derivation[0].path="m/84'/1'/0'/0/0"},p=>{p.data.inputs[0].sighashType=2},p=>{p.data.inputs[0].finalScriptWitness=Buffer.from('00','hex')}]){
  const p=bitcoin.Psbt.fromBase64(signed);mutate(p);assert.throws(()=>verifyFundedJadeRegistration({...args,signedPsbtBase64:p.toBase64()}));
 }
 assert.throws(()=>verifyFundedJadeRegistration({...args,signedPsbtBase64:request.unsignedPsbtBase64}),/Every registered/);
});
test('request and wallet pins cannot be replaced by self-recomputed or altered approval data',()=>{
 const {request,signed}=fixture(),args={request,independentRequestDigest:request.requestDigest,independentWalletDigest:request.walletDigest,signedPsbtBase64:signed};
 assert.throws(()=>verifyFundedJadeRegistration({...args,independentRequestDigest:'00'.repeat(32)}));
 assert.throws(()=>verifyFundedJadeRegistration({...args,independentWalletDigest:'00'.repeat(32)}));
 const {requestDigest,...body}=structuredClone(request);body.feeSats++;
 assert.throws(()=>validateFundedJadeRequest({...body,requestDigest:digest(body)},digest(body)),/intent differs/);
});

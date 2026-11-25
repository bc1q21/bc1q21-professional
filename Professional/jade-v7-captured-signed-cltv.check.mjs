// Legacy filename retained for tooling compatibility. SOFTWARE-ONLY fixture now.
// This is not the archived Jade V7 capture or new hardware/Bitcoin acceptance.
import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import bitcoin from 'bitcoinjs-lib';
import {syntheticSignedCltvFixture} from './fixtures/public-synthetic-wallet.mjs';
import {verifySyntheticSignedPsbt} from './verify-synthetic-signed-psbt.mjs';
import {finalizeSyntheticCltvPsbt} from './finalize-synthetic-cltv.mjs';
const f=syntheticSignedCltvFixture(),signed=f.signed,expectedPubkey=f.publicKeyHex;
const snapshot=JSON.parse(readFileSync(new URL('./fixtures/public-synthetic-cltv.json',import.meta.url),'utf8'));
const sha256=b=>createHash('sha256').update(b).digest('hex');
test('software-generated fixture is deterministic and explicitly not hardware evidence',()=>{
 assert.equal(sha256(signed),snapshot.signedSha256);assert.equal(signed.toString('base64'),snapshot.signedBase64);
 assert.equal(sha256(Buffer.from(f.unsignedBase64,'base64')),snapshot.unsignedSha256);
 assert.equal(snapshot.hardwareVerified,false);assert.equal(snapshot.chainFunded,false);assert.equal(snapshot.broadcast,false);
 assert.equal(verifySyntheticSignedPsbt(signed,f.unsignedBase64,expectedPubkey).signatureCount,1);
});
test('synthetic signed fixture finalizes offline with expected fields and fee',()=>{
 const result=finalizeSyntheticCltvPsbt(signed,f.unsignedBase64,expectedPubkey),tx=bitcoin.Transaction.fromHex(result.rawTransactionHex);
 assert.equal(tx.version,2);assert.equal(tx.locktime,110);assert.equal(tx.ins.length,1);assert.equal(tx.outs.length,1);
 assert.equal(tx.ins[0].sequence,0xfffffffe);assert.equal(tx.ins[0].witness.length,0);assert.equal(tx.outs[0].value,99000);
 assert.equal(result.broadcast,false);assert.equal(result.scriptExecutionVerified,false);
});
test('altered synthetic signature is rejected',()=>{
 const p=bitcoin.Psbt.fromBuffer(signed),sig=Buffer.from(p.data.inputs[0].partialSig[0].signature);sig[12]^=1;
 p.data.inputs[0].partialSig[0].signature=sig;
 assert.throws(()=>verifySyntheticSignedPsbt(p.toBuffer(),f.unsignedBase64,expectedPubkey));
});

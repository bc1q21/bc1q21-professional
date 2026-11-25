// SOFTWARE-GENERATED ONLY. No physical signature, funding or acceptance is asserted.
import {syntheticSignedCltvFixture} from './fixtures/public-synthetic-wallet.mjs';
// Software-only synthetic account; not a captured hardware identity.
import {PUBLIC_SYNTHETIC_ACCOUNT} from './fixtures/public-synthetic-wallet.mjs';
// Predictable public test material; never use for funds.
import test from 'node:test';
import assert from 'node:assert/strict';
import bitcoin from 'bitcoinjs-lib';
import { finalizeSyntheticCltvPsbt } from './finalize-synthetic-cltv.mjs';
import { verifySyntheticSignedPsbt } from './verify-synthetic-signed-psbt.mjs';
import { deriveJadePublicCltvHandoff } from './jade-xpub-cltv-handoff.mjs';
import { prepareProfessionalReleaseFromPublicHandoff } from './public-funding-release-integration.mjs';
const synthetic=syntheticSignedCltvFixture();
const signed=synthetic.signed;
const original=bitcoin.Psbt.fromBuffer(signed);
delete original.data.inputs[0].partialSig;
const unsigned=original.toBase64();
const pubkey=synthetic.publicKeyHex;
const finalize=raw=>finalizeSyntheticCltvPsbt(raw,unsigned,pubkey);
test('software-only synthetic signature finalizes to a legacy P2SH scriptSig',()=>{
 const result=finalize(signed);
 const tx=bitcoin.Transaction.fromHex(result.rawTransactionHex);
 assert.equal(tx.ins.length,1);
 assert.equal(tx.outs.length,1);
 assert.equal(tx.locktime,110);
 assert.equal(tx.ins[0].sequence,0xfffffffe);
 assert.equal(tx.ins[0].witness.length,0);
 const chunks=bitcoin.script.decompile(tx.ins[0].script);
 assert.equal(chunks.length,2);
 assert.ok(Buffer.isBuffer(chunks[0]));
 assert.equal(Buffer.from(chunks[1]).toString('hex'),original.data.inputs[0].redeemScript.toString('hex'));
 assert.equal(result.scriptExecutionVerified,false);
 assert.equal(result.broadcast,false);
});
test('tampered signature fails before finalization',()=>{
 const p=bitcoin.Psbt.fromBuffer(signed);
 const sig=Buffer.from(p.data.inputs[0].partialSig[0].signature);
 sig[10]^=1;
 p.data.inputs[0].partialSig[0].signature=sig;
 assert.throws(()=>finalize(p.toBuffer()));
});
test('changed transaction locktime is rejected',()=>{
 const p=bitcoin.Psbt.fromBuffer(signed);
 const unsignedTx=bitcoin.Transaction.fromBuffer(p.data.globalMap.unsignedTx.toBuffer());
 unsignedTx.locktime=111;
 p.data.globalMap.unsignedTx.tx=unsignedTx;
 assert.throws(()=>finalize(p.toBuffer()),/Unsigned transaction changed/);
});

test('Professional builder matches the software-generated unsigned fixture byte for byte',()=>{
 const h=deriveJadePublicCltvHandoff({
  accountXpub:PUBLIC_SYNTHETIC_ACCOUNT.xpub,
  masterFingerprintHex:PUBLIC_SYNTHETIC_ACCOUNT.fingerprint,childIndex:10,locktime:110
 });
 const previous=bitcoin.Transaction.fromBuffer(original.data.inputs[0].nonWitnessUtxo);
 const handoff={version:h.version,network:h.network,signerPubkeyHex:h.signerPubkeyHex,locktime:h.locktime,
  redeemScriptHex:h.redeemScriptHex,fundingAddress:h.fundingAddress};
 const newResult=prepareProfessionalReleaseFromPublicHandoff(handoff,{
  fundingTxHex:previous.toHex(),vout:0,expectedTxid:previous.getId(),expectedSats:100000,
  masterFingerprintHex:h.masterFingerprintHex,derivationPath:h.derivationPath,
  destinationScriptHex:'0014'+'42'.repeat(20),destinationSats:99000
 });
 const newlyBuilt=bitcoin.Psbt.fromBase64(newResult.unsignedPsbtBase64);
 assert.equal(newlyBuilt.data.inputs[0].redeemScript.toString('hex'),original.data.inputs[0].redeemScript.toString('hex'));
 assert.equal(newlyBuilt.data.inputs[0].bip32Derivation[0].pubkey.toString('hex'),pubkey);
 assert.equal(newlyBuilt.data.inputs[0].bip32Derivation[0].path,original.data.inputs[0].bip32Derivation[0].path);
 assert.equal(newlyBuilt.data.inputs[0].bip32Derivation[0].masterFingerprint.toString('hex'),
  original.data.inputs[0].bip32Derivation[0].masterFingerprint.toString('hex'));
 assert.equal(newResult.unsignedPsbtBase64,unsigned,
  'Unsigned PSBT differs from the synthetic authorized fixture');
 assert.equal(newResult.signed,false);assert.equal(newResult.broadcast,false);
});

test('public-only builder verifies and finalizes the software-generated synthetic signature',()=>{
 const h=deriveJadePublicCltvHandoff({
  accountXpub:PUBLIC_SYNTHETIC_ACCOUNT.xpub,
  masterFingerprintHex:PUBLIC_SYNTHETIC_ACCOUNT.fingerprint,childIndex:10,locktime:110
 });
 const previous=bitcoin.Transaction.fromBuffer(original.data.inputs[0].nonWitnessUtxo);
 const publicHandoff={version:h.version,network:h.network,signerPubkeyHex:h.signerPubkeyHex,
  locktime:h.locktime,redeemScriptHex:h.redeemScriptHex,fundingAddress:h.fundingAddress};
 const result=prepareProfessionalReleaseFromPublicHandoff(publicHandoff,{
  fundingTxHex:previous.toHex(),vout:0,expectedTxid:previous.getId(),expectedSats:100000,
  masterFingerprintHex:h.masterFingerprintHex,derivationPath:h.derivationPath,
  destinationScriptHex:'0014'+'42'.repeat(20),destinationSats:99000
 });
 assert.equal(result.unsignedPsbtBase64,unsigned,'synthetic signing fixture must match builder');
 const verified=verifySyntheticSignedPsbt(signed,result.unsignedPsbtBase64,h.signerPubkeyHex);
 assert.equal(verified.signatureCount,1);
 const finalized=finalizeSyntheticCltvPsbt(signed,result.unsignedPsbtBase64,h.signerPubkeyHex);
 const transaction=bitcoin.Transaction.fromHex(finalized.rawTransactionHex);
 assert.equal(transaction.locktime,h.locktime);
 assert.equal(transaction.ins[0].sequence,0xfffffffe);
 assert.equal(finalized.inputCount,1);assert.equal(finalized.outputCount,1);
 assert.equal(finalized.scriptExecutionVerified,false);assert.equal(finalized.broadcast,false);
});
test('regression: synthetic funding outpoint uses internal txid bytes, not display-order bytes',()=>{
 const signedTx=bitcoin.Transaction.fromBuffer(original.data.globalMap.unsignedTx.toBuffer());
 const fundingTx=bitcoin.Transaction.fromBuffer(original.data.inputs[0].nonWitnessUtxo);
 const internalHash=fundingTx.getHash();
 assert.ok(signedTx.ins[0].hash.equals(internalHash),
  'Outpoint must contain raw funding double-SHA256 bytes');
 assert.notEqual(internalHash.toString('hex'),fundingTx.getId(),
  'Displayed txid is reversed and must never be copied as internal outpoint bytes');
 const reversed=Buffer.from(internalHash).reverse();
 assert.ok(!signedTx.ins[0].hash.equals(reversed),
  'Regression: old standalone HTML generator reversed the internal funding hash');
});

test('builder rejects a wrong signer for the synthetic signature',()=>{
 const wrongPubkey='02'+'11'.repeat(32);
 assert.throws(()=>verifySyntheticSignedPsbt(signed,unsigned,wrongPubkey),/signer signature/i);
});

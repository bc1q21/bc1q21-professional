import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';import bitcoin from 'bitcoinjs-lib';
import {PUBLIC_SYNTHETIC_ACCOUNT as a,syntheticSignedCltvFixture} from './public-synthetic-wallet.mjs';
import {deriveRecipientReleaseKeysFromXpub} from '../derive-recipient-release-keys.mjs';
const read=n=>JSON.parse(readFileSync(new URL('./'+n,import.meta.url),'utf8'));
test('software fixture signer agrees with independent public BIP32 derivation',()=>{
 const f=syntheticSignedCltvFixture(),keys=deriveRecipientReleaseKeysFromXpub({accountXpub:a.xpub,releaseCount:24});
 assert.equal(keys.keys[10].publicKeyHex,f.publicKeyHex);assert.equal(f.hardwareVerified,false);assert.equal(f.broadcast,false);
});
test('24 simulated funding outputs, handoff and claim PSBT bind to the same transaction',()=>{
 const proof=read('original-funded-24-public-evidence.json'),fund=read('public-synthetic-funding.json'),h=read('same-gift-unsigned-handoff.json');
 const tx=bitcoin.Transaction.fromHex(fund.fundingHex),claim=bitcoin.Psbt.fromBase64(h.unsignedPsbtBase64);
 assert.equal(tx.getId(),proof.fundingTxid);assert.equal(h.fundingTxid,tx.getId());assert.equal(proof.releaseOutputs.length,24);
 for(const r of proof.releaseOutputs){assert.equal(tx.outs[r.vout].value,r.sats);assert.equal(tx.outs[r.vout].script.toString('hex'),r.scriptPubKeyHex);}
 assert.ok(Buffer.from(claim.txInputs[0].hash).equals(tx.getHash()));assert.equal(claim.txInputs[0].index,h.vout);
 assert.equal(claim.locktime,h.locktime);assert.equal(tx.outs[h.vout].value,h.inputSats);assert.equal(claim.txOutputs[0].value,h.payoutSats);
 assert.equal(h.inputSats-h.payoutSats,h.feeSats);assert.equal(h.confirmedUnspentAtObservation,false);
 assert.equal(createHash('sha256').update(Buffer.from(h.unsignedPsbtBase64,'base64')).digest('hex'),h.psbtSha256);
 for(const r of [proof,fund,h]){assert.equal(r.synthetic,true);assert.equal(r.hardwareVerified,false);assert.equal(r.chainFunded,false);assert.equal(r.broadcast,false);}
});
test('five-release diagnostic fixture reconciles principal and fee without observed funding claims',()=>{
 const f=read('five-release-unsigned-preview.json'),p=bitcoin.Psbt.fromBase64(f.unsigned.unsignedPsbtBase64);
 assert.equal(p.txOutputs.length,6);assert.equal(p.txOutputs.slice(0,5).reduce((n,o)=>n+o.value,0),100000);
 const input=p.data.inputs.reduce((n,i)=>n+i.witnessUtxo.value,0),output=p.txOutputs.reduce((n,o)=>n+o.value,0);
 assert.equal(input-output,1750);assert.equal(f.unsigned.networkFeeSats,1750);assert.equal(f.chainFunded,false);assert.equal(f.hardwareVerified,false);
});

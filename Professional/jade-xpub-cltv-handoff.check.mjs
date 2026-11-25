// Software-only synthetic account; not a captured hardware identity.
import {PUBLIC_SYNTHETIC_ACCOUNT,syntheticSignedCltvFixture} from './fixtures/public-synthetic-wallet.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import bitcoin from 'bitcoinjs-lib';
import { deriveJadePublicCltvHandoff } from './jade-xpub-cltv-handoff.mjs';
import { prepareProfessionalReleaseFromPublicHandoff } from './public-funding-release-integration.mjs';
const accountXpub=PUBLIC_SYNTHETIC_ACCOUNT.xpub;
const fingerprint=PUBLIC_SYNTHETIC_ACCOUNT.fingerprint;
const input={accountXpub,masterFingerprintHex:fingerprint,childIndex:10,locktime:110};
test('synthetic public xpub derives coherent regtest CLTV handoff and unsigned PSBT',()=>{
 const h=deriveJadePublicCltvHandoff(input);
 assert.equal(h.network,'regtest');assert.equal(h.locktime,110);
 assert.equal(h.masterFingerprintHex,fingerprint);
 assert.deepEqual(h.derivationPath,[0x80000054,0x80000000,0x80000000,1,10]);
 assert.equal(h.originAttestedByXpub,false);
 assert.match(h.signerPubkeyHex,/^(02|03)[0-9a-f]{64}$/);
 const redeem=bitcoin.script.compile([bitcoin.script.number.encode(110),bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
 bitcoin.opcodes.OP_DROP,Buffer.from(h.signerPubkeyHex,'hex'),bitcoin.opcodes.OP_CHECKSIG]);
 assert.equal(h.redeemScriptHex,redeem.toString('hex'));
 const funding=new bitcoin.Transaction();funding.version=2;funding.addInput(Buffer.alloc(32,1),0);
 funding.addOutput(Buffer.from(h.fundingScriptPubKeyHex,'hex'),100000);
 const details={fundingTxHex:funding.toHex(),vout:0,expectedTxid:funding.getId(),expectedSats:100000,
 masterFingerprintHex:h.masterFingerprintHex,derivationPath:h.derivationPath,
 destinationScriptHex:'0014'+'ab'.repeat(20),destinationSats:99000};
 const approved={version:h.version,network:h.network,signerPubkeyHex:h.signerPubkeyHex,locktime:h.locktime,
 redeemScriptHex:h.redeemScriptHex,fundingAddress:h.fundingAddress};
 const r=prepareProfessionalReleaseFromPublicHandoff(approved,details);
 const psbt=bitcoin.Psbt.fromBase64(r.unsignedPsbtBase64);
 assert.equal(psbt.data.inputs[0].bip32Derivation[0].masterFingerprint.toString('hex'),fingerprint);
 assert.equal(psbt.data.inputs[0].bip32Derivation[0].path,"m/84'/0'/0'/1/10");
 assert.equal(psbt.data.inputs[0].bip32Derivation[0].pubkey.toString('hex'),h.signerPubkeyHex);
 assert.equal(r.fundingAddress,h.fundingAddress);
 assert.equal(r.transactionSummary.feeSats,1000);
 assert.equal(r.signed,false);assert.equal(r.broadcast,false);
});
test('Public derivation matches the independently derived software-only signer',()=>{
 const h=deriveJadePublicCltvHandoff(input);
 const signedFixturePubkey=syntheticSignedCltvFixture().publicKeyHex;
 assert.equal(h.signerPubkeyHex,signedFixturePubkey,
  'Synthetic public and private derivation paths differ');
});
test('reject malformed or private account material and tampered metadata',()=>{
 for(const bad of ['xprv'+accountXpub.slice(4),'',accountXpub.slice(0,-1)+'1']){
  assert.throws(()=>deriveJadePublicCltvHandoff({...input,accountXpub:bad}));
 }
 for(const bad of [-1,100001,1.5])assert.throws(()=>deriveJadePublicCltvHandoff({...input,childIndex:bad}));
 for(const bad of [0,16,0x100000000])assert.throws(()=>deriveJadePublicCltvHandoff({...input,locktime:bad}));
 for(const bad of ['','fffffffff'])assert.throws(()=>deriveJadePublicCltvHandoff({...input,masterFingerprintHex:bad}));
});

test('retail-style timestamp CLTV derived entirely from public Jade account xpub',()=>{
 const timestamp=1798761600;
 const handoff=deriveJadePublicCltvHandoff({...input,locktime:timestamp});
 const expectedScript=bitcoin.script.compile([bitcoin.script.number.encode(timestamp),bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
  bitcoin.opcodes.OP_DROP,Buffer.from(handoff.signerPubkeyHex,'hex'),bitcoin.opcodes.OP_CHECKSIG]);
 assert.equal(handoff.redeemScriptHex,expectedScript.toString('hex'));
 assert.equal(handoff.locktime,timestamp);
 assert.equal(handoff.originAttestedByXpub,false);
});

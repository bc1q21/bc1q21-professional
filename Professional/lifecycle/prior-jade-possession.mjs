// Reuse a pinned, fully signed possession challenge after its chain is lost.
// Proves possession ONLY. Never supplies funding/confirmation/broadcast authority.
import assert from 'node:assert/strict';
import {sha256} from '@noble/hashes/sha256';
import bitcoin from 'bitcoinjs-lib';
import {publicWallet,digest,keyScript,network} from './public-model.mjs';
import {verifyExactJadeRoleSignatures} from './jade-registration.mjs';
export function verifyPriorJadePossession({wallet,independentWalletDigest,unsignedPsbtBase64,signedPsbtBase64,independentUnsignedSha256}){
 wallet=publicWallet(wallet);assert.equal(digest(wallet),independentWalletDigest,'Independent wallet pin mismatch');
 assert.match(independentUnsignedSha256||'',/^[a-f0-9]{64}$/,'Independent unsigned hash required');
 const bytes=Buffer.from(unsignedPsbtBase64,'base64');assert.ok(bytes.length<=100000);
 assert.equal(Buffer.from(sha256(bytes)).toString('hex'),independentUnsignedSha256,'Independent unsigned hash mismatch');
 const original=bitcoin.Psbt.fromBuffer(bytes,{network}),keys=[wallet.creator,wallet.change,wallet.service,...wallet.recipient];
 assert.equal(original.inputCount,keys.length);
 const expected=new bitcoin.Psbt({network});expected.setVersion(2);const seen=new Set();
 const origin=k=>[{pubkey:Buffer.from(k.publicKeyHex,'hex'),masterFingerprint:Buffer.from(k.masterFingerprintHex,'hex'),path:k.path}];
 original.txInputs.forEach((input,i)=>{
  const id=input.hash.toString('hex')+':'+input.index;assert.ok(!seen.has(id),'Duplicate possession input');seen.add(id);
  expected.addInput({hash:input.hash,index:input.index,sequence:0xfffffffd,
   witnessUtxo:{value:100000,script:Buffer.from(keyScript(keys[i]),'hex')},sighashType:1,bip32Derivation:origin(keys[i])});
 });
 expected.addOutput({script:Buffer.from(keyScript(wallet.change),'hex'),value:100000*keys.length-2500,bip32Derivation:origin(wallet.change)});
 expected.addOutput({script:bitcoin.script.compile([bitcoin.opcodes.OP_RETURN,Buffer.from(independentWalletDigest,'hex')]),value:0});
 assert.ok(expected.toBuffer().equals(bytes),'Possession template/metadata changed');
 const signatures=verifyExactJadeRoleSignatures(unsignedPsbtBase64,signedPsbtBase64);
 return {publicKeyPossessionVerified:true,inputSignaturesVerified:signatures,chainVerified:false,
  historicalFundingRevalidated:false,hardwareOriginAttested:false,fundingAuthorized:false,broadcastAuthorized:false};
}

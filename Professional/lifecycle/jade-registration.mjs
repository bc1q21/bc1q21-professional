// A standard PSBT proof-of-possession bridge for the existing public wallet
// gate. Unlike the software fixture's raw digest signature, this can be
// presented using Jade's transaction QR protocol. Device acceptance is untested.
// UNSPENDABLE SYNTHETIC CHALLENGE ONLY: never fund or submit this transaction.
import assert from 'node:assert/strict';
import bitcoin from 'bitcoinjs-lib';
import {secp256k1} from '@noble/curves/secp256k1';
import {publicWallet,digest,keyScript,network} from './public-model.mjs';
const same=(a,b)=>Buffer.from(a).equals(Buffer.from(b));
const origins=k=>[{pubkey:Buffer.from(k.publicKeyHex,'hex'),masterFingerprint:Buffer.from(k.masterFingerprintHex,'hex'),path:k.path}];
export function jadeRegistrationChallenge(wallet,independentWalletDigest){
 wallet=publicWallet(wallet);const walletDigest=digest(wallet);
 assert.equal(walletDigest,independentWalletDigest,'Independently pinned public wallet digest required');
 const keys=[wallet.creator,wallet.change,wallet.service,...wallet.recipient];
 const psbt=new bitcoin.Psbt({network});psbt.setVersion(2);
 // Distinct fake outpoints commit the entire registered public wallet and
 // genesis. They are NOT observed UTXOs and confer no funding authority.
 keys.forEach((k,index)=>psbt.addInput({hash:walletDigest,index,sequence:0xfffffffd,
  witnessUtxo:{script:Buffer.from(keyScript(k),'hex'),value:100000},bip32Derivation:origins(k)}));
 psbt.addOutput({script:Buffer.from(keyScript(wallet.change),'hex'),value:100000*keys.length-2500,
  bip32Derivation:origins(wallet.change)});
 return {format:'professional-jade-synthetic-registration-challenge-v1',network:'regtest',
  walletDigest,unsignedPsbtBase64:psbt.toBase64(),inputCount:keys.length,
  synthetic:true,fundingAuthorized:false,broadcastAuthorized:false,hardwareTested:false};
}
export function verifyJadeRegistration(wallet,independentWalletDigest,signedPsbtBase64){
 const challenge=jadeRegistrationChallenge(wallet,independentWalletDigest);
 assert.ok(typeof signedPsbtBase64==='string'&&signedPsbtBase64.length<=140000,'Invalid proof size');
 verifyExactJadeRoleSignatures(challenge.unsignedPsbtBase64,signedPsbtBase64);
 return {walletDigest:challenge.walletDigest,publicKeyPossessionVerified:true,
  hardwareOriginAttested:false,identityAuthenticated:false,fundingAuthorized:false,broadcastAuthorized:false};
}

// Shared verifier for exact synthetic/funded native-segwit role proofs.
export function verifyExactJadeRoleSignatures(unsignedPsbtBase64,signedPsbtBase64){
 assert.ok(typeof signedPsbtBase64==='string'&&signedPsbtBase64.length<=140000,'Invalid proof size');
 const before=bitcoin.Psbt.fromBase64(unsignedPsbtBase64,{network}),after=bitcoin.Psbt.fromBase64(signedPsbtBase64,{network});
 assert.ok(same(before.data.globalMap.unsignedTx.toBuffer(),after.data.globalMap.unsignedTx.toBuffer()),'Registration transaction changed');
 assert.deepEqual(Object.keys(after.data.globalMap),['unsignedTx']);
 assert.deepEqual(after.data.outputs,before.data.outputs,'Registration output origin changed');
 const tx=bitcoin.Transaction.fromBuffer(before.data.globalMap.unsignedTx.toBuffer());
 for(let i=0;i<before.inputCount;i++){
  const a=after.data.inputs[i],b=before.data.inputs[i];
  assert.ok(Object.keys(a).every(k=>['witnessUtxo','nonWitnessUtxo','bip32Derivation','sighashType','partialSig'].includes(k)),'Unexpected proof metadata');
  const {partialSig,...metadata}=a;assert.deepEqual(metadata,b,'Proof UTXO or origin metadata changed');
  assert.equal(a.partialSig?.length,1,'Every registered role must prove key possession');
  const sig=a.partialSig[0],pub=b.bip32Derivation[0].pubkey;
  assert.ok(same(sig.pubkey,pub),'Wrong proof key');
  const decoded=bitcoin.script.signature.decode(sig.signature);assert.equal(decoded.hashType,bitcoin.Transaction.SIGHASH_ALL);
  const script=bitcoin.payments.p2pkh({pubkey:pub,network}).output;
  const hash=tx.hashForWitnessV0(i,script,b.witnessUtxo.value,decoded.hashType);
  assert.ok(secp256k1.verify(decoded.signature,hash,pub,{lowS:true}),'Invalid proof signature');
 }
 return before.inputCount;
}

// Public-only registration verifier shared by browser and lab coordinator.
import assert from 'node:assert/strict';
import {secp256k1} from '@noble/curves/secp256k1';
import {publicWallet,digest} from './public-model.mjs';
import {verifyFundedJadeRegistration} from './jade-funded-registration.mjs';
import {verifyJadeRegistration} from './jade-registration.mjs';
import {verifyPriorJadePossession} from './prior-jade-possession.mjs';
export function verifyWalletRegistration(registration,independentWalletDigest){
 const wallet=publicWallet(registration.wallet),hash=digest(wallet);
 assert.equal(hash,independentWalletDigest,'Public wallet fingerprint must be independently pinned');
 assert.equal(registration.walletDigest,hash);
 const keys=[wallet.creator,wallet.change,wallet.service,...wallet.recipient];
 if(registration.priorFundedPossession!==undefined){
  assert.equal(registration.proofs,undefined,'Ambiguous registration proof formats');
  assert.equal(registration.signedRegistrationPsbtBase64,undefined,'Ambiguous registration proof formats');
  const p=registration.priorFundedPossession;
  assert.deepEqual(Object.keys(p).sort(),['unsignedPsbtBase64','signedPsbtBase64','independentUnsignedSha256'].sort());
  verifyPriorJadePossession({...p,wallet,independentWalletDigest});
  return wallet;
 }
 if(registration.signedRegistrationPsbtBase64!==undefined){
  assert.equal(registration.proofs,undefined,'Ambiguous registration proof formats');
  if(registration.fundedRegistrationRequest!==undefined){
   verifyFundedJadeRegistration({request:registration.fundedRegistrationRequest,independentRequestDigest:registration.fundedRegistrationRequestDigest,independentWalletDigest,signedPsbtBase64:registration.signedRegistrationPsbtBase64});
  }else verifyJadeRegistration(wallet,independentWalletDigest,registration.signedRegistrationPsbtBase64);
  return wallet;
 }
 assert.equal(registration.proofs.length,keys.length);
 // Possession binds all public roles to this regtest registration; it does not
 // establish a person's legal identity or attest a hardware device.
 keys.forEach((k,i)=>assert.ok(secp256k1.verify(registration.proofs[i],hash,k.publicKeyHex,{lowS:true}),'Wallet possession proof failed'));
 return wallet;
}

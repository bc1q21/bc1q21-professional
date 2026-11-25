// Public-only browser wallet setup. Reuses existing Jade PSBT signature checks.
import assert from 'node:assert/strict';
import {Buffer} from 'buffer';
import bitcoin from 'bitcoinjs-lib';
import bs58check from 'bs58check';
import {decodeJadeRegtestAccount} from './jade-public-account.mjs';
import {deriveRecoveryPublicKeys,discoveryForPlan} from './independent-recovery-profile.mjs';
import {GENESIS,network,digest,canonical,keyScript,publicWallet} from './lifecycle/public-model.mjs';
import {verifyExactJadeRoleSignatures} from './lifecycle/jade-registration.mjs';
export const IDENTITY_PROOF_FEE_SATS=2500; // Existing funded Jade identity-test fee, not a gift fee.
export function accountFromPublicFrames(text){
 const node=decodeJadeRegtestAccount(text,{expectedAccountPath:null});
 // Public node serialization only. Parent fingerprint is unavailable in the
 // decoder; zero is internal metadata, NOT a claim to reproduce original xpub.
 const raw=Buffer.alloc(78);raw.writeUInt32BE(0x0488b21e);raw[4]=3;raw.writeUInt32BE(0x80000000,9);
 Buffer.from(node.chainCodeHex,'hex').copy(raw,13);Buffer.from(node.publicKeyHex,'hex').copy(raw,45);
 const account={accountPath:node.accountPath,accountXpub:bs58check.encode(raw),masterFingerprintHex:node.masterFingerprintHex};
 deriveRecoveryPublicKeys(account,1);return account;
}
export const accountIdentity=a=>digest({accountPath:a.accountPath,masterFingerprintHex:a.masterFingerprintHex,publicKeyHex:Buffer.from(bs58check.decode(a.accountXpub)).subarray(45,78).toString('hex'),chainCodeHex:Buffer.from(bs58check.decode(a.accountXpub)).subarray(13,45).toString('hex')});
export function accountProofChallenge({account,planDigest,role,utxo,challengeId}){
 assert.ok(['creator','beneficiary'].includes(role));assert.match(planDigest,/^[0-9a-f]{64}$/);assert.match(challengeId,/^[0-9a-f-]{36}$/);
 const keys=deriveRecoveryPublicKeys(account,1),tx=bitcoin.Transaction.fromHex(utxo.fundingTxHex);
 assert.equal(tx.getId(),utxo.txid,'Identity funding TXID mismatch');assert.ok(Number.isSafeInteger(utxo.vout)&&utxo.vout>=0&&tx.outs[utxo.vout]);
 const output=tx.outs[utxo.vout];assert.equal(output.value,utxo.valueSats);assert.equal(output.script.toString('hex'),keyScript(keys.funding),'Identity funding belongs to another wallet');
 assert.ok(output.value>=IDENTITY_PROOF_FEE_SATS+546,'Disposable identity-test funds insufficient');
 const binding={format:'professional-local-account-possession-v1',network:'regtest',genesis:GENESIS,accountIdentity:accountIdentity(account),planDigest,role,challengeId};
 const commitment=digest(binding),psbt=new bitcoin.Psbt({network});psbt.setVersion(2);
 psbt.addInput({hash:utxo.txid,index:utxo.vout,sequence:0xfffffffd,witnessUtxo:{script:output.script,value:output.value},sighashType:1,bip32Derivation:[{pubkey:Buffer.from(keys.funding.publicKeyHex,'hex'),masterFingerprint:Buffer.from(account.masterFingerprintHex,'hex'),path:keys.funding.path}]});
 psbt.addOutput({script:Buffer.from(keyScript(keys.destination),'hex'),value:output.value-IDENTITY_PROOF_FEE_SATS,bip32Derivation:[{pubkey:Buffer.from(keys.destination.publicKeyHex,'hex'),masterFingerprint:Buffer.from(account.masterFingerprintHex,'hex'),path:keys.destination.path}]});
 psbt.addOutput({script:bitcoin.script.compile([bitcoin.opcodes.OP_RETURN,Buffer.from(commitment,'hex')]),value:0});
 return {...binding,account:{...account},utxo:{...utxo},unsignedPsbtBase64:psbt.toBase64(),commitment,feeSats:IDENTITY_PROOF_FEE_SATS,returnSats:output.value-IDENTITY_PROOF_FEE_SATS,broadcastAuthorized:false};
}
export function verifyAccountProof(challenge,signed,context){
 assert.equal(challenge.planDigest,context.planDigest,'Identity plan changed');assert.equal(challenge.role,context.role);assert.equal(challenge.accountIdentity,accountIdentity(context.account),'Account changed');
 const rebuilt=accountProofChallenge({account:context.account,planDigest:context.planDigest,role:context.role,utxo:challenge.utxo,challengeId:challenge.challengeId});
 assert.equal(canonical(challenge),canonical(rebuilt),'Identity request changed');
 assert.equal(verifyExactJadeRoleSignatures(rebuilt.unsignedPsbtBase64,signed),1);
 return {accountIdentity:challenge.accountIdentity,planDigest:challenge.planDigest,role:challenge.role,commitment:challenge.commitment,cryptographicPossessionVerified:true,broadcastAuthorized:false};
}
export function approvedServiceKey(policy){
 assert.equal(policy?.approved,true,'Professional service-fee destination is awaiting approval; setup cannot be completed');assert.equal(policy.network,'regtest');assert.equal(policy.genesis,GENESIS,'Service policy genesis mismatch');assert.ok(typeof policy.id==='string'&&policy.id.length>0);
 assert.deepEqual(Object.keys(policy.key).sort(),['masterFingerprintHex','path','publicKeyHex']);assert.match(policy.key.publicKeyHex,/^(02|03)[0-9a-f]{64}$/);assert.match(policy.key.masterFingerprintHex,/^[0-9a-f]{8}$/);assert.match(policy.key.path,/^m\/84'\/0'\/0'\/[01]\/\d+$/);
 return {...policy.key};
}
export function assembleCustomerWallet({creatorAccount,beneficiaryAccount,creatorProof,beneficiaryProof,plan,index,policy}){
 const creator=deriveRecoveryPublicKeys(creatorAccount,index),beneficiary=deriveRecoveryPublicKeys(beneficiaryAccount,index),planDigest=digest(plan);
 for(const [account,proof,role] of [[creatorAccount,creatorProof,'creator'],[beneficiaryAccount,beneficiaryProof,'beneficiary']]){
  assert.ok(proof?.challenge&&proof.signedPsbtBase64,'Cryptographic wallet proof required');
  const shared=accountIdentity(creatorAccount)===accountIdentity(beneficiaryAccount);
  assert.ok(proof.challenge.role===role||(shared&&role==='beneficiary'&&proof.challenge.role==='creator'),'Wallet proof role mismatch');
  verifyAccountProof(proof.challenge,proof.signedPsbtBase64,{account,planDigest,role:proof.challenge.role});
 }
 const service=approvedServiceKey(policy),wallet=publicWallet({format:'professional-regtest-public-wallet-v1',network:'regtest',genesis:GENESIS,creator:creator.funding,change:creator.destination,service,recipient:beneficiary.recipient.slice(0,plan.releases.length)});
 const discovery={publicAccount:beneficiaryAccount,index};discoveryForPlan({plan,wallet,...discovery});
 return {wallet,discovery,pin:digest(wallet),setupMode:'LOCAL_ACCOUNT_PROOFS',servicePolicyId:policy.id};
}

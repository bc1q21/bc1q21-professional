// Public-only adaptation of the existing Jade role-possession challenge to
// actual confirmed regtest funding. No keys, signing, RPC or broadcast here.
import assert from 'node:assert/strict';
import bitcoin from 'bitcoinjs-lib';
import {publicWallet,digest,canonical,keyScript,GENESIS,network,sum} from './public-model.mjs';
import {verifyExactJadeRoleSignatures} from './jade-registration.mjs';
export function fundedJadeRegistration({wallet,independentWalletDigest,utxos}){
 wallet=publicWallet(wallet);const walletDigest=digest(wallet);
 assert.equal(walletDigest,independentWalletDigest,'Independent wallet digest mismatch');
 const keys=[wallet.creator,wallet.change,wallet.service,...wallet.recipient];
 assert.equal(utxos.length,keys.length,'One real funding outpoint per registered role required');
 const psbt=new bitcoin.Psbt({network});psbt.setVersion(2);const seen=new Set();
 const inputs=utxos.map((u,i)=>{
  const key=keys[i];assert.match(u.txid,/^[0-9a-f]{64}$/);assert.ok(Number.isInteger(u.vout)&&u.vout>=0&&u.vout<=0xffffffff);
  assert.equal(u.valueSats,100000,'Each disposable role challenge input must be 100000 sats');
  assert.equal(u.scriptPubKeyHex,keyScript(key),'Role funding key mismatch');
  const id=u.txid+':'+u.vout;assert.ok(!seen.has(id),'Duplicate proof outpoint');seen.add(id);
  assert.ok(typeof u.fundingTxHex==='string'&&u.fundingTxHex.length<=200000);
  const prior=bitcoin.Transaction.fromHex(u.fundingTxHex);assert.equal(prior.getId(),u.txid,'Funding transaction ID mismatch');
  const output=prior.outs[u.vout];assert.ok(output,'Funding outpoint missing');assert.equal(output.value,u.valueSats);
  assert.equal(output.script.toString('hex'),u.scriptPubKeyHex,'Funding output script mismatch');
  psbt.addInput({hash:u.txid,index:u.vout,sequence:0xfffffffd,
   witnessUtxo:{script:output.script,value:output.value},sighashType:bitcoin.Transaction.SIGHASH_ALL,
   bip32Derivation:[{pubkey:Buffer.from(key.publicKeyHex,'hex'),masterFingerprint:Buffer.from(key.masterFingerprintHex,'hex'),path:key.path}]});
  return {txid:u.txid,vout:u.vout,valueSats:u.valueSats,scriptPubKeyHex:u.scriptPubKeyHex,fundingTxHex:u.fundingTxHex};
 });
 const totalInputSats=sum(inputs.map(u=>u.valueSats)),feeSats=2500,returnSats=totalInputSats-feeSats;
 psbt.addOutput({script:Buffer.from(keyScript(wallet.change),'hex'),value:returnSats,
  bip32Derivation:[{pubkey:Buffer.from(wallet.change.publicKeyHex,'hex'),masterFingerprint:Buffer.from(wallet.change.masterFingerprintHex,'hex'),path:wallet.change.path}]});
 // Preserve explicit binding to ALL public roles/origins and regtest genesis,
 // which the synthetic challenge encoded in fake prevout hashes instead.
 psbt.addOutput({script:bitcoin.script.compile([bitcoin.opcodes.OP_RETURN,Buffer.from(walletDigest,'hex')]),value:0});
 const body={format:'professional-funded-jade-registration-v1',network:'regtest',genesis:GENESIS,
  wallet,walletDigest,inputs,totalInputSats,feeSats,returnSats,unsignedPsbtBase64:psbt.toBase64(),
  synthetic:false,signed:false,signingAuthorized:false,broadcastAuthorized:false};
 return {...body,requestDigest:digest(body)};
}
export function validateFundedJadeRequest(request,independentRequestDigest){
 const {requestDigest,...body}=request;
 assert.match(independentRequestDigest||'',/^[0-9a-f]{64}$/,'Independent request digest required');
 assert.equal(digest(body),requestDigest,'Funded challenge changed');assert.equal(requestDigest,independentRequestDigest,'Independent request digest mismatch');
 const rebuilt=fundedJadeRegistration({wallet:request.wallet,independentWalletDigest:request.walletDigest,utxos:request.inputs});
 assert.equal(canonical(request),canonical(rebuilt),'Funded challenge intent differs');return rebuilt;
}
export function verifyFundedJadeRegistration({request,independentRequestDigest,independentWalletDigest,signedPsbtBase64}){
 validateFundedJadeRequest(request,independentRequestDigest);
 assert.equal(request.walletDigest,independentWalletDigest,'Independent wallet digest mismatch');
 const signatures=verifyExactJadeRoleSignatures(request.unsignedPsbtBase64,signedPsbtBase64);
 assert.equal(signatures,request.inputs.length);
 return {format:'professional-funded-jade-registration-verified-v1',network:'regtest',walletDigest:request.walletDigest,
  requestDigest:request.requestDigest,publicKeyPossessionVerified:true,inputSignaturesVerified:signatures,
  hardwareOriginAttested:false,chainVerified:false,broadcast:false,broadcastAuthorized:false};
}

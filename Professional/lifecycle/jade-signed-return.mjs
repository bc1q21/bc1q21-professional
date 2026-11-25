// Offline, public-only exact-request verification. No RPC or broadcast.
import assert from 'node:assert/strict';
import {Buffer} from 'buffer';
import {decodeSavedCryptoPsbtFrames,MAX_PSBT_BYTES} from '../crypto-psbt-transport.mjs';
import {GENESIS,canonical,digest,prepareCreation,prepareClaim,finalizeCreation,finalizeClaim} from './public-model.mjs';
export function verifyJadeRequest(request,independentRequestDigest){
 const {requestDigest,...body}=request;
 assert.match(independentRequestDigest||'',/^[a-f0-9]{64}$/,'Independent request fingerprint required');
 assert.equal(digest(body),requestDigest,'Request changed');assert.equal(requestDigest,independentRequestDigest,'Independent request fingerprint mismatch');
 assert.equal(body.format,'professional-offline-signing-request-v1');assert.equal(body.network,'regtest');assert.equal(body.genesis,GENESIS);
 assert.ok(Number.isSafeInteger(body.revision)&&body.revision>=0);
 const {format,network,genesis,revision,...payload}=body;
 let expected;
 if(body.kind==='create')expected=prepareCreation({plan:body.plan,wallet:body.wallet,utxos:body.intent.inputs,rate:body.rate,feeEstimate:body.feeEstimate,discovery:body.discovery??null});
 else {assert.equal(body.kind,'claim','Creator or claim request required');expected=prepareClaim({manifest:body.manifest,releaseNumbers:body.releaseNumbers,destinationScriptHex:body.destinationScriptHex,rate:body.rate});}
 assert.equal(canonical(payload),canonical(expected),'Request does not match independently reconstructed financial intent');
 return {requestDigest,kind:body.kind,unsignedPsbtBase64:body.kind==='create'?body.unsigned.unsignedPsbtBase64:body.unsignedPsbtBase64};
}
export function readJadeSignedPayload(raw){
 const bytes=Buffer.from(raw);
 if(bytes.subarray(0,5).toString('hex')==='70736274ff'){
  assert.ok(bytes.length>=10&&bytes.length<=MAX_PSBT_BYTES,'Signed PSBT exceeds bounds');return bytes.toString('base64');
 }
 return decodeSavedCryptoPsbtFrames(bytes.toString('utf8')).toString('base64');
}
export function verifyLifecycleJadeReturn({request,independentRequestDigest,signedPsbtBase64}){
 const reviewed=verifyJadeRequest(request,independentRequestDigest);
 const final=reviewed.kind==='create'?finalizeCreation(request,signedPsbtBase64):finalizeClaim(request,signedPsbtBase64);
 return {format:'professional-jade-return-inspection-v1',network:'regtest',kind:reviewed.kind,
  requestDigest:reviewed.requestDigest,txid:final.txid,vsize:final.vsize,feeSats:final.feeSats,
  signatureCryptographicallyVerified:true,transactionMatchesApprovedRequest:true,
  hardwareOriginAttested:false,chainVerified:false,broadcast:false,broadcastAuthorized:false,
  nextStep:'FRESH_CORE_AND_EXPLICIT_REGTEST_SUBMISSION_APPROVAL_REQUIRED'};
}

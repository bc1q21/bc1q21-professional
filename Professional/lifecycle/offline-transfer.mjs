// Reuse the existing Jade BC-UR transfer codec, without changing hardware code.
// The QR carries a standard PSBT; the exact public review/fingerprint accompanies
// it separately. Successful encoding is not evidence a device approved/signs it.
import assert from 'node:assert/strict';
import {decodeCryptoPsbtFrames} from '../crypto-psbt-transport.mjs';
import {makeCryptoPsbtFrames} from '../crypto-psbt-frames.mjs';
import {digest} from './public-model.mjs';
export function offlineTransfer(request,{fragmentLength=120}={}){
 const {requestDigest,...body}=request;assert.equal(digest(body),requestDigest);
 const b64=request.kind==='create'?request.unsigned.unsignedPsbtBase64:request.unsignedPsbtBase64;
 const bytes=Buffer.from(b64,'base64');
 const frameCount=Math.min(512,Math.ceil((bytes.length+5)/fragmentLength)*2+8);
 return {requestDigest,psbtBase64:b64,frames:makeCryptoPsbtFrames(bytes,{frameCount,fragmentLength}),
  hardwareTested:false,signingAuthorized:false,broadcastAuthorized:false};
}
export function decodeOfflineTransfer(frames){
 return decodeCryptoPsbtFrames(frames).toString('base64');
}

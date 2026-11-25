// Shared, public-only transport. QR decoding never authenticates a signer,
// approves a transaction, finalizes it, or authorizes a broadcast.
import {Buffer} from 'buffer';
import {URDecoder} from '@ngraveio/bc-ur';
export const MAX_PSBT_BYTES=100000,MAX_QR_FRAMES=512,MAX_QR_FRAME_CHARS=8192;
const fail=m=>{throw Error('Professional PSBT transport: '+m)};
export function decodeCryptoPsbtCbor(raw){
 const b=Buffer.from(raw);if(b.length<1||b.length>MAX_PSBT_BYTES+5)fail('Invalid CBOR size');
 const lead=b[0];let offset,length;
 if(lead>=0x40&&lead<=0x57){offset=1;length=lead-0x40;}
 else if(lead===0x58){if(b.length<2)fail('Truncated CBOR');offset=2;length=b[1];if(length<24)fail('Noncanonical CBOR');}
 else if(lead===0x59){if(b.length<3)fail('Truncated CBOR');offset=3;length=b.readUInt16BE(1);if(length<256)fail('Noncanonical CBOR');}
 else if(lead===0x5a){if(b.length<5)fail('Truncated CBOR');offset=5;length=b.readUInt32BE(1);if(length<65536)fail('Noncanonical CBOR');}
 else fail('Expected definite CBOR byte string');
 if(length<10||length>MAX_PSBT_BYTES||b.length!==offset+length)fail('Invalid PSBT payload size');
 const bytes=b.subarray(offset);if(bytes.subarray(0,5).toString('hex')!=='70736274ff')fail('Invalid PSBT v0 header');
 return bytes;
}
export function checkCryptoPsbtFrame(frame){
 if(typeof frame!=='string'||frame.length>MAX_QR_FRAME_CHARS||
  !/^ur:crypto-psbt\/[a-z0-9/-]+$/i.test(frame))fail('Only bounded crypto-psbt frames are permitted');
 const parts=frame.toLowerCase().split('/');
 if(parts.length===3){
  const match=parts[1].match(/^([1-9]\d*)-([1-9]\d*)$/);
  if(!match||Number(match[1])>0xffffffff||Number(match[2])>MAX_QR_FRAMES)fail('Invalid or oversized fountain sequence');
 }else if(parts.length!==2)fail('Invalid UR path');
 return frame.toLowerCase();
}
export function decodeCryptoPsbtFrames(frames){
 if(!Array.isArray(frames)||!frames.length||frames.length>MAX_QR_FRAMES)fail('Invalid frame count');
 // Validate the whole input, even trailing frames after a complete message.
 const normalized=frames.map(checkCryptoPsbtFrame);
 const decoder=new URDecoder();
 for(const frame of normalized){decoder.receivePart(frame);if(decoder.isComplete())break;}
 if(!decoder.isComplete()||!decoder.isSuccess())fail('Incomplete or invalid transfer');
 const ur=decoder.resultUR();if(ur.type!=='crypto-psbt')fail('Wrong UR type');
 return decodeCryptoPsbtCbor(ur.cbor);
}
export function decodeSavedCryptoPsbtFrames(text){
 if(typeof text!=='string'||text.length>MAX_QR_FRAMES*(MAX_QR_FRAME_CHARS+2))fail('Saved frame file too large');
 const lines=text.split(/\r?\n/).map(l=>l.trim()).filter(l=>l&&!l.startsWith('#'));
 return decodeCryptoPsbtFrames(lines);
}

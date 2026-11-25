// TEF public export only. No private/seed QR, PSBT, signing or network request.
import jsQR from 'jsqr';
import {URDecoder} from '@ngraveio/bc-ur';
import {decodeJadeRegtestAccount} from './jade-public-account.mjs';
const el=id=>document.getElementById(id),expectedFingerprint='e29ac13c',expectedAccountPath="m/84'/0'/0'";
let stream=null,active=false,generation=0,decoder=new URDecoder(),frames=new Set(),complete=false;
const status=text=>{el('status').textContent=text;};
function stop(discard=true){
 active=false;generation++;
 if(stream)for(const track of stream.getTracks()){try{track.stop();}catch{}}
 stream=null;el('video').srcObject=null;el('canvas').width=0;el('canvas').height=0;
 el('start').disabled=false;el('stop').disabled=true;
 if(discard){decoder=new URDecoder();frames.clear();complete=false;el('save').disabled=true;}
}
function accept(frame){
 if(typeof frame!=='string'||frame.length>8192||!/^ur:crypto-(account|hdkey)\/[a-z0-9/-]+$/i.test(frame))throw Error('Wrong QR type. Only the public Export Xpub screen is permitted.');
 frame=frame.toLowerCase();const parts=frame.split('/');
 if(parts.length===3){const m=parts[1].match(/^([1-9]\d*)-([1-9]\d*)$/);if(!m||Number(m[1])>0xffffffff||Number(m[2])>512)throw Error('Public QR sequence exceeds limits.');}
 else if(parts.length!==2)throw Error('Invalid public QR format.');
 if(frames.has(frame))return;
 if(frames.size>=512)throw Error('Too many public QR frames.');
 frames.add(frame);decoder.receivePart(frame);status('Reading public account: '+frames.size+' distinct frames. Keep the QR visible.');
 if(!decoder.isComplete())return;
 if(!decoder.isSuccess())throw Error('Public QR decoding failed.');
 const account=decodeJadeRegtestAccount([...frames].join('\n'),{expectedAccountPath});
 if(account.masterFingerprintHex!==expectedFingerprint)throw Error('Public export fingerprint does not match the confirmed TEF wallet.');
 complete=true;stop(false);el('save').disabled=false;
 status('Complete public export verified: fingerprint E29AC13C; '+account.accountPath+'. Camera stopped. Save public export frames. No signing authorization.');
}
async function tick(token){
 if(!active||token!==generation)return;
 try{
  const video=el('video');
  if(video.readyState>=2&&video.videoWidth){
   if(video.videoWidth>4096||video.videoHeight>4096||video.videoHeight<=0)throw Error('Camera dimensions exceed limits.');
   const canvas=el('canvas');canvas.width=video.videoWidth;canvas.height=video.videoHeight;
   const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(video,0,0);
   const image=ctx.getImageData(0,0,canvas.width,canvas.height),qr=jsQR(image.data,canvas.width,canvas.height,{inversionAttempts:'attemptBoth'});
   if(qr)accept(qr.data);
  }
 }catch(error){if(token!==generation)return;stop();status('Capture rejected: '+error.message);return;}
 if(active&&token===generation)setTimeout(()=>tick(token),120);
}
el('start').onclick=async()=>{
 stop();
 if(!(location.protocol==='file:'||(['http:','https:'].includes(location.protocol)&&['127.0.0.1','localhost','[::1]'].includes(location.hostname)))){status('Open this file locally or on a loopback-only server.');return;}
 const token=generation;el('start').disabled=true;el('stop').disabled=false;
 let acquired=null;
 try{
  if(!navigator.mediaDevices?.getUserMedia)throw Error('Camera unavailable. A loopback HTTP server may be required by Brave.');
  acquired=await navigator.mediaDevices.getUserMedia({video:true,audio:false});
  if(token!==generation){acquired.getTracks().forEach(t=>t.stop());return;}
  stream=acquired;el('video').srcObject=stream;await el('video').play();
  if(token!==generation){acquired.getTracks().forEach(t=>t.stop());return;}
  active=true;status('Show Jade’s public Export Xpub QR to the webcam. Never show a seed/backup QR.');void tick(token);
 }catch(error){if(acquired)acquired.getTracks().forEach(t=>t.stop());if(token===generation){stop();status('Camera unavailable: '+error.message);}}
};
el('stop').onclick=()=>{stop();status('Stopped. Partial frames cleared.');};
el('reset').onclick=()=>{stop();status('Ready for TEF public-account export.');};
el('save').onclick=()=>{
 if(!complete)return;
 const text='# TEF PUBLIC ACCOUNT EXPORT ONLY\n# Contains public keys; keep private to this test. Never a seed backup.\n'+[...frames].join('\n')+'\n';
 const url=URL.createObjectURL(new Blob([text],{type:'text/plain'})),a=document.createElement('a');
 a.href=url;a.download='TEF-public-account-frames.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
window.addEventListener('pagehide',()=>stop());

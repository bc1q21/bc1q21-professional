// Transport only. Existing race-safe camera receiver, bundled locally; no CDN.
import {createJadeSignedCameraReceiver} from '../recipient-jade-signed-camera.browser.mjs';
const el=id=>document.getElementById(id);let captured=null;
const clear=()=>{captured=null;el('save').disabled=true;};
const status=text=>{el('status').textContent=text+' Capture is not signature verification. No broadcast.';};
const receiver=createJadeSignedCameraReceiver({video:el('video'),canvas:el('canvas'),onStatus:status,
 onSignedPsbt:bytes=>{captured=new Uint8Array(bytes);el('save').disabled=false;status('PSBT transport decoded; save for exact-request verification.');}});
el('start').onclick=async()=>{
 clear();
 if(!['localhost','127.0.0.1','[::1]'].includes(location.hostname)||!['http:','https:'].includes(location.protocol)){
  status('Open this capture page through a local-only HTTP server.');return;
 }
 try{await receiver.start();}catch(e){status('Camera unavailable: '+e.message);}
};
el('stop').onclick=()=>{receiver.stop();status('Camera stopped.');};
el('reset').onclick=()=>{clear();receiver.reset();};
el('save').onclick=()=>{
 if(!captured)return;
 const url=URL.createObjectURL(new Blob([captured],{type:'application/octet-stream'}));
 const a=document.createElement('a');a.href=url;a.download='jade-return-unverified.psbt';a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
};
window.addEventListener('pagehide',()=>{receiver.stop();clear();});

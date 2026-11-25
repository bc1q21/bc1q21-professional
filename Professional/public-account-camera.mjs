// Public-account QR transport only. Stopping never changes imported wallet state.
import jsQR from 'jsqr';
import {accountFromPublicFrames} from './creator-wallet-setup.mjs';
export function publicAccountReceiver({video,canvas,onAccount,onStatus}){
 let stream=null,generation=0,frames=new Set();
 const stop=()=>{
  generation++;if(stream)for(const t of stream.getTracks()){try{t.stop();}catch{}}stream=null;video.srcObject=null;
  canvas.width=0;canvas.height=0;frames.clear();
 };
 const accept=text=>{
  if(typeof text!=='string'||text.length>8192||!/^ur:crypto-(account|hdkey)\/[a-z0-9/-]+$/i.test(text))throw Error('Only the Jade public Export Xpub QR is accepted. Never scan recovery words.');
  frames.add(text.toLowerCase());if(frames.size>512)throw Error('Too many public export frames');
  try{const account=accountFromPublicFrames([...frames].join('\n'));stop();onAccount(account);}catch(e){if(!/Incomplete public export/.test(e.message))throw e;onStatus('Reading public export: '+frames.size+' frames');}
 };
 const start=async()=>{
  stop();const token=generation;let acquired=null;
  try{
   if(!navigator.mediaDevices?.getUserMedia)throw Error('Camera requires a secure browser context');
   acquired=await navigator.mediaDevices.getUserMedia({video:true,audio:false});
   if(token!==generation){for(const t of acquired.getTracks())t.stop();return;}
   stream=acquired;for(const track of stream.getTracks())track.addEventListener?.('ended',()=>{if(token===generation){stop();onStatus('Camera interrupted by browser or device. Click Scan again; wallet and request retained.');}},{once:true});video.srcObject=stream;await video.play();
   if(token!==generation){for(const t of acquired.getTracks())t.stop();return;}
   const tick=()=>{if(token!==generation)return;
    try{if(video.readyState>=2&&video.videoWidth){if(video.videoWidth>4096||video.videoHeight>4096)throw Error('Camera dimensions exceed limit');canvas.width=video.videoWidth;canvas.height=video.videoHeight;const c=canvas.getContext('2d',{willReadFrequently:true});if(!c)throw Error('Camera canvas unavailable');c.drawImage(video,0,0);const pixels=c.getImageData(0,0,canvas.width,canvas.height),qr=jsQR(pixels.data,canvas.width,canvas.height,{inversionAttempts:'attemptBoth'});if(qr)accept(qr.data);}}
    catch(e){if(token!==generation)return;stop();onStatus('Public export rejected: '+e.message+'. Imported wallet and identity request retained.');}
    if(token===generation)setTimeout(tick,120);
   };tick();
  }catch(e){if(acquired)for(const t of acquired.getTracks()){try{t.stop();}catch{}}if(token!==generation)return;stop();throw e;}
 };
 window.addEventListener('pagehide',stop);
 return {start,stop,accept,get active(){return stream!==null;}};
}

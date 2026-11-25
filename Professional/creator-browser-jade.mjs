import {engine,plan,guard,brand,rows} from './creator-browser-common.mjs';
import {inspectIndependentFunding} from './creator-independent-service.mjs';
brand();const $=id=>document.getElementById(id),E=engine();let timer=null,camera=null,active=null,busy=false,pendingReturn=null,done=false;
const w=creatorSession.workflow,check=guard();
function stopQr(){if(timer)clearInterval(timer);timer=null;$('qr-panel').hidden=true;}
function stopCamera(message){camera?.stop();$('stop').disabled=true;if(message)$('verification').textContent=message;}
async function fresh(request){
 check();E.verifyJadeRequest(request,request.requestDigest);
 const r=w.registration,previous=w.funding;if(!r||!previous||E.canonical(r.wallet)!==E.canonical(request.wallet))throw Error('Funding or wallet identity context changed');
 const funding=await inspectIndependentFunding({url:previous.url,wallet:r.wallet,outpoints:request.intent.inputs.map(i=>({txid:i.txid,vout:i.vout})),engine:E,applicationOrigin:location.origin});check();
 const rebuilt=E.prepareBetaCreation({plan:plan(),wallet:r.wallet,utxos:funding.utxos,feeEstimate:funding.feeEstimate,discovery:r.discovery});
 if(rebuilt.unsigned.unsignedPsbtBase64!==request.unsigned.unsignedPsbtBase64)throw Error('Funding or fees changed. Return to Add Funds and review again.');
}
try{
 const request=w.prepared,handoff=w.handoff;
 if(!request||!handoff||handoff.digest!==request.requestDigest||w.acknowledgement!==request.requestDigest)throw Error('Return to Add Funds and acknowledge the exact transaction');
 E.verifyJadeRequest(request,request.requestDigest);rows('schedule-rows',request.plan.releases);$('schedule-panel').hidden=false;
 $('gift-summary').textContent=request.plan.releases.length+' releases · '+request.principalSats+' sats · unsigned, not broadcast';
 $('transaction-review-details').textContent='Principal '+request.principalSats+' sats; service '+request.serviceFeeSats+' sats; discovery '+request.discovery.valueSats+' sats ('+request.discovery.key.path+'); mining '+request.feeSats+' sats; change '+request.changeSats+' sats. Commitment '+request.requestDigest;
 rows('jade-release-rows',request.intent.gifts);$('jade-release-schedule').hidden=false;$('transaction-review').hidden=false;
 $('status').textContent='Exact transaction retained in temporary browser memory. Explicit authorization required; camera has no timeout.';
 const authorize=document.createElement('button');authorize.id='authorize-creator-signing';authorize.type='button';authorize.textContent='Authorize / renew SAME Jade transaction — regtest only';$('transaction-review').append(authorize);
 const file=document.createElement('input');file.id='creator-signed-return';file.type='file';file.accept='.txt,.psbt';file.disabled=true;
 const label=document.createElement('label');label.textContent='Or import saved signed PSBT / captured QR frames';label.append(file);$('verification').after(label);
 function context(){check();if(w.prepared!==request||w.handoff!==handoff||w.acknowledgement!==request.requestDigest||handoff.digest!==request.requestDigest)throw Error('Approved transaction context changed');E.verifyJadeRequest(request,request.requestDigest);}
 function valid(a){return !!a&&!a.used&&Date.now()<a.expiresAt&&a.digest===request.requestDigest;}
 function expired(){stopQr();authorize.disabled=done;$('verification').textContent='Signing authorization expired. Camera and SAME prepared transaction retained. Explicitly renew after fresh checks; do not reconstruct or re-sign solely because time elapsed.';}
 async function returned(payload){
  if(busy)return;busy=true;
  try{
   context();if(done)throw Error('Verified return already consumed');
   const result=E.verifyReturn(request,payload),consent=active;
   pendingReturn=new Uint8Array(payload);
   if(!valid(consent)){expired();$('verification').textContent='Exact signed response captured and retained, NOT accepted. Renew authorization for the SAME transaction to accept it after fresh checks.';return;}
   await fresh(request);context();if(active!==consent||!valid(consent)){expired();return;}
   consent.used=true;done=true;pendingReturn=null;w.verified={...result,requestDigest:request.requestDigest};stopQr();stopCamera();
   $('verification').textContent='SIGNED — NOT BROADCAST. Creator transaction '+result.receipt.txid+'. No confirmation or gift delivery claimed.';
   $('status').textContent='SIGNED — NOT BROADCAST. Cryptographic verification passed locally.';file.disabled=true;authorize.disabled=true;$('scan').disabled=true;$('verified-next').hidden=false;$('finish-gift').disabled=false;$('finish-gift').onclick=()=>location.assign('./finish-workspace.html');
  }catch(e){$('verification').textContent='Signed return rejected: '+e.message+'. Exact request retained; no broadcast.';authorize.disabled=done;}
  finally{busy=false;}
 }
 camera=E.createJadeSignedCameraReceiver({video:$('camera'),canvas:$('camera-canvas'),onStatus:t=>{$('verification').textContent=t;},onSignedPsbt:returned});
 authorize.onclick=async()=>{
  if(busy||done)return;busy=true;authorize.disabled=true;
  try{
   context();if((handoff.consumed||Date.now()>=handoff.expiresAt)&&!confirm('Renew authorization for this SAME acknowledged transaction? Fresh wallet and funding checks are required.'))return;
   active=null;stopQr();await fresh(request);context();const qr=await E.unsignedQr(request);context();
   // Explicit renewal supersedes expired review consent only for the unchanged,
   // acknowledged request. It does not authorize a replacement transaction.
   handoff.consumed=true;active={digest:request.requestDigest,expiresAt:Date.now()+300000,used:false};w.signing=active;
   let i=0,paused=false,delay=280;const show=()=>{try{context();if(!valid(active)){expired();return;}if(!paused){$('qr').src=qr.images[i];$('frame-count').textContent='Frame '+(i+1)+' / '+qr.images.length;i=(i+1)%qr.images.length;}}catch(e){active=null;stopQr();$('verification').textContent=e.message;}};
   show();timer=setInterval(show,delay);$('pause').onclick=()=>{paused=!paused;};$('qr-speed').onclick=()=>{clearInterval(timer);delay=delay===280?700:280;timer=setInterval(show,delay);$('qr-speed-status').textContent=delay+' ms per frame';};
   $('qr-panel').hidden=false;$('scan').disabled=false;file.disabled=false;$('verification').textContent='Signing authorized for five minutes for this exact transaction. Camera has no timeout. Nothing is broadcast.';
   if(pendingReturn){const saved=pendingReturn;setTimeout(()=>returned(saved),0);}
  }catch(e){active=null;stopQr();$('verification').textContent='Authorization refused: '+e.message+'. Exact transaction retained.';}
  finally{busy=false;authorize.disabled=done;}
 };
 $('scan').onclick=async()=>{try{context();if(done)throw Error('Transaction already verified');await camera.start();$('stop').disabled=false;}catch(e){stopCamera('Camera not started: '+e.name+' — '+e.message+'. Click Scan again; exact transaction retained.');}};
 $('stop').onclick=()=>stopCamera('Camera stopped; exact transaction and authorization retained.');
 file.onchange=async()=>{try{const f=file.files[0];if(!f||f.size>500000)throw Error('Invalid signed-return file');await returned(new Uint8Array(await f.arrayBuffer()));}catch(e){$('verification').textContent=e.message;}};
 window.addEventListener('pagehide',()=>{active=null;pendingReturn=null;stopQr();stopCamera();file.disabled=true;});
}catch(e){$('status').textContent='Review unavailable: '+e.message;}

import {PLAN_KEY,validatePublicPlan} from './public-date-planner.mjs';
const key='bc1q21-professional-coordinator-review';
if(location.hash!=='#recipient-claim-review'&&!location.hash.startsWith('#recipient-claim-recovery=')&&!location.hash.startsWith('#recipient-claim-preflight=')&&sessionStorage.getItem(key)){
 // New review-only flow must never resume the legacy session diagnostic signer.
 for(const id of ['scan','stop','finish-gift'])document.getElementById(id).disabled=true;
 document.getElementById('qr-panel').hidden=true;
 document.getElementById('verified-next').hidden=true;
 try{
  const binding=JSON.parse(sessionStorage.getItem(key));
  const snapshot=sessionStorage.getItem(PLAN_KEY);
  const p=JSON.parse(snapshot||'null');
  if(!p||p.signingAuthorized!==false||p.fundingAuthorized!==false||p.broadcastAuthorized!==false)throw Error('Current approved plan required.');
  const plan=validatePublicPlan(p.releases,p.totalSats);
  const response=await fetch('/api/regtest/creator-review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(binding)});
  const r=await response.json();
  if(!response.ok)throw Error(r.error||'Review unavailable.');
  if(sessionStorage.getItem(PLAN_KEY)!==snapshot)throw Error('Plan changed during review.');
  if(r.reviewOnly!==true||r.requestDigest!==binding.requestDigest||r.planDigest!==binding.planDigest||r.walletDigest!==binding.walletDigest||['fundingAuthorized','signingAuthorized','broadcastAuthorized'].some(k=>r[k]!==false))throw Error('Review binding mismatch.');
  if(JSON.stringify(r.intent.gifts.map(g=>({date:g.date,amountSats:g.valueSats})))!==JSON.stringify(plan.releases))throw Error('Current plan differs from prepared outputs.');
  const inspect=globalThis.bc1q21ProfessionalVerifyUnsignedCreatorPsbt;
  if(typeof inspect!=='function')throw Error('Existing unsigned PSBT verifier bundle required.');
  inspect({unsigned:r.unsigned,intent:r.intent});
  document.getElementById('transaction-review-details').textContent=`Review only · ${r.unsigned.giftOutputCount} releases · ${plan.totalSats} sats principal · ${r.intent.serviceFee.valueSats} sats service · ${r.unsigned.networkFeeSats} sats mining. Request ${r.requestDigest}. No signing authorization.`;
  const rows=document.getElementById('jade-release-rows');rows.replaceChildren();
  for(const [i,g] of r.intent.gifts.entries()){
   const row=document.createElement('tr');for(const value of [String(i+1),g.date,String(g.valueSats)]){const cell=document.createElement('td');cell.textContent=value;row.appendChild(cell);}rows.appendChild(row);
  }
  document.getElementById('jade-release-schedule').hidden=false;
  document.getElementById('transaction-review').hidden=false;
  document.getElementById('status').textContent='Acknowledged transaction restored from the coordinator. Review-only handoff verified; QR display, camera signing and broadcast remain disabled.';
  document.getElementById('camera-help').textContent='Review only until separate explicit signing authorization. No hardware operation is requested.';
  installSigningSession(binding,r,snapshot);
 }catch(e){document.getElementById('transaction-review').hidden=true;document.getElementById('status').textContent='Coordinator review unavailable: '+e.message;}
}

function installSigningSession(binding,review,snapshot){
 const scan=document.getElementById('scan'),stop=document.getElementById('stop'),output=document.getElementById('verification');
 const sessionKey='bc1q21-professional-signing-session-'+binding.requestDigest;
 let active=null,controller=null,timer=null,expiryTimer=null,pendingSigned=null;
 const current=()=>active?.state==='AUTHORIZED'&&Date.now()<active.expiresAt&&sessionStorage.getItem(PLAN_KEY)===snapshot;
 const lock=message=>{
  active=null;if(timer)clearInterval(timer);if(expiryTimer)clearInterval(expiryTimer);controller?.invalidate();scan.disabled=true;stop.disabled=true;document.getElementById('qr-panel').hidden=true;output.textContent=message;
 };
 async function api(route,data){
  const response=await fetch('/api/regtest/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const result=await response.json();
  if(!response.ok)throw Error(result.error||'Signing session rejected.');
  if(result.network!=='regtest'||result.broadcastAuthorized!==false)throw Error('Invalid signing session boundary.');
  return result;
 }
 const saved=()=>JSON.parse(localStorage.getItem(sessionKey)||'null');
 const finishLink=receipt=>{
  if(receipt?.requestDigest!==binding.requestDigest||receipt.broadcast!==false||sessionStorage.getItem(PLAN_KEY)!==snapshot)throw Error('Finish binding mismatch.');
  const payload={...binding,sessionId:receipt.sessionId,transactionId:receipt.txid};
  localStorage.setItem('bc1q21-professional-finish-'+binding.requestDigest,JSON.stringify(payload));
  sessionStorage.setItem('bc1q21-professional-coordinator-finish',JSON.stringify(payload));
  document.getElementById('verified-next').hidden=false;
 };

 async function submit(result){
  if(sessionStorage.getItem(PLAN_KEY)!==snapshot){pendingSigned=null;lock('Plan changed. Captured return was not submitted.');return;}
  pendingSigned=result;
  try{
   const s=saved();if(!s)throw Error('Signing-session identity lost.');
   const result=await api('creator-signing-return',{...binding,sessionId:s.sessionId,signedPayload:pendingSigned.verifiedSignedPsbtBase64});
   if(result.receipt?.requestDigest!==binding.requestDigest||result.receipt.signatureCryptographicallyVerified!==true||result.receipt.transactionMatchesApprovedRequest!==true||result.receipt.broadcast!==false)throw Error('Invalid verified-return receipt.');
   finishLink(result.receipt);pendingSigned=null;lock('Signed return durably verified. Transaction '+result.receipt.txid+'. No broadcast or confirmation.');
   document.getElementById('status').textContent='Signed return verified and session consumed. Broadcasting remains disabled.';
  }catch(e){
   try{const s=saved(),restored=await api('creator-signing-state',{...binding,sessionId:s.sessionId});if(restored.state==='VERIFIED_RETURN'&&restored.receipt?.requestDigest===binding.requestDigest&&restored.receipt.broadcast===false){finishLink(restored.receipt);pendingSigned=null;lock('Previously verified return recovered: '+restored.receipt.txid+'. No broadcast.');return;}}catch{/* Retain captured return in memory for explicit retry. */}
   scan.disabled=false;scan.textContent='Retry signed-return submission';output.textContent='Signed return not recorded: '+e.message+' Retry submits the captured return; do not sign again.';}
 }
 async function show(session){
  if(session.requestDigest!==binding.requestDigest)throw Error('Signing-session request mismatch.');
  if(session.state==='VERIFIED_RETURN'){
   if(session.receipt?.requestDigest!==binding.requestDigest||session.receipt.broadcast!==false)throw Error('Invalid saved receipt.');
   finishLink(session.receipt);lock('Previously verified signed return restored: '+session.receipt.txid+'. Nothing broadcast.');return;
  }
  active=session;if(!current())throw Error('Signing session expired or plan changed.');
  const render=globalThis.bc1q21ProfessionalRenderCreatorUnsignedQr,attach=globalThis.bc1q21ProfessionalAttachCreatorCamera;
  if(typeof render!=='function'||typeof attach!=='function')throw Error('Existing Jade QR/camera bundle required.');
  const qr=await render(session.unsigned);if(!current()||qr.approvedPsbtSha256!==review.unsigned.psbtSha256)throw Error('QR no longer matches authorized session.');
  document.getElementById('qr-panel').hidden=false;let frame=0;const img=document.getElementById('qr');img.src=qr.images[0];
  document.getElementById('frame-count').textContent=qr.frameCount+' frames · explicitly authorized regtest signing session · expires '+new Date(session.expiresAt).toISOString();
  const advance=()=>{frame=(frame+1)%qr.images.length;img.src=qr.images[frame];};timer=setInterval(advance,500);
  document.getElementById('pause').onclick=()=>{if(timer){clearInterval(timer);timer=null;}else timer=setInterval(advance,500);};
  scan.textContent='Scan signed Jade QR';
  controller=attach({video:document.getElementById('camera'),canvas:document.getElementById('camera-canvas'),startButton:scan,stopButton:stop,statusElement:output,getApprovedUnsigned:()=>current()?session.unsigned:null,onVerified:submit});
  controller.refresh();expiryTimer=setInterval(()=>{if(!current())lock('Signing session expired or plan changed. Return to review; no broadcast.');},500);
  document.getElementById('status').textContent='Explicit regtest signing session active. Use only a disposable test wallet. Broadcasting remains disabled.';
 }
 scan.disabled=false;scan.textContent='Authorize regtest signing session';
 scan.addEventListener('click',async event=>{
  if(pendingSigned){event.stopImmediatePropagation();await submit(pendingSigned);return;}
  if(current())return;
  event.stopImmediatePropagation();scan.disabled=true;
  try{
   if(sessionStorage.getItem(PLAN_KEY)!==snapshot)throw Error('Approved plan changed.');
   if(!confirm('Authorize a 10-minute REGTEST signing session for this exact request?\n'+binding.requestDigest+'\nWallet '+binding.walletDigest+'\nPrincipal '+review.intent.gifts.reduce((n,g)=>n+g.valueSats,0)+' sats; mining '+review.unsigned.networkFeeSats+' sats. Broadcasting stays disabled.')){scan.disabled=false;return;}
   let s=saved();if(!s){s={sessionId:crypto.randomUUID()};localStorage.setItem(sessionKey,JSON.stringify(s));}
   const session=await api('creator-signing-authorize',{...binding,operationId:s.sessionId,explicitSigningApproval:binding.requestDigest});await show(session);
  }catch(e){lock('Signing session unavailable: '+e.message);}
 },{capture:true});
 const s=saved();if(s){scan.disabled=true;void api('creator-signing-state',{...binding,sessionId:s.sessionId}).then(show).catch(e=>lock('Signing session unavailable: '+e.message));}
}

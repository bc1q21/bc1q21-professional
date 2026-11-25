// Existing Jade workspace: explicit recipient review/signing sessions only.
const key='bc1q21-professional-recipient-review';
if(location.hash==='#recipient-claim-review'||location.hash.startsWith('#recipient-claim-recovery=')||location.hash.startsWith('#recipient-claim-preflight=')){
 const $=id=>document.getElementById(id);let snapshot=sessionStorage.getItem(key);
 let phase='REVIEW',session=null,binding=null,review=null,signingAccess=null,timer=null,qrTimer=null,camera=null,ready=false,busy=false,preflightBusy=false;
 const same=()=>sessionStorage.getItem(key)===snapshot;
 const current=()=>phase==='AUTHORIZED'&&session?.signingAuthorized===true&&Date.now()<session.expiresAt&&same();
 const canAuthorize=()=>phase==='REVIEW'&&ready&&review?.recipientSigningSessionsEnabled===true&&Date.now()<review.expiresAt&&same()&&!busy;
 function lock(){
  if(!$('finish-gift').disabled)$('finish-gift').disabled=true;
  if(!$('verified-next').hidden)$('verified-next').hidden=true;
  if(current())return;
  for(const id of ['scan','stop','finish-gift','pause','qr-speed']){const disabled=id==='scan'?!canAuthorize():true;if($(id).disabled!==disabled)$(id).disabled=disabled;}
  for(const id of ['qr-panel','verified-next'])if(!$(id).hidden)$(id).hidden=true;
 }
 function stopTransport(){clearInterval(qrTimer);qrTimer=null;camera?.stop();camera=null;$('qr-panel').hidden=true;}
 function reject(message){phase='LOCKED';ready=false;stopTransport();lock();$('gift-summary').textContent='Recipient signing/review unavailable — no broadcast';$('transaction-review').hidden=true;$('jade-release-schedule').hidden=true;$('status').textContent='Recipient review unavailable: '+message+'. No new signing or broadcast authorization.';}
 async function api(action,body){const response=await fetch('/api/regtest/recipient-package-signing-'+action,{method:'POST',headers:{'Content-Type':'application/json','X-Professional-Recipient-Signing-Token':signingAccess},body:JSON.stringify(body)});const value=await response.json();if(!response.ok)throw Error(value.error||'Recipient signing unavailable');return value;}
 function saved(){try{return JSON.parse(localStorage.getItem('professional-recipient-signing-v1-'+binding.claimId)||'null');}catch{return null;}}
 function validState(s){if(!s||s.sessionId!==session?.sessionId||s.broadcastAuthorized!==false)throw Error('Signing-session response mismatch');}
 function preflightText(result){
  if(!result)return;
  if(result.broadcast!==false||result.mempoolSubmitted!==false||result.confirmed!==false||result.broadcastAuthorized===true||!['ACCEPTED','REJECTED','STALE','UNAVAILABLE','AUTHORIZED','EXPIRED'].includes(result.status))throw Error('Invalid recipient preflight status boundary');
  $('camera-help').textContent='Historical recipient preflight: '+result.status+(result.reason?' — '+result.reason:'')+'. CLAIM SIGNED — NOT BROADCAST. No mempool entry, submission or confirmation is established.';
 }
 async function runPreflight(s){
  if(!location.hash.startsWith('#recipient-claim-preflight=')||preflightBusy)return;
  preflightBusy=true;
  try{
   if(!same())throw Error('Review binding changed');
   if(decodeURIComponent(location.hash.slice('#recipient-claim-preflight='.length))!==s.sessionId)throw Error('Preflight session differs from the restored claim');
   if(s.recipientPreflightEnabled!==true)throw Error('Recipient preflight disabled by operator');
   if(!confirm('Run ONE read-only recipient PREFLIGHT for exact TXID '+s.receipt.txid+'? This is separate operator authorization. No broadcast. A consumed attempt will not be repeated.'))return;
   const access=prompt('Separate recipient PREFLIGHT operator token. Never enter wallet credentials.');if(!access)throw Error('Separate preflight access required');
   const call=async(action,data)=>{const response=await fetch('/api/regtest/recipient-preflight-'+action,{method:'POST',headers:{'Content-Type':'application/json','X-Professional-Recipient-Preflight-Token':access},body:JSON.stringify(data)});const value=await response.json();if(!response.ok)throw Error(value.error||'Preflight unavailable');return value;};
   const description=await call('describe',{sessionId:s.sessionId,expectedDigest:binding.expectedDigest,recipientPin:binding.recipientPin});
   if(description.base.sessionId!==s.sessionId||description.base.transactionId!==s.receipt.txid||description.base.requestDigest!==binding.requestDigest||description.base.receiptDigest!==s.receiptDigest||description.base.expectedDigest!==binding.expectedDigest)throw Error('Preflight context differs from signed claim');
   if(description.latest&&description.latest.status!=='AUTHORIZED'){preflightText(description.latest);history.replaceState(null,'',location.pathname+'#recipient-claim-review');return;}
   const request={...description.base,authorizationId:description.latest?.authorizationId||crypto.randomUUID()};
   localStorage.setItem('professional-recipient-preflight-'+s.sessionId,JSON.stringify(request));
   if(!description.latest){const auth=await call('authorize',{...request,explicitPreflightApproval:description.approvalDigest});if(auth.authorizationId!==request.authorizationId||auth.status!=='authorized')throw Error('Preflight authorization mismatch');}
   const result=await call('run',request);preflightText(result);history.replaceState(null,'',location.pathname+'#recipient-claim-review');
  }catch(e){$('camera-help').textContent='Recipient preflight unavailable/rejected: '+e.message+'. CLAIM SIGNED — NOT BROADCAST. Inspect recorded state before any retry.';}finally{preflightBusy=false;}
 }
 function signed(s){
  validState(s);const r=s.receipt;
  if(s.state!=='VERIFIED_RETURN'||s.claimSigned!==true||s.signingAuthorized!==false||r?.sessionId!==s.sessionId||r?.claimId!==binding.claimId||r?.reviewId!==binding.reviewId||r?.intent?.packageDigest!==binding.expectedDigest||r?.intent?.requestDigest!==binding.requestDigest||r.signatureCryptographicallyVerified!==true||r.transactionMatchesApprovedRequest!==true||r.hardwareOriginAttested!==false||r.broadcast!==false||r.broadcastAuthorized!==false||typeof r.artifactRetained!=='boolean')throw Error('Unverified recipient signature receipt');
  phase='SIGNED';session=s;stopTransport();lock();
  $('gift-summary').textContent='CLAIM SIGNED — NOT BROADCAST';$('status').textContent='CLAIM SIGNED — NOT BROADCAST. Cryptographic verification receipt restored; no mempool or confirmation evidence.';
  $('verification').textContent='Session '+s.sessionId+'; TXID '+r.txid+'; signed PSBT SHA-256 '+r.signedPsbtSha256+'; '+r.feeSats+' sats mining; '+r.vsize+' vbytes. '+(s.artifactRetained&&s.artifactIntegrityVerified?'Exact signed claim retained and cryptographically reverified in private storage.':'Signed bytes not retained; keep the original capture.')+' Hardware origin is not attested by a PSBT.';
  $('camera-help').textContent='Signing session consumed. No broadcast, confirmation or Bitcoin transfer is established.';preflightText(s.preflight);
 }
 async function submit(payload){
  if(!current())throw Error('Signing session expired or changed');
  phase='VERIFYING';stopTransport();lock();
  try{const s=await api('return',{...session.binding,signedPayload:payload});if(!same())throw Error('Review binding changed');signed(s);}
  catch(error){
   // An ambiguous return is reconciled before any retry, never blindly resent.
   try{const s=await api('state',session.binding);if(same()&&s.state==='VERIFIED_RETURN'){signed(s);return;}}catch{}
   reject(error.message+' Keep the original signed capture; restore session state before any deliberate retry');
  }
 }
 async function showAuthorized(s){
  validState(s);if(s.state!=='AUTHORIZED'||s.signingAuthorized!==true||Date.now()>=s.expiresAt)throw Error('Signing session expired or consumed');
  session={...s,binding:session.binding};phase='PREPARING';lock();
  const renderer=globalThis.bc1q21ProfessionalPrepareGiftUnsignedQr;
  if(typeof renderer!=='function')throw Error('Existing unsigned Jade QR component required');
  const frames=await renderer({gift:review.gift,release:review.release,approvedUnsignedBase64:review.unsignedPsbtBase64,expectedApprovedSha256:review.intent.unsignedPsbtSha256});
  if(!same()||Date.now()>=s.expiresAt)throw Error('Signing session changed or expired while preparing QR');
  let n=0,paused=false,delay=280;
  const advance=()=>{if(!current()){stopTransport();lock();return;}if(!paused){$('qr').src=frames.images[n];$('frame-count').textContent='Authorized unsigned claim QR '+(n+1)+' / '+frames.images.length;n=(n+1)%frames.images.length;}};
  phase='AUTHORIZED';$('qr-panel').hidden=false;$('scan').disabled=false;$('stop').disabled=true;$('pause').disabled=false;$('qr-speed').disabled=false;$('scan').textContent='Scan signed Jade QR';
  advance();qrTimer=setInterval(advance,delay);
  $('pause').onclick=()=>{if(current()){paused=!paused;$('pause').textContent=paused?'Resume QR':'Pause QR';}};
  $('qr-speed').onclick=()=>{if(current()){delay=delay===280?650:280;clearInterval(qrTimer);qrTimer=setInterval(advance,delay);$('qr-speed-status').textContent=delay+' ms per frame';}};
  const attach=globalThis.bc1q21ProfessionalAttachClaimCameraTransport;
  if(typeof attach!=='function')throw Error('Existing Jade camera receiver required');
  camera=attach({video:$('camera'),canvas:$('camera-canvas'),onStatus:message=>{if(current())$('verification').textContent=message;},onSignedPsbt:submit});
  $('status').textContent='SIGNING AUTHORIZED. Exact regtest recipient claim; expires '+new Date(s.expiresAt).toISOString()+'. Air-gapped QR only. Broadcasting disabled.';
 }
 $('schedule-panel').hidden=true;$('transaction-review').hidden=true;$('jade-release-schedule').hidden=true;$('gift-summary').textContent='Checking the exact prepared recipient claim…';
 lock();new MutationObserver(lock).observe(document.body,{subtree:true,attributes:true,attributeFilter:['disabled','hidden']});
 window.addEventListener('pagehide',stopTransport);
 window.addEventListener('hashchange',()=>{if(phase==='SIGNED'&&session?.state==='VERIFIED_RETURN')void runPreflight(session);});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&['AUTHORIZED','PREPARING'].includes(phase))reject('Page hidden; restore the existing session with fresh checks before resuming');});
 try{
  let recovered=null;
  if(location.hash.startsWith('#recipient-claim-recovery=')){
   const sessionId=decodeURIComponent(location.hash.slice('#recipient-claim-recovery='.length));
   const expectedDigest=prompt('Independent expected recipient package SHA-256 digest. Obtain it from your verified records, not from an untrusted capture.');
   const pin=prompt('Independent recipient public pin JSON (recipientId, recipientKeysDigest, destinationScriptHex). No wallet secrets.');
   const recoveryAccess=prompt('Separate recipient ARTIFACT RECOVERY operator token. Never enter wallet credentials.');
   if(!expectedDigest||!pin||!recoveryAccess)throw Error('Independent package/recipient pin and recovery access required');
   const response=await fetch('/api/regtest/recipient-artifact-recover',{method:'POST',headers:{'Content-Type':'application/json','X-Professional-Recovery-Token':recoveryAccess},body:JSON.stringify({sessionId,expectedDigest:expectedDigest.trim().toLowerCase(),recipientPin:JSON.parse(pin)})});
   recovered=await response.json();if(!response.ok)throw Error(recovered.error||'Private recipient artifact recovery unavailable');
   if(recovered.status!=='CLAIM SIGNED — NOT BROADCAST'||recovered.artifactVerified!==true||recovered.signingBinding?.sessionId!==sessionId||recovered.packagePins?.expectedDigest!==expectedDigest.trim().toLowerCase()||recovered.signingAuthorized!==false||recovered.broadcastAuthorized!==false)throw Error('Recovered claim identity/integrity mismatch');
   snapshot=JSON.stringify(recovered.reviewBinding);sessionStorage.setItem(key,snapshot);
   localStorage.setItem('professional-recipient-import-v1',JSON.stringify(recovered.packagePins));localStorage.setItem('professional-recipient-import-v1-claim',JSON.stringify(recovered.claimLocator));
   localStorage.setItem('professional-recipient-signing-v1-'+recovered.claimLocator.claimId,JSON.stringify(recovered.signingBinding));
  }
  if(!snapshot)throw Error('Existing consumed review identity required; return to recipient page');
  binding=JSON.parse(snapshot);const previous=saved();let restored=null,r;
  if(location.hash.startsWith('#recipient-claim-preflight=')&&previous?.sessionId!==decodeURIComponent(location.hash.slice('#recipient-claim-preflight='.length)))throw Error('Restore the exact signed recipient session first; preflight cannot infer its identity');
  if(recovered){session={sessionId:recovered.signingBinding.sessionId,binding:recovered.signingBinding};restored=recovered.signedState;r=restored.review;}
  else if(previous){
   signingAccess=prompt('Separate recipient SIGNING access token to restore the existing session or receipt. Never enter wallet credentials.');if(!signingAccess)throw Error('Signing access required');
   session={sessionId:previous.sessionId,binding:previous};restored=await api('state',previous);r=restored.review;
  }else{
   const access=prompt('Separate operator claim-preparation access token to restore recipient REVIEW ONLY. Never enter wallet credentials.');if(!access)throw Error('Operator review access required');
   const response=await fetch('/api/regtest/recipient-package-review-restore',{method:'POST',headers:{'Content-Type':'application/json','X-Professional-Recipient-Claim-Token':access},body:JSON.stringify(binding)});r=await response.json();if(!response.ok)throw Error(r.error||'Review unavailable');
  }
  const completed=restored?.state==='VERIFIED_RETURN';
  if(!same()||r.reviewOnly!==true||r.reviewId!==binding.reviewId||r.acknowledgementDigest!==binding.acknowledgementDigest||r.intent?.requestDigest!==binding.requestDigest||r.intent?.claimId!==binding.claimId||r.intent?.packageDigest!==binding.expectedDigest||r.broadcastAuthorized!==false||r.signingAuthorized!==false||r.claimSigned!==completed||(!completed&&(!Number.isSafeInteger(r.expiresAt)||Date.now()>=r.expiresAt)))throw Error('Expired or mismatched review');
  const verify=globalThis.bc1q21ProfessionalVerifyGiftReleaseBinding;if(typeof verify!=='function')throw Error('Existing unsigned gift PSBT verifier required');
  verify({gift:r.gift,release:r.release,approvedUnsignedBase64:r.unsignedPsbtBase64,expectedApprovedSha256:r.intent.unsignedPsbtSha256});
  const i=r.intent;if(i.releaseNumbers.length!==1||i.releaseNumbers[0]!==r.release.releaseNumber||i.inputs.length!==1||i.inputs[0].txid!==r.release.fundingTxid||i.inputs[0].vout!==r.release.fundingVout||i.inputs[0].valueSats!==r.release.inputSats||i.outputs.length!==1||i.outputs[0].valueSats!==r.release.amountSats||i.outputs[0].scriptPubKeyHex!==r.release.destinationScriptHex||i.inputs[0].valueSats!==i.outputs[0].valueSats+i.miningFeeSats||i.locktime!==r.release.lockHeight)throw Error('Claim review accounting/binding mismatch');
  review=r;
  const btc=sats=>{const n=BigInt(sats);return `${n/100000000n}.${String(n%100000000n).padStart(8,'0')}`;};
  $('gift-summary').textContent='Recipient claim · release '+i.releaseNumbers.join(', ')+' · REVIEW AUTHORIZED — NOT SIGNED';
  $('schedule-panel').hidden=true;
  $('transaction-review-details').textContent='REVIEW ONLY. Input '+i.inputs[0].valueSats+' sats ('+btc(i.inputs[0].valueSats)+' BTC); recipient '+i.outputs[0].valueSats+' sats ('+btc(i.outputs[0].valueSats)+' BTC); mining fee '+i.miningFeeSats+' sats. Destination '+i.outputs[0].address+'; script '+i.outputs[0].scriptPubKeyHex+'. Locktime '+i.locktime+'; sequence '+i.inputs[0].sequence+'. Input '+i.inputs[0].txid+':'+i.inputs[0].vout+'. Signer '+i.signer.publicKeyHex+'; fingerprint '+i.signer.masterFingerprintHex+'; path '+i.signer.path+'. PSBT '+i.unsignedPsbtSha256+'; request '+i.requestDigest+'. Expires '+new Date(r.expiresAt).toISOString()+'.';
  const rows=$('jade-release-rows');rows.replaceChildren();
  const row=document.createElement('tr');
  for(const value of [i.releaseNumbers[0],i.locktime>=500000000?new Date(i.locktime*1000).toISOString():'Block '+i.locktime,i.inputs[0].valueSats]){const cell=document.createElement('td');cell.textContent=String(value);row.append(cell);}rows.append(row);
  $('jade-release-schedule').hidden=false;$('transaction-review').hidden=false;

  $('status').textContent='REVIEW AUTHORIZED. CLAIM NOT SIGNED. Separate explicit signing authorization required.';
  $('camera-help').textContent='Review only until separate signing authorization. No device operation is requested by this preview.';
  $('verification').textContent='No signed recipient claim verified.';$('jade-back').href='./recipient-gift-specific-prototype.html';$('jade-back').setAttribute('aria-label','Back to recipient gift');
  ready=true;
  if(completed){signed(restored);await runPreflight(restored);}
  else if(restored)await showAuthorized(restored);
  else{lock();if(canAuthorize())$('scan').textContent='Authorize recipient signing session';}
  $('scan').addEventListener('click',async()=>{
   if(current()){
    try{$('scan').disabled=true;$('stop').disabled=false;await camera.start();}catch(e){if(current()){$('verification').textContent='Camera unavailable: '+e.message;$('scan').disabled=false;$('stop').disabled=true;}}
    return;
   }
   if(!canAuthorize())return;
   busy=true;lock();
   try{
    if(!confirm('Separately authorize a REGTEST recipient signing session for this EXACT reviewed claim?\n'+binding.acknowledgementDigest+'\nRecipient '+review.intent.outputs[0].address+'; payout '+review.intent.outputs[0].valueSats+' sats; mining '+review.intent.miningFeeSats+' sats. No broadcast.'))return;
    signingAccess=prompt('Separate recipient SIGNING access token. Never enter wallet credentials.');if(!signingAccess)throw Error('Separate signing token required');
    const id={...binding,sessionId:crypto.randomUUID()};
    // Persist only the locator before authorization. Uncertain responses must
    // restore this session, never automatically authorize another identity.
    localStorage.setItem('professional-recipient-signing-v1-'+binding.claimId,JSON.stringify(id));session={sessionId:id.sessionId,binding:id};
    const s=await api('authorize',{...id,explicitSigningApproval:binding.acknowledgementDigest});await showAuthorized(s);
   }catch(e){reject(e.message+' Restore the original signing-session identity before retrying');}finally{busy=false;lock();}
  });
  $('stop').addEventListener('click',()=>{camera?.stop();if(current()){$('scan').disabled=false;$('stop').disabled=true;}});
  timer=setInterval(()=>{if(!same()){reject('Review binding changed');return;}if(phase==='SIGNED')return;if(Date.now()>=(session?.expiresAt||review.expiresAt))reject('Review/signing expired or binding changed; no automatic renewal');},250);
 }catch(e){reject(e.message);}
}

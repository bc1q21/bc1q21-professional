// Coordinator-backed recipient import. Offline package evidence never enables claims.
const $=id=>document.getElementById(id), key='professional-recipient-import-v1';
let active=null,generation=0,observation=null,expiryTimer=null,activePins=null,selectionGeneration=0;
const locked=['sign','startCamera','redemptionReceiptFile','showUnsignedQr','giftCameraStart','saveVerifiedJadePsbt','publicGiftFile','giftPsbtFile','coreUtxoFile','draftGiftFile','dateGiftPreviewFile'];
function lock(){if(active)for(const id of locked)if($(id)&&!$(id).disabled)$(id).disabled=true;}
function clear(){
 generation++;selectionGeneration++;active=null;activePins=null;observation=null;clearTimeout(expiryTimer);try{localStorage.removeItem(key);}catch{}
 for(const id of ['hideUnsignedQr','giftCameraStop','stopCamera'])if($(id)&&!$(id).disabled)$(id).click();
 $('giftScheduleRows').replaceChildren();$('giftTotal').textContent='No verified package loaded';
 $('selectedRelease').replaceChildren(new Option('No imported release selected',''));
 $('giftTotalContext').textContent='Funding NOT VERIFIED; CLAIM UNAVAILABLE.';
 $('selectedReleaseEvidence').textContent='No current prepared claim selected.';
 $('scheduleProvenance').textContent='Package changed; independent verification required.';
 for(const id of locked)if($(id)&&!$(id).disabled)$(id).disabled=true;
}
async function post(route,data){
 const response=await fetch('/api/regtest/recipient-package-'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
 const result=await response.json();if(!response.ok)throw Error(result.error||'Import unavailable');return result;
}
function render(result,pins){
 if(result.status!=='PACKAGE IMPORTED'||result.fundingVerified!==false||result.claimAvailable!==false||result.signingAuthorized!==false||result.broadcastAuthorized!==false)throw Error('Unsupported recipient import state');
 active=result;activePins=pins;try{localStorage.setItem(key,JSON.stringify(pins));}catch{}
 const manifest=result.package.body.manifest;
 $('giftTotal').textContent=manifest.plan.totalSats.toLocaleString('en-US')+' sats';
 $('giftTotalContext').textContent='PACKAGE IMPORTED — FUNDING NOT VERIFIED — CLAIM UNAVAILABLE';
 $('giftId').textContent=result.transactionId;
 $('linkStatus').textContent='Independently pinned recipient: '+result.recipientId;
 $('giftScheduleRows').replaceChildren();$('selectedRelease').replaceChildren(new Option('Select imported release',''));
 manifest.releases.forEach((r,i)=>{
  const row=document.createElement('tr');
  for(const value of [i+1,r.locktime>=500000000?new Date(r.locktime*1000).toISOString():`Block ${r.locktime}`,r.valueSats+' sats','Funding not verified; claim unavailable']){
   const cell=document.createElement('td');cell.textContent=String(value);row.append(cell);
  }
  $('giftScheduleRows').append(row);$('selectedRelease').append(new Option('Release '+(i+1),String(i+1)));
 });
 $('scheduleProvenance').textContent='Integrity-checked public recovery manifest. Packaged confirmation is historical evidence only; no current blockchain check has occurred.';
 $('completeHandoffStatus').textContent='PACKAGE IMPORTED'+(result.duplicate?' (already imported)':'')+'. Independent digest and recipient pin match. FUNDING NOT VERIFIED. CLAIM UNAVAILABLE.';
 $('giftRecordStatus').textContent='Public package imported; no claim authorization.';
 $('message').textContent='Claiming and signing remain disabled pending separate integration and authorization.';lock();
 void verifyFunding(pins,generation);
}
function invalidateObservation(message){
 observation=null;clearTimeout(expiryTimer);
 $('giftTotalContext').textContent='PACKAGE IMPORTED — '+message+' — CLAIM UNAVAILABLE';
 $('completeHandoffStatus').textContent='PACKAGE IMPORTED. '+message+'. CLAIM UNAVAILABLE.';
 $('utxoEvidenceStatus').textContent=message+'. Fresh verification required; signing disabled.';
 for(const row of $('giftScheduleRows').rows)row.cells[3].textContent=message+'; claim unavailable';
 $('selectedReleaseStatus').textContent=message+'; claiming and signing disabled.';
 $('scheduleProvenance').textContent='Authenticated package schedule; no current funding/maturity authority. Historical observations require re-verification.';
}
async function verifyFunding(pins,token){
 invalidateObservation('FUNDING VERIFICATION PENDING');
 try{
  const result=await post('verify',pins);if(token!==generation||!active)return;
  if(result.packageDigest!==pins.expectedDigest||result.transactionId!==active.transactionId||result.recipientId!==pins.recipientPin.recipientId||result.claimAvailable!==false||result.signingAuthorized!==false||result.broadcastAuthorized!==false)throw Error('Funding observation binding mismatch');
  if(!result.fresh||!result.fundingVerified){invalidateObservation('FUNDING '+result.status);return;}
  observation=result;
  $('completeHandoffStatus').textContent='PACKAGE IMPORTED. Independent digest and recipient pin match. FUNDING VERIFIED AT OBSERVATION. CLAIM UNAVAILABLE.';
  $('giftTotalContext').textContent='PACKAGE IMPORTED — FUNDING VERIFIED AT OBSERVATION — CLAIM UNAVAILABLE';
  $('utxoEvidenceStatus').textContent=result.confirmations+' confirmations; height '+result.height+'; MTP '+result.medianTimePast+'. '+(result.allRecipientOutputsUnspent?'All recipient outputs unspent.':'Some recipient outputs spent or unavailable.')+' Signing remains disabled.';
  for(const r of result.releases){const row=$('giftScheduleRows').rows[r.releaseNumber-1];if(row)row.cells[3].textContent=r.status;}
  $('scheduleProvenance').textContent='Fresh read-only Core observation '+result.observationId+' at tip '+result.tip+'. This observation is not signing/submission authority.';
  expiryTimer=setTimeout(()=>{if(token===generation&&active)invalidateObservation('OBSERVATION STALE');},Math.max(0,result.validUntil-Date.now()));
 }catch(error){if(token===generation&&active)invalidateObservation('FUNDING UNAVAILABLE');}
}
$('verifyCompleteHandoff').addEventListener('click',async event=>{
 // Capture phase prevents the legacy unsigned-handoff importer from accepting a delivery export.
 event.stopImmediatePropagation();event.preventDefault();
 clear();const token=generation;
 try{
  const expectedDigest=$('completeHandoffDigest').value.trim().toLowerCase();
  if(!/^[a-f0-9]{64}$/.test(expectedDigest))throw Error('Enter the digest received through a separate authenticated channel.');
  const text=prompt('Paste the independently supplied public recipient pin JSON (recipientId, recipientKeysDigest, destinationScriptHex). Obtain it separately from this package. Never enter recovery words or private keys.');
  if(!text)throw Error('Independent recipient pin required');
  const pins={expectedDigest,recipientPin:JSON.parse(text)},file=$('completeHandoffFile').files?.[0];
  if(file&&(!file.size||file.size>700000))throw Error('Choose a nonempty export smaller than 700 KB');
  const result=await post(file?'import':'recover',file?{...pins,package:JSON.parse(await file.text())}:pins);
  if(token===generation)render(result,pins);
 }catch(error){if(token===generation)$('completeHandoffStatus').textContent='Rejected import: '+error.message;}
},true);
for(const id of ['completeHandoffFile','completeHandoffDigest'])$(id).addEventListener(id.endsWith('File')?'change':'input',clear);
$('selectedRelease').addEventListener('change',async event=>{
 if(!active)return;event.stopImmediatePropagation();
 $('selectedReleaseEvidence').textContent='No current prepared claim selected.';
 const releaseNumber=Number($('selectedRelease').value),r=observation?.releases.find(r=>r.releaseNumber===releaseNumber),token=generation,selection=++selectionGeneration;
 $('selectedReleaseStatus').textContent=(r?.mature?'RELEASE MATURE — '+r.status:r?r.status:'Current funding/maturity not verified')+'. Claiming and signing disabled.';lock();
 if(!activePins||!releaseNumber)return;
 try{
  let saved=null;try{saved=JSON.parse(localStorage.getItem(key+'-claim')||'null');}catch{}
  const recovering=saved?.packageDigest===active.packageDigest&&saved?.releaseNumber===releaseNumber;
  if(!recovering&&!r?.claimPreparationEligible)return;
  if(!confirm(recovering?'Recover the existing unsigned CLAIM PREPARED record? Fresh eligibility is NOT established by recovery. No signing or broadcast.':
   'RELEASE MATURE at last observation. Prepare unsigned claim for release '+releaseNumber+'? Input '+r.valueSats+' sats; recipient '+r.payoutSats+' sats; mining '+r.miningFeeSats+' sats; destination script '+activePins.recipientPin.destinationScriptHex+'. Fresh verification is required. No signing or broadcast.'))return;
  const access=prompt('Separate operator claim-preparation access token. Never enter wallet credentials.');
  if(!access)throw Error('Operator preparation token required');
  let body,route;
  if(recovering){route='claim-recover';body={...activePins,claimId:saved.claimId};}
  else{
   const text=prompt('Paste the existing PUBLIC wallet registration with its possession proofs (JSON). No seed words or private keys.');
   if(!text)throw Error('Verified public signer registration required');
   const registration=JSON.parse(text),signer=registration.wallet?.recipient?.[releaseNumber-1];
   route='claim-prepare';body={...activePins,operationId:crypto.randomUUID(),releaseNumber,signer,registration,explicitPreparationApproval:true};
  }
  const response=await fetch('/api/regtest/recipient-package-'+route,{method:'POST',headers:{'Content-Type':'application/json','X-Professional-Recipient-Claim-Token':access},body:JSON.stringify(body)});
  const result=await response.json();if(!response.ok)throw Error(result.error||'Claim preparation rejected');
  if(token!==generation||selection!==selectionGeneration)return;
  if(result.status!=='CLAIM PREPARED'||result.packageDigest!==active.packageDigest||result.creatorTxid!==active.transactionId||result.releaseNumber!==releaseNumber||result.claimSigned!==false||result.claimAvailable!==false||result.signingAuthorized!==false||result.broadcastAuthorized!==false)throw Error('Unsigned claim binding/status mismatch');
  try{localStorage.setItem(key+'-claim',JSON.stringify({claimId:result.claimId,packageDigest:result.packageDigest,releaseNumber}));}catch{}
  $('selectedReleaseStatus').textContent='CLAIM PREPARED — NOT SIGNED. '+(recovering?'Recovered historical preparation; fresh eligibility must be rechecked.':'Unsigned preparation only.');
  $('selectedReleaseEvidence').textContent='Claim '+result.claimId+'; request '+result.requestDigest+'; PSBT '+result.unsignedPsbtSha256+'; input '+result.principalSats+' sats; payout '+result.payoutSats+' sats; mining '+result.miningFeeSats+' sats; locktime '+result.locktime+'; destination script '+result.destinationScriptHex;
  $('message').textContent='CLAIM PREPARED. Signing, QR handoff and broadcasting remain disabled.';lock();
  let signingLocator=null;try{signingLocator=JSON.parse(localStorage.getItem('professional-recipient-signing-v1-'+result.claimId)||'null');}catch{}
  if(signingLocator){
   const signingAccess=prompt('Separate recipient SIGNING access token to inspect the existing signing session. Never enter wallet credentials.');
   if(!signingAccess)throw Error('Signing-session access required');
   const response=await fetch('/api/regtest/recipient-package-signing-state',{method:'POST',headers:{'Content-Type':'application/json','X-Professional-Recipient-Signing-Token':signingAccess},body:JSON.stringify(signingLocator)});
   const state=await response.json();if(!response.ok)throw Error(state.error||'Signing state unavailable');
   if(token!==generation||selection!==selectionGeneration)return;
   if(state.sessionId!==signingLocator.sessionId||state.broadcastAuthorized!==false||state.review?.intent?.claimId!==result.claimId||state.review?.intent?.requestDigest!==result.requestDigest||state.review?.intent?.packageDigest!==active.packageDigest)throw Error('Signing state differs from selected claim');
   if(state.state==='VERIFIED_RETURN'&&state.claimSigned===true&&state.signingAuthorized===false&&state.receipt?.signatureCryptographicallyVerified===true){
    $('selectedReleaseStatus').textContent='CLAIM SIGNED — NOT BROADCAST';$('selectedReleaseEvidence').textContent='Session '+state.sessionId+'; verified TXID '+state.receipt.txid+'; signed PSBT SHA-256 '+state.receipt.signedPsbtSha256+'; receipt '+state.receiptDigest+'. No mempool or confirmation evidence.';$('message').textContent='Historical signature receipt only. '+(state.artifactRetained&&state.artifactIntegrityVerified?'Exact signed claim retained and reverified privately.':'Signed bytes are not retained; keep the original capture.')+' Broadcasting remains disabled.'+(state.preflight?' Historical read-only preflight: '+state.preflight.status+'. Not mempool entry or confirmation.':'');return;
   }
   if(state.state!=='AUTHORIZED'||state.signingAuthorized!==true)throw Error('Signing session expired or unavailable');
   $('selectedReleaseStatus').textContent='SIGNING AUTHORIZED — NOT SIGNED. Existing session only; no renewal.';
   if(confirm('Return to the existing recipient signing session without renewal? Broadcasting remains disabled.')){
    const {sessionId,...reviewBinding}=signingLocator;sessionStorage.setItem('bc1q21-professional-recipient-review',JSON.stringify(reviewBinding));location.assign('./jade-signing-workspace.html#recipient-claim-review');
   }
   return;
  }
  const identity={...activePins,claimId:result.claimId,requestDigest:result.requestDigest};
  const apiReview=async(action,data)=>{const response=await fetch('/api/regtest/recipient-package-review-'+action,{method:'POST',headers:{'Content-Type':'application/json','X-Professional-Recipient-Claim-Token':access},body:JSON.stringify(data)});const value=await response.json();if(!response.ok)throw Error(value.error||'Review rejected');return value;};
  let prior=null;try{prior=JSON.parse(sessionStorage.getItem('bc1q21-professional-recipient-review')||'null');}catch{}
  if(prior?.claimId===identity.claimId&&prior?.requestDigest===identity.requestDigest&&prior?.expectedDigest===identity.expectedDigest){
   if(!confirm('Restore the existing REVIEW ONLY authorization without renewal? No signing or broadcast.'))return;
   await apiReview('restore',prior);
   if(token===generation&&selection===selectionGeneration)location.assign('./jade-signing-workspace.html#recipient-claim-review');
   return;
  }
  const review=await apiReview('intent',identity);
  if(token!==generation||selection!==selectionGeneration)return;
  const i=review.intent;
  if(i.claimId!==result.claimId||i.requestDigest!==result.requestDigest||i.unsignedPsbtSha256!==result.unsignedPsbtSha256)throw Error('Review intent differs from prepared claim');
  if(!confirm('Acknowledge exact claim and open REVIEW ONLY?\nRelease '+i.releaseNumbers.join(', ')+'; input '+i.inputs[0].valueSats+' sats; payout '+i.outputs[0].valueSats+' sats; mining '+i.miningFeeSats+' sats; destination '+i.outputs[0].address+'; locktime '+i.locktime+'; PSBT '+i.unsignedPsbtSha256+'. No QR signing or broadcast.')){$('message').textContent='CLAIM PREPARED. Review not acknowledged; signing and broadcast disabled.';return;}
  const binding={...identity,reviewId:crypto.randomUUID(),acknowledgementDigest:review.acknowledgementDigest};
  await apiReview('acknowledge',{...binding,acknowledgedIntent:i});
  if(token!==generation||selection!==selectionGeneration)return;
  // Save identity before consuming the one-use handoff. An uncertain response
  // must be restored, never blindly acknowledged or handed off a second time.
  sessionStorage.setItem('bc1q21-professional-recipient-review',JSON.stringify(binding));
  await apiReview('handoff',binding);
  if(token!==generation||selection!==selectionGeneration)return;
  location.assign('./jade-signing-workspace.html#recipient-claim-review');
 }catch(error){if(token===generation&&selection===selectionGeneration){$('selectedReleaseStatus').textContent='Claim preparation rejected: '+error.message+'. NOT SIGNED; no broadcast.';lock();}}
},true);
// Preserve the existing diagnostic page, but never let an accepted package unlock its signing controls.
document.addEventListener('click',event=>{if(active&&locked.includes(event.target.id)){event.preventDefault();event.stopImmediatePropagation();}},true);
document.addEventListener('visibilitychange',()=>{if(active&&document.hidden)invalidateObservation('OBSERVATION STALE');});
new MutationObserver(lock).observe(document.body,{subtree:true,attributes:true,attributeFilter:['disabled']});
(async()=>{
 try{const saved=localStorage.getItem(key);if(!saved)return;const pins=JSON.parse(saved);const token=++generation;const result=await post('recover',pins);if(token===generation){$('completeHandoffDigest').value=pins.expectedDigest;render(result,pins);}}
 catch(error){clear();$('completeHandoffStatus').textContent='Recovery rejected: '+error.message;}
})();

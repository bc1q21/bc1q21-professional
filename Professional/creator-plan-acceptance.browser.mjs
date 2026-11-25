import {PLAN_KEY,validatePublicPlan} from './public-date-planner.mjs';
const status=document.getElementById('coordinator-plan-status');
const readPlan=()=>{
 const original=JSON.parse(sessionStorage.getItem(PLAN_KEY)||'null');
 if(!original||original.status!=='UNFUNDED_PREVIEW_NOT_SIGNABLE'||['fundingAuthorized','signingAuthorized','broadcastAuthorized'].some(k=>original[k]!==false))throw Error('Review and approve a gift plan first.');
 return validatePublicPlan(original.releases,original.totalSats);
};
const fingerprint=async(value)=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value))))].map(x=>x.toString(16).padStart(2,'0')).join('');
function retryId(key){let id=localStorage.getItem(key);if(!id){id=crypto.randomUUID();localStorage.setItem(key,id);}return id;}
async function context(){
 const plan=readPlan(),snapshot=JSON.stringify(plan),hash=await fingerprint(plan);
 return {plan,snapshot,key:'bc1q21-regtest-plan-request-'+hash};
}
function unchanged(c){if(JSON.stringify(readPlan())!==c.snapshot)throw Error('Plan changed during saving. The saved snapshot does not approve your edited plan.');}
async function post(path,body){
 const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 let result;try{result=await response.json();}catch{throw Error('Local coordinator unavailable. Use the creator-plan service, not a static server.');}
 if(!response.ok)throw Error(result.error||'Plan request rejected.');
 if(!['accepted','already-processed'].includes(result.status)||result.requestId!==body.requestId||result.network!=='regtest'||['fundingAuthorized','signingAuthorized','broadcastAuthorized'].some(k=>result[k]!==false))throw Error('Invalid coordinator response.');
 return result;
}
function action(id,fn){const button=document.getElementById(id);button?.addEventListener('click',async event=>{
 if(['construct-unsigned','handoff-jade'].includes(id)){if(document.getElementById('construct-unsigned').dataset.coordinatorBound!=='true')return;event.stopImmediatePropagation();}
 button.disabled=true;
 try{const c=await context();unchanged(c);await fn(c);}
 catch(e){if(document.getElementById('construct-unsigned')?.dataset.coordinatorBound==='true'){document.getElementById('unsigned-review').hidden=true;document.getElementById('unsigned-status').textContent='Preparation unavailable for the current plan: '+e.message;}status.textContent='Not accepted for the current plan: '+e.message+' Retry uses the same saved request ID; do not treat this as funding approval.';}
 finally{button.disabled=false;}
},{capture:['construct-unsigned','handoff-jade'].includes(id)});}
action('save-coordinator-plan',async c=>{
 const id=retryId(c.key);status.textContent='Saving approved plan to the local coordinator…';
 const result=await post('/api/regtest/creator-plans',{network:'regtest',requestId:id,plan:c.plan});unchanged(c);
 localStorage.setItem(c.key+'-receipt',JSON.stringify(result));
 status.textContent=(result.status==='accepted'?'Accepted and durably saved. ':'Already processed; no duplicate record created. ')+`Request ${id}. Plan ${result.planDigest}. Funding, signing and broadcasting remain disabled.`;
});
function saved(c){const r=JSON.parse(localStorage.getItem(c.key+'-receipt')||'null');if(!r||r.requestId!==localStorage.getItem(c.key))throw Error('Save this approved plan with the coordinator first.');return r;}
action('register-coordinator-wallet',async c=>{
 const receipt=saved(c),file=document.getElementById('coordinator-registration').files[0];
 if(!file||file.size>262144)throw Error('Choose a bounded public wallet registration JSON file, not a seed or wallet backup.');
 const registration=JSON.parse(await file.text());unchanged(c);
 const operationId=retryId(c.key+'-registration-'+await fingerprint(registration));
 const result=await post('/api/regtest/creator-registration',{network:'regtest',requestId:receipt.requestId,planDigest:receipt.planDigest,operationId,registration});unchanged(c);
 if(result.identityVerified!==true||result.planDigest!==receipt.planDigest)throw Error('Invalid registration receipt.');
 localStorage.setItem(c.key+'-wallet',JSON.stringify(result));
 status.textContent=`Wallet identity verified and bound to this saved plan (${result.status}). Wallet digest ${result.walletDigest}. No funding, signing or broadcast authorization.`;
});
action('inspect-coordinator-funding',async c=>{
 const receipt=saved(c),wallet=JSON.parse(localStorage.getItem(c.key+'-wallet')||'null');if(!wallet||wallet.planDigest!==receipt.planDigest)throw Error('Verify the public wallet for this exact plan first.');
 const outpoints=document.getElementById('coordinator-outpoints').value.trim().split(/\r?\n/).map(line=>{
  const m=line.trim().match(/^([a-f0-9]{64}):([0-9]+)$/);if(!m)throw Error('Use one TXID:output-index per line.');return {txid:m[1],vout:Number(m[2])};
 });
 // A completed receipt is historical. Explicit Refresh creates a new read-only
 // operation; transport failures/reloads retain the pending ID for safe retry.
 const key=c.key+'-inspection-'+await fingerprint({walletDigest:wallet.walletDigest,outpoints});
 const operationId=retryId(key);
 const result=await post('/api/regtest/creator-funding',{network:'regtest',requestId:receipt.requestId,planDigest:receipt.planDigest,operationId,walletDigest:wallet.walletDigest,outpoints});unchanged(c);
 if(result.planDigest!==receipt.planDigest||result.walletDigest!==wallet.walletDigest||result.inspectionOnly!==true)throw Error('Invalid funding receipt.');
 status.textContent=`Read-only inspection recorded at height ${result.chainTip.blocks}: ${result.totalFundingSats} sats. Snapshot at ${result.recordedAt}; not a live balance or funding authorization. Select again to refresh. No signing or broadcasting.`;
 localStorage.setItem(c.key+'-funding',JSON.stringify({...result,selectedOutpoints:outpoints}));
 enablePreparation();
 localStorage.removeItem(key);
});

async function enablePreparation(){
 try{
  const c=await context(),r=saved(c),wallet=JSON.parse(localStorage.getItem(c.key+'-wallet')||'null'),funding=JSON.parse(localStorage.getItem(c.key+'-funding')||'null');unchanged(c);
  if(!wallet||!funding||wallet.planDigest!==r.planDigest||funding.planDigest!==r.planDigest||funding.walletDigest!==wallet.walletDigest)return;
  const b=document.getElementById('construct-unsigned');b.dataset.coordinatorBound='true';b.disabled=false;b.textContent='Construct unsigned transaction';
  document.getElementById('network-fee').disabled=true;
  document.getElementById('unsigned-status').textContent='Saved plan and registered wallet ready for fresh funding revalidation and unsigned preparation. Existing Retail fallback fee rules apply; no signing approval.';
 }catch{/* No saved binding: retain original diagnostic guards. */}
}
action('construct-unsigned',async c=>{
 const receipt=saved(c),wallet=JSON.parse(localStorage.getItem(c.key+'-wallet')||'null'),funding=JSON.parse(localStorage.getItem(c.key+'-funding')||'null');
 document.getElementById('unsigned-review').hidden=true;
 document.getElementById('review-acknowledged').checked=false;
 for(const id of ['diagnostic-qr','diagnostic-scan','handoff-jade'])document.getElementById(id).disabled=true;
 if(!wallet||!funding||funding.planDigest!==receipt.planDigest||funding.walletDigest!==wallet.walletDigest)throw Error('Inspect funding for this saved plan and registered wallet first.');
 const key=c.key+'-prepare-'+funding.operationId,operationId=retryId(key);
 const result=await post('/api/regtest/creator-prepare',{network:'regtest',requestId:receipt.requestId,planDigest:receipt.planDigest,walletDigest:wallet.walletDigest,fundingOperationId:funding.operationId,operationId});unchanged(c);
 if(result.planDigest!==receipt.planDigest||result.walletDigest!==wallet.walletDigest||!['PREPARED_NOT_AUTHORIZED','ACKNOWLEDGED_REVIEW_ONLY','REVIEW_HANDOFF_CONSUMED'].includes(result.approvalState)||result.freshFundingChecked!==true)throw Error('Invalid unsigned preparation receipt.');
 const s=result.summary;
 document.getElementById('review-inputs').textContent=s.inputCount+' ('+s.fundingSats+' sats)';
 document.getElementById('review-gifts').textContent=s.releaseCount+' ('+s.principalSats+' sats)';
 document.getElementById('review-fee').textContent=String(s.miningFeeSats);
 document.getElementById('review-change').textContent=String(s.changeSats);
 document.getElementById('review-hash').textContent=result.requestDigest;
 document.getElementById('unsigned-review').hidden=false;
 localStorage.setItem(c.key+'-prepared',JSON.stringify({...result,preparationOperationId:operationId}));
 document.getElementById('review-acknowledged').disabled=false;
 const priorAck=JSON.parse(localStorage.getItem(c.key+'-ack')||'null');
 if(priorAck?.requestDigest===result.requestDigest){document.getElementById('review-acknowledged').checked=true;document.getElementById('review-acknowledged').disabled=true;document.getElementById('handoff-jade').disabled=false;}
 document.getElementById('unsigned-status').textContent='Unsigned request durably prepared ('+result.status+'). Service '+s.serviceFeeSats+' sats; mining '+s.miningFeeSats+' sats ('+s.feeSource+'). Funding freshly rechecked. Signing and broadcasting remain disabled.';
 status.textContent='Unsigned preparation saved. Review the existing transaction details above. This is not signing approval.';
});
enablePreparation();

function preparedBinding(c){
 const p=JSON.parse(localStorage.getItem(c.key+'-prepared')||'null'),receipt=saved(c);
 if(!p||p.planDigest!==receipt.planDigest)throw Error('Prepare the exact current plan first.');
 return {network:'regtest',requestId:receipt.requestId,planDigest:receipt.planDigest,walletDigest:p.walletDigest,preparationOperationId:p.preparationOperationId,requestDigest:p.requestDigest};
}
document.getElementById('review-acknowledged')?.addEventListener('change',async event=>{
 if(document.getElementById('construct-unsigned').dataset.coordinatorBound!=='true')return;
 event.stopImmediatePropagation();const checkbox=event.target,handoff=document.getElementById('handoff-jade');handoff.disabled=true;
 if(!checkbox.checked)return;
 checkbox.disabled=true;
 try{
  const c=await context(),binding=preparedBinding(c);unchanged(c);
  const operationId=retryId(c.key+'-ack-'+binding.requestDigest);
  const result=await post('/api/regtest/creator-acknowledge',{...binding,operationId,acknowledged:true});unchanged(c);
  if(result.reviewOnly!==true||result.requestDigest!==binding.requestDigest)throw Error('Acknowledgement binding mismatch.');
  localStorage.setItem(c.key+'-ack',JSON.stringify(result));handoff.disabled=false;
  document.getElementById('review-ack-status').textContent='Exact transaction acknowledgement saved for review only. Signing remains disabled.';
 }catch(e){checkbox.checked=false;checkbox.disabled=false;document.getElementById('review-ack-status').textContent='Acknowledgement rejected: '+e.message;}
},{capture:true});
action('handoff-jade',async c=>{
 const binding=preparedBinding(c),ack=JSON.parse(localStorage.getItem(c.key+'-ack')||'null');
 if(!document.getElementById('review-acknowledged').checked||!ack||ack.requestDigest!==binding.requestDigest)throw Error('Explicit acknowledgement of this exact transaction required.');
 const operationId=retryId(c.key+'-handoff-'+binding.requestDigest);
 let result;
 // Restore is read-only and only succeeds if this precise handoff was consumed.
 try{result=await post('/api/regtest/creator-review',{...binding,operationId,handoffId:operationId});}
 catch{result=await post('/api/regtest/creator-handoff',{...binding,operationId,acknowledgementId:ack.acknowledgementId});}
 unchanged(c);
 if(result.reviewOnly!==true||result.requestDigest!==binding.requestDigest)throw Error('Review handoff mismatch.');
 sessionStorage.removeItem('bc1q21-professional-diagnostic-jade-handoff');sessionStorage.removeItem('bc1q21-professional-regtest-unsigned-preview');
 sessionStorage.setItem('bc1q21-professional-coordinator-review',JSON.stringify({...binding,operationId,handoffId:operationId}));
 window.location.assign('./jade-signing-workspace.html');
});

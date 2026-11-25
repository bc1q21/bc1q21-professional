import {PLAN_KEY,validatePublicPlan} from './public-date-planner.mjs';
const summary=document.getElementById('summary');
// Session-storage diagnostic flags are never an authoritative coordinator receipt.
const verified=document.getElementById('verified-transaction');verified.hidden=true;
try{
 const recoveryId=new URLSearchParams(location.hash.slice(1)).get('recover');
 if(recoveryId){
  const token=prompt('Operator recovery access token (not a seed phrase, private key or wallet password):');
  if(!token)throw Error('Operator recovery cancelled.');
  const response=await fetch('/api/regtest/creator-artifact-recover',{method:'POST',headers:{'Content-Type':'application/json','X-Professional-Recovery-Token':token},body:JSON.stringify({sessionId:recoveryId})});
  const recovered=await response.json();if(!response.ok||recovered.network!=='regtest'||recovered.artifactVerified!==true||recovered.broadcastAuthorized!==false||recovered.stage!=='SIGNED_NOT_BROADCAST')throw Error(recovered.error||'Recovery rejected.');
  const normalized=validatePublicPlan(recovered.plan.releases,recovered.plan.totalSats);
  sessionStorage.setItem(PLAN_KEY,JSON.stringify(normalized));sessionStorage.setItem('bc1q21-professional-coordinator-finish',JSON.stringify(recovered.finishBinding));
  localStorage.setItem('bc1q21-professional-finish-'+recovered.finishBinding.requestDigest,JSON.stringify(recovered.finishBinding));
  history.replaceState(null,'',location.pathname);
 }
 const snapshot=sessionStorage.getItem(PLAN_KEY),raw=JSON.parse(snapshot||'null');
 if(!raw||raw.signingAuthorized!==false||raw.fundingAuthorized!==false||raw.broadcastAuthorized!==false)throw Error('Current approved plan required.');
 const plan=validatePublicPlan(raw.releases,raw.totalSats);
 const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(plan))))].map(x=>x.toString(16).padStart(2,'0')).join('');
 const prepared=JSON.parse(localStorage.getItem('bc1q21-regtest-plan-request-'+hash+'-prepared')||'null');
 const binding=JSON.parse(sessionStorage.getItem('bc1q21-professional-coordinator-finish')||localStorage.getItem('bc1q21-professional-finish-plan-'+hash)||localStorage.getItem('bc1q21-professional-finish-'+prepared?.requestDigest)||'null');
 if(!binding)throw Error('No authoritative verified signing receipt is available.');
 const response=await fetch('/api/regtest/creator-finish',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(binding)});
 const r=await response.json();
 if(!response.ok)throw Error(r.error||'Receipt unavailable.');
 if(sessionStorage.getItem(PLAN_KEY)!==snapshot)throw Error('Plan changed during receipt loading.');
 if(!['SIGNED_NOT_BROADCAST','SUBMISSION_STATUS_OBSERVED'].includes(r.stage)||r.requestDigest!==binding.requestDigest||r.planDigest!==binding.planDigest||r.walletDigest!==binding.walletDigest||r.sessionId!==binding.sessionId||r.transactionId!==binding.transactionId||r.giftCompleted!==false||r.broadcastAuthorized!==false||r.signingAuthorized!==false||r.recipientDeliveryAvailable!==false||r.mempoolAcceptance!=='NOT_CHECKED'||r.confirmationStatus!=='NOT_CHECKED'||r.fundingStatus!=='NOT_CHECKED'||r.receipt?.signatureCryptographicallyVerified!==true||r.receipt.transactionMatchesApprovedRequest!==true||r.receipt.broadcast!==false||r.summary.totalSats!==plan.totalSats||JSON.stringify(r.summary.releases.map(({date,amountSats})=>({date,amountSats})))!==JSON.stringify(plan.releases))throw Error('Receipt does not match the current plan or completion boundary.');
 localStorage.setItem('bc1q21-professional-finish-plan-'+hash,JSON.stringify(binding));
 const rows=document.getElementById('releases');rows.replaceChildren();for(const [i,release] of plan.releases.entries()){const row=document.createElement('tr');for(const value of [i+1,release.date,release.amountSats.toLocaleString()]){const cell=document.createElement('td');cell.textContent=String(value);row.appendChild(cell);}rows.appendChild(row);}document.getElementById('gift-details').hidden=false;
 summary.textContent='SIGNED — NOT BROADCAST. '+plan.releases.length+' planned releases · '+plan.totalSats.toLocaleString()+' sats. Gift completion pending.';
 document.getElementById('verified-transaction-details').textContent='Server-verified signed transaction: '+r.transactionId+'. Request '+r.requestDigest+'. Inputs: '+r.summary.fundingInputCount+'. Service: '+r.summary.serviceFeeSats+' sats. Mining: '+r.summary.miningFeeSats+' sats. Change: '+r.summary.changeSats+' sats. Mempool acceptance, current funding and blockchain confirmation have not been checked.';
 verified.hidden=false;
 document.getElementById('handoff-stage').textContent='Signature verified and receipt saved. No broadcast or confirmation established; recipient delivery remains pending.';
 document.getElementById('next-action').textContent='Next step requires separate authorization and blockchain evidence. This page does not submit a transaction or complete a gift.';
 const preflightText=result=>{
  if(!result)return;
  if(result.broadcast!==false||result.mempoolSubmitted!==false||result.confirmed!==false)throw Error('Invalid preflight status boundary.');
  document.getElementById('next-action').textContent='Historical submission preflight: '+result.status+(result.reason?' — '+result.reason:'')+'. This is not mempool entry, broadcast, confirmation or gift completion.';
 };
 preflightText(r.preflight);
 const submissionText=s=>{
  if(!s)return;
  const labels={'NOT SUBMITTED':'SIGNED — NOT BROADCAST','SUBMISSION UNKNOWN':'SUBMISSION UNKNOWN — DO NOT RETRY','MEMPOOL OBSERVED':'MEMPOOL OBSERVED — NOT CONFIRMED','CONFIRMED':'CONFIRMED TRANSACTION — RECIPIENT DELIVERY PENDING','REJECTED':'SUBMISSION REJECTED — NOT CONFIRMED','CONFLICTED':'CONFLICTED — OPERATOR REVIEW REQUIRED'};
  if(!labels[s.status]||s.transactionId!==binding.transactionId||s.giftCompleted!==false||s.recipientDeliveryAvailable!==false)throw Error('Invalid authoritative submission status.');
  summary.textContent=labels[s.status]+'. Gift completion remains pending.';
  document.getElementById('finish-broadcast-status').textContent=s.status+' (stored operator observation, not a fresh chain check).';
  document.getElementById('finish-transaction-status').textContent=s.status;
  document.getElementById('finish-notice').textContent='Isolated regtest development status: '+s.status+'. Recipient delivery and completed gift status remain pending.';
  document.getElementById('next-action').textContent='Submission '+s.submissionId+': '+s.status+'. Reconcile uncertain outcomes before any retry. This page never automatically resubmits.';
  document.getElementById('handoff-stage').textContent='Transaction status '+s.status+'. Recipient delivery remains pending.';
 };
 submissionText(r.submission);
 const packageText=p=>{
  if(!p)return;
  if(p.deliveryAuthorized!==false||p.delivered!==false||p.signingAuthorized!==false||!['NOT_AUTHORIZED','AUTHORIZED','EXPORTED','EXPIRED'].includes(p.deliveryAuthorization))throw Error('Invalid recipient delivery boundary.');
  document.getElementById('handoff-stage').textContent='Recipient package '+p.packageId+' prepared (stored record). Integrity digest '+p.integrityDigest+'. Controlled export state: '+p.deliveryAuthorization+'. Actual delivery is NOT authorized and has not occurred; external sending is disabled.';
 };
 packageText(r.recipientPackage);
 if(new URLSearchParams(location.hash.slice(1)).get('recipient-export')===binding.sessionId){
  try{
   const p=r.recipientPackage;if(!p)throw Error('Prepare the confirmed recipient package first.');
   const token=prompt('Separate recipient delivery/export operator token (never wallet credentials):');
   if(!token||!confirm('Authorize ONE local export for recipient '+p.recipientId+' of package '+p.packageId+' with digest '+p.integrityDigest+'? No recipient sending or notification will occur.'))throw Error('Export not authorized.');
   const key='bc1q21-recipient-export-'+p.packageId;let authorizationId=localStorage.getItem(key);if(!authorizationId){authorizationId=p.deliveryAuthorization==='AUTHORIZED'?p.authorizationId:crypto.randomUUID();localStorage.setItem(key,authorizationId);}
   const base={sessionId:binding.sessionId,packageId:p.packageId,packageDigest:p.integrityDigest,recipientId:p.recipientId,authorizationId};
   const headers={'Content-Type':'application/json','X-Professional-Recipient-Delivery-Token':token};
   if(!(p.deliveryAuthorization==='AUTHORIZED'&&p.authorizationId===authorizationId)){
    const response=await fetch('/api/regtest/creator-recipient-authorize',{method:'POST',headers,body:JSON.stringify({...base,explicitDeliveryApproval:p.explicitApprovalDigest})});const result=await response.json();if(!response.ok)throw Error(result.error||'Export authorization rejected.');packageText(result);
   }
   const response=await fetch('/api/regtest/creator-recipient-export',{method:'POST',headers,body:JSON.stringify(base)});
   const text=await response.text();if(!response.ok)throw Error(JSON.parse(text).error||'Export rejected.');
   const pkg=JSON.parse(text);
   const canonical=value=>Array.isArray(value)?'['+value.map(canonical).join(',')+']':value&&typeof value==='object'?'{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}':JSON.stringify(value);
   const hash=async bytes=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');
   if(pkg.digest!==p.integrityDigest||await hash(new TextEncoder().encode(canonical(pkg.body)))!==p.integrityDigest||await hash(new TextEncoder().encode(text))!==response.headers.get('X-Export-File-Digest'))throw Error('Export integrity check failed.');
   const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='bc1q21-recipient-'+p.packageId+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
   packageText({...p,deliveryAuthorization:'EXPORTED'});history.replaceState(null,'',location.pathname);
  }catch(e){document.getElementById('handoff-stage').textContent='Recipient export unavailable: '+e.message+'. No recipient delivery has been performed. An existing export must not be blindly repeated.';}
 }

 if(new URLSearchParams(location.hash.slice(1)).get('recipient-package')===binding.sessionId){
  try{
   const token=prompt('Recipient package operator access token (never wallet credentials):'),recipientId=prompt('Operator-pinned recipient ID (no personal information):');
   if(!token||!recipientId)throw Error('Package preparation cancelled.');
   const key='bc1q21-recipient-package-'+binding.requestDigest+'-'+recipientId;let operationId=localStorage.getItem(key);if(!operationId){operationId=crypto.randomUUID();localStorage.setItem(key,operationId);}
   const response=await fetch('/api/regtest/creator-recipient-package',{method:'POST',headers:{'Content-Type':'application/json','X-Professional-Recipient-Package-Token':token},body:JSON.stringify({sessionId:binding.sessionId,transactionId:binding.transactionId,requestDigest:binding.requestDigest,recipientId,operationId})});const p=await response.json();if(!response.ok)throw Error(p.error||'Package rejected.');packageText(p);history.replaceState(null,'',location.pathname);
  }catch(e){document.getElementById('handoff-stage').textContent='Recipient package unavailable: '+e.message+'. Actual delivery remains disabled.';}
 }
 if(new URLSearchParams(location.hash.slice(1)).get('broadcast')===binding.sessionId){
  try{
   const token=prompt('Separate broadcast operator token (never wallet credentials):');if(!token)throw Error('Cancelled.');
   const call=async(route,body)=>{const response=await fetch('/api/regtest/'+route,{method:'POST',headers:{'Content-Type':'application/json','X-Professional-Broadcast-Token':token},body:JSON.stringify(body)});const result=await response.json();if(!response.ok)throw Error(result.error||'Submission rejected.');return result;};
   const key='bc1q21-broadcast-'+binding.sessionId;let authorizationId=localStorage.getItem(key);if(!authorizationId){authorizationId=crypto.randomUUID();localStorage.setItem(key,authorizationId);}
   const base={sessionId:binding.sessionId,transactionId:binding.transactionId,requestDigest:binding.requestDigest,receiptDigest:r.receiptDigest,authorizationId,preflightId:r.preflight?.authorizationId};
   if(r.submission){base.authorizationId=r.submission.authorizationId;base.preflightId=r.submission.preflightId;submissionText(await call('creator-broadcast-reconcile',base));}
   else{
    if(!confirm('Authorize ONE regtest submission of EXACT TXID '+binding.transactionId+'? This is separate from signing/preflight.'))throw Error('Not authorized.');
    const approval={preflightId:base.preflightId,receiptDigest:base.receiptDigest,requestDigest:base.requestDigest,transactionId:base.transactionId};
    const explicitBroadcastApproval=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(approval))))].map(x=>x.toString(16).padStart(2,'0')).join('');
    await call('creator-broadcast-authorize',{...base,explicitBroadcastApproval});submissionText(await call('creator-broadcast-run',base));
   }
   history.replaceState(null,'',location.pathname);
  }catch(e){document.getElementById('next-action').textContent='Submission workflow unavailable: '+e.message+' Do not blindly retry; reconcile any existing intent.';}
 }

 if(new URLSearchParams(location.hash.slice(1)).get('preflight')===binding.sessionId){
  try{
  const token=prompt('Separate operator preflight access token (never wallet credentials):');
  if(!token)throw Error('Operator preflight cancelled.');
  if(!confirm('Authorize ONE read-only regtest preflight for TXID '+binding.transactionId+'? No broadcast will occur.'))throw Error('Preflight not approved.');
  const storageKey='bc1q21-preflight-'+binding.sessionId;
  let authorizationId=localStorage.getItem(storageKey);if(!authorizationId){authorizationId=crypto.randomUUID();localStorage.setItem(storageKey,authorizationId);}
  const base={sessionId:binding.sessionId,transactionId:binding.transactionId,requestDigest:binding.requestDigest,receiptDigest:r.receiptDigest,authorizationId};
  const approval={receiptDigest:r.receiptDigest,requestDigest:binding.requestDigest,transactionId:binding.transactionId};
  const approvalDigest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(approval))))].map(x=>x.toString(16).padStart(2,'0')).join('');
  const call=async(route,body)=>{const response=await fetch('/api/regtest/'+route,{method:'POST',headers:{'Content-Type':'application/json','X-Professional-Preflight-Token':token},body:JSON.stringify(body)});const result=await response.json();if(!response.ok)throw Error(result.error||'Preflight rejected.');return result;};
  // Lost authorization responses can be recovered from the server's durable status.
  if(!(r.preflight?.status==='AUTHORIZED'&&r.preflight.authorizationId===authorizationId))await call('creator-preflight-authorize',{...base,explicitPreflightApproval:approvalDigest});
  const result=await call('creator-preflight-run',base);preflightText(result);history.replaceState(null,'',location.pathname);
  }catch(e){document.getElementById('next-action').textContent='Preflight unavailable or rejected: '+e.message+'. SIGNED — NOT BROADCAST; no mempool entry or confirmation established.';}
 }

}catch(e){
 verified.hidden=true;summary.textContent='Verified Finish receipt unavailable: '+e.message+' No completed gift, broadcast or confirmation is established.';
 document.getElementById('handoff-stage').textContent='Authoritative signed receipt unavailable. Recipient delivery remains pending.';
}

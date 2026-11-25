import {cameraOwnership} from './camera-ownership.mjs';
import {transactionNetwork} from './browser-transaction-network.mjs';
import {discoverBeneficiary,verifyBeneficiaryReleases,prepareBeneficiaryClaim} from './beneficiary-browser-engine.mjs';
const E=globalThis.bc1q21CreatorEngine,$=id=>document.getElementById(id);let account=null,releases=[],prepared=null,signed=null,authorization=null,animation=null,worker=null,version=0,busy=false,submission={},preparedDigest=null,pendingReturn=null;
const cameras=cameraOwnership();
const section=document.createElement('section');section.id='beneficiary-local';section.style.overflowWrap='anywhere';section.innerHTML='<h2>Recover and claim your gift</h2><p>Your recovery words stay on Jade. Scan only the public account export. All working data stays in this open page.</p><label>Independent regtest service <input id="beneficiary-service" type="url" placeholder="http://127.0.0.1:18762"></label><p><button id="beneficiary-account-scan">Scan Jade public account</button> <button id="beneficiary-account-stop">Stop account camera</button> <input id="beneficiary-account-file" type="file" accept=".txt"></p><video id="beneficiary-video" playsinline muted></video><canvas id="beneficiary-canvas" hidden></canvas><p id="beneficiary-account-status" role="status">No wallet connected.</p><button id="beneficiary-discover">Find my gifts</button><details><summary>Optional: open a saved public recovery record</summary><input id="beneficiary-recovery-file" type="file" accept=".json"></details><p id="beneficiary-status" role="status">Funding and maturity not yet verified.</p><div id="beneficiary-releases"></div><button id="beneficiary-prepare">Prepare selected claim</button><p id="beneficiary-review"></p><button id="beneficiary-authorize" disabled>Review and authorize Jade claim signing</button><img id="beneficiary-qr" alt="Unsigned claim PSBT QR" hidden><button id="beneficiary-scan-return" disabled>Scan Jade signed response</button><button id="beneficiary-stop-return">Stop response camera</button><p id="beneficiary-camera-status" role="status">Camera starts and stops under your control. No camera timeout.</p><input id="beneficiary-signed-file" type="file" accept=".txt,.psbt" disabled><video id="beneficiary-signed-video" playsinline muted></video><canvas id="beneficiary-signed-canvas" hidden></canvas><button id="beneficiary-save" disabled>Save verified signed claim</button><button id="beneficiary-submit" disabled>Send verified claim — regtest only</button><button id="beneficiary-refresh" disabled>Refresh claim confirmation</button>';
document.querySelector('main>header').after(section);$('beneficiary-qr').style.maxWidth='100%';for(const input of section.querySelectorAll('input'))input.style.maxWidth='100%';
// Retain old layouts as diagnostic material, but do not run the coordinator path.
for(const id of ['giftScheduleRows'])$(id)?.replaceChildren();$('giftTotal').textContent='No verified gifts';$('giftTotalContext').textContent='Connect the beneficiary public account and check Bitcoin.';
for(const legacy of document.querySelectorAll('main>section'))if(legacy.querySelector('#completeHandoffDigest,#selectedRelease,#startCamera'))legacy.hidden=true;
$('linkStatus').textContent='Identify gifts from your public account; a saved record is optional.';
const status=t=>{$('beneficiary-status').textContent=t;},net=()=>transactionNetwork({url:$('beneficiary-service').value,engine:E,applicationOrigin:location.origin});
function invalidate(){cameras.stop();version++;preparedDigest=null;pendingReturn=null;prepared=null;signed=null;authorization=null;submission={};clearInterval(animation);worker?.terminate();$('beneficiary-qr').hidden=true;$('beneficiary-review').textContent='';for(const id of ['beneficiary-authorize','beneficiary-scan-return','beneficiary-signed-file','beneficiary-save','beneficiary-submit','beneficiary-refresh'])$(id).disabled=true;}
function accept(a){
 cameras.stop();
 if(account&&E.accountIdentity(account)===E.accountIdentity(a)){status('Same public account; gifts, prepared claim and authorization retained.');return;}
 if(account&&!confirm('Replace the beneficiary account? This invalidates its discovered gifts and claim approvals.')){status('Replacement cancelled; account and claim retained.');return;}
 invalidate();account=a;releases=[];$('beneficiary-releases').replaceChildren();$('giftScheduleRows').replaceChildren();$('giftTotal').textContent='No verified gifts';$('beneficiary-account-status').textContent='Public account '+a.masterFingerprintHex.toUpperCase()+' · '+a.accountPath;
}
const camera=E.publicAccountReceiver({video:$('beneficiary-video'),canvas:$('beneficiary-canvas'),onAccount:accept,onStatus:t=>{$('beneficiary-account-status').textContent=t;}});
async function startCamera(receiver){
 $('beneficiary-camera-status').textContent='Opening camera; wallet and prepared claim retained.';
 try{if(await cameras.start(receiver))$('beneficiary-camera-status').textContent='Camera active. Stop it when finished; signing authorization is separate.';}
 catch(e){$('beneficiary-camera-status').textContent='Camera unavailable: '+e.name+' — '+e.message+'. Click Scan again; account and claim retained.';}
}
function stopCamera(){cameras.stop();$('beneficiary-camera-status').textContent='Camera stopped; account, gifts and prepared claim retained.';}
$('beneficiary-account-scan').onclick=()=>startCamera(camera);
$('beneficiary-account-stop').onclick=stopCamera;
$('beneficiary-stop-return').onclick=stopCamera;
$('beneficiary-account-file').onchange=async()=>{const v=version;try{const f=$('beneficiary-account-file').files[0];if(!f||f.size>500000)throw Error('Invalid public capture');const a=E.accountFromPublicFrames(await f.text());if(v!==version)throw Error('Wallet context changed during import');accept(a);}catch(e){status(e.message+'; existing account and claim retained.');}};
$('beneficiary-service').oninput=()=>{invalidate();releases=[];$('beneficiary-releases').replaceChildren();status('Service changed; fresh verification required.');};
function render(rows){releases=rows;$('giftScheduleRows').replaceChildren();rows.forEach((r,i)=>{const tr=document.createElement('tr');for(const value of [i+1,r.date,r.valueSats+' sats',!r.unspent?'SPENT':r.mature?'RELEASE MATURE':'NOT YET MATURE']){const td=document.createElement('td');td.textContent=String(value);tr.append(td);}$('giftScheduleRows').append(tr);});$('scheduleProvenance').textContent='Fresh independent regtest observations; eligibility is rechecked before signing.';const host=$('beneficiary-releases');host.replaceChildren();rows.forEach(r=>{const label=document.createElement('label'),c=document.createElement('input');c.type='checkbox';c.value=r.id;c.disabled=!r.unspent||!r.mature;c.onchange=()=>invalidate();label.append(c,document.createTextNode(r.date+' · '+r.valueSats+' sats · '+(!r.unspent?'SPENT':r.mature?'RELEASE MATURE':'NOT YET MATURE')));host.append(label,document.createElement('br'));});$('giftTotal').textContent=rows.filter(r=>r.unspent).reduce((n,r)=>n+r.valueSats,0)+' sats';$('giftTotalContext').textContent='Verified public gift outputs; eligibility must be checked again before signing.';status(rows.length+' release outputs verified.');}
async function task(fn){if(busy)return;busy=true;const v=version;try{await fn(()=>{if(v!==version)throw Error('Wallet, service or selection changed');});}catch(e){status(e.message);}finally{busy=false;}}
$('beneficiary-discover').onclick=()=>{invalidate();task(async check=>{if(!account)throw Error('Connect your public account first');const rows=await discoverBeneficiary({account,network:net(),engine:E,onProgress:status,match:data=>new Promise((resolve,reject)=>{worker=new Worker('./browser-integration/beneficiary-discovery.worker.js');worker.onmessage=e=>{worker.terminate();e.data.error?reject(Error(e.data.error)):resolve(e.data.result);};worker.onerror=e=>reject(Error(e.message));worker.postMessage(data);})});check();render(rows);});};
$('beneficiary-recovery-file').onchange=()=>{invalidate();task(async check=>{if(!account)throw Error('Connect beneficiary account first');const f=$('beneficiary-recovery-file').files[0];if(!f||f.size>2000000)throw Error('Invalid recovery file');const input=JSON.parse(await f.text()),m=input.body?.manifest??input;E.validateRecovery(m,m.digest);const rows=m.releases.map(r=>({...r,txid:m.creatorTxid,rawTransactionHex:m.creatorRawHex,id:m.creatorTxid+':'+r.vout}));const verified=await verifyBeneficiaryReleases({releases:rows,account,network:net(),engine:E});check();render(verified);});};
$('beneficiary-prepare').onclick=()=>task(async check=>{invalidate();const selected=[...document.querySelectorAll('#beneficiary-releases input:checked')].map(c=>releases.find(r=>r.id===c.value));const revision=version;const p=await prepareBeneficiaryClaim({releases:selected,account,network:net(),engine:E});if(revision!==version)throw Error('Selection changed');prepared=p;preparedDigest=E.digest(p);$('beneficiary-scan-return').disabled=false;$('beneficiary-signed-file').disabled=false;$('beneficiary-review').textContent='Claim '+p.principalSats+' sats → '+p.payoutSats+' sats; mining '+p.feeSats+' sats; destination '+E.address(E.deriveRecoveryPublicKeys(account,1).destination)+'; locktime '+Math.max(...p.releases.map(r=>r.locktime))+'. CLAIM PREPARED — NOT SIGNED.';$('beneficiary-authorize').disabled=false;});
function exactClaim(){if(!prepared||E.digest(prepared)!==preparedDigest)throw Error('Prepared claim changed; fresh review required');return prepared;}
async function freshClaim(p,v){
 const fresh=await prepareBeneficiaryClaim({releases:p.releases,account,network:net(),engine:E});
 if(v!==version||p!==prepared||E.digest(p)!==preparedDigest||E.canonical(fresh)!==E.canonical(p))throw Error('Claim, recipient, funding or fee context changed; renewal refused');
}
function valid(a,p){return !!a&&!a.used&&Date.now()<a.expires&&a.digest===E.digest(p)&&a.version===version;}
function expire(){
 clearInterval(animation);$('beneficiary-qr').hidden=true;$('beneficiary-authorize').disabled=!prepared||!!signed;
 $('beneficiary-authorize').textContent='Renew authorization — SAME claim';
 status('Signing authorization expired. Camera and exact claim retained. Explicitly renew the SAME claim after fresh checks; no new signature is needed for that same transaction.');
}
$('beneficiary-authorize').onclick=()=>task(async()=>{
 const p=exactClaim(),v=version;if(signed)throw Error('Claim already signed');
 if(!confirm('Authorize or renew signing of this SAME reviewed regtest claim? Fresh identity, funding and maturity checks are required.'))return;
 authorization=null;clearInterval(animation);await freshClaim(p,v);const q=await E.psbtQr(p.unsignedPsbtBase64);if(v!==version||p!==prepared)throw Error('Claim changed');
 authorization={digest:preparedDigest,version:v,expires:Date.now()+300000,used:false};let i=0;
 const tick=()=>{if(!valid(authorization,p)){expire();return;}$('beneficiary-qr').src=q.images[i++%q.images.length];};tick();animation=setInterval(tick,280);
 $('beneficiary-qr').hidden=false;$('beneficiary-scan-return').disabled=false;$('beneficiary-signed-file').disabled=false;$('beneficiary-authorize').disabled=false;$('beneficiary-authorize').textContent='Renew authorization — SAME claim';
 status('SIGNING AUTHORIZED for five minutes. Camera has no timeout. Exact prepared claim unchanged.');
 if(pendingReturn){const saved=pendingReturn;setTimeout(()=>returned(saved),0);}
});
async function returned(payload){return task(async()=>{
 const p=exactClaim(),a=authorization,v=version;if(signed||a?.used)throw Error('Claim already signed; duplicate return rejected');
 const base64=E.signedPayload(payload),final=E.finalizeRecoveredClaim(p,base64);
 // Quarantine only an exact, cryptographically verified response in session RAM.
 // It does not become an accepted signing receipt without fresh explicit consent.
 pendingReturn=new Uint8Array(payload);
 if(!valid(a,p)){expire();status('Exact signed response captured and retained, NOT accepted. Renew authorization for the SAME claim to verify and accept it.');return;}
 await freshClaim(p,v);if(a!==authorization||!valid(a,p)){expire();return;}
 a.used=true;pendingReturn=null;signed={...final,signedPsbtBase64:base64};clearInterval(animation);$('beneficiary-qr').hidden=true;cameras.stop();
 for(const id of ['beneficiary-submit','beneficiary-save','beneficiary-refresh'])$(id).disabled=false;
 $('beneficiary-authorize').disabled=true;$('beneficiary-signed-file').disabled=true;$('beneficiary-scan-return').disabled=true;status('CLAIM SIGNED — NOT BROADCAST. '+signed.txid);
});}
const receiver=E.createJadeSignedCameraReceiver({video:$('beneficiary-signed-video'),canvas:$('beneficiary-signed-canvas'),onStatus:t=>{$('beneficiary-camera-status').textContent=t;},onSignedPsbt:returned});
$('beneficiary-scan-return').onclick=()=>{try{exactClaim();if(signed)throw Error('Claim already signed');startCamera(receiver);}catch(e){status(e.message);}};
$('beneficiary-signed-file').onchange=async()=>{const f=$('beneficiary-signed-file').files[0];if(!f||f.size>500000)return status('Invalid signed return');await returned(new Uint8Array(await f.arrayBuffer()));};
$('beneficiary-submit').onclick=()=>task(async()=>{if(!signed||!confirm('Send this exact verified claim to the selected regtest service?'))return;$('beneficiary-submit').disabled=true;E.finalizeRecoveredClaim(prepared,signed.signedPsbtBase64);const r=await net().submit({raw:signed.rawTransactionHex,state:submission,revalidate:()=>prepareBeneficiaryClaim({releases:prepared.releases,account,network:net(),engine:E})});status(r.state+' · '+r.txid);});
$('beneficiary-refresh').onclick=()=>task(async()=>{const r=await net().observe(signed.rawTransactionHex);status(r.state+' · '+(r.confirmations??0)+' confirmations · '+r.txid);});
$('beneficiary-save').onclick=()=>{const blob=new Blob([JSON.stringify({format:'professional-customer-held-signed-claim-v1',network:'regtest',prepared,signed})],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='verified-regtest-claim.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
window.addEventListener('pagehide',()=>{cameras.stop();worker?.terminate();clearInterval(animation);account=null;prepared=null;signed=null;});

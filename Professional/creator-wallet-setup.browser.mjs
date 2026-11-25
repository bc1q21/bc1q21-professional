import {engine,plan,guard,clearPrepared} from './creator-browser-common.mjs';
import {inspectIndependentFunding} from './creator-independent-service.mjs';
const AUTHORIZATION_MS=5*60*1000;
export function installCustomerWalletSetup({onRegistered,onInvalidate}){
 const E=engine(),$=id=>document.getElementById(id),host=$('public-wallet-qr-import');
 const state=()=>{
  const s=creatorSession.workflow.walletSetup??(creatorSession.workflow.walletSetup={accounts:{},proofs:{}});
  s.pendingProofs??={};return s;
 };
 const panel=document.createElement('div');panel.id='customer-wallet-setup';
 panel.innerHTML='<h3>Connect your Jade public wallet</h3><p>Export Xpub on Jade: Single Sig, Native SegWit, account 0. Scan only the public export, never recovery words.</p><label>Whose wallet? <select id="wallet-owner"><option value="creator">Your funding wallet</option><option value="beneficiary">Beneficiary wallet</option></select></label><label><input type="checkbox" id="same-beneficiary-wallet"> Use the same wallet for the beneficiary</label><p id="wallet-account-summary" role="status">No public accounts scanned.</p><button type="button" id="prepare-local-wallet-proof">Verify this wallet locally</button><p id="wallet-proof-status" role="status">A public export alone does not prove key possession.</p><div id="wallet-proof-review" hidden><p id="wallet-proof-details"></p><button type="button" id="authorize-wallet-proof">Show identity-test QR</button><img id="wallet-proof-qr" alt="Unsigned local identity proof QR" hidden><p>After signing this identity test on Jade, scan its signed response. Nothing is broadcast.</p><button type="button" id="scan-wallet-proof" disabled>Scan identity response</button><button type="button" id="stop-wallet-proof" disabled>Stop proof camera</button><button type="button" id="verify-captured-wallet-proof" hidden>Verify retained identity response</button><p id="wallet-proof-camera-status" role="status">Authorize this exact request before scanning. The request is retained while cameras are stopped.</p><video id="wallet-proof-video" playsinline muted style="width:100%;max-width:400px;min-height:160px" hidden></video><canvas id="wallet-proof-canvas" hidden></canvas><details><summary>Optional: use a saved public export or signed capture</summary><label>Public account frames <input type="file" id="public-account-file" accept=".txt"></label><label>Signed identity response <input type="file" id="wallet-proof-file" accept=".txt,.psbt" disabled></label></details></div><button type="button" id="complete-wallet-setup">Use verified wallets</button><p id="wallet-service-status" role="status"></p><details><summary>Advanced recovery reference</summary><label>Gift recovery slot <input id="wallet-discovery-slot" type="number" min="1" max="20" value="1"></label><p>All 20 references are recoverable from the wallet. Reusing one may link gifts publicly.</p></details>';
 host.before(panel);host.hidden=false;
 const advanced=$('coordinator-registration').closest('section'),details=document.createElement('details'),summary=document.createElement('summary');
 summary.textContent='Advanced public registration import (optional)';details.append(summary);advanced.parentNode.insertBefore(details,advanced);details.append(advanced);
 const serviceLabel=$('independent-service').previousElementSibling,serviceInput=$('independent-service');panel.prepend(serviceLabel,serviceInput);
 panel.append($('public-account-file').closest('details'));
 $('same-beneficiary-wallet').checked=state().shared===true;
 if(!serviceInput.value&&creatorSession.workflow.serviceURL)serviceInput.value=creatorSession.workflow.serviceURL;
 let camera=null,proofCamera=null,animation=null,lease=null,busy=false,cameraTurn=0,cameraOwner=null,epoch=0,disposed=false,cameraAcquisition=Promise.resolve();
 const role=()=>$('wallet-owner').value;
 const status=t=>{$('wallet-proof-status').textContent=t;};
 const publicStatus=t=>{$('public-wallet-camera-status').textContent=t;status(t);};
 const proofStatus=t=>{$('wallet-proof-camera-status').textContent=t;status(t);};
 const selected=()=>state().pendingProofs[role()];
 function stopPublic(){camera?.stop();$('public-wallet-camera-video').hidden=true;$('public-wallet-camera-video').style.display='none';$('public-wallet-camera-stop').disabled=true;if(cameraOwner==='public'){cameraOwner=null;cameraTurn++;}}
 function stopProof(){proofCamera?.stop();$('wallet-proof-video').hidden=true;$('stop-wallet-proof').disabled=true;if(cameraOwner==='proof'){cameraOwner=null;cameraTurn++;}}
 function stopCameras(){cameraTurn++;cameraOwner=null;stopPublic();stopProof();}
 async function startSerialized(receiver,turn,owner){
  const previous=cameraAcquisition;let release;
  cameraAcquisition=new Promise(resolve=>{release=resolve;});
  try{await previous;if(turn!==cameraTurn||cameraOwner!==owner)return;await receiver.start();}
  finally{release();}
 }
 function stopAnimation(){if(animation)clearInterval(animation);animation=null;$('wallet-proof-qr').hidden=true;}
 function bound(p){
  if(!p||p.consumed||state().pendingProofs[p.challenge.role]!==p)throw Error('This identity request is missing, replaced or already verified.');
  const a=state().accounts[p.challenge.role];
  if(!a||E.accountIdentity(a)!==p.challenge.accountIdentity||E.digest(plan())!==p.challenge.planDigest)throw Error('Wallet or approved plan changed; this identity request cannot be used.');
  return a;
 }
 function active(p){return !!lease&&lease.request===p&&!p?.consumed&&lease.revision===creatorSession.revision&&Date.now()<lease.expiresAt;}
 function requireAuthorization(p){
  bound(p);
  if(!active(p))throw Error('Identity authorization expired or changed. The exact request is retained. Select Authorize / reauthorize SAME identity request, then scan the existing response.');
 }
 function render(){
  const s=state(),p=selected();
  $('wallet-account-summary').textContent=['creator','beneficiary'].map(r=>r+': '+(s.accounts[r]?'public export '+s.accounts[r].masterFingerprintHex.toUpperCase()+' · '+s.accounts[r].accountPath+' · '+(s.proofs[r]?'possession verified':'proof pending'):'not connected')).join(' | ');
  $('funding-key-status').textContent=s.accounts.creator?'Jade public account imported. '+(s.proofs.creator?'Possession verified.':'Possession proof pending; this is not signing or funding authorization.'):'No Jade public account imported.';
  $('wallet-proof-review').hidden=!p;
  $('authorize-wallet-proof').textContent='Authorize / reauthorize SAME identity request';
  $('authorize-wallet-proof').disabled=!p||p.consumed||busy||active(p);
  $('scan-wallet-proof').disabled=!p||p.consumed||busy;
  $('wallet-proof-file').disabled=!p||busy||!active(p);
  $('verify-captured-wallet-proof').hidden=!p?.pendingSigned;$('verify-captured-wallet-proof').disabled=!p||busy||!active(p);
  if(p){const c=p.challenge;$('wallet-proof-details').textContent='Local '+c.role+' identity test. Return '+c.returnSats+' sats to this wallet; mining fee 2,500 sats; zero-value account commitment. NOT the gift transaction; NEVER broadcast. '+c.account.masterFingerprintHex.toUpperCase()+' · '+c.account.accountPath+'. Exact request '+E.digest(c)+'. Authorization lasts five minutes from explicit approval; reauthorization retains this same PSBT.';}
 }
 function invalidateDependents(){
  epoch++;lease=null;stopCameras();stopAnimation();
  const s=state();s.proofs={};s.pendingProofs={};
  clearPrepared();for(const k of ['registration','funding','quote','handoff'])delete creatorSession.workflow[k];
  creatorSession.revision++;
  try{const q=E.betaFundingQuote(plan());$('customer-payment-amount').textContent=(q.estimatedTotalSats/1e8).toFixed(8)+' BTC (fallback estimate)';$('customer-payment-breakdown').textContent='Wallet context changed. Fresh funding and transaction review required.';}catch{}
  $('construct-unsigned').disabled=true;$('handoff-jade').disabled=true;$('unsigned-review').hidden=true;$('customer-address-qr').hidden=true;$('copy-test-funding-address').disabled=true;$('customer-payment-address').textContent='Verify the selected wallet before using its address.';onInvalidate?.();
 }
 function accept(account,r=role()){
  const s=state(),old=s.accounts[r];stopCameras();
  if(old&&E.accountIdentity(old)===E.accountIdentity(account)){
   render();publicStatus('Public export validated locally: same account. Existing proofs and exact identity request retained.');return;
  }
  if(old&&!window.confirm('Replace the imported '+r+' account with '+account.masterFingerprintHex.toUpperCase()+' '+account.accountPath+'? This invalidates identity proofs, funding quotes and signing approvals.')){render();publicStatus('Wallet replacement cancelled. Existing accounts and exact identity request retained.');return;}
  // Commit a fully decoded, validated replacement only. Camera operations and
  // invalid/incomplete files must never mutate the imported account or request.
  invalidateDependents();s.accounts[r]=account;if(r==='creator'&&s.shared)s.accounts.beneficiary={...account};if(r==='beneficiary'&&s.shared&&s.accounts.creator&&E.accountIdentity(account)!==E.accountIdentity(s.accounts.creator)){s.shared=false;$('same-beneficiary-wallet').checked=false;}
  render();publicStatus('Public export validated locally. Verify possession next.');
 }
 camera=E.publicAccountReceiver({video:$('public-wallet-camera-video'),canvas:$('public-wallet-camera-canvas'),onAccount:a=>accept(a),onStatus:publicStatus});
 $('customer-import-public-wallet').textContent='Connect Jade public wallet';$('customer-import-public-wallet').onclick=()=>{for(let n=panel.parentElement;n;n=n.parentElement)if(n.tagName==='DETAILS')n.open=true;panel.scrollIntoView();$('public-wallet-camera-start').focus();};
 $('public-wallet-camera-start').disabled=false;$('public-wallet-camera-start').textContent='Scan Jade public account QR';
 $('public-wallet-camera-start').onclick=async()=>{
  stopCameras();const turn=++cameraTurn;cameraOwner='public';$('public-wallet-camera-video').hidden=false;$('public-wallet-camera-video').style.display='block';$('public-wallet-camera-stop').disabled=false;publicStatus('Opening public-account camera. Imported accounts and identity request are retained.');
  try{await startSerialized(camera,turn,'public');if(turn===cameraTurn&&cameraOwner==='public'&&camera.active)publicStatus('Scanning Jade public account QR. A valid replacement is required before any wallet change.');}
  catch(e){if(turn===cameraTurn){stopPublic();publicStatus('Public camera unavailable: '+e.name+' — '+e.message+'. Imported accounts and request retained.');}}
 };
 $('public-wallet-camera-stop').onclick=()=>{stopPublic();publicStatus('Public camera stopped; partial frames discarded. Imported accounts and exact identity request retained.');};
 $('wallet-owner').onchange=()=>{stopCameras();lease=null;stopAnimation();render();proofStatus('Selected '+role()+' wallet. Imported accounts and pending identity requests retained; explicit authorization required for scanning.');};
 $('same-beneficiary-wallet').onchange=()=>{
  const s=state();s.shared=$('same-beneficiary-wallet').checked;
  if(s.shared&&s.accounts.creator&&(!s.accounts.beneficiary||E.accountIdentity(s.accounts.beneficiary)!==E.accountIdentity(s.accounts.creator))){const a=s.accounts.creator;invalidateDependents();s.accounts.beneficiary={...a};}
  render();status('Wallet sharing selection updated. Existing public accounts retained.');
 };
 $('wallet-discovery-slot').oninput=()=>{invalidateDependents();render();};
 $('public-account-file').onchange=async()=>{
  const r=role(),version=epoch;stopCameras();
  try{const file=$('public-account-file').files[0];if(!file||file.size>500000)throw Error('Choose bounded public QR frames only');const a=E.accountFromPublicFrames(await file.text());if(version!==epoch||r!==role())throw Error('Wallet selection changed during file read');accept(a,r);}
  catch(e){publicStatus('Export rejected: '+e.message+'. Existing account and request retained.');}
 };
 async function freshAccount(account,outpoints){const keys=E.deriveRecoveryPublicKeys(account,1);return inspectIndependentFunding({url:serviceInput.value,wallet:{creator:keys.funding},outpoints,engine:E,applicationOrigin:location.origin});}
 async function freshRequest(p){
  const a=bound(p),c=p.challenge,check=guard();
  const f=await freshAccount(a,[{txid:c.utxo.txid,vout:c.utxo.vout}]);check();bound(p);
  const u=f.utxos[0];for(const k of ['txid','vout','valueSats','fundingTxHex'])if(u[k]!==c.utxo[k])throw Error('Identity funding changed; request retained but authorization refused.');
 }
 $('prepare-local-wallet-proof').onclick=async()=>{
  if(busy)return;busy=true;const version=epoch,r=role(),check=guard();stopCameras();
  try{
   const a=state().accounts[r];if(!a)throw Error('Scan this wallet public account first');
   const existing=state().pendingProofs[r];
   if(existing){bound(existing);render();proofStatus(existing.consumed?'This request was already verified.':'Exact identity request already retained. Use Authorize / reauthorize SAME identity request; no new PSBT was created.');return;}
   const f=await freshAccount(a);check();if(version!==epoch||r!==role())throw Error('Wallet context changed');
   const utxo=f.utxos.find(u=>u.valueSats>=3046);if(!utxo)throw Error('This disposable regtest wallet needs a confirmed test output for the identity proof');
   const challenge=E.accountProofChallenge({account:a,planDigest:E.digest(plan()),role:r,utxo,challengeId:crypto.randomUUID()});
   state().pendingProofs[r]={challenge,createdAt:Date.now(),consumed:false};lease=null;stopAnimation();proofStatus('Exact identity request prepared and retained in this open session. Explicit authorization required; nothing signed or broadcast.');
  }catch(e){proofStatus(e.message);}finally{busy=false;render();}
 };
 $('authorize-wallet-proof').onclick=async()=>{
  if(busy)return;const p=selected();busy=true;render();stopAnimation();lease=null;
  try{
   E.checkServicePolicy();bound(p);const revision=creatorSession.revision;await freshRequest(p);
   const qr=await E.psbtQr(p.challenge.unsignedPsbtBase64);bound(p);if(revision!==creatorSession.revision||p!==selected())throw Error('Identity context changed during authorization');
   lease={request:p,revision,expiresAt:Date.now()+AUTHORIZATION_MS};let i=0;
   const tick=()=>{if(!active(p)){stopAnimation();lease=null;render();proofStatus('Identity authorization expired or context changed. Exact request retained. Reauthorize the SAME request after fresh checks before importing a signed response.');return;}$('wallet-proof-qr').hidden=false;$('wallet-proof-qr').src=qr.images[i++%qr.images.length];};tick();animation=setInterval(tick,280);
   proofStatus('Identity signing/response authorization active for five minutes. Review on Jade at your own pace; if it expires, explicitly reauthorize this SAME retained request before scanning. Identity transaction will NEVER be broadcast.');
  }catch(e){lease=null;proofStatus('Identity authorization refused: '+e.message);}finally{busy=false;render();}
 };
 async function returned(bytes){
  if(busy){proofStatus('Verification already in progress; exact request retained.');return;}busy=true;const p=selected();render();
  try{
   const consent=lease,c=p.challenge,a=bound(p);
   const signed=E.signedPayload(bytes);E.verifyAccountProof(c,signed,{account:a,planDigest:E.digest(plan()),role:c.role});
   p.pendingSigned=new Uint8Array(bytes);
   if(!active(p)){proofStatus('Identity response rejected: authorization expired or absent. Exact signed response retained, NOT accepted. Reauthorize the SAME request, then select Verify retained identity response.');return;}
   await freshRequest(p);if(lease!==consent)throw Error('Identity authorization changed during verification');requireAuthorization(p);
   p.consumed=true;delete p.pendingSigned;state().proofs[c.role]={challenge:c,signedPsbtBase64:signed};
   if(state().shared&&c.role==='creator'&&state().accounts.beneficiary&&E.accountIdentity(a)===E.accountIdentity(state().accounts.beneficiary))state().proofs.beneficiary=state().proofs.creator;
   lease=null;stopAnimation();stopProof();proofStatus('Wallet possession cryptographically verified locally. Identity test NOT BROADCAST.');
  }catch(e){proofStatus('Identity response rejected: '+e.message+'. Exact request retained; no broadcast.');}finally{busy=false;render();}
 }
 proofCamera=E.createJadeSignedCameraReceiver({video:$('wallet-proof-video'),canvas:$('wallet-proof-canvas'),onStatus:proofStatus,onSignedPsbt:returned});
 $('scan-wallet-proof').onclick=async()=>{
  let turn=null;try{bound(selected());stopCameras();turn=++cameraTurn;cameraOwner='proof';$('wallet-proof-video').hidden=false;$('stop-wallet-proof').disabled=false;proofStatus('Opening signed identity-response camera…');await startSerialized(proofCamera,turn,'proof');if(turn===cameraTurn&&cameraOwner==='proof'&&proofCamera.active)proofStatus('Signed-response camera active. Point it at Jade’s crypto-psbt response.');}
  catch(e){if(turn!==null&&turn!==cameraTurn)return;stopProof();proofStatus('Identity-response camera not started: '+e.name+' — '+e.message+'. Exact request retained.');render();}
 };
 $('stop-wallet-proof').onclick=()=>{stopProof();proofStatus('Signed-response camera stopped; partial frames discarded. Exact identity request and imported accounts retained.');};
 $('verify-captured-wallet-proof').onclick=()=>returned(selected()?.pendingSigned);
 $('wallet-proof-file').onchange=async()=>{try{const file=$('wallet-proof-file').files[0];if(!file||file.size>500000)throw Error('Invalid signed capture');await returned(new Uint8Array(await file.arrayBuffer()));}catch(e){proofStatus(e.message);}};
 $('complete-wallet-setup').onclick=async()=>{try{
  const s=state();if(!s.accounts.creator||!s.accounts.beneficiary)throw Error('Connect both public wallets, or explicitly choose the same beneficiary wallet');
  const registration=E.assembleCustomerWallet({creatorAccount:s.accounts.creator,beneficiaryAccount:s.accounts.beneficiary,creatorProof:s.proofs.creator,beneficiaryProof:s.proofs.beneficiary,plan:plan(),index:Number($('wallet-discovery-slot').value)});
  creatorSession.workflow.registration=registration;creatorSession.workflow.serviceURL=serviceInput.value;await onRegistered(registration);$('wallet-service-status').textContent='Wallets and approved fee destination verified locally.';
 }catch(e){$('wallet-service-status').textContent=e.message;}};
 $('wallet-service-status').textContent=E.servicePolicy.approved?'Service destination pinned by this build.':'Professional service-fee destination pending approval. Public account intake is available; identity-test QR and gift preparation remain blocked.';
 // Capture time is not authorization time. A reload within the still-open RAM
 // session can restore an exact request, but NEVER restores an active consent.
 window.addEventListener('pagehide',()=>{disposed=true;stopCameras();stopAnimation();lease=null;});
 const expiryPoll=setInterval(()=>{if(disposed){clearInterval(expiryPoll);return;}if(lease&&!active(lease.request)){lease=null;stopAnimation();render();proofStatus('Identity authorization expired or context changed. Exact request retained; explicitly reauthorize the SAME request.');}},500);
 render();if(selected())proofStatus('Exact identity request restored from temporary session memory. Explicit reauthorization and fresh funding checks required.');
 $('customer-import-public-wallet').disabled=false;
 return {invalidate:invalidateDependents,accept};
}

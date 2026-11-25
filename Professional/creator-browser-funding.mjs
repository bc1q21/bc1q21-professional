import {installCustomerWalletSetup} from './creator-wallet-setup.browser.mjs';
import {inspectIndependentFunding} from './creator-independent-service.mjs';
import {engine,plan,guard,brand,rows,clearPrepared} from './creator-browser-common.mjs';
brand();const $=id=>document.getElementById(id),E=engine();
const message=text=>{$('coordinator-plan-status').textContent=text;};
function unlock(){const w=creatorSession.workflow;$('construct-unsigned').disabled=!w.registration;if(w.registration){$('construct-unsigned').textContent='Prepare unsigned gift transaction';for(let n=$('construct-unsigned').parentElement;n;n=n.parentElement)if(n.tagName==='DETAILS')n.open=true;}}
function reset(){creatorSession.revision++;clearPrepared();delete creatorSession.workflow.funding;$('unsigned-review').hidden=true;$('handoff-jade').disabled=true;$('review-acknowledged').checked=false;}
function outpoints(){const text=$('coordinator-outpoints').value.trim();if(!text)return [];return text.split(/\r?\n/).map(line=>{const m=line.trim().match(/^([a-f0-9]{64}):(0|[1-9][0-9]*)$/);if(!m)throw Error('Use TXID:output-index per line');return {txid:m[1],vout:Number(m[2])};});}
function currentRegistration(){const r=creatorSession.workflow.registration;if(!r)throw Error('Connect and verify the public wallets first');E.verifyServiceWallet(r.wallet);return r;}
async function inspect(){const check=guard(),r=currentRegistration();const result=await inspectIndependentFunding({url:$('independent-service').value,wallet:r.wallet,outpoints:outpoints(),engine:E,applicationOrigin:location.origin});check();creatorSession.workflow.funding=result;const q=E.betaFundingQuote(plan(),{feeEstimate:result.feeEstimate});$('customer-payment-amount').textContent=(q.estimatedTotalSats/1e8).toFixed(8)+' BTC ('+q.estimatedTotalSats+' sats)';$('customer-payment-breakdown').textContent='Principal '+plan().totalSats+'; service '+q.serviceFeeSats+'; discovery '+q.discoveryValueSats+'; estimated mining '+q.estimatedMiningFeeSats+' sats. '+(result.feeEstimate?'Independent service estimate.':'Explicit fallback; not live.');return result;}
function request(f){const r=currentRegistration(),body={format:'professional-offline-signing-request-v1',network:'regtest',genesis:E.GENESIS,revision:creatorSession.revision,...E.prepareBetaCreation({plan:plan(),wallet:r.wallet,utxos:f.utxos,feeEstimate:f.feeEstimate,discovery:r.discovery})};return {...body,requestDigest:E.digest(body)};}
function wire(id,fn){$(id)?.addEventListener('click',async()=>{const b=$(id);b.disabled=true;try{await fn();}catch(e){clearPrepared();$('handoff-jade').disabled=true;$('unsigned-review').hidden=true;message(e.message);}finally{if(id==='construct-unsigned')b.disabled=!creatorSession.workflow.registration;else if(id==='handoff-jade'){const w=creatorSession.workflow;b.disabled=!w.prepared||w.acknowledgement!==w.prepared.requestDigest;}else b.disabled=false;}});}
try{
 const p=plan(),q=E.betaFundingQuote(p);$('status').textContent='Approved plan is held in this open application only.';$('total').textContent=String(p.totalSats);rows('releases',p.releases);$('details').hidden=false;
 const due=$('customer-payment-amount')||$('customer-required-btc');if(due)due.textContent=(q.estimatedTotalSats/1e8).toFixed(8)+' BTC ('+q.estimatedTotalSats+' sats)';
 $('customer-funding-status').textContent='Verify the public wallet registration and independently selected regtest service below. Nothing is signed or broadcast.';
 $('save-coordinator-plan').textContent='Review approved plan in memory';$('register-coordinator-wallet').textContent='Verify public wallet locally';
 $('customer-import-public-wallet').textContent='Open public wallet verification';$('customer-import-public-wallet').onclick=()=>{$('public-wallet-pin').scrollIntoView();$('coordinator-registration').focus();};
 const w=creatorSession.workflow;if(w.registration){$('independent-service').value=w.serviceURL||'';$('public-wallet-pin').value=w.registration.pin;message('Public registration remains verified in this open application. Refresh funding before preparation.');}
 unlock();
}catch(e){message(e.message);}
for(const id of ['independent-service','public-wallet-pin','coordinator-registration','coordinator-outpoints'])$(id).addEventListener('input',()=>{reset();if(id==='independent-service')creatorSession.workflow.serviceURL=$('independent-service').value;if(id==='public-wallet-pin'||id==='coordinator-registration'){delete creatorSession.workflow.registration;$('construct-unsigned').disabled=true;}message('Inputs changed. Fresh verification and review are required.');});
wire('save-coordinator-plan',()=>{plan();message('Plan reviewed in browser memory. It is not saved to a server or browser storage.');});
wire('register-coordinator-wallet',async()=>{
 const check=guard(),file=$('coordinator-registration').files[0];if(!file||file.size>300000)throw Error('Choose a public registration JSON file, never a wallet backup');
 const payload=JSON.parse(await file.text());check();const pending=[payload];while(pending.length){const v=pending.pop();if(v&&typeof v==='object')for(const [k,x]of Object.entries(v)){if(/seed|mnemonic|private|secret|password|wif|xprv|tprv/i.test(k))throw Error('Secret-bearing fields prohibited');pending.push(x);}}
 const pin=$('public-wallet-pin').value.trim();if(!/^[0-9a-f]{64}$/.test(pin))throw Error('Supply the independently verified wallet digest');
 const wallet=E.verifyWalletRegistration(payload.registration,pin);E.verifyServiceWallet(wallet);const keys=E.deriveRecoveryPublicKeys(payload.creatorAccount,1);
 if(E.canonical(wallet.creator)!==E.canonical(keys.funding)||E.canonical(wallet.change)!==E.canonical(keys.destination))throw Error('Creator public export differs from registered funding/change keys');
 const discovery={publicAccount:payload.beneficiaryAccount,index:payload.discoveryIndex};
 // Use the same transaction/profile validation without inventing funding.
 E.deriveRecoveryPublicKeys(discovery.publicAccount,discovery.index).recipient.slice(0,wallet.recipient.length).forEach((k,i)=>{if(E.canonical(k)!==E.canonical(wallet.recipient[i]))throw Error('Beneficiary export does not match release keys');});
 check();reset();creatorSession.workflow.registration={wallet,discovery,pin};creatorSession.workflow.serviceURL=$('independent-service').value;
 await displayRegistration(creatorSession.workflow.registration);
});
async function displayRegistration(registration){
 E.verifyServiceWallet(registration.wallet);const wallet=registration.wallet;
 const address=E.address(wallet.creator);$('customer-payment-address').textContent=address;$('funding-test-address').textContent=address;$('funding-key-result').hidden=false;rows('gift-output-preview',plan().releases);
 $('service-public-key').value=wallet.service.publicKeyHex;$('jade-fingerprint').value=wallet.creator.masterFingerprintHex;
 await E.drawAddress($('customer-address-qr'),address);$('customer-address-qr').hidden=false;$('customer-qr-placeholder').hidden=true;$('copy-test-funding-address').disabled=false;
 $('copy-test-funding-address').onclick=()=>navigator.clipboard.writeText(address);unlock();message('Wallet identity and approved service destination verified locally. Review the full receiving address on your Jade before using disposable regtest funds. No production payment is enabled.');
}
wire('inspect-coordinator-funding',async()=>{clearPrepared();const f=await inspect();message('Read-only funding verified: '+f.utxos.reduce((s,u)=>s+u.valueSats,0)+' sats at height '+f.tip.height+'. '+(f.feeEstimate?'Independent fee estimate available.':'No live fee estimate; explicit fallback applies.'));unlock();});
wire('construct-unsigned',async()=>{
 clearPrepared();$('review-acknowledged').checked=false;const f=await inspect(),r=request(f);creatorSession.workflow.prepared=r;$('network-fee').value=String(r.feeSats);
 $('review-inputs').textContent=r.intent.inputs.length+' ('+r.fundingSats+' sats)';$('review-gifts').textContent=r.plan.releases.length+' ('+r.principalSats+' sats)';$('review-fee').textContent=String(r.feeSats);$('review-change').textContent=String(r.changeSats);$('review-hash').textContent=r.requestDigest;
 $('unsigned-review').hidden=false;$('review-acknowledged').disabled=false;$('handoff-jade').disabled=true;
 $('unsigned-status').textContent='Prepared locally: service '+r.serviceFeeSats+' sats; discovery '+r.discovery.valueSats+' sats at '+r.discovery.key.path+'; mining '+r.feeSats+' sats. '+(f.feeEstimate?'Independent service estimate.':'Explicit fallback, not a live fee quote.');
 message('Unsigned transaction prepared in browser memory. Review all amounts; nothing is signed or broadcast.');
});
$('review-acknowledged').addEventListener('change',()=>{const w=creatorSession.workflow;if(w.prepared&&$('review-acknowledged').checked){w.acknowledgement=w.prepared.requestDigest;$('handoff-jade').disabled=false;}else{delete w.acknowledgement;$('handoff-jade').disabled=true;}});
wire('handoff-jade',async()=>{
 const w=creatorSession.workflow,r=w.prepared;if(!r||w.acknowledgement!==r.requestDigest||!$('review-acknowledged').checked)throw Error('Acknowledge the exact prepared transaction');
 const f=await inspect(),fresh=request(f);if(fresh.requestDigest!==r.requestDigest)throw Error('Funding or fees changed. Prepare and review again.');
 w.handoff={digest:r.requestDigest,expiresAt:Date.now()+300000,consumed:false};location.assign('./jade-signing-workspace.html');
});
for(const id of ['derive-funding-key','scan-funding','inspect-funding','diagnostic-qr','diagnostic-scan','public-wallet-camera-start','network-fee','service-public-key','jade-fingerprint'])if($(id))$(id).disabled=true;

installCustomerWalletSetup({onRegistered:displayRegistration,onInvalidate:()=>{message('Wallet changed; funding, quotes, transactions and signing approvals invalidated.');}});

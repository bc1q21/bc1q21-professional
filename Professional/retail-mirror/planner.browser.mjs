import {previewFees,btcToSats,satsToBtc,invalidatePlannerState,publicScheduleDates,
 PLAN_KEY,DRAFT_KEY,SAVED_PLAN_KEY} from '../public-date-planner.mjs';
import {buildPlannerPreview,usdToSats,satsToUsdEntry,growthNumber,DEVELOPMENT_PRICE} from '../planner-amounts.mjs';
import {createDisclaimerGate} from '../disclaimer-gate.mjs';
import {DISCLAIMER_POLICY} from '../disclaimer-policy.mjs';
import {renderPlannerBrand} from '../professional-branding.mjs';
const $=id=>document.getElementById(id);
const legalGate=createDisclaimerGate(DISCLAIMER_POLICY);let legalVersion=null,legalUrl=null;
function requireLegalGate(){if(!legalGate.canContinue())throw Error('Review and explicitly accept the approved Professional disclaimer before continuing.');}
const form=$('planner');let reviewed=null,available=true,inputSnapshot=null,panel='welcome',initialized=false,finalReview=false;
let amountUnit='BTC',projectionAsOf=new Date().toISOString();
const money=sats=>'$'+(sats/100000000*80000).toFixed(2);
function values(){
 let btc=$('btc').value;
 if(amountUnit==='USD'){try{btc=satsToBtc(usdToSats($('usd').value));}catch{btc='';}}
 return {btc,giftType:form.elements.giftType.value,
 count:Number($('count').value),period:$('period').value,start:$('start').value,
 allocation:form.elements.allocation.value,manual:$('manual').value,
 decisionVersion:2,amountUnit,strategy:form.elements.strategy.value,usd:$('usd').value,growth:$('growth').value,projectionAsOf};
}
function chooseAllocation(value){form.elements.allocation.value=value;}
const titles={welcome:'Welcome',amount:'Plan Your Gift',type:'How would you like to give?',
 schedule:'Choose the release dates',allocation:'Plan Your Gift',strategy:'How should we set the amounts?',
 manual:'Your gift plan',growth:'Optional: growth guess'};
function steps(){const v=values();return ['welcome','amount','type','schedule',
 ...(v.giftType==='one'?[]:['allocation',...(!v.allocation||v.allocation==='equal'?[]:
 ['strategy',v.allocation==='manual'?'manual':'growth'])])];}
function renderPanels(){
 const route=steps();if(!route.includes(panel))panel='amount';
 for(const element of document.querySelectorAll('[data-panel]'))element.hidden=element.dataset.panel!==panel;
 const last=panel===route.at(-1),branch=['type','allocation'].includes(panel);
 $('plan-next').hidden=last&&!branch;$('review').hidden=!last||branch;
 const v=values();
 $('plan-next').disabled=!initialized||!legalGate.canContinue()||(panel==='type'&&!v.giftType)||(panel==='allocation'&&!v.allocation)||(panel==='strategy'&&!form.elements.strategy.value);$('review').disabled=!initialized||!legalGate.canContinue();
 for(const button of document.querySelectorAll('[data-gift],#choose-equal,#choose-variable'))button.disabled=!initialized;
 $('stage-heading').textContent=titles[panel];
 $('plan-back').textContent='Back';$('plan-back').setAttribute('aria-label',panel==='welcome'?'Back to Professional identity':'Back');
}
function showPanel(next){panel=next;renderPanels();$('stage-heading').focus();}
function nextPanel(){
 try{
  const v=values();
  requireLegalGate();
  if(panel==='type'){if(!v.giftType)throw Error('Choose a gift type.');$('status').textContent='';showPanel('schedule');return;}
  if(panel==='allocation'){
   if(!v.allocation)throw Error('Choose equal or different amounts.');
   if(v.allocation==='equal'){reviewPlan();return;}
   $('status').textContent='';showPanel('strategy');return;
  }
  if(panel==='amount'){
   if(amountUnit==='USD')usdToSats($('usd').value);
   btcToSats(v.btc);
  }
  if(panel==='schedule')publicScheduleDates(v.start,v.giftType==='one'?1:v.count,v.period);
  if(panel==='strategy'&&!form.elements.strategy.value)throw Error('Choose how to set the amounts.');
  if(panel==='strategy'&&v.allocation==='manual'&&!$('manual').value.trim()){
   const initial=buildPlannerPreview({...v,allocation:'equal'}).plan;
   $('manual').value=initial.releases.map(r=>r.date+', '+satsToBtc(r.amountSats)).join('\n');
   changed();update();
  }
  const route=steps(),index=route.indexOf(panel);
  if(index===route.length-1){reviewPlan();return;}
  $('status').textContent='';showPanel(route[index+1]);
 }catch(error){$('status').textContent=error.message;$('status').scrollIntoView({block:'center'});}
}
$('plan-next').addEventListener('click',nextPanel);
$('plan-back').addEventListener('click',()=>{
 revoke();const route=steps(),index=route.indexOf(panel);
 if(index===0){window.location.assign('../index.html');return;}
 $('status').textContent='';showPanel(route[index-1]);
});
function revoke(){
 reviewed=null;finalReview=false;$('plan-ready').hidden=true;$('schedule-review').hidden=true;$('approve').disabled=true;form.hidden=false;
 $('review-status').textContent='';renderPanels();
 try{invalidatePlannerState(creatorMemory,creatorMemory);}
 catch{available=false;$('storage-warning').hidden=false;
  $('storage-warning').textContent='The in-memory creator session is unavailable. Restart the creator wizard.';}
}
function update(){
 const v=values(),one=v.giftType==='one';
 $('count-label').hidden=one;$('period-label').hidden=one;
 $('date-label').textContent=one?'First day they can claim':'First date';
 $('btc-label').hidden=amountUnit!=='BTC';$('usd-label').hidden=amountUnit!=='USD';
 for(const unit of ['BTC','USD']){
  const b=$('unit-'+unit.toLowerCase());b.className=unit===amountUnit?'btn-primary':'btn-outline';
  b.setAttribute('aria-pressed',String(unit===amountUnit));
 }
 for(const b of document.querySelectorAll('[data-gift]')){
  const active=b.dataset.gift===v.giftType;b.className=active?'btn-primary':'btn-outline';b.setAttribute('aria-pressed',String(active));
 }
 for(const [id,active] of [['choose-equal',v.allocation==='equal'],['choose-variable',v.allocation==='manual'||v.allocation==='suggest']]){
  $(id).className=active?'btn-primary':'btn-outline';$(id).setAttribute('aria-pressed',String(active));
 }
 renderPanels();
 try{$('usd-preview').textContent=amountUnit==='BTC'?money(btcToSats(v.btc)):satsToBtc(btcToSats(v.btc))+' BTC';}
 catch{$('usd-preview').textContent='';}
 try{
  const total=btcToSats(v.btc);$('manual-target').textContent=satsToBtc(total)+' BTC';$('manual-target-usd').textContent='≈ '+money(total)+' (development)';
  let sum=0;
  for(const line of v.manual.trim().split(/\r?\n/)){
   const fields=line.split(',').map(x=>x.trim());if(fields.length!==2)throw Error('Enter one date and BTC amount per line.');
   sum+=btcToSats(fields[1]);if(!Number.isSafeInteger(sum))throw Error('Manual total is outside safe limits.');
  }
  $('manual-current').textContent=satsToBtc(sum)+' BTC';$('manual-current-usd').textContent='≈ '+money(sum)+' (development)';
  $('manual-difference').textContent=sum===total?'✓ Totals match perfectly!':
   'Difference: '+(sum<total?'-':'+')+satsToBtc(Math.abs(sum-total))+' BTC ('+(sum-total).toLocaleString()+' sats).';
 }catch(error){$('manual-current').textContent='—';$('manual-current-usd').textContent='';$('manual-difference').textContent=error.message;}
 try{
  const g=growthNumber(v.growth)/100,p1=DEVELOPMENT_PRICE*(1+g),p5=DEVELOPMENT_PRICE*Math.pow(1+g,5);
  if(!Number.isFinite(p1)||!Number.isFinite(p5))throw Error('Projection outside safe limits.');
  $('growth-preview').textContent='Development price: $80,000/BTC • In 1 year: $'+p1.toFixed(2)+' • In 5 years: $'+p5.toFixed(2)+' / BTC (hypothetical).';
 }catch{$('growth-preview').textContent='Enter a finite, non-negative growth guess.';}
}
function changed(){
 // A control can emit input and then change for the same committed value.
 // A delayed duplicate must not erase a schedule just reviewed by the owner.
 const snapshot=JSON.stringify(values());
 if(snapshot===inputSnapshot)return;
 inputSnapshot=snapshot;
 revoke();update();$('status').textContent='Plan changed. Review and approve the schedule again.';
 try{creatorMemory.setItem(DRAFT_KEY,JSON.stringify(values()));}catch{available=false;}
}
function inputChanged(event){
 if(event.target.name==='strategy')chooseAllocation(event.target.value);
 if(event.target.id==='usd'&&amountUnit==='USD'){
  try{$('btc').value=satsToBtc(usdToSats($('usd').value));}catch{$('btc').value='';}
 }
 changed();
}
form.addEventListener('input',inputChanged);
form.addEventListener('change',inputChanged);
for(const unit of ['BTC','USD'])$('unit-'+unit.toLowerCase()).addEventListener('click',()=>{
 if(amountUnit===unit)return;
 const v=values();
 if(unit==='USD'){try{$('usd').value=satsToUsdEntry(btcToSats(v.btc));}catch{$('usd').value='';}}
 else $('btc').value=v.btc;
 amountUnit=unit;changed();update();
});
for(const b of document.querySelectorAll('[data-gift]'))b.addEventListener('click',()=>{
 form.elements.giftType.value=b.dataset.gift;changed();revoke();update();$('status').textContent='';
});
$('choose-equal').addEventListener('click',()=>{chooseAllocation('equal');changed();revoke();update();$('status').textContent='';});
$('choose-variable').addEventListener('click',()=>{
 chooseAllocation(form.elements.strategy.value||'manual');changed();revoke();update();$('status').textContent='';
});
for(const b of document.querySelectorAll('[data-growth]'))b.addEventListener('click',()=>{
 $('growth').value=b.dataset.growth;changed();update();
});
function reviewPlan(){
 revoke();
 try{
  requireLegalGate();
  const current=values();inputSnapshot=JSON.stringify(current);
  creatorMemory.setItem(DRAFT_KEY,inputSnapshot);
  const preview=buildPlannerPreview(current),plan=preview.plan,fees=globalThis.bc1q21CreatorEngine.betaFundingQuote(plan);const body=$('schedule-rows');body.replaceChildren();
  plan.releases.forEach((release,i)=>{
   const row=document.createElement('tr');
   const cells=[i+1,release.date,satsToBtc(release.amountSats),release.amountSats.toLocaleString(),preview.prices?'$'+preview.targetUsd.toFixed(2):money(release.amountSats)];
   if(preview.prices)cells.push('$'+preview.prices[i].toFixed(2));
   for(const text of cells){
    const cell=document.createElement('td');cell.textContent=text;row.append(cell);
   }body.append(row);
  });
  $('schedule-total').textContent=plan.totalSats.toLocaleString()+' sats';$('schedule-usd').textContent=money(plan.totalSats);
  $('gift-total').textContent=satsToBtc(plan.totalSats)+' BTC · '+plan.totalSats.toLocaleString()+' sats';
  $('release-count').textContent=String(plan.releases.length);
  $('service-fee').textContent=fees.serviceFeeSats.toLocaleString()+' sats · '+money(fees.serviceFeeSats);
  $('discovery-fee').textContent=fees.discoveryValueSats+' sats · beneficiary-owned';
  $('mining-fee').textContent=fees.estimatedMiningFeeSats.toLocaleString()+' sats · '+money(fees.estimatedMiningFeeSats);
  $('deposit-total').textContent=satsToBtc(fees.estimatedTotalSats)+' BTC · '+fees.estimatedTotalSats.toLocaleString()+' sats';
  $('projection-summary').hidden=!preview.prices;
  $('projection-price-heading').hidden=!preview.prices;$('projected-price-total').hidden=!preview.prices;
  $('schedule-usd-heading').textContent=preview.prices?'Projected USD*':'USD*';
  $('projection-summary').textContent=preview.prices?
   'Hypothetical growth guess: '+preview.growthPct+'%. Projected target per date: $'+preview.targetUsd.toFixed(2)+'. Reference time: '+projectionAsOf+'. These are estimates, not guaranteed returns.':'';
  $('schedule-usd').textContent=preview.prices?'$'+(preview.targetUsd*plan.releases.length).toFixed(2)+' projected':money(plan.totalSats);
  reviewed=plan;$('approve').disabled=true;$('schedule-review').hidden=false;form.hidden=true;
  $('stage-heading').textContent='Your gift plan';
  $('status').textContent='Review your public dates and exact satoshi amounts. No payment or signing is authorized.';
  $('review-status').textContent='';
  $('schedule-review').scrollIntoView({block:'start'});$('review-title').focus();
 }catch(error){
  $('status').textContent=error.message;
  $('status').scrollIntoView({block:'center'});
 }
}
// Review is a local UI action, not an HTML form navigation. Do not rely on a
// native submit action under the deliberately restrictive form-action CSP.
$('review').addEventListener('click',reviewPlan);
form.addEventListener('submit',event=>{event.preventDefault();nextPanel();});
form.addEventListener('keydown',event=>{
 if(event.key==='Enter'&&!event.isComposing&&event.target.matches('input:not([type="radio"])')){
  event.preventDefault();nextPanel();
 }
});
$('edit').addEventListener('click',()=>{const previous=steps().at(-1);revoke();showPanel(previous);$('status').textContent='Review and approve again after editing.';});
function assertReviewed(){
 requireLegalGate();
 if(!available||!reviewed)throw Error('Review the plan before approval.');
 const current=buildPlannerPreview(values()).plan;
 if(JSON.stringify(current)!==JSON.stringify(reviewed))throw Error('Plan changed. Review again.');
}
$('schedule-next').addEventListener('click',()=>{
 try{
  assertReviewed();finalReview=true;$('schedule-review').hidden=true;$('plan-ready').hidden=false;
  $('approve').disabled=false;$('stage-heading').textContent='Plan ready';
  $('plan-ready').scrollIntoView({block:'start'});$('ready-title').setAttribute('tabindex','-1');$('ready-title').focus();
 }catch(error){revoke();$('status').textContent=error.message;}
});
$('ready-back').addEventListener('click',()=>{
 // Going back is not authorization. Clear downstream state, then rebuild
 // the schedule from the same inputs using the one existing planner.
 reviewPlan();
});
$('approve').addEventListener('click',()=>{
 try{
  assertReviewed();
  if(!finalReview)throw Error('Complete the final review before approval.');
  // Clear prior transaction state even when the new public schedule is identical.
  const plan=reviewed;invalidatePlannerState(creatorMemory,creatorMemory);
  creatorMemory.setItem(PLAN_KEY,JSON.stringify(plan));
  creatorMemory.setItem(SAVED_PLAN_KEY,JSON.stringify(plan));
  creatorMemory.setItem('bc1q21-professional-return-allowed','yes');
  window.location.assign('../funding-workspace.html');
 }catch(error){revoke();$('status').textContent='Cannot approve: '+error.message;}
});
function restore(){
 try{
  const v=JSON.parse(creatorMemory.getItem(DRAFT_KEY)||'null');
  if(v&&typeof v==='object'){
   panel='amount';
   for(const key of ['btc','usd','count','period','start','manual','growth'])if(typeof v[key]==='string'||typeof v[key]==='number')$(key).value=String(v[key]);
   amountUnit=v.amountUnit==='USD'?'USD':'BTC';
   if(typeof v.projectionAsOf==='string'&&Number.isFinite(Date.parse(v.projectionAsOf)))projectionAsOf=v.projectionAsOf;
   form.elements.strategy.value=v.decisionVersion===2&&['manual','suggest'].includes(v.strategy)?v.strategy:'';
   for(const name of v.decisionVersion===2?['giftType','allocation']:[]){
    const input=[...form.elements[name]].find(el=>el.value===v[name]&&!el.disabled);if(input)input.checked=true;
   }
  }
  const profile=JSON.parse(creatorMemory.getItem('bc1q21-professional-profile-draft')||'null');
  renderPlannerBrand(document,profile);
 }catch{/* Corrupt drafts never create an approved plan. */}
 if(!legalGate.canContinue())panel='welcome';
 revoke();update();inputSnapshot=JSON.stringify(values());
}
// BFCache/back navigation must not revive review or transaction approval.
window.addEventListener('pageshow',restore);
restore();
initialized=true;renderPanels();
$('planner-startup').hidden=true;

$('disclaimer-acceptance').addEventListener('change',()=>{
 legalGate.setAcceptance({version:legalVersion,checked:$('disclaimer-acceptance').checked});
 revoke();update();
});
$('disclaimer-open').addEventListener('click',()=>{if(legalUrl)window.open(legalUrl,'_blank','noopener,noreferrer');});
void legalGate.prepare().then(document=>{
 if(!document){renderPanels();return;}
 legalVersion=document.version;
 legalUrl=document.url;
 $('disclaimer-download').href=legalUrl;$('disclaimer-download').hidden=false;
 const frame=window.document.createElement('iframe');frame.title='Approved Professional Liability Disclaimer';frame.src=legalUrl;
 $('disclaimer-frame').replaceChildren(frame);
 $('disclaimer-label').textContent=document.acceptanceText;
 $('disclaimer-open').disabled=false;$('disclaimer-open').textContent='Open full PDF';
 $('disclaimer-acceptance').checked=false;$('disclaimer-acceptance').disabled=false;
 $('legal-navigation-note').textContent='Explicit acceptance of this approved document is required before proceeding.';
 renderPanels();
}).catch(error=>{
 $('legal-status').textContent=error.message;$('disclaimer-acceptance').disabled=true;renderPanels();
});

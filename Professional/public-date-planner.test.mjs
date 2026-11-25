import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createPublicPlan,btcToSats,satsToBtc,publicScheduleDates,validatePublicPlan,
 previewFees,invalidatePlannerState,PLAN_KEY,DRAFT_KEY,SAVED_PLAN_KEY} from './public-date-planner.mjs';
import {retailSchedule} from './retail-date-policy-reference.mjs';
const example={btc:'0.00100000',count:5,period:'yearly',start:'2027-11-03'};
test('five annual releases have exact public dates, amounts and existing fee estimates',()=>{
 const plan=createPublicPlan(example);
 assert.deepEqual(plan.releases,Array.from({length:5},(_,i)=>({date:`${2027+i}-11-03`,amountSats:20000})));
 assert.equal(plan.totalSats,100000);
 assert.deepEqual(previewFees(plan),{serviceFeeSats:2000,estimatedMiningFeeSats:1750,estimatedTotalSats:103750});
 assert.equal(plan.status,'UNFUNDED_PREVIEW_NOT_SIGNABLE');
 for(const flag of ['signingAuthorized','fundingAuthorized','broadcastAuthorized'])assert.equal(plan[flag],false);
 assert.ok(Object.isFrozen(plan.releases[0]));
});
test('BTC is parsed as decimal integers without floating point rounding',()=>{
 assert.equal(btcToSats('0.00000547'),547);
 assert.equal(btcToSats('21000000'),2100000000000000);
 assert.equal(satsToBtc(100001),'0.00100001');
 for(const value of ['0','-1','1e-8','0.000000001','NaN','Infinity','1.000000000','21000001',1,null])assert.throws(()=>btcToSats(value));
});
test('equal remainder policy preserves every satoshi deterministically',()=>{
 const plan=createPublicPlan({...example,btc:'0.00100002'});
 assert.deepEqual(plan.releases.map(x=>x.amountSats),[20001,20001,20000,20000,20000]);
 assert.equal(plan.releases.reduce((s,r)=>s+r.amountSats,0),100002);
});
test('UTC rollover exactly matches repository calendar reference vectors',()=>{
 for(const [start,period,reference] of [['2032-02-29','yearly','year'],['2031-01-31','monthly','month'],['2031-12-31','monthly','month']])
  assert.deepEqual(publicScheduleDates(start,4,period),retailSchedule(start,4,reference));
});
test('manual allocation preserves documented five-release handover values',()=>{
 const amounts=[25944,22553,19613,17057,14833];
 const manual=amounts.map((n,i)=>`${2027+i}-11-03, ${satsToBtc(n)}`).join('\n');
 const plan=createPublicPlan({...example,allocation:'manual',manual});
 assert.deepEqual(plan.releases.map(r=>r.amountSats),amounts);
 assert.equal(plan.totalSats,100000);
 assert.throws(()=>createPublicPlan({...example,allocation:'manual',manual:manual.replace('0.00025944','0.00025945')}),/exactly match/);
});
test('single release retains the entire gift amount',()=>{
 assert.deepEqual(createPublicPlan({...example,giftType:'one',btc:'0.00000546'}).releases,[{date:'2027-11-03',amountSats:546}]);
});
test('dust, dates, release limits and unsupported allocation fail closed',()=>{
 for(const change of [{count:25},{count:0},{count:1.5},{start:'2031-02-29'},
  {start:'2105-12-31',count:2},{btc:'0.00000546'},{period:'weekly'},{allocation:'suggest'}])
  assert.throws(()=>createPublicPlan({...example,...change}));
 for(const dates of [['2030-01-01','2030-01-01'],['2031-01-01','2030-01-01']])
  assert.throws(()=>validatePublicPlan(dates.map(date=>({date,amountSats:1000})),2000));
 assert.throws(()=>validatePublicPlan([{date:'2030-01-01',amountSats:546.5}],546.5));
 assert.throws(()=>previewFees(createPublicPlan({...example,btc:'21000000'})),/supply limit/);
});
function storage(entries){const data=new Map(Object.entries(entries));return {
 get length(){return data.size},key:i=>[...data.keys()][i]??null,
 getItem:key=>data.get(key)??null,removeItem:key=>data.delete(key)};}
test('edits revoke every downstream context and local fallback, preserve identity/draft',()=>{
 const keys=[PLAN_KEY,'bc1q21-professional-diagnostic-jade-handoff',
  'bc1q21-professional-regtest-unsigned-preview','bc1q21-professional-verified-creator-preview',
  'bc1q21-professional-future-approval','bc1q21-professional-return-allowed'];
 const session=storage(Object.fromEntries([...keys,DRAFT_KEY,'bc1q21-professional-profile-draft','unrelated'].map(k=>[k,'x'])));
 const local=storage({[SAVED_PLAN_KEY]:'stale',unrelated:'keep'});
 invalidatePlannerState(session,local);
 for(const key of keys)assert.equal(session.getItem(key),null);
 for(const key of [DRAFT_KEY,'bc1q21-professional-profile-draft','unrelated'])assert.equal(session.getItem(key),'x');
 assert.equal(local.getItem(SAVED_PLAN_KEY),null);assert.equal(local.getItem('unrelated'),'keep');
});
test('planner resource/import graph resolves under Professional without wallet modules or external URLs',()=>{
 const root=new URL('./',import.meta.url),seen=new Set();
 function visit(url){
  assert.ok(url.href.startsWith(root.href),url.href);
  if(seen.has(url.href))return;seen.add(url.href);assert.ok(existsSync(url),url.href);
  if(url.pathname.endsWith('.png')){assert.deepEqual([...readFileSync(url).subarray(0,8)],[137,80,78,71,13,10,26,10]);return;}
  const source=readFileSync(url,'utf8');
  assert.doesNotMatch(source,/Frontend\/|(?:mnemonicToSeed|signCltvReleaseTx|sendrawtransaction|broadcastTransaction|fetch|XMLHttpRequest|WebSocket)\s*\(/);
  const refs=url.pathname.endsWith('.html')?[...source.matchAll(/(?:src|href)="([^"]+)"/g)].map(x=>x[1]):
   url.pathname.endsWith('.mjs')?[...source.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)].map(x=>x[1]):url.pathname.endsWith('.css')?[...source.matchAll(/url\(\s*["']?([^)'"]+)/g)].map(x=>x[1]).filter(x=>!x.startsWith('data:')):[];
  for(const ref of refs){
   // Navigation destinations are separately integrated pages, not planner dependencies.
   if(ref==='../index.html')continue;
   assert.match(ref,/^\./);visit(new URL(ref,url));
  }
 }
 visit(new URL('./retail-mirror/index.html',import.meta.url));
 assert.equal(seen.size,15);
 assert.ok(seen.has(new URL('./creator-memory.js',root).href));
 assert.ok(seen.has(new URL('./browser-integration/creator-browser.bundle.js',root).href));
 assert.ok(seen.has(new URL('./planner-amounts.mjs',root).href));
 const html=readFileSync(new URL('./retail-mirror/index.html',import.meta.url),'utf8');
 assert.match(html,/connect-src 'self';/);assert.match(html,/frame-src 'self' blob:/);assert.doesNotMatch(html,/connect-src[^;]*(?:https:|\*)/);assert.match(html,/form-action 'none'/);
 assert.doesNotMatch(html,/<iframe|<base|type="password"/);
});

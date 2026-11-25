import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {usdToSats,satsToUsdEntry,suggestedAllocation,buildPlannerPreview} from './planner-amounts.mjs';
import {publicScheduleDates,createPublicPlan,MAX_SATS} from './public-date-planner.mjs';
const asOf='2026-11-10T00:00:00.000Z';
const ref=JSON.parse(readFileSync(new URL('./reference/retail-suggested-allocation.json',import.meta.url)));
class FixedDate extends Date{constructor(...args){super(...(args.length?args:[asOf]));}}
// Test-only pinned public calculation, never loaded in the browser.
const reference=new Function('Date',`return ({${ref.method}});`)(FixedDate);

test('fixed-price USD uses decimal satoshi rounding and lossless unit switching',()=>{
 assert.equal(usdToSats('80.0016'),100002);
 assert.equal(usdToSats('0.0004'),1);
 assert.equal(usdToSats('0.0012'),2);
 for(const sats of [1,546,100002,100000001,MAX_SATS])
  assert.equal(usdToSats(satsToUsdEntry(sats)),sats);
 for(const bad of ['0','0.00039999','-1','Infinity','1e3','1,000','', '0.123456789','1680000000000.0008'])
  assert.throws(()=>usdToSats(bad),bad);
});
test('suggested golden vectors use the located reference, not equal-remainder rules',()=>{
 const dates=publicScheduleDates('2030-01-02',5,'yearly');
 assert.deepEqual(suggestedAllocation({totalSats:100002,dates,growth:'0',asOf}).plan.releases.map(r=>r.amountSats),
  [20000,20000,20000,20000,20002]);
 assert.deepEqual(suggestedAllocation({totalSats:100002,dates,growth:'10',asOf}).plan.releases.map(r=>r.amountSats),
  [23981,21803,19822,18016,16380]);
 assert.deepEqual(createPublicPlan({btc:'0.00100002',count:5,start:'2030-01-02',period:'yearly'}).releases.map(r=>r.amountSats),
  [20001,20001,20000,20000,20000]);
});
test('suggested amounts match pinned Retail calculation across dates, growth and totals',()=>{
 assert.equal(ref.blob,'8678771c7292e47532fc252640c75dca26c20577');
 let accepted=0;
 for(const start of ['2027-01-31','2030-01-02','2032-02-29'])
 for(const period of ['monthly','yearly'])for(const count of [1,5,24])
 for(const totalSats of [100002,100000000,2100000000000000])for(const growth of ['','0','5','10','20']){
  const dates=publicScheduleDates(start,count,period);
  const rows=reference.createEqualUsdSchedule.call({priceManager:{currentPrice:80000},generateDateSequence:()=>dates},
   totalSats/1e8,start,count,period,Number(growth));
  const expected=rows.map(r=>Math.round(r.btc*1e8));
  let actual;
  try{actual=suggestedAllocation({totalSats,dates,growth,asOf});}
  catch(error){
   assert.match(error.message,/546 satoshis|rounding is unsafe/);
   assert.ok(expected.some(s=>s<546)||expected.reduce((a,b)=>a+b,0)!==totalSats);
   continue;
  }
  accepted++;
  assert.deepEqual(actual.plan.releases.map(r=>r.amountSats),expected);
  assert.deepEqual(actual.prices,rows.map(r=>r.price));
  assert.equal(actual.targetUsd,rows[0].usd);
  assert.equal(actual.plan.releases.reduce((s,r)=>s+r.amountSats,0),totalSats);
  for(const flag of ['signingAuthorized','fundingAuthorized','broadcastAuthorized'])assert.equal(actual.plan[flag],false);
 }
 assert.ok(accepted>200);
});
test('projections reject invalid growth, numeric overflow, dust and unsafe reference times',()=>{
 const base={totalSats:100002,dates:publicScheduleDates('2030-01-02',5,'yearly'),asOf};
 for(const growth of ['-1','NaN','Infinity','1e300','abc'])assert.throws(()=>suggestedAllocation({...base,growth}));
 assert.throws(()=>suggestedAllocation({...base,growth:'9'.repeat(60)}),/limits|546|rounding/);
 assert.throws(()=>suggestedAllocation({...base,totalSats:546,growth:''}),/546/);
 assert.throws(()=>suggestedAllocation({...base,asOf:'invalid'}));
 assert.deepEqual(buildPlannerPreview({btc:'0.00100002',count:5,start:'2030-01-02',period:'yearly'}).plan,
  createPublicPlan({btc:'0.00100002',count:5,start:'2030-01-02',period:'yearly'}));
});

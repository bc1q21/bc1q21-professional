// Professional public-only UI calculations. No wallet, price API or signing.
import {btcToSats,satsToBtc,publicScheduleDates,validatePublicPlan,createPublicPlan} from './public-date-planner.mjs';
export const DEVELOPMENT_PRICE=80000;

export function usdToSats(value){
 if(typeof value!=='string'||value.length>40||!/^(?:0|[1-9]\d*)(?:\.\d{1,8})?$/.test(value))
  throw Error('Enter a positive USD amount with at most eight decimal places.');
 const [whole,fraction='']=value.split('.');
 const units=BigInt(whole)*100000000n+BigInt(fraction.padEnd(8,'0'));
 // Fixed $80,000/BTC reference: nearest satoshi, positive half-satoshi rounds up.
 // Decimal integers avoid binary floating-point conversion of customer amounts.
 const sats=Number((units+40000n)/80000n);
 btcToSats(satsToBtc(sats));
 return sats;
}
export function satsToUsdEntry(sats){
 btcToSats(satsToBtc(sats));
 // $80,000 / 100,000,000 = 8 / 10,000. Keep all digits on unit toggles.
 const units=BigInt(sats)*8n;
 return (units/10000n)+'.'+String(units%10000n).padStart(4,'0');
}
export function growthNumber(value){
 if(value==='')return 0;
 if(typeof value!=='string'||value.length>64||!/^\d+(?:\.\d+)?$/.test(value)||!Number.isFinite(Number(value)))
  throw Error('Enter a finite, non-negative annual growth guess.');
 return Number(value);
}
export function suggestedAllocation({totalSats,dates,growth='',asOf}){
 btcToSats(satsToBtc(totalSats));
 if(!Array.isArray(dates)||!dates.length||dates.length>24)throw Error('Choose 1–24 releases.');
 const now=Date.parse(asOf);
 if(typeof asOf!=='string'||!Number.isFinite(now))throw Error('A valid projection reference time is required.');
 const g=growthNumber(growth)/100;
 // Reference: SchedulePlanner.js blob 8678771c7292e47532fc252640c75dca26c20577,
 // createEqualUsdSchedule. Retain its growth model, year length, rounding and
 // last-release correction; use Professional's validated dates, never Retail's
 // different calendar generator. Frozen asOf keeps review/approval deterministic.
 const prices=dates.map(date=>{
  const years=Math.max(0,(Date.parse(date+'T00:00:00Z')-now)/(365.25*24*60*60*1000));
  const price=DEVELOPMENT_PRICE*Math.pow(1+g,years);
  if(!Number.isFinite(price)||price<=0)throw Error('Growth projection is outside safe numeric limits.');
  return price;
 });
 const totalBtc=Number(satsToBtc(totalSats));
 const denom=prices.reduce((sum,p)=>sum+1/p,0),targetUsd=totalBtc/denom;
 if(!Number.isFinite(targetUsd)||targetUsd<=0)throw Error('Unsafe projected allocation.');
 let usedSats=0,referenceUsedBtc=0;
 const releases=dates.map((date,index)=>{
  const btc=index<dates.length-1?Number((targetUsd/prices[index]).toFixed(8)):
   Number((totalBtc-referenceUsedBtc).toFixed(8));
  const referenceSats=Math.round(btc*100000000);
  const amountSats=index<dates.length-1?referenceSats:totalSats-usedSats;
  // Do not silently replace the reference rounding at unsafe magnitudes.
  if(!Number.isSafeInteger(referenceSats)||referenceSats!==amountSats)
   throw Error('Suggested rounding is unsafe for this amount. Choose equal or manual amounts.');
  referenceUsedBtc+=btc;usedSats+=amountSats;
  return {date,amountSats};
 });
 const plan=validatePublicPlan(releases,totalSats);
 return {plan,prices,targetUsd:Number(targetUsd.toFixed(2)),growthPct:g*100,asOf};
}
export function buildPlannerPreview(values){
 if(values.giftType==='multiple'&&values.allocation==='suggest'){
  return suggestedAllocation({totalSats:btcToSats(values.btc),
   dates:publicScheduleDates(values.start,values.count,values.period),
   growth:values.growth??'',asOf:values.projectionAsOf});
 }
 return {plan:createPublicPlan(values)};
}

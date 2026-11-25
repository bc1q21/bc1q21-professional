// Public planning only. Integer satoshis; no wallet, encryption, RPC or signing.
import {retailDateToCltvTimestamp} from './retail-calendar-cltv.mjs';
export const PLAN_KEY='bc1q21-professional-approved-plan-preview';
export const DRAFT_KEY='bc1q21-professional-public-planner-draft-v1';
export const SAVED_PLAN_KEY='bc1q21-professional-last-approved-plan-preview';
export const MAX_SATS=2100000000000000;
export function btcToSats(value) {
 if(typeof value!=='string'||! /^(?:0|[1-9]\d{0,7})(?:\.\d{1,8})?$/.test(value))
  throw Error('Enter BTC with at most eight decimal places.');
 const [whole,fraction='']=value.split('.');
 const sats=Number(BigInt(whole)*100000000n+BigInt(fraction.padEnd(8,'0')));
 if(!Number.isSafeInteger(sats)||sats<=0||sats>MAX_SATS)throw Error('Invalid Bitcoin amount.');
 return sats;
}
export function satsToBtc(sats) {
 if(!Number.isSafeInteger(sats)||sats<0||sats>MAX_SATS)throw Error('Invalid satoshi amount.');
 return Math.floor(sats/100000000)+'.'+String(sats%100000000).padStart(8,'0');
}
// Preserve the repository's documented UTC overflow policy, including Jan 31
// -> March 3 and Feb 29 -> March 1; never substitute month-end clamping.
export function publicScheduleDates(start,count,period) {
 if(!Number.isInteger(count)||count<1||count>24)throw Error('Choose 1–24 releases.');
 if(!['monthly','yearly'].includes(period))throw Error('Choose monthly or yearly dates.');
 const dates=[];let date=start;
 for(let i=0;i<count;i++) {
  retailDateToCltvTimestamp(date);
  if(date>'2105-12-31')throw Error('Release dates must be no later than 2105-12-31.');
  dates.push(date);
  const current=new Date(date+'T00:00:00Z');
  date=new Date(Date.UTC(current.getUTCFullYear()+(period==='yearly'?1:0),
   current.getUTCMonth()+(period==='monthly'?1:0),current.getUTCDate())).toISOString().slice(0,10);
 }
 return dates;
}
export function validatePublicPlan(releases,totalSats) {
 if(!Array.isArray(releases)||releases.length<1||releases.length>24||
    !Number.isSafeInteger(totalSats)||totalSats<=0||totalSats>MAX_SATS)throw Error('Invalid gift total or release count.');
 let sum=0;
 const copy=releases.map((row,i)=>{
  retailDateToCltvTimestamp(row?.date);
  if(row.date>'2105-12-31'||(i&&row.date<=releases[i-1].date))throw Error('Dates must be valid and strictly increasing.');
  if(!Number.isSafeInteger(row.amountSats)||row.amountSats<546)throw Error('Each release must be at least 546 satoshis.');
  sum+=row.amountSats;
  return Object.freeze({date:row.date,amountSats:row.amountSats});
 });
 if(!Number.isSafeInteger(sum)||sum!==totalSats)throw Error('Release amounts must exactly match the gift total.');
 return Object.freeze({format:'bc1q21-professional-retail-plan-preview-v1',
  status:'UNFUNDED_PREVIEW_NOT_SIGNABLE',releases:Object.freeze(copy),totalSats,
  signingAuthorized:false,fundingAuthorized:false,broadcastAuthorized:false});
}
export function createPublicPlan({btc,giftType='multiple',count,period,start,allocation='equal',manual=''}) {
 const total=btcToSats(btc);
 if(!['one','multiple'].includes(giftType))throw Error('Choose one-time or multiple dates.');
 let releases;
 if(giftType==='multiple'&&allocation==='manual') {
  if(typeof manual!=='string'||manual.length>10000)throw Error('Invalid manual schedule.');
  releases=manual.trim().split(/\r?\n/).map(line=>{
   const fields=line.split(',').map(x=>x.trim());
   if(fields.length!==2)throw Error('Enter one YYYY-MM-DD, BTC pair per line.');
   return {date:fields[0],amountSats:btcToSats(fields[1])};
  });
 }else {
  if(allocation!=='equal'&&giftType!=='one')throw Error('Suggested allocation needs an approved source specification.');
  const dates=publicScheduleDates(start,giftType==='one'?1:count,period);
  const base=Math.floor(total/dates.length),remainder=total%dates.length;
  // Explicit independent policy: remainder sats go to the earliest releases.
  releases=dates.map((date,i)=>({date,amountSats:base+(i<remainder?1:0)}));
 }
 return validatePublicPlan(releases,total);
}
export function previewFees(plan) {
 validatePublicPlan(plan.releases,plan.totalSats);
 const serviceFeeSats=1000+250*(plan.releases.length-1);
 const estimatedMiningFeeSats=500+250*plan.releases.length;
 if(plan.totalSats+serviceFeeSats+estimatedMiningFeeSats>MAX_SATS)
  throw Error('Gift plus estimated fees exceeds the Bitcoin supply limit.');
 return Object.freeze({serviceFeeSats,estimatedMiningFeeSats,
  estimatedTotalSats:plan.totalSats+serviceFeeSats+estimatedMiningFeeSats});
}
// Remove all Professional transaction/approval context, including future keys.
// Retain only optional identity and the editable public draft. Local fallback
// must also be removed or Add Funds could resurrect the old approved schedule.
export function invalidatePlannerState(session,local) {
 const keep=new Set(['bc1q21-professional-profile-draft',DRAFT_KEY]);
 const keys=Array.from({length:session.length},(_,i)=>session.key(i));
 for(const key of keys)if(key?.startsWith('bc1q21-professional-')&&!keep.has(key))session.removeItem(key);
 local.removeItem(SAVED_PLAN_KEY);
}

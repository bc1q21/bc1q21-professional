// Customer-selected network only. All transaction validation remains local.
import {independentServiceURL} from './creator-independent-service.mjs';
export function transactionNetwork({url,engine,applicationOrigin,fetcher=fetch}){
 const base=independentServiceURL(url,applicationOrigin);
 async function request(path,{raw,optional=false}={}){
  const r=await fetcher(base+path,{method:raw===undefined?'GET':'POST',body:raw,headers:raw===undefined?{}:{'Content-Type':'text/plain'},credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(20000)});
  const text=await r.text();if(text.length>2000000)throw Error('Oversize Bitcoin service response');
  if(optional&&r.status===404)return null;
  if(!r.ok)throw Error('Bitcoin service HTTP '+r.status+': '+text.slice(0,160));return text;
 }
 async function tip(){
  if(await request('/block-height/0')!==engine.GENESIS)throw Error('Regtest genesis required');
  const hash=await request('/blocks/tip/hash');if(!/^[0-9a-f]{64}$/.test(hash))throw Error('Invalid tip');
  const b=JSON.parse(await request('/block/'+hash));if(b.id!==hash||!Number.isSafeInteger(b.height)||!Number.isSafeInteger(b.mediantime))throw Error('Invalid tip evidence');return {...b,hash};
 }
 async function observe(raw){
  const expected=engine.decodeTransaction(raw),t=await tip();const text=await request('/tx/'+expected.txid+'/status',{optional:true});if(text===null)return {state:'NOT OBSERVED',txid:expected.txid,tip:t};
  const status=JSON.parse(text),chainRaw=await request('/tx/'+expected.txid+'/hex');
  if(chainRaw!==raw||engine.decodeTransaction(chainRaw).txid!==expected.txid)throw Error('Observed transaction bytes differ');
  if(status.confirmed!==true)return {state:'MEMPOOL OBSERVED',txid:expected.txid,confirmations:0,tip:t};
  const b=JSON.parse(await request('/block/'+status.block_hash+'/status'));
  if(b.in_best_chain!==true||!Number.isSafeInteger(status.block_height)||status.block_height>t.height)throw Error('Transaction confirmation reorganized or invalid');
  if(await request('/blocks/tip/hash')!==t.hash)throw Error('Chain changed; refresh');
  return {state:'CONFIRMED',txid:expected.txid,blockHash:status.block_hash,confirmations:t.height-status.block_height+1,tip:t};
 }
 return {request,tip,observe,async submit({raw,state,revalidate}){
  if(state.attempted)throw Error('Submission already attempted; reconcile before any retry');
  const prior=await observe(raw);if(prior.state!=='NOT OBSERVED'){state.attempted=true;Object.assign(state,prior);return prior;}
  await revalidate();await tip();state.attempted=true;state.state='SUBMISSION UNKNOWN';
  try{const txid=await request('/tx',{raw});if(txid!==engine.decodeTransaction(raw).txid)throw Error('Unexpected submission TXID');}
  catch(e){state.error=e.message;try{const found=await observe(raw);if(found.state!=='NOT OBSERVED'){Object.assign(state,found);return found;}}catch{}throw Error('Submission outcome uncertain/rejected: '+e.message+'. Refresh status; do not resend automatically.');}
  const result=await observe(raw);Object.assign(state,result);return result;
 }};
}

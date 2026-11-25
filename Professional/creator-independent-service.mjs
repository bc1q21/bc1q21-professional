// Read-only independent Esplora connection. Never a bc1q21 relay or coordinator.
export function independentServiceURL(value,applicationOrigin){
 const u=new URL(value);
 if(u.username||u.password||u.search||u.hash||u.origin===applicationOrigin||/(^|\.)bc1q21\.com$/i.test(u.hostname))throw Error('Choose an independent service, not this application or bc1q21');
 if(u.protocol!=='https:'&&!(u.protocol==='http:'&&['127.0.0.1','localhost','[::1]'].includes(u.hostname)))throw Error('Use HTTPS, or a local-only HTTP regtest service');
 return u.href.replace(/\/$/,'');
}
export async function inspectIndependentFunding({url,wallet,outpoints,engine,applicationOrigin,fetcher=fetch}){
 const base=independentServiceURL(url,applicationOrigin),get=async(path,text=false)=>{
  const r=await fetcher(base+path,{method:'GET',credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(15000)});
  if(!r.ok)throw Error('Independent service unavailable: HTTP '+r.status);
  const data=await r.text();if(data.length>2000000)throw Error('Service response too large');return text?data.trim():JSON.parse(data);
 };
 if(await get('/block-height/0',true)!==engine.GENESIS)throw Error('Only isolated Bitcoin regtest is supported');
 const tip=await get('/blocks/tip/hash',true);if(!/^[0-9a-f]{64}$/.test(tip))throw Error('Invalid independent chain tip');
 const block=await get('/block/'+tip);if(block.id!==tip||!Number.isSafeInteger(block.height)||block.height<0)throw Error('Invalid independent tip evidence');
 const address=engine.address(wallet.creator),script=engine.keyScript(wallet.creator),all=await get('/address/'+encodeURIComponent(address)+'/utxo');
 if(!Array.isArray(all)||all.length>1000)throw Error('Unsupported funding response');
 const confirmed=all.filter(u=>u.status?.confirmed===true);
 let selected=confirmed;
 if(outpoints?.length){selected=outpoints.map(o=>{const matches=confirmed.filter(u=>u.txid===o.txid&&u.vout===o.vout);if(matches.length!==1)throw Error('Selected funding output is missing, unconfirmed or ambiguous');return matches[0];});}
 if(!selected.length||selected.length>20)throw Error('Select 1–20 confirmed regtest funding outputs');
 const seen=new Set(),inputs=[];
 for(const u of selected){
  if(!/^[0-9a-f]{64}$/.test(u.txid)||!Number.isSafeInteger(u.vout)||u.vout<0||!Number.isSafeInteger(u.value)||u.value<=0)throw Error('Invalid funding outpoint');
  const id=u.txid+':'+u.vout;if(seen.has(id))throw Error('Duplicate funding outpoint');seen.add(id);
  const fundingTxHex=await get('/tx/'+u.txid+'/hex',true),raw=engine.decodeTransaction(fundingTxHex),o=raw.outputs[u.vout];
  if(raw.txid!==u.txid||!o||o.scriptPubKeyHex!==script||o.valueSats!==u.value)throw Error('Funding raw transaction, script or amount mismatch');
  const status=await get('/tx/'+u.txid+'/status');
  if(status.confirmed!==true||!Number.isSafeInteger(status.block_height)||status.block_height<0||status.block_height>block.height||!/^[0-9a-f]{64}$/.test(status.block_hash))throw Error('Funding not confirmed');
  if((await get('/block/'+status.block_hash+'/status')).in_best_chain!==true)throw Error('Funding block was reorganized');
  const spent=await get('/tx/'+u.txid+'/outspends');if(!Array.isArray(spent)||spent[u.vout]?.spent!==false)throw Error('Funding output spent or unavailable');
  inputs.push({txid:u.txid,vout:u.vout,valueSats:o.valueSats,scriptPubKeyHex:script,fundingTxHex});
 }
 let feeEstimate=null;try{const rates=await get('/fee-estimates'),n=Math.ceil(rates['6']),l=Math.ceil(rates['12']);if(Number.isSafeInteger(n)&&n>=1&&n<=1000&&Number.isSafeInteger(l)&&l>=1&&l<=1000)feeEstimate={success:true,normal:{sat_vb:n},low_priority:{sat_vb:l}};}catch{/* Explicit fallback; never described as a live quote. */}
 if(await get('/blocks/tip/hash',true)!==tip)throw Error('Chain changed during funding verification; refresh');
 return {url:base,address,utxos:inputs,feeEstimate,tip:{hash:tip,height:block.height},observedAt:Date.now(),source:'CUSTOMER_SELECTED_INDEPENDENT_SERVICE',consensusIndependentlyValidated:false};
}

// Public data and temporary memory only. Independent regtest service selected by user.
export async function verifyBeneficiaryReleases({releases,account,network,engine}){
 const keys=engine.deriveRecoveryPublicKeys(account,1),start=await network.tip(),out=[];
 // Validate scripts/amounts as a group so an economical accumulated claim is
 // not rejected merely because one release cannot pay a standalone fee.
 for(const txid of new Set(releases.map(r=>r.txid))){const group=releases.filter(r=>r.txid===txid);engine.prepareRecoveredClaim({creatorTxid:txid,creatorRawHex:group[0].rawTransactionHex,releases:group,destinationScriptHex:engine.keyScript(keys.destination)});}
 for(const r of releases){
  const index=keys.recipient.findIndex(k=>k.publicKeyHex===r.key.publicKeyHex&&k.path===r.key.path&&k.masterFingerprintHex===r.key.masterFingerprintHex);if(index<0)throw Error('Gift belongs to another beneficiary account');
  const raw=await network.request('/tx/'+r.txid+'/hex');if(raw!==r.rawTransactionHex)throw Error('Gift transaction bytes differ');
  const status=JSON.parse(await network.request('/tx/'+r.txid+'/status'));
  if(status.confirmed!==true||!Number.isSafeInteger(status.block_height)||status.block_height>start.height)throw Error('Gift funding not confirmed');
  if(JSON.parse(await network.request('/block/'+status.block_hash+'/status')).in_best_chain!==true)throw Error('Gift funding reorganized');
  const spends=JSON.parse(await network.request('/tx/'+r.txid+'/outspends'));
  // Exact CLTV script/value bindings were reconstructed above; freshness here
  // is still checked separately for every selected funding output.
  out.push({...r,unspent:spends[r.vout]?.spent===false,mature:r.locktime<start.mediantime,confirmations:start.height-status.block_height+1});
 }
 if((await network.tip()).hash!==start.hash)throw Error('Chain changed during verification');
 return out;
}
export async function discoverBeneficiary({account,network,engine,match,onProgress=()=>{}}){
 const tip=await network.tip(),txs=new Map();
 for(let index=1;index<=20;index++){
  onProgress('Checking recovery address '+index+' of 20');const keys=engine.deriveRecoveryPublicKeys(account,index),address=engine.address(keys.discovery);let cursor='',ended=false;const seen=new Set();
  for(let page=0;page<100;page++){
   const path='/address/'+address+'/txs'+(cursor?'/chain/'+cursor:'');const rows=JSON.parse(await network.request(path));if(!Array.isArray(rows)||rows.length>25)throw Error('Invalid address history');if(!rows.length){ended=true;break;}
   for(const row of rows){if(!/^[0-9a-f]{64}$/.test(row.txid)||seen.has(row.txid))throw Error('Invalid/looping history');seen.add(row.txid);const raw=await network.request('/tx/'+row.txid+'/hex'),tx=engine.decodeTransaction(raw);if(tx.txid!==row.txid)throw Error('Discovery TXID mismatch');if(tx.outputs.some(o=>o.scriptPubKeyHex===engine.keyScript(keys.discovery)&&o.valueSats>=546))txs.set(tx.txid,{raw,tx});}
   cursor=rows.at(-1).txid;
  }if(!ended)throw Error('History pagination bound reached');
 }
 const publicOutpoints=[];for(const [txid,{raw,tx}] of txs)tx.outputs.forEach((o,vout)=>{if(/^a914[0-9a-f]{40}87$/.test(o.scriptPubKeyHex))publicOutpoints.push({txid,vout,rawTransactionHex:raw});});
 onProgress('Matching public time-lock scripts locally; this can take several minutes.');
 const result=await match({publicAccount:account,publicOutpoints});
 if((await network.tip()).hash!==tip.hash)throw Error('Chain changed; repeat discovery');
 return verifyBeneficiaryReleases({releases:result.releases,account,network,engine});
}
export async function prepareBeneficiaryClaim({releases,account,network,engine}){
 if(!releases.length)throw Error('Select a release');const fresh=await verifyBeneficiaryReleases({releases,account,network,engine});
 if(fresh.some(r=>!r.unspent||!r.mature))throw Error('Selected releases are spent or immature');
 if(new Set(fresh.map(r=>r.txid)).size!==1)throw Error('Select releases from one gift transaction at a time');
 const keys=engine.deriveRecoveryPublicKeys(account,1);
 return engine.prepareRecoveredClaim({creatorTxid:fresh[0].txid,creatorRawHex:fresh[0].rawTransactionHex,releases:fresh.map(({unspent,mature,confirmations,...r})=>r),destinationScriptHex:engine.keyScript(keys.destination)});
}

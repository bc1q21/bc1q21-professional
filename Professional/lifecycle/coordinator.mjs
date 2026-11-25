// Trusted local regtest coordinator. Never imported by customer browser pages.
// RPC is a caller-authenticated Core adapter; lab authorization is NOT customer
// identity, hardware attestation, or permission to operate on any other network.
import assert from 'node:assert/strict';
import bitcoin from 'bitcoinjs-lib';
import {secp256k1} from '@noble/curves/secp256k1';
import {collectProfessionalCoreSnapshot} from '../core-readonly-snapshot.mjs';
import {validatePublicPlan} from '../public-date-planner.mjs';
import {verifyFundedJadeRegistration} from './jade-funded-registration.mjs';
import {verifyJadeRegistration} from './jade-registration.mjs';
import {verifyPriorJadePossession} from './prior-jade-possession.mjs';
import {GENESIS,canonical,digest,publicWallet,coreSats,sum,keyScript,prepareCreation,
 prepareClaim,finalizeCreation,finalizeClaim,recoveryManifest,validateRecovery} from './public-model.mjs';
export function verifyWalletRegistration(registration,independentWalletDigest){
 const wallet=publicWallet(registration.wallet),hash=digest(wallet);
 assert.equal(hash,independentWalletDigest,'Public wallet fingerprint must be independently pinned');
 assert.equal(registration.walletDigest,hash);
 const keys=[wallet.creator,wallet.change,wallet.service,...wallet.recipient];
 if(registration.priorFundedPossession!==undefined){
  assert.equal(registration.proofs,undefined,'Ambiguous registration proof formats');
  assert.equal(registration.signedRegistrationPsbtBase64,undefined,'Ambiguous registration proof formats');
  const p=registration.priorFundedPossession;
  assert.deepEqual(Object.keys(p).sort(),['unsignedPsbtBase64','signedPsbtBase64','independentUnsignedSha256'].sort());
  verifyPriorJadePossession({...p,wallet,independentWalletDigest});
  return wallet;
 }
 if(registration.signedRegistrationPsbtBase64!==undefined){
  assert.equal(registration.proofs,undefined,'Ambiguous registration proof formats');
  if(registration.fundedRegistrationRequest!==undefined){
   verifyFundedJadeRegistration({request:registration.fundedRegistrationRequest,independentRequestDigest:registration.fundedRegistrationRequestDigest,independentWalletDigest,signedPsbtBase64:registration.signedRegistrationPsbtBase64});
  }else verifyJadeRegistration(wallet,independentWalletDigest,registration.signedRegistrationPsbtBase64);
  return wallet;
 }
 assert.equal(registration.proofs.length,keys.length);
 // Possession binds all public roles to this regtest registration; it does not
 // establish a person's legal identity or attest a hardware device.
 keys.forEach((k,i)=>assert.ok(secp256k1.verify(registration.proofs[i],hash,k.publicKeyHex,{lowS:true}),'Wallet possession proof failed'));
 return wallet;
}
export async function assertRegtest(rpc){
 const chain=await rpc('getblockchaininfo',[]);
 assert.equal(chain.chain,'regtest','Only isolated regtest permitted');
 assert.equal(await rpc('getblockhash',[0]),GENESIS,'Wrong regtest genesis');
 assert.equal(chain.initialblockdownload,false,'Core is not synchronized');
 return chain;
}
export async function confirmedOutpoints(rpc,outpoints){
 await assertRegtest(rpc);const checked=[];let tip=null;
 for(const o of outpoints){
  const s=await collectProfessionalCoreSnapshot({rpc,txid:o.txid,vout:o.vout});
  if(tip===null)tip=s.chainTip.bestblockhash;
  assert.equal(s.chainTip.bestblockhash,tip,'Chain changed across funding inspection');
  const txo=s.coreEvidence.transaction.vout[o.vout],u=s.coreEvidence.txout;
  assert.equal(coreSats(txo.value),o.valueSats,'Confirmed output amount mismatch');
  assert.equal(txo.scriptPubKey.hex,o.scriptPubKeyHex,'Confirmed output script mismatch');
  assert.equal(coreSats(u.value),o.valueSats,'Unspent output amount mismatch');
  assert.equal(u.scriptPubKey.hex,o.scriptPubKeyHex,'Unspent output script mismatch');
  checked.push({...o,confirmations:u.confirmations,tip:s.chainTip});
 }
 assert.equal(await rpc('getbestblockhash',[]),tip,'Chain changed after funding inspection');return checked;
}
export async function recoverPublicGift({manifest,independentDigest,rpc}){
 manifest=JSON.parse(canonical(manifest));
 const body=validateRecovery(manifest,independentDigest);await assertRegtest(rpc);
 const start=await rpc('getbestblockhash',[]),chain=await rpc('getblockchaininfo',[]);
 const raw=await rpc('getrawtransaction',[body.creatorTxid,true]);
 assert.equal(raw.hex,body.creatorRawHex,'Recovery creator transaction differs from chain');
 assert.ok(raw.confirmations>=1&&raw.blockhash,'Creator transaction not confirmed');
 const block=await rpc('getblockheader',[raw.blockhash,true]);
 assert.ok(block.confirmations>=1&&block.confirmations===raw.confirmations&&chain.blocks-block.height+1===raw.confirmations,'Recovery creator is not on sampled active chain');
 const header=await rpc('getblockheader',[start,true]);assert.equal(header.confirmations,1);
 assert.equal(chain.bestblockhash,start,'Recovery chain info tip mismatch');
 assert.equal(chain.blocks,header.height,'Recovery chain height mismatch');
 const creator=bitcoin.Transaction.fromHex(body.creatorRawHex);let actualInputSats=0;
 for(const vin of creator.ins){
  const priorId=Buffer.from(vin.hash).reverse().toString('hex');
  const prior=await rpc('getrawtransaction',[priorId,true]);
  const priorTx=bitcoin.Transaction.fromHex(prior.hex);assert.equal(priorTx.getId(),priorId);
  const output=priorTx.outs[vin.index];assert.ok(output,'Recovery creator input missing');
  assert.equal(output.script.toString('hex'),keyScript(body.wallet.creator),'Recovery creator input belongs to wrong wallet');
  actualInputSats=sum([actualInputSats,output.value]);
 }
 assert.equal(actualInputSats,body.ledger.fundingSats,'Recovery actual funding inputs differ from ledger');
 assert.equal(actualInputSats-sum(creator.outs.map(o=>o.value)),body.ledger.creatorFeeSats,'Recovery actual mining fee differs from ledger');
 const releases=[];
 for(const r of body.releases){
  const output=await rpc('gettxout',[body.creatorTxid,r.vout,true]);
  if(output){
   assert.equal(output.bestblock,start,'Recovery UTXO tip mismatch');
   assert.equal(coreSats(output.value),r.valueSats);assert.equal(output.scriptPubKey.hex,r.scriptPubKeyHex);
   assert.equal(output.confirmations,raw.confirmations);
  }
  releases.push({releaseNumber:r.vout+1,status:output?'CONFIRMED_UNSPENT':'UNAVAILABLE_SPENT_OR_MEMPOOL_SPEND',
   valueSats:r.valueSats,mature:header.mediantime>r.locktime,locktime:r.locktime});
 }
 assert.equal(await rpc('getbestblockhash',[]),start,'Recovery chain changed');
 return {creatorTxid:body.creatorTxid,independentDigestMatches:true,chainTip:start,
  medianTimePast:header.mediantime,releases,
  unspentPrincipalSats:sum(releases.filter(r=>r.status==='CONFIRMED_UNSPENT').map(r=>r.valueSats)),
  signingAuthorized:false,broadcastAuthorized:false};
}
export function approveCreatorPlan(plan){
 const approved=validatePublicPlan(plan.releases,plan.totalSats);
 return {plan:approved,planDigest:digest(approved)};
}
export class RegtestGiftCoordinator{
 #rpc;#wallet;#plan;#revision=0;#requests=new Map();#lab;
 constructor({rpc,registration,independentWalletDigest,isolatedRegtestAuthorization=false}){
  assert.equal(typeof rpc,'function');this.#rpc=rpc;
  this.#wallet=verifyWalletRegistration(registration,independentWalletDigest);
  this.#lab=isolatedRegtestAuthorization===true;
 }
 approvePlan(plan){
  this.#plan=approveCreatorPlan(plan).plan;this.#revision++;
  this.#requests.clear();return digest(this.#plan);
 }
 #remember(body){
  const request={format:'professional-offline-signing-request-v1',network:'regtest',genesis:GENESIS,
   revision:this.#revision,...JSON.parse(canonical(body))};
  const id=digest(request);this.#requests.set(id,{request,consumed:false});
  return JSON.parse(canonical({...request,requestDigest:id}));
 }
 async create({utxos,rate=2,feeEstimate=null,approvedPlanDigest}){
  utxos=JSON.parse(canonical(utxos));
  if(feeEstimate!==null)feeEstimate=JSON.parse(canonical(feeEstimate));
  assert.ok(this.#plan,'Approve a plan first');assert.equal(digest(this.#plan),approvedPlanDigest,'Plan approval changed');
  const revision=this.#revision,plan=this.#plan;
  await confirmedOutpoints(this.#rpc,utxos);
  assert.equal(this.#revision,revision,'Plan changed during funding inspection');
  return this.#remember(prepareCreation({plan,wallet:this.#wallet,utxos,rate,feeEstimate}));
 }
 async claim({manifest,independentDigest,releaseNumbers,destinationScriptHex,rate=2}){
  manifest=JSON.parse(canonical(manifest));releaseNumbers=[...releaseNumbers];
  const revision=this.#revision;
  const recovered=await recoverPublicGift({manifest,independentDigest,rpc:this.#rpc});
  assert.equal(digest(manifest.wallet),digest(this.#wallet),'Recipient wallet does not match registered wallet');
  for(const n of releaseNumbers){const r=recovered.releases[n-1];assert.ok(r&&r.status==='CONFIRMED_UNSPENT'&&r.mature,'Release is spent, unconfirmed, or immature');}
  assert.equal(this.#revision,revision,'Authorization changed during recovery');
  return this.#remember(prepareClaim({manifest,releaseNumbers,destinationScriptHex,rate}));
 }
 async broadcastSigned({requestDigest,signedPsbtBase64,explicitRequestApproval}){
  assert.equal(this.#lab,true,'Regtest execution must be explicitly authorized');
  assert.equal(explicitRequestApproval,requestDigest,'Exact request approval required');
  const entry=this.#requests.get(requestDigest);
  assert.ok(entry&&!entry.consumed,'Unknown, invalidated, or already consumed request');
  const r=entry.request;
  assert.equal(r.revision,this.#revision,'Plan changed; downstream authorization invalid');
  await assertRegtest(this.#rpc);
  const final=r.kind==='create'?finalizeCreation(r,signedPsbtBase64):finalizeClaim(r,signedPsbtBase64);
  const inputs=r.kind==='create'?r.intent.inputs:r.releases.map(x=>({txid:bitcoin.Transaction.fromHex(r.creatorRawHex).getId(),vout:x.vout,valueSats:x.valueSats,scriptPubKeyHex:x.scriptPubKeyHex}));
  const checked=await confirmedOutpoints(this.#rpc,inputs);
  if(r.kind==='claim')assert.ok(r.releases.every(x=>checked[0].tip.mediantime>x.locktime),'CLTV maturity changed');
  const mempool=await this.#rpc('testmempoolaccept',[[final.rawTransactionHex]]);
  assert.equal(mempool.length,1);assert.equal(mempool[0].txid,final.txid);
  assert.equal(mempool[0].allowed,true,'Core rejected signed transaction: '+mempool[0]['reject-reason']);
  // Recheck after asynchronous work, including concurrent plan edits. Mark
  // consumed BEFORE sending; transport ambiguity requires chain reconciliation,
  // never blind replay or automatic re-signing.
  assert.equal(await this.#rpc('getbestblockhash',[]),checked[0].tip.bestblockhash,'Chain changed before broadcast; reconstruct evidence');
  assert.equal(this.#revision,r.revision,'Plan changed during pre-broadcast checks');
  assert.equal(entry.consumed,false,'Concurrent broadcast rejected');entry.consumed=true;
  const txid=await this.#rpc('sendrawtransaction',[final.rawTransactionHex]);assert.equal(txid,final.txid);
  return {...final,requestDigest,network:'regtest',hardwareTested:false,broadcast:true,broadcastSubmitted:true,confirmed:false,
   manifest:r.kind==='create'?recoveryManifest(r,final.rawTransactionHex):null};
 }
}
export async function reconcileGift({manifest,independentDigest,claimTxids,beneficiaryScriptHex,rpc}){
 manifest=JSON.parse(canonical(manifest));claimTxids=[...claimTxids];
 assert.ok(/^(0014[0-9a-f]{40}|76a914[0-9a-f]{40}88ac)$/.test(beneficiaryScriptHex),'Independently approved beneficiary destination required for reconciliation');
 const recovery=await recoverPublicGift({manifest,independentDigest,rpc});
 const seen=new Set(),claimed=new Set();let claimFeesSats=0,beneficiarySats=0;
 for(const txid of claimTxids){
  assert.ok(!seen.has(txid),'Duplicate claim transaction');seen.add(txid);
  const raw=await rpc('getrawtransaction',[txid,true]);assert.ok(raw.confirmations>=1,'Claim not confirmed');
  const h=await rpc('getblockheader',[raw.blockhash,true]);assert.ok(h.confirmations>=1&&h.confirmations===raw.confirmations,'Claim not on active chain');
  const tx=bitcoin.Transaction.fromHex(raw.hex);assert.equal(tx.getId(),txid);assert.equal(tx.outs.length,1,'Unexpected claim output count');
  assert.equal(tx.outs[0].script.toString('hex'),beneficiaryScriptHex,'Claim paid an unexpected beneficiary destination');
  let input=0;
  for(const vin of tx.ins){
   const prior=Buffer.from(vin.hash).reverse().toString('hex'),r=manifest.releases[vin.index];
   assert.equal(prior,manifest.creatorTxid,'Claim contains unrelated inputs');assert.ok(r&&!claimed.has(vin.index),'Duplicate or invalid claimed release');
   assert.ok(recovery.releases[vin.index].status!=='CONFIRMED_UNSPENT','Claimed release remains unspent');
   claimed.add(vin.index);input+=r.valueSats;
  }
  const out=sum(tx.outs.map(o=>o.value));assert.ok(input>out,'Invalid claim accounting');
  claimFeesSats+=input-out;beneficiarySats+=out;
 }
 const l=manifest.ledger,remainingPrincipalSats=recovery.unspentPrincipalSats;
 assert.equal(claimed.size+recovery.releases.filter(r=>r.status==='CONFIRMED_UNSPENT').length,manifest.releases.length,'Unaccounted spent release: provide all confirmed claim transactions');
 assert.equal(l.principalSats,sum([remainingPrincipalSats,beneficiarySats,claimFeesSats]),'Principal not conserved');
 assert.equal(l.fundingSats,sum([l.serviceFeeSats,l.creatorFeeSats,l.changeSats,remainingPrincipalSats,beneficiarySats,claimFeesSats]),'Funding not conserved');
 assert.equal(await rpc('getbestblockhash',[]),recovery.chainTip,'Reconciliation tip changed');
 return {...l,remainingPrincipalSats,beneficiarySats,claimFeesSats,claimCount:claimTxids.length,
  allSatoshisAccountedFor:true,chainTip:recovery.chainTip};
}

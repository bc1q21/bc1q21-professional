import test from 'node:test';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync,writeFileSync,statSync,chmodSync,symlinkSync,unlinkSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {CreatorPrivateArtifacts} from './lifecycle/creator-private-artifacts.mjs';
import {tmpdir} from 'node:os';import {join} from 'node:path';import {randomUUID} from 'node:crypto';
import bitcoin from 'bitcoinjs-lib';
import {CreatorPlanStore} from './lifecycle/creator-plan-store.mjs';
import {CreatorPlanFunding} from './lifecycle/creator-plan-funding.mjs';
import {createCreatorPlanService} from './lifecycle/creator-plan-service.mjs';
import {initializeDisposableSigner,signDisposableRequest} from './lifecycle/disposable-offline-signer.mjs';
import {CreatorSigningSessions} from './lifecycle/creator-signing-session.mjs';
import {validatePublicPlan} from './public-date-planner.mjs';
import {GENESIS,keyScript,digest,finalizeCreation} from './lifecycle/public-model.mjs';
import {makeCryptoPsbtFrames} from './crypto-psbt-frames.mjs';
import {RecipientClaimSigning} from './lifecycle/recipient-claim-signing.mjs';
import {RecipientClaimReview} from './lifecycle/recipient-claim-review.mjs';
import {RecipientClaimPreparation} from './lifecycle/recipient-claim-preparation.mjs';
import {RecipientFundingVerification,recipientCltvMature} from './lifecycle/recipient-funding-verification.mjs';
import {RecipientPackageImports} from './lifecycle/recipient-package-import.mjs';
import {CreatorRecipientPackages,verifyRecipientDeliveryPackage} from './lifecycle/creator-recipient-package.mjs';
import {CreatorBroadcast} from './lifecycle/creator-broadcast.mjs';
import {CreatorSubmissionPreflight} from './lifecycle/creator-submission-preflight.mjs';
function fixture(fundingSats=50000){
 const dir=mkdtempSync(join(tmpdir(),'professional-plan-wallet-'));
 const {wallet,walletDigest,proofs}=initializeDisposableSigner(join(dir,'disposable.json'),2);
 const registration={wallet,walletDigest,proofs};
 const store=new CreatorPlanStore(join(dir,'state.sqlite'));
 const requestId=randomUUID(),accepted=store.accept({network:'regtest',requestId,plan:validatePublicPlan([{date:'2030-01-02',amountSats:20001},{date:'2031-01-02',amountSats:20000}],40001)});
 const walletPins=[{planDigest:accepted.planDigest,walletDigest:registration.walletDigest}];
 const base={network:'regtest',requestId,planDigest:accepted.planDigest};
 const register={...base,operationId:randomUUID(),registration};
 const tx=new bitcoin.Transaction();tx.addInput(Buffer.alloc(32,2),0);tx.addOutput(Buffer.from(keyScript(registration.wallet.creator),'hex'),fundingSats);
 const tip='aa'.repeat(32),block='bb'.repeat(32);let spent=false,wrong=false,chainMove=false,offline=false;const calls=[];
 const rpc=async(method,params=[])=>{
  calls.push(method);if(offline)throw Error('Transport unavailable');
  if(method==='getblockchaininfo')return {chain:wrong?'main':'regtest',blocks:100,bestblockhash:tip,initialblockdownload:false};
  if(method==='getblockhash')return wrong?'cc'.repeat(32):GENESIS;
  if(method==='getbestblockhash')return chainMove?'dd'.repeat(32):tip;
  if(method==='getblockheader')return params[0]===tip?{hash:tip,height:100,mediantime:1893542402,confirmations:1}:{hash:block,height:99,confirmations:2};
  if(method==='getrawtransaction')return {txid:tx.getId(),hex:tx.toHex(),blockhash:block,confirmations:2,vout:[{value:fundingSats/1e8,scriptPubKey:{hex:keyScript(registration.wallet.creator)}}]};
  if(method==='gettxout')return spent?null:{bestblock:tip,confirmations:2,value:fundingSats/1e8,scriptPubKey:{hex:keyScript(registration.wallet.creator)}};
  throw Error('Unexpected or prohibited RPC '+method);
 };
 const inspect={...base,operationId:randomUUID(),walletDigest:registration.walletDigest,outpoints:[{txid:tx.getId(),vout:0}]};
 return {dir,store,registration,walletPins,register,inspect,rpc,calls,flags(v){({spent=spent,wrong=wrong,chainMove=chainMove,offline=offline}=v);},close(){store.close();rmSync(dir,{recursive:true,force:true});}};
}
test('plan-bound possession verification and funding receipts survive database reopen',async()=>{
 const f=fixture();let reopened;
 try{
  let service=new CreatorPlanFunding(f.store,{walletPins:f.walletPins,rpc:f.rpc});assert.equal(service.register(f.register).identityVerified,true);
  const r=await service.inspect(f.inspect);assert.equal(r.totalFundingSats,50000);assert.equal(r.signingAuthorized,false);assert.equal(r.inspectionOnly,true);
  const persisted=JSON.stringify(f.store.db.prepare('SELECT * FROM registrations').all())+JSON.stringify(f.store.db.prepare('SELECT * FROM plan_operations').all());assert.ok(!persisted.includes(f.registration.proofs[0]));assert.ok(!persisted.includes('signedPsbtBase64'));
  reopened=new CreatorPlanStore(join(f.dir,'state.sqlite'));service=new CreatorPlanFunding(reopened,{walletPins:f.walletPins,rpc:()=>{throw Error('Should use stored receipt');}});
  assert.equal(service.register(f.register).status,'already-processed');const old=await service.inspect(f.inspect);assert.equal(old.status,'already-processed');assert.equal(old.historicalReceipt,true);
  assert.deepEqual(new Set(f.calls),new Set(['getblockchaininfo','getblockhash','getrawtransaction','getbestblockhash','getblockheader','gettxout']));
 }finally{reopened?.close();f.close();}
});
test('client wallet digest alone, tampered proof, secret fields and changed plan cannot register',()=>{
 const f=fixture();try{
  assert.throws(()=>new CreatorPlanFunding(f.store).register(f.register),e=>e.status===403);
  const service=new CreatorPlanFunding(f.store,{walletPins:f.walletPins});
  const bad=structuredClone(f.register);bad.registration.proofs[0]='00'.repeat(64);assert.throws(()=>service.register(bad),e=>e.status===400);
  assert.throws(()=>service.register({...f.register,planDigest:'00'.repeat(32)}),e=>e.status===409);
  assert.throws(()=>service.register({...f.register,registration:{...f.registration,seed:'never accept'}}),e=>e.status===400);
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM registrations').get().n,0);
 }finally{f.close();}
});
test('inspection requires registered wallet; operations cannot be rebound or duplicate inputs counted',async()=>{
 const f=fixture();try{
  const service=new CreatorPlanFunding(f.store,{walletPins:f.walletPins,rpc:f.rpc});await assert.rejects(service.inspect(f.inspect),e=>e.status===403);
  service.register(f.register);await service.inspect(f.inspect);
  await assert.rejects(service.inspect({...f.inspect,outpoints:[{txid:'11'.repeat(32),vout:0}]}),e=>e.status===409);
  await assert.rejects(service.inspect({...f.inspect,operationId:randomUUID(),outpoints:[...f.inspect.outpoints,...f.inspect.outpoints]}),e=>e.status===400);
  await assert.rejects(service.inspect({...f.inspect,walletDigest:'00'.repeat(32)}),e=>e.status===403);
 }finally{f.close();}
});
test('read-only failures leave a retryable durable operation; new refresh rejects spent funds',async()=>{
 const f=fixture();let other;try{
  let service=new CreatorPlanFunding(f.store,{walletPins:f.walletPins,rpc:f.rpc});service.register(f.register);f.flags({offline:true});await assert.rejects(service.inspect(f.inspect),e=>e.status===422);
  other=new CreatorPlanStore(join(f.dir,'state.sqlite'));service=new CreatorPlanFunding(other,{walletPins:f.walletPins,rpc:f.rpc});f.flags({offline:false});assert.equal((await service.inspect(f.inspect)).status,'accepted');
  f.flags({spent:true});await assert.rejects(service.inspect({...f.inspect,operationId:randomUUID()}),e=>e.status===422);
  assert.equal((await service.inspect(f.inspect)).historicalReceipt,true);
 }finally{other?.close();f.close();}
});
test('mainnet, moving tip, wrong owner and missing adapter reject without transaction authority',async()=>{
 const f=fixture();try{
  const service=new CreatorPlanFunding(f.store,{walletPins:f.walletPins,rpc:f.rpc});service.register(f.register);
  f.flags({wrong:true});await assert.rejects(service.inspect(f.inspect),e=>e.status===422);f.flags({wrong:false,chainMove:true});await assert.rejects(service.inspect(f.inspect),e=>e.status===422);f.flags({chainMove:false});
  const rpc=async(m,p)=>{const r=await f.rpc(m,p);if(m==='getrawtransaction')r.vout[0].scriptPubKey.hex='0014'+'00'.repeat(20);return r;};
  await assert.rejects(new CreatorPlanFunding(f.store,{walletPins:f.walletPins,rpc}).inspect(f.inspect),e=>e.status===422);
  await assert.rejects(new CreatorPlanFunding(f.store,{walletPins:f.walletPins}).inspect(f.inspect),e=>e.status===503);
  assert.ok(!f.calls.some(x=>/send|sign|generate|setmocktime/.test(x)));
 }finally{f.close();}
});
test('actual HTTP registration and funding endpoints preserve same-origin and default-disabled gates',async()=>{
 const f=fixture();let server=createCreatorPlanService({databasePath:join(f.dir,'state.sqlite'),walletPins:f.walletPins,rpc:async(m,p)=>m==='testmempoolaccept'?[{txid:JSON.parse(f.store.db.prepare('SELECT receipt FROM creator_signing_sessions').get().receipt).txid,allowed:true}]:f.rpc(m,p),enableSubmissionPreflight:true,preflightTokenSha256:createHash('sha256').update('c'.repeat(64)).digest('hex'),enableSigningSessions:true,artifactDirectory:join(f.dir,'artifact-http'),recoveryTokenSha256:createHash('sha256').update('a'.repeat(64)).digest('hex')});await new Promise(r=>server.listen(0,'127.0.0.1',r));let origin=`http://127.0.0.1:${server.address().port}`;
 const post=(route,data,originHeader=origin)=>fetch(origin+'/api/regtest/'+route,{method:'POST',headers:{Origin:originHeader,'Content-Type':'application/json'},body:JSON.stringify(data)});
 try{
  assert.equal((await post('creator-registration',f.register)).status,201);assert.equal((await post('creator-registration',f.register)).status,200);
  const r=await (await post('creator-funding',f.inspect)).json();assert.equal(r.totalFundingSats,50000);assert.equal(r.broadcastAuthorized,false);
  const preparation={network:'regtest',requestId:f.register.requestId,planDigest:f.register.planDigest,walletDigest:f.registration.walletDigest,fundingOperationId:f.inspect.operationId,operationId:randomUUID()};
  const unsigned=await post('creator-prepare',preparation);assert.equal(unsigned.status,201);const prepared=await unsigned.json();assert.equal(prepared.approvalState,'PREPARED_NOT_AUTHORIZED');
  const reviewBase={network:'regtest',requestId:f.register.requestId,planDigest:f.register.planDigest,walletDigest:f.registration.walletDigest,preparationOperationId:preparation.operationId,requestDigest:prepared.requestDigest};
  const ackId=randomUUID(),handoffId=randomUUID();assert.equal((await post('creator-acknowledge',{...reviewBase,operationId:ackId,acknowledged:true})).status,201);
  assert.equal((await post('creator-handoff',{...reviewBase,operationId:handoffId,acknowledgementId:ackId})).status,201);
  assert.equal((await post('creator-handoff',{...reviewBase,operationId:handoffId,acknowledgementId:ackId})).status,409);
  assert.equal((await post('creator-review',{...reviewBase,operationId:randomUUID(),handoffId})).status,200);
  assert.equal((await post('creator-review',{...reviewBase,operationId:randomUUID(),handoffId},'https://evil.invalid')).status,403);
  const sessionId=randomUUID();assert.equal((await post('creator-signing-authorize',{...reviewBase,handoffId,operationId:sessionId,explicitSigningApproval:reviewBase.requestDigest})).status,201);
  assert.equal((await post('creator-signing-state',{...reviewBase,handoffId,operationId:randomUUID(),sessionId})).status,201);
  const engine=JSON.parse(f.store.db.prepare('SELECT request_json FROM creator_requests').get().request_json),signedPayload=signDisposableRequest(join(f.dir,'disposable.json'),engine,engine.requestDigest).signedPsbtBase64;
  const signedRequest={...reviewBase,handoffId,operationId:randomUUID(),sessionId,signedPayload};const signedResponse=await post('creator-signing-return',signedRequest);assert.equal(signedResponse.status,201);const verifiedReturn=await signedResponse.json();assert.equal(verifiedReturn.receipt.signatureCryptographicallyVerified,true);
  assert.equal((await post('creator-artifact-recover',{sessionId})).status,403);
  const recover=()=>fetch(origin+'/api/regtest/creator-artifact-recover',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-Professional-Recovery-Token':'a'.repeat(64)},body:JSON.stringify({sessionId})});
  const recovered=await (await recover()).json();assert.equal(recovered.artifactVerified,true);assert.equal(recovered.transactionId,verifiedReturn.receipt.txid);assert.ok(!JSON.stringify(recovered).includes(signedPayload));
  const finishRequest={...reviewBase,handoffId,operationId:randomUUID(),sessionId,transactionId:verifiedReturn.receipt.txid};const finish=await post('creator-finish',finishRequest);assert.equal(finish.status,201);const finishData=await finish.json();assert.equal(finishData.stage,'SIGNED_NOT_BROADCAST');
  const pf={sessionId,transactionId:verifiedReturn.receipt.txid,requestDigest:reviewBase.requestDigest,receiptDigest:finishData.receiptDigest,authorizationId:randomUUID()};const pfAuth={...pf,explicitPreflightApproval:digest({transactionId:pf.transactionId,requestDigest:pf.requestDigest,receiptDigest:pf.receiptDigest})};
  assert.equal((await post('creator-preflight-authorize',pfAuth)).status,403);
  const pfPost=(route,data)=>fetch(origin+'/api/regtest/'+route,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-Professional-Preflight-Token':'c'.repeat(64)},body:JSON.stringify(data)});assert.equal((await pfPost('creator-preflight-authorize',pfAuth)).status,200);const pfResult=await (await pfPost('creator-preflight-run',pf)).json();assert.equal(pfResult.status,'ACCEPTED');assert.equal(pfResult.broadcast,false);assert.equal((await pfPost('creator-preflight-run',pf)).status,409);
  assert.equal((await post('creator-finish',finishRequest,'https://evil.invalid')).status,403);
  assert.equal((await post('creator-signing-return',signedRequest)).status,409);

  assert.equal((await post('creator-prepare',preparation,'https://evil.invalid')).status,403);
  assert.equal((await post('creator-funding',f.inspect,'https://evil.invalid')).status,403);
  const html=await (await fetch(origin+'/funding-workspace.html')).text();assert.match(html,/register-coordinator-wallet/);assert.match(html,/inspect-coordinator-funding/);
  await new Promise(r=>server.close(r));server=createCreatorPlanService({databasePath:join(f.dir,'state.sqlite'),walletPins:f.walletPins,rpc:()=>{throw Error('No fresh read on receipt retry');},artifactDirectory:join(f.dir,'artifact-http'),recoveryTokenSha256:createHash('sha256').update('a'.repeat(64)).digest('hex')});await new Promise(r=>server.listen(0,'127.0.0.1',r));origin=`http://127.0.0.1:${server.address().port}`;
  assert.equal((await post('creator-registration',f.register)).status,200);const restored=await (await post('creator-funding',f.inspect)).json();assert.equal(restored.status,'already-processed');assert.equal(restored.historicalReceipt,true);assert.equal((await post('creator-prepare',preparation)).status,422);assert.equal((await post('creator-finish',finishRequest)).status,201);assert.equal((await (await recover()).json()).artifactVerified,true);
 }finally{await new Promise(r=>server.close(r));f.close();}
});

test('unsigned preparation reuses engine and persists exact request and non-signing approval',async()=>{
 const f=fixture();let other;try{
  let service=new CreatorPlanFunding(f.store,{walletPins:f.walletPins,rpc:f.rpc});service.register(f.register);await service.inspect(f.inspect);
  const request={network:'regtest',requestId:f.register.requestId,planDigest:f.register.planDigest,walletDigest:f.registration.walletDigest,fundingOperationId:f.inspect.operationId,operationId:randomUUID()};
  const r=await service.prepare(request);assert.equal(r.approvalState,'PREPARED_NOT_AUTHORIZED');assert.equal(r.summary.principalSats,40001);assert.equal(r.summary.serviceFeeSats,1250);assert.equal(r.summary.miningFeeSats,1000);assert.equal(r.summary.changeSats,7749);assert.equal(r.signingAuthorized,false);
  const row=f.store.db.prepare('SELECT * FROM creator_requests').get();const engine=JSON.parse(row.request_json);const psbt=bitcoin.Psbt.fromBase64(engine.unsigned.unsignedPsbtBase64);assert.equal(psbt.inputCount,1);assert.equal(psbt.txOutputs.length,4);assert.ok(!psbt.data.inputs[0].partialSig);assert.equal(engine.requestDigest,r.requestDigest);
  other=new CreatorPlanStore(join(f.dir,'state.sqlite'));service=new CreatorPlanFunding(other,{walletPins:f.walletPins,rpc:f.rpc});const repeat=await service.prepare(request);assert.equal(repeat.status,'already-processed');assert.equal(repeat.requestDigest,r.requestDigest);assert.equal(repeat.freshFundingChecked,true);
  await assert.rejects(service.prepare({...request,operationId:randomUUID()}),e=>e.status===409);
  f.flags({spent:true});await assert.rejects(service.prepare(request),e=>e.status===422);
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM creator_requests').get().n,1);
 }finally{other?.close();f.close();}
});
test('preparation rejects altered plan, pins, funding binding and insufficient funds',async()=>{
 const f=fixture();try{
  const service=new CreatorPlanFunding(f.store,{walletPins:f.walletPins,rpc:f.rpc});service.register(f.register);await service.inspect(f.inspect);
  const request={network:'regtest',requestId:f.register.requestId,planDigest:f.register.planDigest,walletDigest:f.registration.walletDigest,fundingOperationId:f.inspect.operationId,operationId:randomUUID()};
  await assert.rejects(service.prepare({...request,planDigest:'00'.repeat(32)}),e=>e.status===409);
  await assert.rejects(service.prepare({...request,fundingOperationId:f.register.operationId}),e=>e.status===409);
  await assert.rejects(new CreatorPlanFunding(f.store,{rpc:f.rpc}).prepare(request),e=>e.status===403);
  await assert.rejects(service.prepare({...request,rate:1}),e=>e.status===400);
  f.flags({chainMove:true});await assert.rejects(service.prepare(request),e=>e.status===422);f.flags({chainMove:false});
  const row=f.store.db.prepare('SELECT wallet FROM registrations').get();const wallet=JSON.parse(row.wallet);wallet.creator.masterFingerprintHex='00'.repeat(4);f.store.db.prepare('UPDATE registrations SET wallet=?').run(JSON.stringify(wallet));await assert.rejects(service.prepare(request),e=>e.status===409);
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM creator_requests').get().n,0);
 }finally{f.close();}
});

test('insufficient funding and cross-plan input reuse cannot create unsigned requests',async()=>{
 const low=fixture(30000);try{
  const s=new CreatorPlanFunding(low.store,{walletPins:low.walletPins,rpc:low.rpc});s.register(low.register);await s.inspect(low.inspect);
  await assert.rejects(s.prepare({network:'regtest',requestId:low.register.requestId,planDigest:low.register.planDigest,walletDigest:low.registration.walletDigest,fundingOperationId:low.inspect.operationId,operationId:randomUUID()}),e=>e.status===422);
  assert.equal(low.store.db.prepare('SELECT count(*) AS n FROM creator_requests').get().n,0);
 }finally{low.close();}
 const f=fixture();try{
  const s=new CreatorPlanFunding(f.store,{walletPins:f.walletPins,rpc:f.rpc});s.register(f.register);await s.inspect(f.inspect);
  await s.prepare({network:'regtest',requestId:f.register.requestId,planDigest:f.register.planDigest,walletDigest:f.registration.walletDigest,fundingOperationId:f.inspect.operationId,operationId:randomUUID()});
  const requestId=randomUUID();f.store.accept({network:'regtest',requestId,plan:validatePublicPlan([{date:'2030-01-02',amountSats:20001},{date:'2031-01-02',amountSats:20000}],40001)});
  s.register({...f.register,requestId,operationId:randomUUID()});const inspection={...f.inspect,requestId,operationId:randomUUID()};await s.inspect(inspection);
  await assert.rejects(s.prepare({network:'regtest',requestId,planDigest:f.register.planDigest,walletDigest:f.registration.walletDigest,fundingOperationId:inspection.operationId,operationId:randomUUID()}),e=>e.status===409);
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM creator_requests').get().n,1);
 }finally{f.close();}
});

test('exact acknowledgement and one-time review handoff survive restart without signing authority',async()=>{
 const f=fixture();let other;try{
  let s=new CreatorPlanFunding(f.store,{walletPins:f.walletPins,rpc:f.rpc});s.register(f.register);await s.inspect(f.inspect);
  const op=randomUUID(),prep=await s.prepare({network:'regtest',requestId:f.register.requestId,planDigest:f.register.planDigest,walletDigest:f.registration.walletDigest,fundingOperationId:f.inspect.operationId,operationId:op});
  const base={network:'regtest',requestId:f.register.requestId,planDigest:f.register.planDigest,walletDigest:f.registration.walletDigest,preparationOperationId:op,requestDigest:prep.requestDigest};
  const ackId=randomUUID(),ack={...base,operationId:ackId,acknowledged:true};
  assert.equal((await s.acknowledge(ack)).reviewOnly,true);assert.equal((await s.acknowledge(ack)).status,'already-processed');
  other=new CreatorPlanStore(join(f.dir,'state.sqlite'));s=new CreatorPlanFunding(other,{walletPins:f.walletPins,rpc:f.rpc});
  const handoff={...base,operationId:randomUUID(),acknowledgementId:ackId};const r=await s.handoff(handoff);assert.equal(r.reviewOnly,true);assert.equal(r.signingAuthorized,false);assert.equal(r.qrTransportVerified,true);assert.equal(r.unsigned.signed,false);
  await assert.rejects(s.handoff(handoff),e=>e.status===409);await assert.rejects(s.acknowledge(ack),e=>e.status===409);
  const restored=await s.restoreReview({...base,operationId:randomUUID(),handoffId:r.handoffId});assert.equal(restored.status,'already-processed');assert.equal(restored.requestDigest,prep.requestDigest);assert.equal(restored.broadcastAuthorized,false);
  assert.equal(f.store.db.prepare('SELECT state FROM creator_reviews').get().state,'REVIEW_HANDOFF_CONSUMED');
  f.flags({spent:true});await assert.rejects(s.restoreReview({...base,operationId:randomUUID(),handoffId:r.handoffId}),e=>e.status===422);
 }finally{other?.close();f.close();}
});
test('review rejects absent acknowledgement, changed digest, stale wallet and unauthorized acknowledgement',async()=>{
 const f=fixture();try{
  const s=new CreatorPlanFunding(f.store,{walletPins:f.walletPins,rpc:f.rpc});s.register(f.register);await s.inspect(f.inspect);
  const op=randomUUID(),prep=await s.prepare({network:'regtest',requestId:f.register.requestId,planDigest:f.register.planDigest,walletDigest:f.registration.walletDigest,fundingOperationId:f.inspect.operationId,operationId:op});
  const base={network:'regtest',requestId:f.register.requestId,planDigest:f.register.planDigest,walletDigest:f.registration.walletDigest,preparationOperationId:op,requestDigest:prep.requestDigest,operationId:randomUUID()};
  await assert.rejects(s.acknowledge({...base,acknowledged:false}),e=>e.status===400);
  await assert.rejects(s.acknowledge({...base,requestDigest:'00'.repeat(32),acknowledged:true}),e=>e.status===409);
  await assert.rejects(s.handoff({...base,acknowledgementId:randomUUID()}),e=>e.status===409);
  await assert.rejects(new CreatorPlanFunding(f.store,{rpc:f.rpc}).acknowledge({...base,acknowledged:true}),e=>e.status===403);
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM creator_reviews').get().n,0);
 }finally{f.close();}
});

async function signingFixture(f){
 const funding=new CreatorPlanFunding(f.store,{walletPins:f.walletPins,rpc:f.rpc});funding.register(f.register);await funding.inspect(f.inspect);
 const preparationOperationId=randomUUID();const prep=await funding.prepare({network:'regtest',requestId:f.register.requestId,planDigest:f.register.planDigest,walletDigest:f.registration.walletDigest,fundingOperationId:f.inspect.operationId,operationId:preparationOperationId});
 const base={network:'regtest',requestId:f.register.requestId,planDigest:f.register.planDigest,walletDigest:f.registration.walletDigest,preparationOperationId,requestDigest:prep.requestDigest};
 const ack=randomUUID();await funding.acknowledge({...base,operationId:ack,acknowledged:true});const handoffId=randomUUID();await funding.handoff({...base,operationId:handoffId,acknowledgementId:ack});
 return {funding,base:{...base,handoffId},engine:JSON.parse(f.store.db.prepare('SELECT request_json FROM creator_requests').get().request_json)};
}
test('separate signing authorization is opt-in, exact, expiring and not extended by retry',async()=>{
 const f=fixture();try{
  const {funding,base}=await signingFixture(f);let now=1000000;const s=new CreatorSigningSessions(funding,{enabled:true,clock:()=>now});const authorize={...base,operationId:randomUUID(),explicitSigningApproval:base.requestDigest};
  await assert.rejects(new CreatorSigningSessions(funding).authorize(authorize),e=>e.status===403);
  await assert.rejects(s.authorize({...authorize,explicitSigningApproval:'00'.repeat(32)}),e=>e.status===400);
  const r=await s.authorize(authorize);assert.equal(r.signingAuthorized,true);assert.equal(r.broadcastAuthorized,false);assert.equal(r.expiresAt,1600000);
  now+=1000;assert.equal((await s.authorize(authorize)).expiresAt,r.expiresAt);await assert.rejects(s.authorize({...authorize,operationId:randomUUID()}),e=>e.status===409);
  now=1600000;await assert.rejects(s.restore({...base,operationId:randomUUID(),sessionId:r.sessionId}),e=>e.status===409);await assert.rejects(s.authorize(authorize),e=>e.status===409);
 }finally{f.close();}
});
test('signed return verification persists across reopen; invalid and duplicate returns fail closed',async()=>{
 const f=fixture();let other;try{
  const {funding,base,engine}=await signingFixture(f);let now=1000000;let s=new CreatorSigningSessions(funding,{enabled:true,clock:()=>now});
  const auth=await s.authorize({...base,operationId:randomUUID(),explicitSigningApproval:base.requestDigest});
  other=new CreatorPlanStore(join(f.dir,'state.sqlite'));s=new CreatorSigningSessions(new CreatorPlanFunding(other,{walletPins:f.walletPins,rpc:f.rpc}),{enabled:true,clock:()=>now});
  const request={...base,operationId:randomUUID(),sessionId:auth.sessionId};assert.equal((await s.restore(request)).state,'AUTHORIZED');
  await assert.rejects(s.acceptReturn({...request,signedPayload:engine.unsigned.unsignedPsbtBase64}),e=>e.status===422);
  const signed=signDisposableRequest(join(f.dir,'disposable.json'),engine,engine.requestDigest).signedPsbtBase64;
  const mutated=bitcoin.Psbt.fromBase64(signed);mutated.data.inputs[0].partialSig[0].signature[5]^=1;
  await assert.rejects(s.acceptReturn({...request,signedPayload:mutated.toBase64()}),e=>e.status===422);
  const r=await s.acceptReturn({...request,signedPayload:signed});assert.equal(r.receipt.signatureCryptographicallyVerified,true);assert.equal(r.receipt.transactionMatchesApprovedRequest,true);assert.equal(r.receipt.feeSats,1000);assert.equal(r.receipt.broadcast,false);assert.equal(r.signingAuthorized,false);
  await assert.rejects(s.acceptReturn({...request,signedPayload:signed}),e=>e.status===409);
  assert.equal((await s.restore(request)).receipt.txid,r.receipt.txid);assert.ok(!f.store.db.prepare('SELECT receipt FROM creator_signing_sessions').get().receipt.includes(signed));
 }finally{other?.close();f.close();}
});
test('stale wallet/funding, changed request and expiry reject signing returns',async()=>{
 const f=fixture();try{
  const {funding,base,engine}=await signingFixture(f);let now=1000000;const s=new CreatorSigningSessions(funding,{enabled:true,clock:()=>now});
  const auth=await s.authorize({...base,operationId:randomUUID(),explicitSigningApproval:base.requestDigest});const signed=signDisposableRequest(join(f.dir,'disposable.json'),engine,engine.requestDigest).signedPsbtBase64;
  const request={...base,operationId:randomUUID(),sessionId:auth.sessionId,signedPayload:signed};await assert.rejects(s.acceptReturn({...request,requestDigest:'00'.repeat(32)}),e=>e.status===409);
  f.flags({spent:true});await assert.rejects(s.acceptReturn(request),e=>e.status===422);f.flags({spent:false});now=auth.expiresAt;await assert.rejects(s.acceptReturn(request),e=>e.status===409);
  assert.equal(f.store.db.prepare('SELECT receipt FROM creator_signing_sessions').get().receipt,null);
 }finally{f.close();}
});

test('Finish loads only a persisted verified receipt and survives restart without claiming chain evidence',async()=>{
 const f=fixture();let other;try{
  const {funding,base,engine}=await signingFixture(f),s=new CreatorSigningSessions(funding,{enabled:true,clock:()=>1000000});
  const auth=await s.authorize({...base,operationId:randomUUID(),explicitSigningApproval:base.requestDigest});
  const signedPayload=signDisposableRequest(join(f.dir,'disposable.json'),engine,engine.requestDigest).signedPsbtBase64;
  const returned=await s.acceptReturn({...base,operationId:randomUUID(),sessionId:auth.sessionId,signedPayload});
  const request={...base,operationId:randomUUID(),sessionId:auth.sessionId,transactionId:returned.receipt.txid};
  other=new CreatorPlanStore(join(f.dir,'state.sqlite'));const restored=new CreatorSigningSessions(new CreatorPlanFunding(other,{walletPins:f.walletPins,rpc:()=>{throw Error('Finish must not imply a fresh blockchain check');}}));
  const r=restored.finish(request);assert.equal(r.stage,'SIGNED_NOT_BROADCAST');assert.equal(r.giftCompleted,false);assert.equal(r.recipientDeliveryAvailable,false);assert.equal(r.confirmationStatus,'NOT_CHECKED');assert.equal(r.mempoolAcceptance,'NOT_CHECKED');assert.equal(r.fundingStatus,'NOT_CHECKED');assert.equal(r.summary.totalSats,40001);assert.equal(r.receipt.txid,returned.receipt.txid);
  assert.throws(()=>restored.finish({...request,transactionId:'00'.repeat(32)}),e=>e.status===409);
  assert.throws(()=>restored.finish({...request,planDigest:'00'.repeat(32)}),e=>e.status===409);
  const changed=structuredClone(returned.receipt);changed.feeSats++;other.db.prepare('UPDATE creator_signing_sessions SET receipt=?').run(JSON.stringify(changed));assert.throws(()=>restored.finish(request),e=>e.status===409);
 }finally{other?.close();f.close();}
});
test('Finish rejects unverified sessions and wrong current wallet pins',async()=>{
 const f=fixture();try{
  const {funding,base,engine}=await signingFixture(f),s=new CreatorSigningSessions(funding,{enabled:true,clock:()=>1000000});
  const auth=await s.authorize({...base,operationId:randomUUID(),explicitSigningApproval:base.requestDigest});
  const request={...base,operationId:randomUUID(),sessionId:auth.sessionId,transactionId:'00'.repeat(32)};assert.throws(()=>s.finish(request),e=>e.status===409);
  const signedPayload=signDisposableRequest(join(f.dir,'disposable.json'),engine,engine.requestDigest).signedPsbtBase64;const r=await s.acceptReturn({...base,operationId:randomUUID(),sessionId:auth.sessionId,signedPayload});request.transactionId=r.receipt.txid;
  assert.throws(()=>new CreatorSigningSessions(new CreatorPlanFunding(f.store)).finish(request),e=>e.status===403);
 }finally{f.close();}
});

test('private signed artifacts bind verified receipts, survive reopen and reject corruption or replacement',async()=>{
 const f=fixture();let other;try{
  const {funding,base,engine}=await signingFixture(f),path=join(f.dir,'private-artifacts'),artifacts=new CreatorPrivateArtifacts(path);
  const s=new CreatorSigningSessions(funding,{enabled:true,clock:()=>1000000,artifactStore:artifacts});
  const auth=await s.authorize({...base,operationId:randomUUID(),explicitSigningApproval:base.requestDigest});
  const signed=signDisposableRequest(join(f.dir,'disposable.json'),engine,engine.requestDigest).signedPsbtBase64;
  const result=await s.acceptReturn({...base,operationId:randomUUID(),sessionId:auth.sessionId,signedPayload:signed});assert.equal(result.artifactRetained,true);
  const file=join(path,result.receipt.signedPsbtSha256+'.psbt');assert.equal(statSync(path).mode&0o777,0o700);assert.equal(statSync(file).mode&0o777,0o600);
  other=new CreatorPlanStore(join(f.dir,'state.sqlite'));const restored=new CreatorSigningSessions(new CreatorPlanFunding(other,{walletPins:f.walletPins}),{artifactStore:new CreatorPrivateArtifacts(path)});
  const recovered=restored.recoverArtifact(auth.sessionId);assert.equal(recovered.transactionId,result.receipt.txid);assert.equal(recovered.artifactVerified,true);assert.equal(recovered.plan.totalSats,40001);
  assert.equal(restored.importArtifact(auth.sessionId,signed).transactionId,result.receipt.txid);
  assert.throws(()=>restored.importArtifact(auth.sessionId,engine.unsigned.unsignedPsbtBase64));
  const original=readFileSync(file);writeFileSync(file,Buffer.alloc(original.length));assert.throws(()=>restored.recoverArtifact(auth.sessionId));assert.throws(()=>restored.importArtifact(auth.sessionId,signed));assert.deepEqual(readFileSync(file),Buffer.alloc(original.length));
  writeFileSync(file,original);const row=other.db.prepare('SELECT * FROM creator_signed_artifacts').get();other.db.prepare('UPDATE creator_signed_artifacts SET receipt_digest=?').run('00'.repeat(32));assert.throws(()=>restored.recoverArtifact(auth.sessionId));other.db.prepare('UPDATE creator_signed_artifacts SET receipt_digest=?').run(row.receipt_digest);
  unlinkSync(file);assert.equal(restored.importArtifact(auth.sessionId,signed).artifactVerified,true);
 }finally{other?.close();f.close();}
});
test('private store refuses repository paths, broad permissions and symlink paths',()=>{
 const dir=mkdtempSync(join(tmpdir(),'professional-permission-'));try{
  assert.throws(()=>new CreatorPrivateArtifacts(new URL('./private-test',import.meta.url).pathname));
  const store=new CreatorPrivateArtifacts(dir);chmodSync(dir,0o755);assert.throws(()=>new CreatorPrivateArtifacts(dir));assert.throws(()=>store.get('00'.repeat(32)));assert.throws(()=>store.put(Buffer.from('70736274ff0000000000','hex')));chmodSync(dir,0o700);
  symlinkSync(dir,dir+'-link');assert.throws(()=>new CreatorPrivateArtifacts(dir+'-link'));unlinkSync(dir+'-link');
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('retention failure rolls back signed-return consumption and receipt mapping',async()=>{
 const f=fixture();try{
  const {funding,base,engine}=await signingFixture(f),s=new CreatorSigningSessions(funding,{enabled:true,clock:()=>1000000,artifactStore:{put(){throw Error('Storage unavailable');}}});
  const auth=await s.authorize({...base,operationId:randomUUID(),explicitSigningApproval:base.requestDigest});
  const signedPayload=signDisposableRequest(join(f.dir,'disposable.json'),engine,engine.requestDigest).signedPsbtBase64;
  await assert.rejects(s.acceptReturn({...base,operationId:randomUUID(),sessionId:auth.sessionId,signedPayload}),/Storage unavailable/);
  assert.equal(f.store.db.prepare('SELECT state FROM creator_signing_sessions').get().state,'AUTHORIZED');assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM creator_signed_artifacts').get().n,0);
 }finally{f.close();}
});

test('operator private export and binary re-import preserve exact verified payload without overwrite',async()=>{
 const f=fixture();try{
  assert.throws(()=>createCreatorPlanService({databasePath:':memory:',enableSigningSessions:true}),/private artifact/);
  const {funding,base,engine}=await signingFixture(f),directory=join(f.dir,'operator-artifacts'),s=new CreatorSigningSessions(funding,{enabled:true,clock:()=>1000000,artifactStore:new CreatorPrivateArtifacts(directory)});
  const auth=await s.authorize({...base,operationId:randomUUID(),explicitSigningApproval:base.requestDigest});
  const signedPayload=signDisposableRequest(join(f.dir,'disposable.json'),engine,engine.requestDigest).signedPsbtBase64;await s.acceptReturn({...base,operationId:randomUUID(),sessionId:auth.sessionId,signedPayload});
  const config=join(f.dir,'operator.json'),output=join(f.dir,'export','signed.psbt');writeFileSync(config,JSON.stringify({walletPins:f.walletPins,artifactDirectory:directory}),{mode:0o600});
  const helper=new URL('./lifecycle/creator-artifact-operator.mjs',import.meta.url).pathname;
  const run=mode=>JSON.parse(execFileSync(process.execPath,[...process.execArgv.filter(a=>a!=='--test'),helper,mode,join(f.dir,'state.sqlite'),config,auth.sessionId,output],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));
  assert.equal(run('export').artifactVerified,true);assert.equal(readFileSync(output).toString('base64'),signedPayload);assert.equal(statSync(output).mode&0o777,0o600);
  assert.equal(run('import').artifactVerified,true);assert.throws(()=>run('export'));
 }finally{f.close();}
});

async function preflightFixture(f){
 const {funding,base,engine}=await signingFixture(f),sessions=new CreatorSigningSessions(funding,{enabled:true,clock:()=>1000000,artifactStore:new CreatorPrivateArtifacts(join(f.dir,'preflight-private'))});
 const auth=await sessions.authorize({...base,operationId:randomUUID(),explicitSigningApproval:base.requestDigest});
 const signedPayload=signDisposableRequest(join(f.dir,'disposable.json'),engine,engine.requestDigest).signedPsbtBase64;
 const r=await sessions.acceptReturn({...base,operationId:randomUUID(),sessionId:auth.sessionId,signedPayload});
 const request={sessionId:auth.sessionId,transactionId:r.receipt.txid,requestDigest:base.requestDigest,receiptDigest:digest(r.receipt),authorizationId:randomUUID()};
 const authorization={...request,explicitPreflightApproval:digest({transactionId:request.transactionId,requestDigest:request.requestDigest,receiptDigest:request.receiptDigest})};
 return {sessions,request,authorization};
}
test('preflight requires exact explicit authorization, persists restart state and consumes once',async()=>{
 const f=fixture();let other;try{
  const {sessions,request,authorization}=await preflightFixture(f),response=[{txid:request.transactionId,allowed:true,vsize:200,fees:{base:.00001}}];let calls=0;
  const rpc=async(m,p)=>{if(m==='testmempoolaccept'){calls++;return response;}return f.rpc(m,p);};
  let s=new CreatorSubmissionPreflight(sessions,{rpc,enabled:true,clock:()=>1000000});
  assert.throws(()=>new CreatorSubmissionPreflight(sessions).authorize(authorization),e=>e.status===403);
  await assert.rejects(s.run(request),e=>e.status===409);
  assert.throws(()=>s.authorize({...authorization,explicitPreflightApproval:'00'.repeat(32)}),e=>e.status===400);s.authorize(authorization);assert.throws(()=>s.authorize(authorization),e=>e.status===409);
  other=new CreatorPlanStore(join(f.dir,'state.sqlite'));const restoredSessions=new CreatorSigningSessions(new CreatorPlanFunding(other,{walletPins:f.walletPins}),{artifactStore:new CreatorPrivateArtifacts(join(f.dir,'preflight-private'))});s=new CreatorSubmissionPreflight(restoredSessions,{rpc,enabled:true,clock:()=>1000001});
  const result=await s.run(request);assert.equal(result.status,'ACCEPTED');assert.deepEqual(result.coreResponse,response);assert.equal(result.broadcast,false);assert.equal(result.mempoolSubmitted,false);assert.equal(result.confirmed,false);assert.equal(s.latest(request.sessionId).status,'ACCEPTED');
  await assert.rejects(s.run(request),e=>e.status===409);assert.equal(calls,1);assert.ok(!f.calls.some(m=>/send|generate|setmocktime/.test(m)));
 }finally{other?.close();f.close();}
});
test('expired preflight and conflicting receipt are rejected before Core policy call',async()=>{
 const f=fixture();try{
  const {sessions,request,authorization}=await preflightFixture(f);let now=1000000;const s=new CreatorSubmissionPreflight(sessions,{rpc:f.rpc,enabled:true,clock:()=>now});
  assert.throws(()=>s.authorize({...authorization,receiptDigest:'00'.repeat(32)}),e=>e.status===409);s.authorize(authorization);const before=f.calls.length;now=1600000;
  await assert.rejects(s.run(request),e=>e.status===409);assert.equal(s.latest(request.sessionId).status,'EXPIRED');assert.equal(f.calls.length,before);
 }finally{f.close();}
});
test('preflight records exact rejection, unavailable Core, stale funding and post-check tip change',async()=>{
 for(const mode of ['reject','unavailable','spent','moving']){
  const f=fixture();try{
   const {sessions,request,authorization}=await preflightFixture(f);let policyCalls=0;
   const response=[{txid:request.transactionId,allowed:mode!=='reject',...(mode==='reject'?{'reject-reason':'non-final'}:{})}];
   const rpc=async(m,p)=>{if(mode==='unavailable')throw Error('Core offline');if(m==='testmempoolaccept'){policyCalls++;if(mode==='moving')f.flags({chainMove:true});return response;}return f.rpc(m,p);};
   const s=new CreatorSubmissionPreflight(sessions,{rpc,enabled:true,clock:()=>1000000});s.authorize(authorization);if(mode==='spent')f.flags({spent:true});
   const r=await s.run(request);assert.equal(r.status,{reject:'REJECTED',unavailable:'UNAVAILABLE',spent:'STALE',moving:'STALE'}[mode]);
   if(mode==='reject')assert.deepEqual(r.coreResponse,response);if(['unavailable','spent'].includes(mode))assert.equal(policyCalls,0);
   await assert.rejects(s.run(request),e=>e.status===409);
  }finally{f.close();}
 }
});

async function broadcastFixture(f,mode='success',clock=()=>1000000){
 const x=await preflightFixture(f),engine=x.sessions.artifactContext(x.request.sessionId).engine;
 const final=finalizeCreation(engine,x.sessions.artifactStore.get(x.sessions.artifactContext(x.request.sessionId).receipt.signedPsbtSha256).toString('base64'));
 let present=false,confirmed=false,sends=0,offline=false,policyReject=false,conflicting=false;
 const missing=()=>{const e=Error('Mock transaction not found');e.code=-5;throw e;};
 const rpc=async(m,p=[])=>{
  if(offline)throw Error('Mock node unavailable');
  if(m==='getrawtransaction'&&p[0]===final.txid)return present?{txid:final.txid,hex:final.rawTransactionHex,vout:bitcoin.Transaction.fromHex(final.rawTransactionHex).outs.map((o,n)=>({n,value:o.value/1e8,scriptPubKey:{hex:o.script.toString('hex')}})),confirmations:confirmed?2:0,...(confirmed?{blockhash:'ee'.repeat(32)}:{})}:missing();
  if(m==='gettxout'&&p[0]===final.txid){const out=bitcoin.Transaction.fromHex(final.rawTransactionHex).outs[p[1]];return present&&confirmed&&out?{bestblock:'aa'.repeat(32),confirmations:2,value:out.value/1e8,scriptPubKey:{hex:out.script.toString('hex')}}:null;}
  if(m==='getmempoolentry')return present&&!confirmed?{vsize:200}:missing();
  if(m==='gettxspendingprevout')return [{...p[0][0],...(conflicting?{spendingtxid:'ff'.repeat(32)}:{})}];
  if(m==='getblockheader'&&p[0]==='ee'.repeat(32))return {hash:p[0],height:99,confirmations:2};
  if(m==='testmempoolaccept')return [{txid:final.txid,allowed:!policyReject,...(policyReject?{'reject-reason':'synthetic-policy-rejection'}:{})}];
  if(m==='sendrawtransaction'){
   sends++;assert.equal(p[0],final.rawTransactionHex);const row=f.store.db.prepare('SELECT * FROM creator_submissions').get();assert.equal(row.attempted,1);assert.equal(row.consumed,1);assert.equal(row.status,'SUBMISSION UNKNOWN');
   if(mode==='reject'){const e=Error('Mock rejected');e.rpcCode=-26;throw e;}
   if(mode==='timeout')throw Error('Mock timeout');
   present=true;if(mode==='timeout-accepted')throw Error('Mock lost response');return final.txid;
  }
  return f.rpc(m,p);
 };
 const preflight=new CreatorSubmissionPreflight(x.sessions,{rpc,enabled:true,clock});preflight.authorize(x.authorization);await preflight.run(x.request);
 const request={...x.request,authorizationId:randomUUID(),preflightId:x.request.authorizationId};
 const authorization={...request,explicitBroadcastApproval:digest({transactionId:request.transactionId,requestDigest:request.requestDigest,receiptDigest:request.receiptDigest,preflightId:request.preflightId})};
 return {preflight,rpc,request,authorization,get sends(){return sends;},present(v){present=v;},confirm(){present=true;confirmed=true;},unconfirm(){present=true;confirmed=false;},rejectPolicy(){policyReject=true;},conflict(){conflicting=true;f.flags({spent:true});},offline(v){offline=v;}};
}
test('broadcast mock records intent before send, observes mempool/confirmation and blocks duplicates',async()=>{
 const f=fixture();try{
  const x=await broadcastFixture(f),s=new CreatorBroadcast(x.preflight,{rpc:x.rpc,enabled:true,clock:()=>1000000});
  assert.throws(()=>new CreatorBroadcast(x.preflight).authorize(x.authorization),e=>e.status===403);
  assert.throws(()=>s.authorize({...x.authorization,transactionId:'00'.repeat(32)}),e=>e.status===409);const intent=s.authorize(x.authorization);assert.equal(intent.status,'NOT SUBMITTED');assert.equal(intent.attempted,false);assert.throws(()=>s.authorize(x.authorization),e=>e.status===409);
  const r=await s.run(x.request);assert.equal(r.status,'MEMPOOL OBSERVED');assert.equal(x.sends,1);await assert.rejects(s.run(x.request),e=>e.status===409);
  x.confirm();const confirmed=await s.reconcile(x.request);assert.equal(confirmed.status,'CONFIRMED');assert.equal(confirmed.evidence.confirmations,2);assert.equal(confirmed.giftCompleted,false);assert.equal(x.sends,1);
  await assert.rejects(s.reconcile({...x.request,preflightId:randomUUID()}),e=>e.status===409);
 }finally{f.close();}
});
test('broadcast mock rejection and ambiguous responses never automatically resend',async()=>{
 for(const mode of ['reject','timeout','timeout-accepted']){
  const f=fixture();try{
   const x=await broadcastFixture(f,mode),s=new CreatorBroadcast(x.preflight,{rpc:x.rpc,enabled:true,clock:()=>1000000});s.authorize(x.authorization);
   const r=await s.run(x.request);assert.equal(r.status,{reject:'REJECTED',timeout:'SUBMISSION UNKNOWN','timeout-accepted':'MEMPOOL OBSERVED'}[mode]);assert.equal(x.sends,1);
   await assert.rejects(s.run(x.request),e=>e.status===409);await s.reconcile(x.request);assert.equal(x.sends,1);
  }finally{f.close();}
 }
});
test('restart/crash checkpoint reconciles without resend; stale funding and expired approvals cannot send',async()=>{
 const f=fixture();let other;try{
  const x=await broadcastFixture(f),s=new CreatorBroadcast(x.preflight,{rpc:x.rpc,enabled:true,clock:()=>1000000});const intent=s.authorize(x.authorization);
  // Exact durable checkpoint written before the external send: simulate process loss.
  f.store.db.prepare("UPDATE creator_submissions SET consumed=1,attempted=1,status='SUBMISSION UNKNOWN',phase='ATTEMPT_RECORDED'").run();
  other=new CreatorPlanStore(join(f.dir,'state.sqlite'));const sessions=new CreatorSigningSessions(new CreatorPlanFunding(other,{walletPins:f.walletPins}),{artifactStore:new CreatorPrivateArtifacts(join(f.dir,'preflight-private'))});const pf=new CreatorSubmissionPreflight(sessions,{rpc:x.rpc,enabled:true,clock:()=>1000000});const restarted=new CreatorBroadcast(pf,{rpc:x.rpc,enabled:true,clock:()=>1000000});
  assert.equal((await restarted.reconcile(x.request)).status,'SUBMISSION UNKNOWN');assert.equal(restarted.latest(x.request.sessionId).submissionId,intent.submissionId);await assert.rejects(restarted.run(x.request),e=>e.status===409);assert.equal(x.sends,0);
  x.present(true);assert.equal((await restarted.reconcile(x.request)).status,'MEMPOOL OBSERVED');x.offline(true);assert.equal((await restarted.reconcile(x.request)).status,'SUBMISSION UNKNOWN');assert.equal(x.sends,0);
 }finally{other?.close();f.close();}
 const stale=fixture();try{const x=await broadcastFixture(stale),s=new CreatorBroadcast(x.preflight,{rpc:x.rpc,enabled:true,clock:()=>1000000});s.authorize(x.authorization);x.conflict();assert.equal((await s.run(x.request)).status,'CONFLICTED');assert.equal(x.sends,0);}finally{stale.close();}
 const policy=fixture();try{const x=await broadcastFixture(policy),s=new CreatorBroadcast(x.preflight,{rpc:x.rpc,enabled:true,clock:()=>1000000});s.authorize(x.authorization);x.rejectPolicy();const r=await s.run(x.request);assert.equal(r.status,'REJECTED');assert.equal(r.attempted,false);assert.equal(r.evidence.preflight[0]['reject-reason'],'synthetic-policy-rejection');assert.equal(x.sends,0);}finally{policy.close();}
 const expired=fixture();try{const x=await broadcastFixture(expired);let now=1000000;const s=new CreatorBroadcast(x.preflight,{rpc:x.rpc,enabled:true,clock:()=>now});s.authorize(x.authorization);now=1600000;await assert.rejects(s.run(x.request),e=>e.status===409);assert.equal(x.sends,0);}finally{expired.close();}
});

test('mock HTTP broadcast routes require separate token and Finish reports authoritative status',async()=>{
 const f=fixture();let server;try{
  const x=await broadcastFixture(f,'success',()=>Date.now());server=createCreatorPlanService({databasePath:join(f.dir,'state.sqlite'),walletPins:f.walletPins,artifactDirectory:join(f.dir,'preflight-private'),rpc:x.rpc,broadcastRpc:x.rpc,enableBroadcastWorkflow:true,broadcastTokenSha256:createHash('sha256').update('d'.repeat(64)).digest('hex')});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
  const post=(route,body,token)=>fetch(origin+'/api/regtest/'+route,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...(token?{'X-Professional-Broadcast-Token':token}:{})},body:JSON.stringify(body)});
  assert.equal((await post('creator-broadcast-authorize',x.authorization)).status,403);
  assert.equal((await post('creator-broadcast-authorize',x.authorization,'d'.repeat(64))).status,200);
  assert.equal((await (await post('creator-broadcast-run',x.request,'d'.repeat(64))).json()).status,'MEMPOOL OBSERVED');assert.equal(x.sends,1);
  assert.equal((await post('creator-broadcast-run',x.request,'d'.repeat(64))).status,409);
  x.confirm();assert.equal((await (await post('creator-broadcast-reconcile',x.request,'d'.repeat(64))).json()).status,'CONFIRMED');
  const finish=x.preflight.sessions.artifactContext(x.request.sessionId).finishBinding;const view=await (await post('creator-finish',finish)).json();assert.equal(view.stage,'SUBMISSION_STATUS_OBSERVED');assert.equal(view.submission.status,'CONFIRMED');assert.equal(view.giftCompleted,false);assert.equal(view.recipientDeliveryAvailable,false);
  const history=f.store.db.prepare('SELECT status FROM creator_submission_events ORDER BY sequence').all().map(x=>x.status);assert.ok(history.includes('SUBMISSION UNKNOWN'));assert.ok(history.includes('MEMPOOL OBSERVED'));assert.ok(history.includes('CONFIRMED'));
 }finally{if(server)await new Promise(r=>server.close(r));f.close();}
});

async function recipientPackageFixture(f){
 const x=await broadcastFixture(f),broadcast=new CreatorBroadcast(x.preflight,{rpc:x.rpc,enabled:true,clock:()=>1000000});broadcast.authorize(x.authorization);await broadcast.run(x.request);x.confirm();await broadcast.reconcile(x.request);
 const c=x.preflight.sessions.artifactContext(x.request.sessionId),pin={planDigest:c.receipt.planDigest,walletDigest:c.receipt.walletDigest,recipientId:'recipient-1',destinationScriptHex:keyScript(c.engine.wallet.recipient[0])};
 const request={sessionId:x.request.sessionId,transactionId:x.request.transactionId,requestDigest:x.request.requestDigest,recipientId:pin.recipientId,operationId:randomUUID()};
 return {...x,broadcast,pin,request};
}
test('confirmed recipient packaging reuses manifest/handoff and persists integrity/delivery gates',async()=>{
 const f=fixture();let other;try{
  const x=await recipientPackageFixture(f),s=new CreatorRecipientPackages(x.broadcast,{recipientPins:[x.pin],rpc:x.rpc});const result=await s.prepare(x.request);assert.equal(result.deliveryAuthorized,false);assert.equal(result.deliveryAuthorization,'NOT_AUTHORIZED');assert.equal(result.delivered,false);
  const row=f.store.db.prepare('SELECT * FROM creator_recipient_packages').get(),pkg=JSON.parse(row.package_json);assert.equal(pkg.body.manifest.ledger.principalSats,40001);assert.equal(pkg.body.customerHandoff.psbts.length,2);assert.ok(!row.package_json.includes('signedPsbtBase64'));
  const expected={recipientId:x.pin.recipientId,recipientKeysDigest:digest(pkg.body.manifest.wallet.recipient),destinationScriptHex:x.pin.destinationScriptHex};assert.equal(verifyRecipientDeliveryPackage(pkg,row.digest,expected).integrityVerified,true);
  const changed=structuredClone(pkg);changed.body.manifest.plan.totalSats++;assert.throws(()=>verifyRecipientDeliveryPackage(changed,row.digest,expected));assert.throws(()=>verifyRecipientDeliveryPackage(pkg,row.digest,{...expected,recipientId:'other'}));
  other=new CreatorPlanStore(join(f.dir,'state.sqlite'));const sessions=new CreatorSigningSessions(new CreatorPlanFunding(other,{walletPins:f.walletPins}),{artifactStore:new CreatorPrivateArtifacts(join(f.dir,'preflight-private'))});const pf=new CreatorSubmissionPreflight(sessions);const broadcast=new CreatorBroadcast(pf);const restarted=new CreatorRecipientPackages(broadcast,{recipientPins:[x.pin],rpc:x.rpc});assert.equal((await restarted.prepare(x.request)).packageId,result.packageId);
  await assert.rejects(restarted.prepare({...x.request,operationId:randomUUID()}),e=>e.status===409);assert.equal(other.db.prepare('SELECT count(*) AS n FROM creator_recipient_packages').get().n,1);
  x.unconfirm();await assert.rejects(restarted.prepare(x.request),e=>e.status===422);
 }finally{other?.close();f.close();}
});
test('recipient packaging rejects insufficient confirmations, reorg, wrong outputs and unpinned recipient',async()=>{
 const f=fixture();try{
  const x=await recipientPackageFixture(f);
  await assert.rejects(new CreatorRecipientPackages(x.broadcast,{recipientPins:[x.pin],rpc:x.rpc,minimumConfirmations:3}).prepare(x.request),e=>e.status===422);
  await assert.rejects(new CreatorRecipientPackages(x.broadcast,{rpc:x.rpc}).prepare(x.request),e=>e.status===403);
  for(const type of ['reorg','outputs']){
   const rpc=async(m,p)=>{const r=await x.rpc(m,p);if(type==='reorg'&&m==='getblockheader'&&p[0]==='ee'.repeat(32))r.confirmations=-1;if(type==='outputs'&&m==='getrawtransaction'&&p[0]===x.request.transactionId)r.vout[0].scriptPubKey.hex='a914'+'00'.repeat(20)+'87';return r;};
   await assert.rejects(new CreatorRecipientPackages(x.broadcast,{recipientPins:[x.pin],rpc}).prepare(x.request),e=>e.status===422);
  }
  assert.equal(f.store.db.prepare('SELECT count(*) AS n FROM creator_recipient_packages').get().n,0);
 }finally{f.close();}
});

test('recipient package HTTP preparation requires operator token and never enables delivery',async()=>{
 const f=fixture();let server;try{
  const x=await recipientPackageFixture(f);server=createCreatorPlanService({databasePath:join(f.dir,'state.sqlite'),walletPins:f.walletPins,artifactDirectory:join(f.dir,'preflight-private'),rpc:x.rpc,recipientPins:[x.pin],recipientPackageTokenSha256:createHash('sha256').update('f'.repeat(64)).digest('hex'),enableRecipientExport:true,recipientDeliveryTokenSha256:createHash('sha256').update('g'.repeat(64)).digest('hex')});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
  const post=(route,body,token)=>fetch(origin+'/api/regtest/'+route,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...(token?{'X-Professional-Recipient-Package-Token':token}:{})},body:JSON.stringify(body)});
  assert.equal((await post('creator-recipient-package',x.request)).status,403);const result=await (await post('creator-recipient-package',x.request,'f'.repeat(64))).json();assert.equal(result.preparationStatus,'PREPARED');assert.equal(result.delivered,false);assert.equal(result.deliveryAuthorized,false);
  const finish=x.broadcast.sessions.artifactContext(x.request.sessionId).finishBinding;const view=await (await post('creator-finish',finish)).json();assert.equal(view.recipientPackage.packageId,result.packageId);assert.equal(view.recipientDeliveryAvailable,false);assert.equal(view.giftCompleted,false);
  const exportBody={sessionId:x.request.sessionId,packageId:result.packageId,packageDigest:result.integrityDigest,recipientId:x.pin.recipientId,authorizationId:randomUUID()},exportAuth={...exportBody,explicitDeliveryApproval:result.explicitApprovalDigest};
  assert.equal((await post('creator-recipient-authorize',exportAuth)).status,403);
  const deliveryPost=(route,body)=>fetch(origin+'/api/regtest/'+route,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-Professional-Recipient-Delivery-Token':'g'.repeat(64)},body:JSON.stringify(body)});
  assert.equal((await deliveryPost('creator-recipient-authorize',exportAuth)).status,200);const file=await deliveryPost('creator-recipient-export',exportBody);assert.equal(file.status,200);assert.match(file.headers.get('Content-Disposition'),/attachment/);assert.equal(JSON.parse(await file.text()).digest,result.integrityDigest);assert.equal((await deliveryPost('creator-recipient-export',exportBody)).status,409);
  const after=await (await post('creator-finish',finish)).json();assert.equal(after.recipientPackage.deliveryAuthorization,'EXPORTED');assert.equal(after.recipientPackage.delivered,false);

 }finally{if(server)await new Promise(r=>server.close(r));f.close();}
});

test('recipient export requires explicit exact authorization and persists one-use export after reopen',async()=>{
 const f=fixture();let other;try{
  const x=await recipientPackageFixture(f);let now=1000000;const s=new CreatorRecipientPackages(x.broadcast,{recipientPins:[x.pin],rpc:x.rpc,enableExport:true,clock:()=>now});const prepared=await s.prepare(x.request);
  const body={sessionId:x.request.sessionId,packageId:prepared.packageId,packageDigest:prepared.integrityDigest,recipientId:x.pin.recipientId,authorizationId:randomUUID()};
  await assert.rejects(s.exportPackage(body),e=>e.status===409);await assert.rejects(s.authorizeExport({...body,explicitDeliveryApproval:'00'.repeat(32)}),e=>e.status===400);
  const auth=await s.authorizeExport({...body,explicitDeliveryApproval:prepared.explicitApprovalDigest});assert.equal(auth.deliveryAuthorization,'AUTHORIZED');assert.equal(auth.deliveryAuthorized,false);assert.equal(auth.delivered,false);
  await assert.rejects(s.authorizeExport({...body,explicitDeliveryApproval:prepared.explicitApprovalDigest}),e=>e.status===409);
  other=new CreatorPlanStore(join(f.dir,'state.sqlite'));const sessions=new CreatorSigningSessions(new CreatorPlanFunding(other,{walletPins:f.walletPins}),{artifactStore:new CreatorPrivateArtifacts(join(f.dir,'preflight-private'))});const restarted=new CreatorRecipientPackages(new CreatorBroadcast(new CreatorSubmissionPreflight(sessions)),{recipientPins:[x.pin],rpc:x.rpc,enableExport:true,clock:()=>now});
  const exported=await restarted.exportPackage(body),pkg=JSON.parse(exported.bytes.toString());assert.equal(pkg.digest,prepared.integrityDigest);assert.equal(createHash('sha256').update(exported.bytes).digest('hex'),exported.fileDigest);assert.equal(exported.status.deliveryAuthorization,'EXPORTED');assert.equal(exported.status.delivered,false);
  verifyRecipientDeliveryPackage(pkg,pkg.digest,pkg.body.recipient);await assert.rejects(restarted.exportPackage(body),e=>e.status===409);assert.equal(restarted.status(body.sessionId).deliveryAuthorization,'EXPORTED');
 }finally{other?.close();f.close();}
});
test('export rejects recipient/funding/corruption changes and expired or disabled authorization',async()=>{
 const f=fixture();try{
  const x=await recipientPackageFixture(f);let now=1000000;const s=new CreatorRecipientPackages(x.broadcast,{recipientPins:[x.pin],rpc:x.rpc,enableExport:true,clock:()=>now}),p=await s.prepare(x.request);
  const body={sessionId:x.request.sessionId,packageId:p.packageId,packageDigest:p.integrityDigest,recipientId:x.pin.recipientId,authorizationId:randomUUID()},authorization={...body,explicitDeliveryApproval:p.explicitApprovalDigest};
  await assert.rejects(new CreatorRecipientPackages(x.broadcast,{recipientPins:[x.pin],rpc:x.rpc}).authorizeExport(authorization),e=>e.status===403);
  await s.authorizeExport(authorization);await assert.rejects(s.exportPackage({...body,recipientId:'other'}),e=>e.status===409);
  x.unconfirm();await assert.rejects(s.exportPackage(body),e=>e.status===422);x.confirm();
  const row=f.store.db.prepare('SELECT package_json FROM creator_recipient_packages').get(),pkg=JSON.parse(row.package_json);pkg.body.manifest.plan.totalSats++;f.store.db.prepare('UPDATE creator_recipient_packages SET package_json=?').run(JSON.stringify(pkg));await assert.rejects(s.exportPackage(body));f.store.db.prepare('UPDATE creator_recipient_packages SET package_json=?').run(row.package_json);
  f.store.db.prepare("UPDATE creator_recipient_packages SET state='SUPERSEDED'").run();await assert.rejects(s.exportPackage(body),e=>e.status===409);f.store.db.prepare("UPDATE creator_recipient_packages SET state='PREPARED'").run();
  now=1600000;await assert.rejects(s.exportPackage(body),e=>e.status===409);assert.equal(s.status(body.sessionId).deliveryAuthorization,'EXPIRED');assert.equal(s.status(body.sessionId).delivered,false);
 }finally{f.close();}
});

async function recipientImportFixture(f){
 const x=await recipientPackageFixture(f),s=new CreatorRecipientPackages(x.broadcast,{recipientPins:[x.pin],rpc:x.rpc,enableExport:true});
 const p=await s.prepare(x.request),body={sessionId:x.request.sessionId,packageId:p.packageId,packageDigest:p.integrityDigest,recipientId:x.pin.recipientId,authorizationId:randomUUID()};
 await s.authorizeExport({...body,explicitDeliveryApproval:p.explicitApprovalDigest});
 const exported=await s.exportPackage(body);
 return {package:JSON.parse(exported.bytes),expectedDigest:p.integrityDigest,recipientPin:{recipientId:x.pin.recipientId,recipientKeysDigest:digest(x.broadcast.sessions.artifactContext(x.request.sessionId).engine.wallet.recipient),destinationScriptHex:x.pin.destinationScriptHex}};
}
test('recipient import independently pins digest and full identity; survives restart and storage loss',async()=>{
 const f=fixture();let reopened;try{
  const request=await recipientImportFixture(f),imports=new RecipientPackageImports(f.store);
  const result=imports.import(request);assert.equal(result.status,'PACKAGE IMPORTED');
  for(const k of ['fundingVerified','claimAvailable','signingAuthorized','broadcastAuthorized'])assert.equal(result[k],false);
  assert.equal(imports.import(request).duplicate,true);
  reopened=new CreatorPlanStore(join(f.dir,'state.sqlite'));
  const restored=new RecipientPackageImports(reopened).recover({expectedDigest:request.expectedDigest,recipientPin:request.recipientPin});
  assert.equal(restored.packageId,result.packageId);assert.deepEqual(restored.package,request.package);
  assert.equal(new RecipientPackageImports(reopened).import(request).duplicate,true);
  assert.equal(reopened.db.prepare('SELECT count(*) n FROM recipient_package_imports').get().n,1);
 }finally{reopened?.close();f.close();}
});
test('recipient import rejects substitution, wrong independent pins, malformed and corrupted persisted packages',async()=>{
 const f=fixture();try{
  const request=await recipientImportFixture(f),imports=new RecipientPackageImports(f.store);
  assert.throws(()=>imports.import({...request,expectedDigest:'00'.repeat(32)}));
  for(const change of [{recipientId:'other'},{recipientKeysDigest:'00'.repeat(32)},{destinationScriptHex:'0014'+'00'.repeat(20)}])assert.throws(()=>imports.import({...request,recipientPin:{...request.recipientPin,...change}}));
  const corrupted=structuredClone(request);corrupted.package.body.manifest.releases[0].valueSats++;assert.throws(()=>imports.import(corrupted));
  const unsupported=structuredClone(request);unsupported.package.body.network='bitcoin';assert.throws(()=>imports.import(unsupported));
  assert.throws(()=>imports.import({package:request.package}));
  imports.import(request);
  const substituted=structuredClone(request);substituted.package.body.packageId=randomUUID();substituted.expectedDigest=substituted.package.digest=digest(substituted.package.body);assert.throws(()=>imports.import(substituted),/Conflicting/);
  assert.throws(()=>imports.recover({expectedDigest:request.expectedDigest,recipientPin:{...request.recipientPin,recipientId:'other'}}));
  f.store.db.prepare("UPDATE recipient_package_imports SET package_json='{}'").run();assert.throws(()=>imports.recover({expectedDigest:request.expectedDigest,recipientPin:request.recipientPin}));
 }finally{f.close();}
});
test('recipient import HTTP requires same origin and recovers independently pinned public state',async()=>{
 const f=fixture();let server;try{
  const request=await recipientImportFixture(f);server=createCreatorPlanService({databasePath:join(f.dir,'state.sqlite')});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
  const post=(route,body,originHeader=origin)=>fetch(origin+'/api/regtest/recipient-package-'+route,{method:'POST',headers:{Origin:originHeader,'Content-Type':'application/json'},body:JSON.stringify(body)});
  assert.equal((await post('import',request,'http://untrusted.invalid')).status,403);
  assert.equal((await post('import',{package:request.package})).status,409);
  const response=await post('import',request);assert.equal(response.status,200);assert.equal((await response.json()).claimAvailable,false);
  const pins={expectedDigest:request.expectedDigest,recipientPin:request.recipientPin};assert.equal((await post('recover',pins)).status,200);
  assert.equal((await post('import',request)).status,200);
  assert.equal((await fetch(origin+'/recipient-gift-specific-prototype.html')).status,200);assert.equal((await fetch(origin+'/recipient-package-import.browser.mjs')).status,200);
 }finally{if(server)await new Promise(r=>server.close(r));f.close();}
});

async function recipientFundingFixture(f){
 const request=await recipientImportFixture(f),imports=new RecipientPackageImports(f.store);imports.import(request);
 const {expectedDigest,recipientPin}=request,pins={expectedDigest,recipientPin},manifest=request.package.body.manifest,tip='aa'.repeat(32),block=request.package.body.confirmation.blockhash;
 const flags={mtp:manifest.releases[0].locktime,spent:false,mode:'confirmed'};
 const rpc=async(m,p=[])=>{
  if(flags.mode==='offline')throw Error('Synthetic Core outage');
  if(m==='getblockchaininfo'&&flags.mode==='wrong-network')return {chain:'main',initialblockdownload:false};
  if(m==='getblockhash')return p[0]===0?GENESIS:p[0]===99?block:tip;
  if(m==='getblockheader')return p[0]===tip?{hash:tip,height:100,mediantime:flags.mtp,confirmations:1}:{hash:p[0],height:99,confirmations:['reorg','orphan'].includes(flags.mode)?-1:2};
  if(m==='getrawtransaction'&&p[0]===manifest.creatorTxid){
   if(flags.mode==='missing'){const e=Error('No such transaction');e.code=-5;throw e;}
   return {txid:p[0],hex:flags.mode==='changed-bytes'?'00':manifest.creatorRawHex,blockhash:block,confirmations:flags.mode==='conflicted'?-1:['unconfirmed','orphan'].includes(flags.mode)?0:2,vout:bitcoin.Transaction.fromHex(manifest.creatorRawHex).outs.map(o=>({value:o.value/1e8,scriptPubKey:{hex:flags.mode==='mismatch'?'00':o.script.toString('hex')}}))};
  }
  if(m==='gettxout'&&p[0]===manifest.creatorTxid){const r=manifest.releases[p[1]];return flags.spent&&p[1]===0?null:{bestblock:tip,confirmations:2,value:(r.valueSats+(flags.mode==='wrong-utxo'?1:0))/1e8,scriptPubKey:{hex:r.scriptPubKeyHex}};}
  if(m==='getbestblockhash'&&flags.mode==='moving')return 'dd'.repeat(32);
  return f.rpc(m,p);
 };
 return {request,pins,imports,rpc,flags,manifest};
}
test('recipient funding verifies exact outputs and strict CLTV time boundary, never authorizes claims',async()=>{
 const f=fixture();try{
  const x=await recipientFundingFixture(f),s=new RecipientFundingVerification(x.imports,{rpc:x.rpc});
  let result=await s.verify(x.pins);assert.equal(result.status,'FUNDING VERIFIED');assert.equal(result.fundingVerified,true);assert.equal(result.allRecipientOutputsUnspent,true);assert.equal(result.releases[0].mature,false);
  x.flags.mtp++;result=await s.verify(x.pins);assert.equal(result.releases[0].mature,true);assert.equal(result.releases[0].claimPreparationEligible,true);assert.equal(result.releases[1].mature,false);
  assert.equal(result.claimAvailable,false);assert.equal(result.signingAuthorized,false);assert.equal(result.broadcastAuthorized,false);assert.equal(result.releases[0].valueSats,result.releases[0].payoutSats+result.releases[0].miningFeeSats);
  x.flags.spent=true;result=await s.verify(x.pins);assert.equal(result.fundingVerified,true);assert.equal(result.allRecipientOutputsUnspent,false);assert.equal(result.releases[0].unspent,false);assert.equal(result.releases[0].claimPreparationEligible,false);
  assert.ok(f.calls.every(m=>!['sendrawtransaction','generatetoaddress','setmocktime','walletprocesspsbt'].includes(m)));
 }finally{f.close();}
});
test('recipient funding fails closed for missing, conflicting, reorged, shallow, stale and unavailable Core evidence',async()=>{
 const f=fixture();try{
  const x=await recipientFundingFixture(f),s=new RecipientFundingVerification(x.imports,{rpc:x.rpc});
  for(const [mode,status] of [['missing','MISSING'],['unconfirmed','UNCONFIRMED'],['conflicted','CONFLICTED'],['reorg','REORGANIZED'],['orphan','REORGANIZED'],['mismatch','MISMATCHED'],['offline','UNAVAILABLE'],['moving','STALE'],['wrong-network','MISMATCHED'],['changed-bytes','MISMATCHED'],['wrong-utxo','MISMATCHED']]){
   x.flags.mode=mode;const result=await s.verify(x.pins);assert.equal(result.status,status,mode);assert.equal(result.fundingVerified,false);assert.equal(result.claimAvailable,false);assert.deepEqual(result.releases,[]);
  }
  x.flags.mode='confirmed';assert.equal((await new RecipientFundingVerification(x.imports,{rpc:x.rpc,minimumConfirmations:3}).verify(x.pins)).status,'INSUFFICIENT CONFIRMATIONS');
  assert.throws(()=>s.historical({...x.pins,recipientPin:{...x.pins.recipientPin,recipientId:'other'}}));
 }finally{f.close();}
});
test('recipient observation history survives restart but never becomes fresh authority',async()=>{
 const f=fixture();let reopened;try{
  const x=await recipientFundingFixture(f),s=new RecipientFundingVerification(x.imports,{rpc:x.rpc});const first=await s.verify(x.pins);
  reopened=new CreatorPlanStore(join(f.dir,'state.sqlite'));const next=new RecipientFundingVerification(new RecipientPackageImports(reopened));
  const history=next.historical(x.pins);assert.equal(history.status,'REVERIFY REQUIRED');assert.equal(history.fresh,false);assert.equal(history.fundingVerified,false);assert.equal(history.claimAvailable,false);assert.equal(history.historicalObservation.observationId,first.observationId);
  assert.equal((await next.verify(x.pins)).status,'UNAVAILABLE');assert.equal(next.historical(x.pins).historicalObservation.status,'UNAVAILABLE');assert.equal(reopened.db.prepare('SELECT count(*) n FROM recipient_funding_observations').get().n,2);
 }finally{reopened?.close();f.close();}
});
test('CLTV candidate-height and BIP113 MTP boundaries use strict transaction finality',()=>{
 assert.equal(recipientCltvMature(101,100,1893542400),false);assert.equal(recipientCltvMature(100,100,1893542400),true);
 assert.equal(recipientCltvMature(1893542400,100,1893542400),false);assert.equal(recipientCltvMature(1893542400,100,1893542401),true);
 assert.throws(()=>recipientCltvMature(1893542400,100,NaN));
});

test('recipient verification HTTP rechecks live mock Core; history is never fresh authority',async()=>{
 const f=fixture();let server;try{
  const x=await recipientFundingFixture(f);server=createCreatorPlanService({databasePath:join(f.dir,'state.sqlite'),rpc:x.rpc});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
  const post=(route,pins=x.pins,originHeader=origin)=>fetch(origin+'/api/regtest/recipient-package-'+route,{method:'POST',headers:{Origin:originHeader,'Content-Type':'application/json'},body:JSON.stringify(pins)});
  assert.equal((await post('verify',x.pins,'http://untrusted.invalid')).status,403);assert.equal((await post('verify',{...x.pins,recipientPin:{...x.pins.recipientPin,recipientId:'other'}})).status,409);
  let r=await (await post('verify')).json();assert.equal(r.fundingVerified,true);assert.equal(r.claimAvailable,false);
  r=await (await post('history')).json();assert.equal(r.fresh,false);assert.equal(r.fundingVerified,false);
  x.flags.mode='offline';r=await (await post('verify')).json();assert.equal(r.status,'UNAVAILABLE');assert.equal(r.fundingVerified,false);assert.equal(r.claimAvailable,false);
 }finally{if(server)await new Promise(r=>server.close(r));f.close();}
});

async function recipientClaimFixture(f){
 const x=await recipientFundingFixture(f);x.flags.mtp=x.manifest.releases.at(-1).locktime+1;
 const pin={packageDigest:x.pins.expectedDigest,recipientId:x.pins.recipientPin.recipientId,walletDigest:f.registration.walletDigest};
 const funding=new RecipientFundingVerification(x.imports,{rpc:x.rpc}),claims=new RecipientClaimPreparation(funding,{claimPins:[pin]});
 const request={...x.pins,operationId:randomUUID(),releaseNumber:1,signer:f.registration.wallet.recipient[0],registration:f.registration,explicitPreparationApproval:true};
 return {...x,pin,funding,claims,request};
}
test('recipient explicit single-release preparation binds approved unsigned claim and survives restart without signing authority',async()=>{
 const f=fixture();let other;try{
  const x=await recipientClaimFixture(f),result=await x.claims.prepare(x.request);
  assert.equal(result.status,'CLAIM PREPARED');assert.equal(result.claimSigned,false);assert.equal(result.signingAuthorized,false);assert.equal(result.broadcastAuthorized,false);assert.equal(result.claimAvailable,false);
  assert.equal(result.principalSats,20001);assert.equal(result.principalSats,result.payoutSats+result.miningFeeSats);assert.equal(result.locktime,x.manifest.releases[0].locktime);assert.equal(result.sequence,0xfffffffd);assert.equal(result.signer.path,x.manifest.releases[0].key.path);
  assert.equal(result.unsignedPsbtBase64,x.imports.recover(x.pins).package.body.customerHandoff.psbts[0].approvedUnsignedBase64);
  await assert.rejects(x.claims.prepare(x.request),e=>e.status===409);await assert.rejects(x.claims.prepare({...x.request,operationId:randomUUID()}),e=>e.status===409);
  other=new CreatorPlanStore(join(f.dir,'state.sqlite'));const restarted=new RecipientClaimPreparation(new RecipientFundingVerification(new RecipientPackageImports(other)),{claimPins:[x.pin]});
  const recovered=restarted.recover({...x.pins,claimId:result.claimId});assert.equal(recovered.requestDigest,result.requestDigest);assert.equal(recovered.currentEligibilityUnverified,true);assert.equal(recovered.preparationEvidence.fresh,false);assert.equal(recovered.signingAuthorized,false);
  const stored=JSON.parse(other.db.prepare('SELECT record_json FROM recipient_claim_preparations').get().record_json);assert.equal(stored.registration,undefined);assert.equal(stored.registrationProofDigest,digest(f.registration));
  stored.payoutSats++;other.db.prepare('UPDATE recipient_claim_preparations SET record_json=?').run(JSON.stringify(stored));assert.throws(()=>restarted.recover({...x.pins,claimId:result.claimId}),e=>e.status===409);
 }finally{other?.close();f.close();}
});
test('recipient claim preparation rejects wrong recipient, unpinned wallet, invalid possession, wrong signer and unsupported selection',async()=>{
 const f=fixture();try{
  const x=await recipientClaimFixture(f);
  await assert.rejects(new RecipientClaimPreparation(x.funding).prepare(x.request),e=>e.status===403);
  await assert.rejects(x.claims.prepare({...x.request,recipientPin:{...x.pins.recipientPin,recipientId:'other'}}));
  await assert.rejects(x.claims.prepare({...x.request,signer:f.registration.wallet.recipient[1]}),e=>e.status===403);
  const invalid=structuredClone(x.request);invalid.registration.proofs[3]='00'.repeat(64);await assert.rejects(x.claims.prepare(invalid),e=>e.status===403);
  await assert.rejects(x.claims.prepare({...x.request,explicitPreparationApproval:false}),e=>e.status===400);
  await assert.rejects(x.claims.prepare({...x.request,releaseNumber:99}),e=>e.status===400);
  await assert.rejects(x.claims.prepare({...x.request,releaseNumbers:[1,2]}),e=>e.status===400);
  await assert.rejects(x.claims.prepare({...x.request,registration:{...f.registration,seed:'forbidden'}}),e=>e.status===400);
  assert.equal(f.store.db.prepare('SELECT count(*) n FROM recipient_claim_preparations').get().n,0);
 }finally{f.close();}
});
test('claim preparation requires fresh unspent mature funding and rejects reorganization or changed evidence',async()=>{
 const f=fixture();try{
  const x=await recipientClaimFixture(f);
  x.flags.mtp=x.manifest.releases[0].locktime;await assert.rejects(x.claims.prepare(x.request),e=>e.status===422);x.flags.mtp++;
  x.flags.spent=true;await assert.rejects(x.claims.prepare(x.request),e=>e.status===422);x.flags.spent=false;
  for(const mode of ['missing','unconfirmed','reorg','offline','changed-bytes','wrong-utxo','moving']){x.flags.mode=mode;await assert.rejects(x.claims.prepare(x.request),e=>e.status===422);}
  assert.equal(f.store.db.prepare('SELECT count(*) n FROM recipient_claim_preparations').get().n,0);
 }finally{f.close();}
});
test('recipient claim preparation HTTP requires separate operator token and exact pinned signer',async()=>{
 const f=fixture();let server;try{
  const x=await recipientClaimFixture(f);server=createCreatorPlanService({databasePath:join(f.dir,'state.sqlite'),rpc:x.rpc,recipientClaimPins:[x.pin],recipientClaimTokenSha256:createHash('sha256').update('h'.repeat(64)).digest('hex')});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
  const post=(route,body,token,originHeader=origin)=>fetch(origin+'/api/regtest/recipient-package-'+route,{method:'POST',headers:{Origin:originHeader,'Content-Type':'application/json',...(token?{'X-Professional-Recipient-Claim-Token':token}:{})},body:JSON.stringify(body)});
  assert.equal((await post('claim-prepare',x.request)).status,403);assert.equal((await post('claim-prepare',x.request,'h'.repeat(64),'http://untrusted.invalid')).status,403);
  const response=await post('claim-prepare',x.request,'h'.repeat(64));assert.equal(response.status,200);const result=await response.json();assert.equal(result.claimSigned,false);
  assert.equal((await post('claim-prepare',x.request,'h'.repeat(64))).status,409);
  const recovery=await post('claim-recover',{...x.pins,claimId:result.claimId},'h'.repeat(64));assert.equal(recovery.status,200);assert.equal((await recovery.json()).currentEligibilityUnverified,true);
 }finally{if(server)await new Promise(r=>server.close(r));f.close();}
});

test('recipient claim preparation rechecks selected outpoint after observation and rejects concurrent duplicates',async()=>{
 const f=fixture();try{
  const x=await recipientClaimFixture(f),original=x.funding.verify.bind(x.funding);
  x.funding.verify=async pins=>{const result=await original(pins);x.flags.spent=true;return result;};
  await assert.rejects(x.claims.prepare(x.request));assert.equal(f.store.db.prepare('SELECT count(*) n FROM recipient_claim_preparations').get().n,0);
  x.flags.spent=false;x.funding.verify=original;
  const results=await Promise.allSettled([x.claims.prepare(x.request),x.claims.prepare(x.request)]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.filter(r=>r.status==='rejected').length,1);assert.equal(f.store.db.prepare('SELECT count(*) n FROM recipient_claim_preparations').get().n,1);
 }finally{f.close();}
});

async function recipientReviewFixture(f,clock=()=>Date.now()){
 const x=await recipientClaimFixture(f),prepared=await x.claims.prepare(x.request),review=new RecipientClaimReview(x.claims,{clock});
 const identity={...x.pins,claimId:prepared.claimId,requestDigest:prepared.requestDigest},intent=review.intent(identity);
 const binding={...identity,reviewId:randomUUID(),acknowledgementDigest:intent.acknowledgementDigest};
 return {...x,prepared,review,identity,intent,binding,ack:{...binding,acknowledgedIntent:intent.intent}};
}
test('recipient exact-claim acknowledgement consumes one review handoff and restores without renewing after restart',async()=>{
 const f=fixture();let other;try{
  let now=1000000;const x=await recipientReviewFixture(f,()=>now);
  const authorized=await x.review.acknowledge(x.ack);assert.equal(authorized.status,'REVIEW AUTHORIZED');assert.equal(authorized.signingAuthorized,false);
  other=new CreatorPlanStore(join(f.dir,'state.sqlite'));const claims=new RecipientClaimPreparation(new RecipientFundingVerification(new RecipientPackageImports(other),{rpc:x.rpc}),{claimPins:[x.pin]}),review=new RecipientClaimReview(claims,{clock:()=>now});
  const handoff=await review.handoff(x.binding);assert.equal(handoff.reviewOnly,true);assert.equal(handoff.claimSigned,false);assert.equal(handoff.signingAuthorized,false);assert.equal(handoff.broadcastAuthorized,false);assert.equal(handoff.unsignedPsbtBase64,x.prepared.unsignedPsbtBase64);assert.equal(handoff.intent.miningFeeSats,x.prepared.miningFeeSats);assert.equal(handoff.intent.outputs[0].valueSats,x.prepared.payoutSats);
  await assert.rejects(review.handoff(x.binding),e=>e.status===409);await assert.rejects(review.acknowledge(x.ack),e=>e.status===409);
  now+=1000;const restored=await review.restore(x.binding);assert.equal(restored.restored,true);assert.equal(restored.expiresAt,authorized.expiresAt);assert.equal(restored.acknowledgementDigest,authorized.acknowledgementDigest);
  const state=other.db.prepare('SELECT state,consumed_at FROM recipient_claim_reviews').get();assert.equal(state.state,'CONSUMED');assert.equal(state.consumed_at,1000000);
 }finally{other?.close();f.close();}
});
test('claim review rejects changed fees/outputs, wrong recipient, altered PSBT digest and duplicate identities',async()=>{
 const f=fixture();try{
  const x=await recipientReviewFixture(f);
  for(const alter of [a=>a.acknowledgedIntent.outputs[0].valueSats++,a=>a.acknowledgedIntent.miningFeeSats++,a=>a.acknowledgedIntent.unsignedPsbtSha256='00'.repeat(32),a=>a.acknowledgedIntent.inputs[0].vout++,a=>a.acknowledgedIntent.locktime++]){
   const changed=structuredClone(x.ack);alter(changed);changed.acknowledgementDigest=digest(changed.acknowledgedIntent);await assert.rejects(x.review.acknowledge(changed),e=>e.status===409);
  }
  await assert.rejects(x.review.acknowledge({...x.ack,recipientPin:{...x.pins.recipientPin,recipientId:'other'}}));
  await x.review.acknowledge(x.ack);await assert.rejects(x.review.handoff({...x.binding,acknowledgementDigest:'00'.repeat(32)}),e=>e.status===409);
  await assert.rejects(x.review.acknowledge({...x.ack,reviewId:randomUUID()}),e=>e.status===409);
  assert.equal(f.store.db.prepare('SELECT state FROM recipient_claim_reviews').get().state,'AUTHORIZED');
 }finally{f.close();}
});
test('review expiry, stale funding, spent inputs and unavailable Core fail closed without renewed authorization',async()=>{
 const f=fixture();try{
  let now=1000000;const x=await recipientReviewFixture(f,()=>now);
  x.flags.spent=true;await assert.rejects(x.review.acknowledge(x.ack),e=>e.status===422);x.flags.spent=false;
  await x.review.acknowledge(x.ack);x.flags.mtp=x.manifest.releases[0].locktime;await assert.rejects(x.review.handoff(x.binding),e=>e.status===422);x.flags.mtp++;
  x.flags.mode='reorg';await assert.rejects(x.review.handoff(x.binding),e=>e.status===422);x.flags.mode='confirmed';
  now+=600000;await assert.rejects(x.review.handoff(x.binding),e=>e.status===409);await assert.rejects(x.review.acknowledge({...x.ack,reviewId:randomUUID()}),e=>e.status===409);
  assert.equal(f.store.db.prepare('SELECT state FROM recipient_claim_reviews').get().state,'AUTHORIZED');
 }finally{f.close();}
});
test('consumed claim review cannot restore when expired, Core unavailable or persisted intent corrupted',async()=>{
 const f=fixture();try{
  let now=1000000;const x=await recipientReviewFixture(f,()=>now);await x.review.acknowledge(x.ack);await x.review.handoff(x.binding);
  x.flags.mode='offline';await assert.rejects(x.review.restore(x.binding),e=>e.status===422);x.flags.mode='confirmed';
  const row=f.store.db.prepare('SELECT intent_json FROM recipient_claim_reviews').get();const bad=JSON.parse(row.intent_json);bad.outputs[0].valueSats++;f.store.db.prepare('UPDATE recipient_claim_reviews SET intent_json=?').run(JSON.stringify(bad));await assert.rejects(x.review.restore(x.binding),e=>e.status===409);f.store.db.prepare('UPDATE recipient_claim_reviews SET intent_json=?').run(row.intent_json);
  now+=600000;await assert.rejects(x.review.restore(x.binding),e=>e.status===409);
 }finally{f.close();}
});
test('recipient review HTTP requires operator token and same-origin exact acknowledgement',async()=>{
 const f=fixture();let server;try{
  const x=await recipientReviewFixture(f);server=createCreatorPlanService({databasePath:join(f.dir,'state.sqlite'),rpc:x.rpc,recipientClaimPins:[x.pin],recipientClaimTokenSha256:createHash('sha256').update('h'.repeat(64)).digest('hex')});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
  const post=(route,body,token='h'.repeat(64),originHeader=origin)=>fetch(origin+'/api/regtest/recipient-package-review-'+route,{method:'POST',headers:{Origin:originHeader,'Content-Type':'application/json','X-Professional-Recipient-Claim-Token':token},body:JSON.stringify(body)});
  assert.equal((await post('acknowledge',x.ack,'wrong')).status,403);assert.equal((await post('acknowledge',x.ack,'h'.repeat(64),'http://untrusted.invalid')).status,403);
  assert.equal((await post('intent',x.identity)).status,200);assert.equal((await post('acknowledge',x.ack)).status,200);assert.equal((await post('handoff',x.binding)).status,200);assert.equal((await post('handoff',x.binding)).status,409);
  const restored=await (await post('restore',x.binding)).json();assert.equal(restored.reviewOnly,true);assert.equal(restored.claimSigned,false);assert.equal(restored.signingAuthorized,false);
 }finally{if(server)await new Promise(r=>server.close(r));f.close();}
});

test('concurrent recipient acknowledgements and handoffs consume exactly one authorization',async()=>{
 const f=fixture();try{
  const x=await recipientReviewFixture(f),acks=await Promise.allSettled([x.review.acknowledge(x.ack),x.review.acknowledge(x.ack)]);
  assert.equal(acks.filter(r=>r.status==='fulfilled').length,1);
  const handoffs=await Promise.allSettled([x.review.handoff(x.binding),x.review.handoff(x.binding)]);assert.equal(handoffs.filter(r=>r.status==='fulfilled').length,1);assert.equal(handoffs.filter(r=>r.status==='rejected').length,1);
  assert.equal(f.store.db.prepare('SELECT count(*) n FROM recipient_claim_reviews').get().n,1);assert.equal(f.store.db.prepare('SELECT state FROM recipient_claim_reviews').get().state,'CONSUMED');
 }finally{f.close();}
});

async function recipientSigningFixture(f,clock=()=>Date.now()){
 const x=await recipientReviewFixture(f,clock);await x.review.acknowledge(x.ack);await x.review.handoff(x.binding);
 const signing=new RecipientClaimSigning(x.review,{enabled:true,clock}),binding={...x.binding,sessionId:randomUUID()},authorization={...binding,explicitSigningApproval:x.binding.acknowledgementDigest};
 return {...x,signing,signingBinding:binding,authorization};
}
test('recipient signing authorizes exact reviewed claim and verifies synthetic signature across restart without retaining bytes',async()=>{
 const f=fixture();let other;try{
  let now=1000000;const x=await recipientSigningFixture(f,()=>now),authorized=await x.signing.authorize(x.authorization);assert.equal(authorized.status,'SIGNING AUTHORIZED');assert.equal(authorized.signingAuthorized,true);assert.equal(authorized.broadcastAuthorized,false);assert.equal(authorized.expiresAt,1300000);
  await assert.rejects(x.signing.authorize(x.authorization),e=>e.status===409);
  const prepared=x.signing.checked(x.signingBinding),signed=signDisposableRequest(join(f.dir,'disposable.json'),prepared.signingRequest,prepared.signingRequest.requestDigest);
  other=new CreatorPlanStore(join(f.dir,'state.sqlite'));const claims=new RecipientClaimPreparation(new RecipientFundingVerification(new RecipientPackageImports(other),{rpc:x.rpc}),{claimPins:[x.pin]}),review=new RecipientClaimReview(claims,{clock:()=>now}),sessions=new RecipientClaimSigning(review,{enabled:true,clock:()=>now});
  const restored=await sessions.restore(x.signingBinding);assert.equal(restored.sessionId,authorized.sessionId);assert.equal(restored.expiresAt,authorized.expiresAt);
  const result=await sessions.acceptReturn({...x.signingBinding,signedPayload:signed.signedPsbtBase64});assert.equal(result.status,'CLAIM SIGNED — NOT BROADCAST');assert.equal(result.claimSigned,true);assert.equal(result.receipt.signatureCryptographicallyVerified,true);assert.equal(result.receipt.hardwareOriginAttested,false);assert.equal(result.artifactRetained,false);assert.equal(result.receipt.feeSats,x.prepared.miningFeeSats);assert.equal(result.receipt.intent.outputs[0].valueSats,x.prepared.payoutSats);assert.equal(result.broadcastAuthorized,false);
  await assert.rejects(sessions.acceptReturn({...x.signingBinding,signedPayload:signed.signedPsbtBase64}),e=>e.status===409);
  now+=700000;x.flags.mode='offline';const history=await sessions.restore(x.signingBinding);assert.equal(history.receipt.txid,result.receipt.txid);assert.equal(history.signingAuthorized,false);
  const finalStore=new CreatorPlanStore(join(f.dir,'state.sqlite'));
  try{const finalClaims=new RecipientClaimPreparation(new RecipientFundingVerification(new RecipientPackageImports(finalStore)),{claimPins:[x.pin]}),finalSessions=new RecipientClaimSigning(new RecipientClaimReview(finalClaims,{clock:()=>now}),{enabled:false,clock:()=>now});assert.equal((await finalSessions.restore(x.signingBinding)).receipt.txid,result.receipt.txid);}finally{finalStore.close();}

  const row=other.db.prepare('SELECT * FROM recipient_claim_signing').get();assert.ok(!JSON.stringify(row).includes(signed.signedPsbtBase64));assert.ok(!JSON.stringify(row).includes('rawTransactionHex'));assert.equal(row.state,'VERIFIED_RETURN');
 }finally{other?.close();f.close();}
});
test('recipient signing rejects disabled/implicit/wrong identity authorization and fresh funding failures',async()=>{
 const f=fixture();try{
  const x=await recipientSigningFixture(f);
  await assert.rejects(new RecipientClaimSigning(x.review).authorize(x.authorization),e=>e.status===403);
  await assert.rejects(x.signing.authorize({...x.authorization,explicitSigningApproval:'00'.repeat(32)}),e=>e.status===400);
  await assert.rejects(x.signing.authorize({...x.authorization,recipientPin:{...x.pins.recipientPin,recipientId:'other'}}));
  x.flags.spent=true;await assert.rejects(x.signing.authorize(x.authorization),e=>e.status===422);x.flags.spent=false;
  x.flags.mtp=x.manifest.releases[0].locktime;await assert.rejects(x.signing.authorize(x.authorization),e=>e.status===422);
  assert.equal(f.store.db.prepare('SELECT count(*) n FROM recipient_claim_signing').get().n,0);
 }finally{f.close();}
});
test('recipient signing rejects altered outputs/locktime, invalid or wrong-key signatures and expires without revival',async()=>{
 const f=fixture();try{
  let now=1000000;const x=await recipientSigningFixture(f,()=>now);await x.signing.authorize(x.authorization);
  const c=x.signing.checked(x.signingBinding),signed=signDisposableRequest(join(f.dir,'disposable.json'),c.signingRequest,c.signingRequest.requestDigest).signedPsbtBase64;
  const before=bitcoin.Psbt.fromBase64(signed);
  for(const mode of ['amount','locktime','signature','signer','origin','sighash']){
   const p=bitcoin.Psbt.fromBase64(signed);
   if(mode==='amount'){delete p.data.inputs[0].partialSig;p.updateOutput(0,{value:x.prepared.payoutSats-1});}
   if(mode==='locktime'){delete p.data.inputs[0].partialSig;p.setLocktime(x.prepared.locktime+1);}
   if(mode==='signature')p.data.inputs[0].partialSig[0].signature=Buffer.from('300602010102010101','hex');
   if(mode==='signer')p.data.inputs[0].partialSig[0].pubkey=Buffer.from(f.registration.wallet.creator.publicKeyHex,'hex');
   if(mode==='origin')p.data.inputs[0].bip32Derivation[0].path="m/84'/1'/0'/1/99";
   if(mode==='sighash')p.data.inputs[0].partialSig[0].signature[p.data.inputs[0].partialSig[0].signature.length-1]=2;
   await assert.rejects(x.signing.acceptReturn({...x.signingBinding,signedPayload:p.toBase64()}),e=>e.status===422,mode);
  }
  await assert.rejects(x.signing.acceptReturn({...x.signingBinding,signedPayload:c.signingRequest.unsignedPsbtBase64}),e=>e.status===422);
  assert.ok(before.data.inputs[0].partialSig);
  x.flags.spent=true;await assert.rejects(x.signing.acceptReturn({...x.signingBinding,signedPayload:signed}),e=>e.status===422);x.flags.spent=false;
  x.flags.mode='reorg';await assert.rejects(x.signing.acceptReturn({...x.signingBinding,signedPayload:signed}),e=>e.status===422);x.flags.mode='confirmed';
  x.flags.mode='offline';await assert.rejects(x.signing.acceptReturn({...x.signingBinding,signedPayload:signed}),e=>e.status===422);x.flags.mode='confirmed';
  now+=300000;await assert.rejects(x.signing.restore(x.signingBinding),e=>e.status===409);await assert.rejects(x.signing.acceptReturn({...x.signingBinding,signedPayload:signed}),e=>e.status===409);await assert.rejects(x.signing.authorize({...x.authorization,sessionId:randomUUID()}),e=>e.status===409);
 }finally{f.close();}
});
test('recipient signing serializes simultaneous returns and rejects corrupted verified receipts',async()=>{
 const f=fixture();try{
  const x=await recipientSigningFixture(f);await x.signing.authorize(x.authorization);const c=x.signing.checked(x.signingBinding),signed=signDisposableRequest(join(f.dir,'disposable.json'),c.signingRequest,c.signingRequest.requestDigest).signedPsbtBase64;
  const results=await Promise.allSettled([x.signing.acceptReturn({...x.signingBinding,signedPayload:signed}),x.signing.acceptReturn({...x.signingBinding,signedPayload:signed})]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.filter(r=>r.status==='rejected').length,1);
  const row=f.store.db.prepare('SELECT receipt_json FROM recipient_claim_signing').get(),receipt=JSON.parse(row.receipt_json);receipt.feeSats++;f.store.db.prepare('UPDATE recipient_claim_signing SET receipt_json=?').run(JSON.stringify(receipt));await assert.rejects(x.signing.restore(x.signingBinding),e=>e.status===409);
 }finally{f.close();}
});
test('recipient signing HTTP requires separate signing token, returns exact receipt and has no submission path',async()=>{
 const f=fixture();let server;try{
  const x=await recipientSigningFixture(f);server=createCreatorPlanService({databasePath:join(f.dir,'state.sqlite'),rpc:x.rpc,recipientClaimPins:[x.pin],enableRecipientSigningSessions:true,recipientArtifactDirectory:join(f.dir,'recipient-service-private'),recipientSigningTokenSha256:createHash('sha256').update('i'.repeat(64)).digest('hex')});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
  const post=(route,body,token='i'.repeat(64))=>fetch(origin+'/api/regtest/recipient-package-signing-'+route,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-Professional-Recipient-Signing-Token':token},body:JSON.stringify(body)});
  assert.equal((await post('authorize',x.authorization,'h'.repeat(64))).status,403);const authorized=await post('authorize',x.authorization);assert.equal(authorized.status,200);assert.equal((await authorized.json()).status,'SIGNING AUTHORIZED');
  const c=x.signing.checked(x.signingBinding),signed=signDisposableRequest(join(f.dir,'disposable.json'),c.signingRequest,c.signingRequest.requestDigest).signedPsbtBase64;
  const response=await post('return',{...x.signingBinding,signedPayload:signed});assert.equal(response.status,200);const receipt=await response.json();assert.equal(receipt.status,'CLAIM SIGNED — NOT BROADCAST');assert.equal(receipt.broadcastAuthorized,false);assert.equal((await post('return',{...x.signingBinding,signedPayload:signed})).status,409);
  assert.equal((await post('broadcast',x.signingBinding)).status,405);
 }finally{if(server)await new Promise(r=>server.close(r));f.close();}
});

test('recipient signing accepts saved Jade frames with precisely witness-stripped parent metadata',async()=>{
 const f=fixture();try{
  const x=await recipientSigningFixture(f);await x.signing.authorize(x.authorization);const c=x.signing.checked(x.signingBinding),signed=signDisposableRequest(join(f.dir,'disposable.json'),c.signingRequest,c.signingRequest.requestDigest).signedPsbtBase64;
  const p=bitcoin.Psbt.fromBase64(signed),parent=bitcoin.Transaction.fromBuffer(p.data.inputs[0].nonWitnessUtxo);parent.ins.forEach((_,i)=>parent.setWitness(i,[]));p.data.inputs[0].nonWitnessUtxo=parent.toBuffer();
  const frames=makeCryptoPsbtFrames(p.toBuffer()),result=await x.signing.acceptReturn({...x.signingBinding,signedPayload:frames.join('\n')});assert.equal(result.status,'CLAIM SIGNED — NOT BROADCAST');assert.equal(result.receipt.signatureCryptographicallyVerified,true);assert.equal(result.receipt.artifactRetained,false);
 }finally{f.close();}
});

test('recipient signing expiry is capped by review and concurrent authorizations cannot replace a session',async()=>{
 const f=fixture();try{
  let now=1000000;const x=await recipientSigningFixture(f,()=>now);now=1500000;
  const results=await Promise.allSettled([x.signing.authorize(x.authorization),x.signing.authorize({...x.authorization,sessionId:randomUUID()})]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.filter(r=>r.status==='rejected').length,1);
  const active=results.find(r=>r.status==='fulfilled').value;assert.equal(active.expiresAt,1600000);now=1600000;
  await assert.rejects(x.signing.restore({...x.binding,sessionId:active.sessionId}),e=>e.status===409);
 }finally{f.close();}
});

async function recipientRetentionFixture(f){
 const x=await recipientSigningFixture(f),directory=join(f.dir,'recipient-private');x.signing.artifactStore=new CreatorPrivateArtifacts(directory);
 await x.signing.authorize(x.authorization);const c=x.signing.checked(x.signingBinding),signed=signDisposableRequest(join(f.dir,'disposable.json'),c.signingRequest,c.signingRequest.requestDigest).signedPsbtBase64;
 const state=await x.signing.acceptReturn({...x.signingBinding,signedPayload:signed});
 return {...x,directory,signed,state,file:join(directory,state.receipt.signedPsbtSha256+'.psbt')};
}
test('recipient private artifacts retain exact signed claim and recover after restart with independent bindings',async()=>{
 const f=fixture();let other;try{
  const x=await recipientRetentionFixture(f);assert.equal(x.state.artifactRetained,true);assert.equal(x.state.artifactIntegrityVerified,true);assert.equal(x.state.receipt.artifactRetained,true);
  assert.equal(readFileSync(x.file).toString('base64'),x.signed);assert.equal(statSync(x.directory).mode&0o777,0o700);assert.equal(statSync(x.file).mode&0o777,0o600);
  other=new CreatorPlanStore(join(f.dir,'state.sqlite'));const claims=new RecipientClaimPreparation(new RecipientFundingVerification(new RecipientPackageImports(other)),{claimPins:[x.pin]}),sessions=new RecipientClaimSigning(new RecipientClaimReview(claims),{artifactStore:new CreatorPrivateArtifacts(x.directory)});
  const recovered=sessions.recoverArtifact(x.signingBinding.sessionId);assert.equal(recovered.transactionId,x.state.receipt.txid);assert.equal(recovered.artifactVerified,true);assert.deepEqual(recovered.signingBinding,x.signingBinding);assert.equal(recovered.signingAuthorized,false);assert.equal(recovered.broadcastAuthorized,false);
  assert.equal(sessions.importArtifact(x.signingBinding.sessionId,x.signed).artifactSha256,x.state.receipt.signedPsbtSha256);assert.equal(other.db.prepare('SELECT count(*) n FROM recipient_signed_artifacts').get().n,1);assert.equal(other.db.prepare('SELECT count(*) n FROM creator_signed_artifacts').get().n,1);
  const row=other.db.prepare('SELECT * FROM recipient_signed_artifacts').get();assert.equal(row.receipt_digest,x.state.receiptDigest);assert.ok(!JSON.stringify(row).includes(x.signed));
 }finally{other?.close();f.close();}
});
test('recipient artifact recovery rejects corruption, conflicting identities and permission changes without overwrite',async()=>{
 const f=fixture();try{
  const x=await recipientRetentionFixture(f),sessionId=x.signingBinding.sessionId,original=readFileSync(x.file);
  assert.throws(()=>x.signing.importArtifact(sessionId,x.prepared.unsignedPsbtBase64));
  const changed=bitcoin.Psbt.fromBase64(x.signed);changed.data.inputs[0].partialSig[0].signature=Buffer.from('300602010102010101','hex');assert.throws(()=>x.signing.importArtifact(sessionId,changed.toBase64()));
  assert.throws(()=>x.signing.recoverArtifact(randomUUID()));
  writeFileSync(x.file,Buffer.alloc(original.length));assert.throws(()=>x.signing.recoverArtifact(sessionId));assert.throws(()=>x.signing.importArtifact(sessionId,x.signed));assert.deepEqual(readFileSync(x.file),Buffer.alloc(original.length));
  writeFileSync(x.file,original);chmodSync(x.file,0o644);assert.throws(()=>x.signing.recoverArtifact(sessionId));chmodSync(x.file,0o600);
  const row=f.store.db.prepare('SELECT * FROM recipient_signed_artifacts').get();f.store.db.prepare('UPDATE recipient_signed_artifacts SET receipt_digest=?').run('00'.repeat(32));assert.throws(()=>x.signing.recoverArtifact(sessionId));assert.throws(()=>x.signing.importArtifact(sessionId,x.signed));f.store.db.prepare('UPDATE recipient_signed_artifacts SET receipt_digest=?').run(row.receipt_digest);
  unlinkSync(x.file);assert.throws(()=>x.signing.recoverArtifact(sessionId));assert.equal(x.signing.importArtifact(sessionId,x.signed).artifactVerified,true);
  f.store.db.prepare('DELETE FROM recipient_signed_artifacts').run();assert.equal(x.signing.importArtifact(sessionId,x.signed).artifactVerified,true);
 }finally{f.close();}
});
test('recipient retention storage failure or expiry during durable write never consumes signing session',async()=>{
 const f=fixture();try{
  let now=1000000;const x=await recipientSigningFixture(f,()=>now);await x.signing.authorize(x.authorization);const c=x.signing.checked(x.signingBinding),signedPayload=signDisposableRequest(join(f.dir,'disposable.json'),c.signingRequest,c.signingRequest.requestDigest).signedPsbtBase64;
  x.signing.artifactStore={put(){throw Error('Storage unavailable');}};
  await assert.rejects(x.signing.acceptReturn({...x.signingBinding,signedPayload}),/Storage unavailable/);
  assert.equal(f.store.db.prepare('SELECT state FROM recipient_claim_signing').get().state,'AUTHORIZED');assert.equal(f.store.db.prepare('SELECT count(*) n FROM recipient_signed_artifacts').get().n,0);
  const store=new CreatorPrivateArtifacts(join(f.dir,'slow-private'));x.signing.artifactStore={put(bytes){const result=store.put(bytes);now=1300000;return result;}};
  await assert.rejects(x.signing.acceptReturn({...x.signingBinding,signedPayload}),e=>e.status===409);assert.equal(f.store.db.prepare('SELECT state FROM recipient_claim_signing').get().state,'AUTHORIZED');assert.equal(f.store.db.prepare('SELECT count(*) n FROM recipient_signed_artifacts').get().n,0);
 }finally{f.close();}
});
test('shared operator CLI exports and reimports recipient claims privately without creator identity confusion',async()=>{
 const f=fixture();try{
  const x=await recipientRetentionFixture(f),config=join(f.dir,'recipient-operator.json'),output=join(f.dir,'private-export','claim.psbt');writeFileSync(config,JSON.stringify({recipientClaimPins:[x.pin],recipientArtifactDirectory:x.directory}),{mode:0o600});
  const helper=new URL('./lifecycle/creator-artifact-operator.mjs',import.meta.url).pathname;
  const run=mode=>JSON.parse(execFileSync(process.execPath,[...process.execArgv.filter(a=>a!=='--test'),helper,'--recipient',mode,join(f.dir,'state.sqlite'),config,x.signingBinding.sessionId,output],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));
  assert.equal(run('recover').artifactVerified,true);assert.equal(run('export').artifactVerified,true);assert.equal(readFileSync(output).toString('base64'),x.signed);assert.equal(statSync(output).mode&0o777,0o600);assert.throws(()=>run('export'));
  unlinkSync(x.file);assert.equal(run('import').artifactVerified,true);assert.equal(readFileSync(x.file).toString('base64'),x.signed);
  assert.equal(f.store.db.prepare('SELECT count(*) n FROM recipient_signed_artifacts').get().n,1);
 }finally{f.close();}
});
test('recipient artifact HTTP requires recovery token and independent package/recipient pins after browser loss',async()=>{
 const f=fixture();let server;try{
  assert.throws(()=>createCreatorPlanService({databasePath:':memory:',enableRecipientSigningSessions:true}),/private artifact/);
  const x=await recipientRetentionFixture(f);server=createCreatorPlanService({databasePath:join(f.dir,'state.sqlite'),recipientClaimPins:[x.pin],recipientArtifactDirectory:x.directory,recipientRecoveryTokenSha256:createHash('sha256').update('j'.repeat(64)).digest('hex')});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`,binding={...x.pins,sessionId:x.signingBinding.sessionId};
  const post=(mode,body=binding,token='j'.repeat(64),originHeader=origin)=>fetch(origin+'/api/regtest/recipient-artifact-'+mode,{method:'POST',headers:{Origin:originHeader,'Content-Type':'application/json','X-Professional-Recovery-Token':token},body:JSON.stringify(body)});
  assert.equal((await post('recover',binding,'i'.repeat(64))).status,403);assert.equal((await post('recover',binding,'j'.repeat(64),'http://untrusted.invalid')).status,403);
  assert.equal((await post('recover',{...binding,expectedDigest:'00'.repeat(32)})).status,409);assert.equal((await post('recover',{...binding,recipientPin:{...binding.recipientPin,recipientId:'other'}})).status,409);
  const recovered=await (await post('recover')).json();assert.equal(recovered.artifactVerified,true);assert.deepEqual(recovered.signingBinding,x.signingBinding);assert.equal(recovered.signedState.claimSigned,true);assert.equal(recovered.broadcastAuthorized,false);assert.ok(!JSON.stringify(recovered).includes(x.signed));
  assert.equal((await post('recover')).status,200);unlinkSync(x.file);assert.equal((await post('import',{...binding,signedPayload:x.signed})).status,200);assert.equal((await post('import',{...binding,signedPayload:x.signed})).status,200);
  assert.equal((await fetch(origin+'/lifecycle/recipient-claim-signing.mjs')).status,404);assert.equal((await fetch(origin+'/'+x.state.receipt.signedPsbtSha256+'.psbt')).status,404);
 }finally{if(server)await new Promise(r=>server.close(r));f.close();}
});

test('legacy recipient receipt reimports only the exact prior signed bytes without changing receipt identity',async()=>{
 const f=fixture();try{
  const x=await recipientSigningFixture(f);await x.signing.authorize(x.authorization);const c=x.signing.checked(x.signingBinding),signed=signDisposableRequest(join(f.dir,'disposable.json'),c.signingRequest,c.signingRequest.requestDigest).signedPsbtBase64;
  const original=await x.signing.acceptReturn({...x.signingBinding,signedPayload:signed});assert.equal(original.artifactRetained,false);
  const altered=bitcoin.Psbt.fromBase64(signed),parent=bitcoin.Transaction.fromBuffer(altered.data.inputs[0].nonWitnessUtxo);parent.ins.forEach((_,i)=>parent.setWitness(i,[]));altered.data.inputs[0].nonWitnessUtxo=parent.toBuffer();
  x.signing.artifactStore=new CreatorPrivateArtifacts(join(f.dir,'legacy-recipient-private'));
  assert.throws(()=>x.signing.importArtifact(x.signingBinding.sessionId,altered.toBase64()));
  const recovered=x.signing.importArtifact(x.signingBinding.sessionId,makeCryptoPsbtFrames(Buffer.from(signed,'base64')).join('\n'));
  assert.equal(recovered.artifactVerified,true);assert.equal(recovered.receiptDigest,original.receiptDigest);assert.equal(recovered.signedState.receipt.artifactRetained,false);assert.equal(recovered.signedState.artifactRetained,true);assert.equal(recovered.transactionId,original.receipt.txid);
  const denied=new RecipientClaimSigning(new RecipientClaimReview(new RecipientClaimPreparation(x.funding)),{artifactStore:x.signing.artifactStore});assert.throws(()=>denied.recoverArtifact(x.signingBinding.sessionId),e=>e.status===403);
 }finally{f.close();}
});

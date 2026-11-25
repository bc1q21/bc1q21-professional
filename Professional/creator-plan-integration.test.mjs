import test from 'node:test';
import http from 'node:http';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {CreatorPlanStore} from './lifecycle/creator-plan-store.mjs';
import {createCreatorPlanService} from './lifecycle/creator-plan-service.mjs';
import {approveCreatorPlan} from './lifecycle/coordinator.mjs';
import {validatePublicPlan} from './public-date-planner.mjs';
const plan=()=>validatePublicPlan([{date:'2030-01-02',amountSats:20001},{date:'2031-01-02',amountSats:20000}],40001);
const body=()=>({network:'regtest',requestId:randomUUID(),plan:plan()});
test('durable exact plan acceptance, retries, conflict and independent connections',()=>{
 const dir=mkdtempSync(join(tmpdir(),'professional-plan-'));const path=join(dir,'state.sqlite');let store=new CreatorPlanStore(path);let other;
 try{
  const request=body();const accepted=store.accept(request);assert.equal(accepted.status,'accepted');assert.equal(accepted.planDigest,approveCreatorPlan(request.plan).planDigest);assert.equal(accepted.broadcastAuthorized,false);
  store.close();store=new CreatorPlanStore(path);other=new CreatorPlanStore(path);
  assert.equal(store.accept(request).status,'already-processed');assert.equal(other.accept(request).status,'already-processed');
  const changed=structuredClone(request);changed.plan.releases[0].amountSats++;changed.plan.totalSats++;
  assert.throws(()=>other.accept(changed),e=>e.status===409);
  assert.equal(store.db.prepare('SELECT count(*) AS n FROM plans').get().n,1);
  assert.equal(store.accept({...changed,requestId:randomUUID()}).status,'accepted');
 }finally{other?.close();store.close();rmSync(dir,{recursive:true,force:true});}
});
test('reject wrong network, authorization flags, secrets, noninteger totals and dust atomically',()=>{
 const store=new CreatorPlanStore(':memory:');
 try{
  for(const mutate of [r=>r.network='mainnet',r=>r.plan.fundingAuthorized=true,r=>r.plan.secret='forbidden',r=>r.seed='forbidden',r=>r.requestId='invalid',r=>r.plan.totalSats++,r=>r.plan.releases[0].amountSats=0.5,r=>{r.plan.releases[0].amountSats=545;r.plan.totalSats=20545;}]){const r=structuredClone(body());mutate(r);assert.throws(()=>store.accept(r));}
  assert.equal(store.db.prepare('SELECT count(*) AS n FROM plans').get().n,0);
 }finally{store.close();}
});
test('actual HTTP boundary: accepted/replayed/rejected, same-origin and private asset isolation',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'professional-http-'));const server=createCreatorPlanService({databasePath:join(dir,'state.sqlite')});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
 const request=body();const post=(data,headers={})=>fetch(origin+'/api/regtest/creator-plans',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...headers},body:JSON.stringify(data)});
 try{
  assert.equal((await post(request)).status,201);assert.equal((await (await post(request)).json()).status,'already-processed');
  assert.equal((await post(request,{Origin:'https://evil.invalid'})).status,403);
  const badHost=await new Promise((resolve,reject)=>{const r=http.request(origin+'/api/regtest/creator-plans',{method:'POST',headers:{Host:'evil.invalid',Origin:origin,'Content-Type':'application/json'}},res=>{res.resume();resolve(res.statusCode);});r.on('error',reject);r.end(JSON.stringify(request));});assert.equal(badHost,403);
  assert.equal((await post({...request,network:'testnet'})).status,400);
  assert.equal((await post({...request,extra:'x'.repeat(17000)})).status,413);
  for(const file of ['lifecycle/creator-plan-store.mjs','.regtest-private/active-environment.json','browser-integration/package.json'])assert.equal((await fetch(origin+'/'+file)).status,404);
  const page=await (await fetch(origin+'/funding-workspace.html')).text();assert.match(page,/connect-src https: http:\/\/127\.0\.0\.1:\* http:\/\/localhost:\*/);assert.match(page,/<template id="legacy-lab-scripts">/);assert.match(page,/creator-browser-funding.mjs/);assert.match(page,/creator-memory.js/);assert.equal((await fetch(origin+'/creator-plan-acceptance.browser.mjs')).status,200);
 }finally{await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});}
});
test('browser handoff retains fail-closed safeguards and packaging resource',()=>{
 const script=readFileSync(new URL('./creator-plan-acceptance.browser.mjs',import.meta.url),'utf8');assert.match(script,/Plan changed during saving/);assert.match(script,/localStorage.setItem/);assert.doesNotMatch(script,/sendrawtransaction|signPsbt|privateKey|mnemonic/);
 assert.match(readFileSync(new URL('./package-local-preview.py',import.meta.url),'utf8'),/creator-plan-acceptance.browser.mjs/);
});

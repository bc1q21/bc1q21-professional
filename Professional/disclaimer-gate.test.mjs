import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash,webcrypto} from 'node:crypto';
import {createDisclaimerGate} from './disclaimer-gate.mjs';
import {DISCLAIMER_POLICY} from './disclaimer-policy.mjs';
if(!globalThis.crypto)globalThis.crypto=webcrypto;
const bytes=await readFile(new URL('./assets/documents/bc1q21_Professional_Liability_Disclaimer.pdf',import.meta.url));
const version=createHash('sha256').update(bytes).digest('hex');
const options={baseUrl:'https://professional.example/retail-mirror/index.html',fetchDocument:async(url,init)=>{
 assert.equal(url,'https://professional.example/assets/documents/bc1q21_Professional_Liability_Disclaimer.pdf');
 assert.deepEqual(init,{credentials:'same-origin',cache:'no-store',redirect:'error'});
 return new Response(bytes,{headers:{'content-type':'application/pdf'}});
}};
test('shipped PDF is the exact approved attachment',()=>assert.equal(version,'617602ff48f768a6a5d233bbdd767c16eb4bcbb332a47f43a0471a5419c75543'));
test('explicit acceptance binds to loaded PDF bytes, is revocable and never restored automatically',async()=>{
 const gate=createDisclaimerGate(DISCLAIMER_POLICY,options);
 gate.setAcceptance({version,checked:true});assert.equal(gate.canContinue(),false);
 const doc=await gate.prepare();assert.equal(doc.version,version);assert.equal(gate.canContinue(),false);
 for(const value of [{version:'old',checked:true},{version,checked:'true'},{version,checked:false}]){
  gate.setAcceptance(value);assert.equal(gate.canContinue(),false);
 }
 gate.setAcceptance({version,checked:true});assert.equal(gate.canContinue(),true);
 gate.setAcceptance({version,checked:false});assert.equal(gate.canContinue(),false);
 gate.setAcceptance({version,checked:true});await gate.prepare();assert.equal(gate.canContinue(),false);
 assert.equal(createDisclaimerGate(DISCLAIMER_POLICY,options).canContinue(),false);
});
test('failed, missing, redirected, non-PDF and cross-origin documents fail closed',async()=>{
 for(const fetchDocument of [async()=>new Response('missing',{status:404}),async()=>new Response('login',{status:401}),
  async()=>new Response('html',{headers:{'content-type':'text/html'}}),
  async()=>new Response('bad',{headers:{'content-type':'application/pdf'}}),async()=>{throw Error('network');}]){
  const gate=createDisclaimerGate(DISCLAIMER_POLICY,{...options,fetchDocument});
  await assert.rejects(gate.prepare());gate.setAcceptance({version,checked:true});assert.equal(gate.canContinue(),false);
 }
 for(const policy of [{mode:'development',terms:null},{...DISCLAIMER_POLICY,pdfPath:'https://elsewhere.example/a.pdf'}]){
  const gate=createDisclaimerGate(policy,options);await assert.rejects(gate.prepare());assert.equal(gate.canContinue(),false);
 }
});
test('replacement PDF invalidates old acceptance without changing application policy',async()=>{
 const changed=Buffer.concat([bytes,Buffer.from('\n% replacement fixture')]);
 const gate=createDisclaimerGate(DISCLAIMER_POLICY,{...options,fetchDocument:async()=>new Response(changed,{headers:{'content-type':'application/pdf'}})});
 const doc=await gate.prepare();assert.notEqual(doc.version,version);
 gate.setAcceptance({version,checked:true});assert.equal(gate.canContinue(),false);
 gate.setAcceptance({version:doc.version,checked:true});assert.equal(gate.canContinue(),true);
});

test('planner CSP supports the same-origin PDF and retains blob frames without broadening other policies',async()=>{
 const html=await readFile(new URL('./retail-mirror/index.html',import.meta.url),'utf8');
 const csp=html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
 const directives=Object.fromEntries(csp.split(';').map(v=>v.trim().split(/\s+/)).filter(v=>v[0]).map(([k,...v])=>[k,v]));
 assert.deepEqual(directives['frame-src'],["'self'",'blob:']);
 assert.deepEqual(directives['connect-src'],["'self'"]);
 assert.deepEqual(directives['object-src'],["'none'"]);
 assert.deepEqual(directives['script-src'],["'self'"]);
 assert.deepEqual(directives['default-src'],["'none'"]);
});

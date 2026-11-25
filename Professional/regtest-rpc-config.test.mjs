import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {regtestRpcConnection,legacyPublicTestAccount} from './regtest-rpc-config.mjs';
const env={BC1Q21_REGTEST_RPC_USER:'synthetic-user',BC1Q21_REGTEST_RPC_PASSWORD:'synthetic-password'};
test('RPC password is input only; explicit configuration and Regtest flags remain required',()=>{
 const c=regtestRpcConnection(env);
 assert.deepEqual(c.args,['-rpcuser=synthetic-user','-stdinrpcpass']);
 assert.equal(c.input,'synthetic-password\n');assert.ok(!c.args.join(' ').includes(env.BC1Q21_REGTEST_RPC_PASSWORD));
 for(const file of ['audit-public-regtest-outpoints.py','build-creator-24-unsigned-core.py','test-single-funded-gift-core.py','build-jade-creator-24-public-psbt.mjs']){
  const s=readFileSync(new URL('./'+file,import.meta.url),'utf8');
  assert.ok(s.includes('-regtest'));assert.ok(!s.includes('-rpcpassword='));
 }
});
test('missing or multiline credentials fail closed without disclosing supplied values',()=>{
 for(const key of Object.keys(env))for(const value of [undefined,'','secret\ntext','secret\rtext','secret\0text']){
  assert.throws(()=>regtestRpcConnection({...env,[key]:value}),e=>e.message.includes(key)&&!e.message.includes('secret'));
 }
});
test('historical public-account helper rejects missing, private or mismatched origins',()=>{
 const valid={BC1Q21_TEST_ACCOUNT_XPUB:'xpub123abc',BC1Q21_TEST_ACCOUNT_FINGERPRINT:'1234ABCD',BC1Q21_TEST_ACCOUNT_ORIGIN:"m/84'/0'/0'"};
 assert.equal(legacyPublicTestAccount(valid).fingerprint,'1234abcd');
 // Extended-key decoding remains the existing HDKey engine's responsibility.
 for(const value of ['tpub123abc','xprv123abc',''])assert.throws(()=>legacyPublicTestAccount({...valid,BC1Q21_TEST_ACCOUNT_XPUB:value}));
 assert.throws(()=>legacyPublicTestAccount({...valid,BC1Q21_TEST_ACCOUNT_ORIGIN:"m/84'/1'/0'"}));
 assert.throws(()=>legacyPublicTestAccount({}));
});

test('actual historical Node RPC functions retain Regtest flags and send password only to stdin',()=>{
 const source=readFileSync(new URL('./build-jade-creator-24-public-psbt.mjs',import.meta.url),'utf8');
 const start=source.indexOf('function rpc('),end=source.indexOf("assert.equal(rpc('getblockcount'),0);");
 assert.ok(start>=0&&end>start);
 const calls=[];
 const functions=runInNewContext(source.slice(start,end)+'\n({rpc,wallet});',{
  rpcConfig:regtestRpcConnection(env),execFileSync:(program,args,options)=>{calls.push({program,args,options});return '{}';}
 });
 functions.rpc('getblockcount');functions.wallet('getnewaddress');
 assert.equal(calls.length,2);
 for(const call of calls){
  assert.equal(call.program,'docker');assert.deepEqual(Array.from(call.args.slice(0,2)),['exec','-i']);
  assert.ok(call.args.includes('-regtest'));assert.ok(call.args.includes('-datadir=/work'));assert.ok(call.args.includes('-stdinrpcpass'));
  assert.ok(!call.args.join(' ').includes(env.BC1Q21_REGTEST_RPC_PASSWORD));assert.equal(call.options.input,env.BC1Q21_REGTEST_RPC_PASSWORD+'\n');
 }
 assert.ok(calls[1].args.includes('-rpcwallet=mining'));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {initializePersistentDirectory,persistentCore,restorePersistent} from './lifecycle/persistent-core.mjs';
test('persistent regtest rejects unrelated directories and symlink state',()=>{
 const root=mkdtempSync(join(tmpdir(),'professional-persistent-guards-'));
 try {
  const unrelated=join(root,'unrelated');mkdirSync(unrelated);writeFileSync(join(unrelated,'owner.txt'),'preserve');
  assert.throws(()=>initializePersistentDirectory(unrelated),/unrelated/);
  const actual=join(root,'actual');initializePersistentDirectory(actual);symlinkSync(actual,join(root,'link'));
  assert.throws(()=>initializePersistentDirectory(join(root,'link')),/Symlink/);
  const wrong=join(root,'wrong');mkdirSync(wrong);writeFileSync(join(wrong,'session.json'),'{}');
  assert.throws(()=>initializePersistentDirectory(wrong),/Not a Professional/);
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('persistent adapter forbids broadcast, wallet-secret export and mainnet endpoint selection',async()=>{
 const root=mkdtempSync(join(tmpdir(),'professional-persistent-rpc-'));
 try {
  const lab=persistentCore(root);
  for(const method of ['sendrawtransaction','dumpprivkey','importprivkey','walletpassphrase','signrawtransactionwithwallet','getnewaddress'])
   await assert.rejects(()=>lab.readOnlyRpc(method),/prohibited/);
  for(const method of ['sendrawtransaction','dumpprivkey','signrawtransactionwithwallet'])
   await assert.rejects(()=>lab.rpc(method),/prohibited/);
  const file=join(root,'not-a-backup');writeFileSync(file,'fixture');
  assert.throws(()=>restorePersistent(file,'00'.repeat(32),join(root,'restore')),/hash mismatch/);
 }finally{rmSync(root,{recursive:true,force:true});}
});

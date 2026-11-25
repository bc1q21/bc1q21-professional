// Reproduce cold recovery WITHOUT funding, signing, mining or broadcasting.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {restorePersistent} from './persistent-core.mjs';
const here=fileURLToPath(new URL('.',import.meta.url));
const evidence=JSON.parse(readFileSync(join(here,'persistent-regtest-evidence.json')));
const root=resolve(process.argv[2]||join(here,'../.regtest-private/recovery-check'));
assert.ok(!existsSync(root),'Use a fresh verification directory');
const lab=restorePersistent(join(here,'fixtures/tef-gift-chain-v1.zip'),evidence.backupSha256,root);
try{
 await lab.start();const first=await lab.verifyCheckpoint();
 assert.equal(first.tip,evidence.identicalTip);assert.deepEqual(first.outpoints,[evidence.fundingOutpoint]);
 lab.removeContainer();await lab.start();assert.equal((await lab.verifyCheckpoint()).tip,first.tip);
 await assert.rejects(()=>lab.rpc('sendrawtransaction',[]),/prohibited/);
 console.log(JSON.stringify({coldRestore:true,containerRecreated:true,confirmedFunding:true,genesisVerified:true,broadcast:false,tip:first.tip}));
}finally{lab.removeContainer();}

// Local engineering Core only. Explicit host datadir, no ports/P2P, no Start9.
import assert from 'node:assert/strict';
import {mkdirSync,existsSync,readFileSync,writeFileSync,readdirSync,lstatSync,realpathSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {docker,CORE_IMAGE} from './local-core-lab.mjs';
import {assertRegtest,confirmedOutpoints} from './coordinator.mjs';
import {GENESIS} from './public-model.mjs';
export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const marker={format:'professional-persistent-regtest-v1',network:'regtest',genesis:GENESIS,coreImage:CORE_IMAGE};
export function initializePersistentDirectory(directory){
 const root=resolve(directory);mkdirSync(root,{recursive:true,mode:0o700});
 assert.ok(!lstatSync(root).isSymbolicLink(),'Symlink datadir prohibited');
 const file=join(root,'session.json');
 if(existsSync(file))assert.deepEqual(JSON.parse(readFileSync(file)),marker,'Not a Professional regtest directory');
 else {assert.equal(readdirSync(root).length,0,'Refuse unrelated/nonempty directory');writeFileSync(file,JSON.stringify(marker,null,2),{mode:0o600,flag:'wx'});}
 for(const name of ['data','evidence']){
  const path=join(root,name);mkdirSync(path,{recursive:true,mode:0o700});
  assert.ok(!lstatSync(path).isSymbolicLink(),'Symlink state prohibited');
 }
 return realpathSync(root);
}
export function persistentCore(directory){
 const root=initializePersistentDirectory(directory),data=join(root,'data');
 const container='professional-lifecycle-persistent-'+sha256(root).slice(0,16);
 function inspect(){try{return JSON.parse(docker(['inspect',container]))[0]}catch(e){if(/No such (object|container)/i.test(String(e.stderr)))return null;throw e;}}
 function checkContainer(info){
  assert.equal(info.Config.Image,CORE_IMAGE);assert.equal(info.HostConfig.NetworkMode,'none');
  assert.ok(!info.HostConfig.PortBindings||Object.keys(info.HostConfig.PortBindings).length===0);
  assert.equal(info.Mounts.length,1);assert.equal(info.Mounts[0].Type,'bind');
  assert.equal(info.Mounts[0].Source,data);assert.equal(info.Mounts[0].Destination,'/home/bitcoin/.bitcoin');
 }
 async function start(){
  let mockTime=0;
  if(existsSync(join(root,'checkpoint.json'))){mockTime=JSON.parse(readFileSync(join(root,'checkpoint.json'))).mockTime;assert.ok(Number.isSafeInteger(mockTime)&&mockTime>0&&mockTime<=0xffffffff,'Checkpoint mock time required');}
  let info=inspect();
  if(info){
   checkContainer(info);
   if(!info.State.Running&&!(info.Config.Cmd||[]).includes('-mocktime='+mockTime)){docker(['rm',container]);info=null;}
   else if(!info.State.Running)docker(['start',container]);
  }
  if(!info){
   const user=typeof process.getuid==='function'?['--user',`${process.getuid()}:${process.getgid()}`]:[];
   docker(['run','--detach','--name',container,'--network=none',...user,
    '--mount',`type=bind,src=${data},dst=/home/bitcoin/.bitcoin`,'--entrypoint','bitcoind',CORE_IMAGE,
    '-datadir=/home/bitcoin/.bitcoin','-regtest','-server','-txindex=1','-listen=0','-discover=0','-dnsseed=0','-mocktime='+mockTime,
    '-fixedseeds=0','-fallbackfee=0.00002','-printtoconsole=0']);
  }
  let error;for(let i=0;i<100;i++){try{await boundReadOnly('getblockchaininfo');error=null;break;}catch(e){error=e;await new Promise(r=>setTimeout(r,100));}}
  if(error)throw error;checkContainer(inspect());
  const chain=await boundReadOnly('getblockchaininfo');assert.equal(chain.chain,'regtest');
  assert.equal(await boundReadOnly('getblockhash',[0]),GENESIS);
  // A brand-new empty regtest is necessarily in IBD. This permits bootstrap
  // mining ONLY; all funding/request/recovery checks still use assertRegtest.
  if(chain.blocks>0||existsSync(join(root,'checkpoint.json')))await assertRegtest(boundReadOnly);
  return container;
 }
 // Use exactly this datadir for cookie-authenticated RPC. No configurable host.
 const persistentRpc=readOnlyOnly=>async(method,params=[])=>{
  // Reuse the existing method allowlist before executing with the bound datadir.
  const allowed=readOnlyOnly?new Set(['getblockchaininfo','getbestblockhash','getblockheader','getblockhash','getrawtransaction','gettxout','getmempoolinfo','getmempoolentry','gettxspendingprevout','estimatesmartfee','testmempoolaccept']):new Set(['getblockchaininfo','getbestblockhash','getblockheader','getblockhash','getrawtransaction','gettxout','getmempoolinfo','getmempoolentry','gettxspendingprevout','estimatesmartfee','testmempoolaccept','createwallet','getnewaddress','generatetoaddress','sendtoaddress','setmocktime','getbalances','gettransaction','invalidateblock','reconsiderblock']);
  assert.ok(allowed.has(method),'RPC prohibited by persistent lab allowlist');
  checkContainer(inspect());
  const out=docker(['exec',container,'bitcoin-cli','-datadir=/home/bitcoin/.bitcoin','-regtest','-rpcclienttimeout=20',method,...params.map(p=>typeof p==='string'?p:JSON.stringify(p))]);
  try{return JSON.parse(out)}catch{return out;}
 };
 const boundRpc=persistentRpc(false),boundReadOnly=persistentRpc(true);
 function stop(){const info=inspect();if(info){checkContainer(info);if(info.State.Running)docker(['stop','--time','60',container]);assert.equal(inspect().State.ExitCode,0,'Core did not stop cleanly; refuse cold backup');}}
 function removeContainer(){stop();if(inspect())docker(['rm',container]);}
 async function checkpoint(outpoints=[]){
  const chain=await assertRegtest(boundReadOnly);
  if(outpoints.length)await confirmedOutpoints(boundReadOnly,outpoints);
  const header=await boundReadOnly('getblockheader',[chain.bestblockhash,true]);
  const record={...marker,tip:chain.bestblockhash,height:chain.blocks,mockTime:header.time+1,outpoints,checkedAt:new Date().toISOString()};
  writeFileSync(join(root,'checkpoint.json'),JSON.stringify(record,null,2),{mode:0o600});return record;
 }
 async function verifyCheckpoint(){const old=JSON.parse(readFileSync(join(root,'checkpoint.json')));assert.equal(old.genesis,GENESIS);const now=await assertRegtest(boundReadOnly);assert.equal(now.bestblockhash,old.tip,'Checkpoint tip changed');assert.equal(now.blocks,old.height);if(old.outpoints.length)await confirmedOutpoints(boundReadOnly,old.outpoints);return old;}
 function backup(file){stop();execFileSync(process.platform==='win32'?'python':'python3',[fileURLToPath(new URL('./regtest-archive.py',import.meta.url)),'backup',root,resolve(file)]);return sha256(readFileSync(file));}
 return {root,container,rpc:boundRpc,readOnlyRpc:boundReadOnly,start,stop,removeContainer,checkpoint,verifyCheckpoint,backup};
}
export function restorePersistent(archive,pinnedSha256,directory){
 assert.match(pinnedSha256,/^[a-f0-9]{64}$/);assert.equal(sha256(readFileSync(archive)),pinnedSha256,'Backup hash mismatch');
 const root=resolve(directory);assert.ok(!existsSync(root),'Restore destination must not exist');
 execFileSync(process.platform==='win32'?'python':'python3',[fileURLToPath(new URL('./regtest-archive.py',import.meta.url)),'restore',root,resolve(archive)]);
 return persistentCore(root);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const [command,directory,file,pin]=process.argv.slice(2);
 if(command==='restore'){const lab=restorePersistent(file,pin,directory);await lab.start();console.log(JSON.stringify(await lab.verifyCheckpoint()));}
 else {const lab=persistentCore(directory);if(command==='start'){await lab.start();console.log(lab.container);}else if(command==='stop')lab.stop();else if(command==='backup')console.log(lab.backup(file));else if(command==='verify')console.log(JSON.stringify(await lab.verifyCheckpoint()));else throw Error('Use start/stop/verify DIR; backup DIR ARCHIVE; restore NEW_DIR ARCHIVE SHA256');}
}

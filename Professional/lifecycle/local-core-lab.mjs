// Disposable local Core lab. Docker network=none, no published ports. No
// production RPC configuration, credentials, wallet names, or endpoints used.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const env={...process.env};for(const k of ['DOCKER_HOST','DOCKER_CONTEXT','DOCKER_TLS','DOCKER_TLS_VERIFY','DOCKER_CERT_PATH'])delete env[k];
export function docker(args){return execFileSync('docker',['--host=unix:///var/run/docker.sock',...args],{env,encoding:'utf8',maxBuffer:4*1024*1024,stdio:['ignore','pipe','pipe']}).trim();}
export const CORE_IMAGE='bitcoin/bitcoin:28.0';
const readOnly=new Set(['getblockchaininfo','getbestblockhash','getblockheader','getblockhash','getrawtransaction','gettxout','getmempoolinfo','getmempoolentry','gettxspendingprevout','estimatesmartfee','testmempoolaccept']);
const labOnly=new Set(['createwallet','getnewaddress','generatetoaddress','sendtoaddress','setmocktime','sendrawtransaction','getbalances','gettransaction','invalidateblock','reconsiderblock']);
export function dockerCoreRpc(container,{readOnlyOnly=false}={}){
 assert.match(container,/^professional-lifecycle-[a-z0-9-]+$/);
 return async(method,params=[])=>{
  assert.ok(readOnly.has(method)||(!readOnlyOnly&&labOnly.has(method)),'RPC prohibited by local lab allowlist');
  const args=params.map(p=>typeof p==='string'?p:JSON.stringify(p));
  const out=docker(['exec',container,'bitcoin-cli','-datadir=/home/bitcoin/.bitcoin','-regtest','-rpcclienttimeout=20',method,...args]);
  try{return JSON.parse(out)}catch{return out;}
 };
}
export function offlineFixtureSession(){
 const directory=mkdtempSync(join(tmpdir(),'professional-offline-fixture-'));
 const professional=resolve(fileURLToPath(new URL('..',import.meta.url)));
 // Reuse the installed host Node binary and its read-only shared libraries.
 // The signer has no NIC, Docker socket, Core data, online state or credentials.
 const run=(args)=>JSON.parse(docker(['run','--rm','--network=none','--read-only','--cap-drop=ALL',
  '--security-opt=no-new-privileges','--user',`${process.getuid()}:${process.getgid()}`,
  '--mount',`type=bind,src=${professional},dst=${professional},readonly`,
  '--mount',`type=bind,src=${directory},dst=/offline`,
  '--mount',`type=bind,src=${process.execPath},dst=/fixture-node,readonly`,
  '--mount','type=bind,src=/lib/x86_64-linux-gnu,dst=/hostlib,readonly',
  '--entrypoint','/hostlib/ld-linux-x86-64.so.2',CORE_IMAGE,
  '--library-path','/hostlib','/fixture-node',join(professional,'lifecycle/disposable-offline-signer.mjs'),...args]));
 return {
  initialize:(count,{accountPath="m/84'/1'/0'"}={})=>run(['init','/offline/wallet.json',String(count),accountPath]),
  registrationProof:pin=>run(['proof','/offline/wallet.json',pin]),
  restoreBackup:()=>{
   const backup=run(['backup','/offline/wallet.json','/offline/recovery-backup.json']);
   const restored=run(['restore','/offline/wallet.json','/offline/recovery-backup.json']);
   return {...backup,...restored};
  },
  sign:request=>{
   writeFileSync(join(directory,'request.json'),JSON.stringify(request),{mode:0o600});
   return run(['sign','/offline/wallet.json','/offline/request.json',request.requestDigest]);
  },
  close:()=>rmSync(directory,{recursive:true,force:true})
 };
}
export async function withCoreLab(run){
 const container='professional-lifecycle-'+process.pid+'-'+Date.now();
 docker(['run','--detach','--name',container,'--network=none',CORE_IMAGE,
  '-regtest','-server','-txindex=1','-listen=0','-discover=0','-dnsseed=0','-fixedseeds=0',
  '-fallbackfee=0.00002','-printtoconsole=0']);
 const rpc=dockerCoreRpc(container);let last;
 try{
  for(let i=0;i<100;i++){
   try{await rpc('getblockchaininfo');last=null;break;}catch(e){last=e;await new Promise(r=>setTimeout(r,100));}
  }
  if(last)throw last;
  return await run({container,rpc,readOnlyRpc:dockerCoreRpc(container,{readOnlyOnly:true})});
 }finally{docker(['rm','--force','--volumes',container]);}
}

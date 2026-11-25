// Sensitive transaction authorizations, never wallet secrets. Local operator storage only.
import {mkdirSync,lstatSync,realpathSync,openSync,writeFileSync,fsyncSync,closeSync,readFileSync,linkSync,unlinkSync,constants} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash,randomUUID} from 'node:crypto';
import {PlanRequestError} from './creator-plan-store.mjs';
export const artifactSha=bytes=>createHash('sha256').update(bytes).digest('hex');
const fail=m=>{throw new PlanRequestError(m,409);};
export class CreatorPrivateArtifacts {
 constructor(directory){
  this.root=resolve(directory);
  const repo=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
  // Refuse symlinked components and any path inside this repository.
  for(let p=this.root;;p=dirname(p)){
   try{if(lstatSync(p).isSymbolicLink())fail('Private artifact path cannot use symlinks.');}catch(e){if(e.code!=='ENOENT')throw e;}
   if(dirname(p)===p)break;
  }
  if(this.root===repo||this.root.startsWith(repo+'/'))fail('Artifacts must be outside the repository.');
  mkdirSync(this.root,{recursive:true,mode:0o700});
  const st=lstatSync(this.root);if(!st.isDirectory()||st.isSymbolicLink()||realpathSync(this.root)!==this.root)fail('Invalid private artifact directory.');
  if(process.platform==='win32')fail('Private-store Windows ACL enforcement is not implemented; use the supported local Linux operator service.');
  if(st.uid!==process.getuid()||(st.mode&0o077)!==0)fail('Private artifact directory requires owner-only permissions.');
 }
 assertRoot(){const st=lstatSync(this.root);if(!st.isDirectory()||st.isSymbolicLink()||realpathSync(this.root)!==this.root||st.uid!==process.getuid()||(st.mode&0o077)!==0)fail('Private artifact directory permissions changed.');}
 get(hash){
  this.assertRoot();
  if(!/^[a-f0-9]{64}$/.test(hash))fail('Invalid artifact hash.');
  const path=join(this.root,hash+'.psbt'),st=lstatSync(path);
  if(!st.isFile()||st.isSymbolicLink()||st.uid!==process.getuid()||(st.mode&0o077)!==0||st.size<10||st.size>100000)fail('Invalid private artifact permissions or size.');
  const fd=openSync(path,constants.O_RDONLY|constants.O_NOFOLLOW);let bytes;try{bytes=readFileSync(fd);}finally{closeSync(fd);}
  if(artifactSha(bytes)!==hash||bytes.subarray(0,5).toString('hex')!=='70736274ff')fail('Private artifact checksum mismatch.');
  return bytes;
 }
 put(bytes){
  this.assertRoot();
  bytes=Buffer.from(bytes);if(bytes.length<10||bytes.length>100000||bytes.subarray(0,5).toString('hex')!=='70736274ff')fail('Bounded signed PSBT required.');
  const hash=artifactSha(bytes),target=join(this.root,hash+'.psbt'),temp=join(this.root,'.pending-'+randomUUID());
  const fd=openSync(temp,constants.O_WRONLY|constants.O_CREAT|constants.O_EXCL|constants.O_NOFOLLOW,0o600);
  try{writeFileSync(fd,bytes);fsyncSync(fd);}finally{closeSync(fd);}
  try{try{linkSync(temp,target);}catch(e){if(e.code!=='EEXIST')throw e;}this.get(hash);const dir=openSync(this.root,constants.O_RDONLY);try{fsyncSync(dir);}finally{closeSync(dir);}}finally{unlinkSync(temp);}
  return {hash,size:bytes.length};
 }
}

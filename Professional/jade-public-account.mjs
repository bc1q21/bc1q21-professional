// Browser-safe, public-only Jade account decoder. No signing, RPC, storage or secrets.
import {strict as assert} from 'assert';
import {Buffer} from 'buffer';
import {URDecoder} from '@ngraveio/bc-ur';
import cbor from 'cbor';
import {secp256k1} from '@noble/curves/secp256k1';
const untag=v=>v&&typeof v==='object'&&'tag'in v?untag(v.value):v;
const get=(v,k)=>v instanceof Map?v.get(k):undefined;
export function decodeJadeRegtestAccount(text,{expectedAccountPath="m/84'/1'/0'"}={}){
 assert.ok(expectedAccountPath===null||["m/84'/0'/0'","m/84'/1'/0'"].includes(expectedAccountPath),'Unsupported pinned account origin');
 assert.ok(typeof text==='string'&&text.length<=4195328,'Public export exceeds bounds');
 const frames=text.split(/\r?\n/).map(x=>x.trim().toLowerCase()).filter(x=>x&&!x.startsWith('#'));
 assert.ok(frames.length>=1&&frames.length<=512);const decoder=new URDecoder();
 for(const frame of frames){
  assert.ok(frame.length<=8192&&/^ur:crypto-(account|hdkey)\/[a-z0-9/-]+$/.test(frame),'Only public account/hdkey export permitted');
  const parts=frame.split('/');
  if(parts.length===3){const m=parts[1].match(/^([1-9]\d*)-([1-9]\d*)$/);assert.ok(m&&Number(m[1])<=0xffffffff&&Number(m[2])<=512,'Export sequence exceeds bounds');}
  else assert.equal(parts.length,2);
 }
 for(const frame of frames){decoder.receivePart(frame);if(decoder.isComplete())break;}
 assert.ok(decoder.isComplete()&&decoder.isSuccess(),'Incomplete public export');
 const ur=decoder.resultUR();assert.ok(ur.cbor.length<=100000,'Public export payload exceeds bounds');
 const decoded=untag(cbor.decodeFirstSync(Buffer.from(ur.cbor),{max_depth:16,preventDuplicateKeys:true,required:true}));
 const rootFingerprint=ur.type==='crypto-account'?get(decoded,1):null;
 const descriptors=ur.type==='crypto-account'?get(decoded,2):[decoded];
 assert.ok(Array.isArray(descriptors)&&descriptors.length>=1&&descriptors.length<=32,'Invalid public account descriptors');
 const candidates=[];
 for(const descriptor of descriptors){
  const node=untag(descriptor);if(!(node instanceof Map)||!get(node,3))continue;
  assert.notEqual(get(node,2),true,'Private HD key prohibited');assert.notEqual(get(node,1),true,'Master key export prohibited');
  const pub=get(node,3),chain=get(node,4),origin=untag(get(node,6));
  assert.ok(Buffer.isBuffer(pub)&&pub.length===33&&[2,3].includes(pub[0])&&Buffer.isBuffer(chain)&&chain.length===32,'Compressed public account required');
  secp256k1.ProjectivePoint.fromHex(pub);
  const path=get(origin,1),fp=get(origin,2),depth=get(origin,3);
  assert.ok(Array.isArray(path)&&[0,1].includes(path[2]),'Unsupported BIP84 account origin');
  const actualAccountPath="m/84'/"+path[2]+"'/0'",coinType=path[2];
  assert.deepEqual(path,[84,true,coinType,true,0,true],'Export differs from supported account origin');
  if(expectedAccountPath!==null)assert.equal(actualAccountPath,expectedAccountPath,'Export differs from independently selected account origin');
  assert.equal(depth,3);assert.ok(Number.isInteger(fp)&&fp>=0&&fp<=0xffffffff,'Master fingerprint required');
  if(rootFingerprint!==null)assert.equal(rootFingerprint,fp,'Account and origin fingerprint disagree');
  const useInfo=untag(get(node,5));if(useInfo){assert.equal(get(useInfo,1)??0,0,'Bitcoin account required');assert.equal(get(useInfo,2),coinType,'Export network metadata contradicts selected origin');}
  candidates.push({format:'professional-jade-public-account-v1',accountPath:actualAccountPath,publicKeyHex:pub.toString('hex'),chainCodeHex:chain.toString('hex'),masterFingerprintHex:fp.toString(16).padStart(8,'0')});
 }
 assert.ok(candidates.length,'No supported explicitly selected BIP84 public account');
 assert.ok(candidates.every(x=>JSON.stringify(x)===JSON.stringify(candidates[0])),'Ambiguous public account export');return candidates[0];
}

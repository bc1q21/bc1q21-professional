// ISOLATED REGTEST PROOF. Public data only; no I/O, coordinator, secrets or storage.
// The caller supplies a COMPLETE independent script -> UTXO index. An address
// history endpoint for an unrelated creator is not such an index.
import assert from 'node:assert/strict';
import {hmac} from '@noble/hashes/hmac';
import {sha512} from '@noble/hashes/sha512';
import bitcoin from 'bitcoinjs-lib';
import bs58check from 'bs58check';
import {secp256k1} from '@noble/curves/secp256k1';
import {retailDateToCltvTimestamp} from '../retail-calendar-cltv.mjs';
import {network,GENESIS,prepareRecoveredClaim} from '../lifecycle/public-model.mjs';
export const PROFILE=Object.freeze({accountPath:"m/84'/0'/0'",accountPaths:Object.freeze(["m/84'/0'/0'","m/84'/1'/0'"]),firstDate:'1985-11-06',lastDate:'2105-12-31',keyCount:24});
export function publicChildren({accountXpub,masterFingerprintHex,accountPath,discoveryIndex=0}){
 assert.ok(PROFILE.accountPaths.includes(accountPath),'Unsupported recovery profile');
 assert.ok(Number.isInteger(discoveryIndex)&&discoveryIndex>=0&&discoveryIndex<=20,'Discovery index outside proof range');
 assert.match(masterFingerprintHex,/^[0-9a-f]{8}$/);
 assert.ok(typeof accountXpub==='string'&&accountXpub.startsWith('xpub'),'Public account xpub required');
 const raw=Buffer.from(bs58check.decode(accountXpub));
 assert.equal(raw.length,78);assert.equal(raw.readUInt32BE(0),0x0488b21e);assert.equal(raw[4],3);assert.equal(raw.readUInt32BE(9),0x80000000);
 const derive=(n,index)=>{
  const i=Buffer.alloc(4);i.writeUInt32BE(index);
  const h=Buffer.from(hmac(sha512,n.chain,Buffer.concat([n.pub,i]))),k=BigInt('0x'+h.subarray(0,32).toString('hex'));
  assert.ok(k<secp256k1.CURVE.n,'Invalid public BIP32 child');
  const parent=secp256k1.ProjectivePoint.fromHex(n.pub);
  const point=k===0n?parent:parent.add(secp256k1.ProjectivePoint.BASE.multiply(k));
  assert.ok(!point.equals(secp256k1.ProjectivePoint.ZERO),'Invalid public BIP32 point');
  return {pub:Buffer.from(point.toRawBytes(true)),chain:h.subarray(32)};
 };
 const account={chain:raw.subarray(13,45),pub:raw.subarray(45,78)},branch=derive(account,1);
 const key=(node,path)=>({publicKeyHex:node.pub.toString('hex'),masterFingerprintHex,path});
 return {recipient:Array.from({length:PROFILE.keyCount},(_,i)=>key(derive(branch,i),`${accountPath}/1/${i}`)),
  destination:key(derive(derive(account,0),1),accountPath+'/0/1'),
  discovery:key(derive(derive(account,0),discoveryIndex===0?0:discoveryIndex+2),`${accountPath}/0/${discoveryIndex===0?0:discoveryIndex+2}`)};
}
export function discover({publicAccount,chainFixture}){
 assert.equal(chainFixture.network,'regtest');assert.equal(chainFixture.genesis,GENESIS);
 assert.equal(chainFixture.completeScriptIndex,true,'Complete independent chain index required; creator address history is insufficient');
 return matchPublicOutputs({publicAccount,publicOutpoints:chainFixture.utxos});
}
// Match only supplied candidate transaction outputs. No claim of global coverage.
export function matchPublicOutputs({publicAccount,publicOutpoints}){
 assert.ok(Array.isArray(publicOutpoints)&&publicOutpoints.length<=10000,'Candidate outputs exceed proof bounds');
 const keys=publicChildren(publicAccount),byScript=new Map();
 for(const u of publicOutpoints){
  const tx=bitcoin.Transaction.fromHex(u.rawTransactionHex);assert.equal(tx.getId(),u.txid,'Fixture TXID mismatch');
  assert.ok(Number.isInteger(u.vout)&&u.vout>=0&&tx.outs[u.vout],'Fixture outpoint missing');
  const out=tx.outs[u.vout],id=`${u.txid}:${u.vout}`;
  assert.ok(![...byScript.values()].flat().some(x=>x.id===id),'Duplicate fixture outpoint');
  const script=out.script.toString('hex'),items=byScript.get(script)||[];items.push({...u,id,valueSats:out.value});byScript.set(script,items);
 }
 const found=[];
 // Search the entire published profile, not a date supplied by a gift package.
 for(const key of byScript.size?keys.recipient:[]){
  for(let time=retailDateToCltvTimestamp(PROFILE.firstDate),end=retailDateToCltvTimestamp(PROFILE.lastDate);time<=end;time+=86400){
   const redeem=bitcoin.script.compile([bitcoin.script.number.encode(time),bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,bitcoin.opcodes.OP_DROP,Buffer.from(key.publicKeyHex,'hex'),bitcoin.opcodes.OP_CHECKSIG]);
   const script=bitcoin.payments.p2sh({redeem:{output:redeem},network}).output.toString('hex');
   for(const u of byScript.get(script)||[])found.push({...u,date:new Date(time*1000).toISOString().slice(0,10),locktime:time,key,
    redeemScriptHex:redeem.toString('hex'),scriptPubKeyHex:script});
  }
 }
 return {releases:found.sort((a,b)=>a.locktime-b.locktime||a.id.localeCompare(b.id)),destinationScriptHex:bitcoin.payments.p2wpkh({pubkey:Buffer.from(keys.destination.publicKeyHex,'hex'),network}).output.toString('hex'),
  publicAccountOriginVerified:false,chainVerified:false,fixtureOnly:true};
}
export function prepareDiscoveredClaim(discovery,selected){
 assert.ok(Array.isArray(selected)&&selected.length>0&&new Set(selected).size===selected.length,'Explicit unique selection required');
 const releases=selected.map(id=>{const r=discovery.releases.find(x=>x.id===id);assert.ok(r,'Unknown discovered outpoint');return r;});
 assert.equal(new Set(releases.map(r=>r.txid)).size,1,'Proof currently supports one creator transaction per claim');
 return prepareRecoveredClaim({creatorTxid:releases[0].txid,creatorRawHex:releases[0].rawTransactionHex,releases,destinationScriptHex:discovery.destinationScriptHex});
}

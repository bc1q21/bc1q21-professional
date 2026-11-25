// Read-only Jade public export adapter. Never accepts private/seed URs, never
// coerces a mainnet account into testnet, and never confers signing authority.
import assert from 'node:assert/strict';
import {Buffer} from 'buffer';
import {hmac} from '@noble/hashes/hmac';
import {sha512} from '@noble/hashes/sha512';
import {secp256k1} from '@noble/curves/secp256k1';
import {GENESIS,publicWallet,digest} from './public-model.mjs';
export {decodeJadeRegtestAccount} from '../jade-public-account.mjs';
export function publicWalletFromJadeAccount(account,releaseCount){
 assert.deepEqual(Object.keys(account).sort(),['format','accountPath','publicKeyHex','chainCodeHex','masterFingerprintHex'].sort());
 assert.equal(account.format,'professional-jade-public-account-v1');assert.ok(["m/84'/0'/0'","m/84'/1'/0'"].includes(account.accountPath),'Unsupported account origin');
 assert.match(account.publicKeyHex,/^(02|03)[0-9a-f]{64}$/);assert.match(account.chainCodeHex,/^[0-9a-f]{64}$/);assert.match(account.masterFingerprintHex,/^[0-9a-f]{8}$/);
 assert.ok(Number.isInteger(releaseCount)&&releaseCount>=1&&releaseCount<=24);
 const derive=(node,index)=>{
  const suffix=Buffer.alloc(4);suffix.writeUInt32BE(index);
  const result=Buffer.from(hmac(sha512,node.chain,Buffer.concat([node.pub,suffix])));
  const left=BigInt('0x'+result.subarray(0,32).toString('hex'));assert.ok(left>0n&&left<secp256k1.CURVE.n,'Invalid public BIP32 child');
  const point=secp256k1.ProjectivePoint.BASE.multiply(left).add(secp256k1.ProjectivePoint.fromHex(node.pub));
  assert.ok(!point.equals(secp256k1.ProjectivePoint.ZERO),'Invalid public child point');
  return {pub:Buffer.from(point.toRawBytes(true)),chain:result.subarray(32)};
 };
 const root={pub:Buffer.from(account.publicKeyHex,'hex'),chain:Buffer.from(account.chainCodeHex,'hex')};
 const key=(branch,index)=>({publicKeyHex:derive(derive(root,branch),index).pub.toString('hex'),masterFingerprintHex:account.masterFingerprintHex,path:account.accountPath+`/${branch}/${index}`});
 const wallet=publicWallet({format:'professional-regtest-public-wallet-v1',network:'regtest',genesis:GENESIS,
  creator:key(0,0),change:key(0,1),service:key(0,2),recipient:Array.from({length:releaseCount},(_,i)=>key(1,i))});
 return {wallet,walletDigest:digest(wallet),walletOriginAuthenticated:false,fundingAuthorized:false,broadcastAuthorized:false};
}

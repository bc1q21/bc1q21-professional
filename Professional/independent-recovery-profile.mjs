// Browser-compatible PUBLIC derivation/validation. No storage, RPC or secrets.
import {Buffer} from 'buffer';
import bitcoin from 'bitcoinjs-lib';
import bs58check from 'bs58check';
import {hmac} from '@noble/hashes/hmac';
import {sha512} from '@noble/hashes/sha512';
import {secp256k1} from '@noble/curves/secp256k1';
export const RECOVERY_PROFILE=Object.freeze({id:'professional-public-date-discovery-v1',accountPath:"m/84'/0'/0'",accountPaths:Object.freeze(["m/84'/0'/0'","m/84'/1'/0'"]),firstDate:'1985-11-06',lastDate:'2105-12-31',maxReleases:24,minDiscoveryIndex:1,maxDiscoveryIndex:20,discoveryValueSats:546});
const fail=m=>{throw Error('Independent recovery profile: '+m);};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function deriveRecoveryPublicKeys(publicAccount,index){
 const p=RECOVERY_PROFILE;
 if(!publicAccount||Object.keys(publicAccount).sort().join(',')!=='accountPath,accountXpub,masterFingerprintHex'||!p.accountPaths.includes(publicAccount.accountPath)||!/^[0-9a-f]{8}$/.test(publicAccount.masterFingerprintHex)||!/^xpub[1-9A-HJ-NP-Za-km-z]{100,120}$/.test(publicAccount.accountXpub))fail('Public account export with exact origin required');
 if(!Number.isInteger(index)||index<p.minDiscoveryIndex||index>p.maxDiscoveryIndex)fail('Discovery index must be 1–20');
 const raw=Buffer.from(bs58check.decode(publicAccount.accountXpub));
 if(raw.length!==78||raw.readUInt32BE(0)!==0x0488b21e||raw[4]!==3||raw.readUInt32BE(9)!==0x80000000)fail('Expected depth-three account-zero xpub');
 const child=(n,i)=>{
  const b=Buffer.alloc(4);b.writeUInt32BE(i);const out=hmac(sha512,n.chain,Buffer.concat([n.pub,b])),k=BigInt('0x'+Buffer.from(out.subarray(0,32)).toString('hex'));
  if(k>=secp256k1.CURVE.n)fail('Invalid BIP32 child');
  const parent=secp256k1.ProjectivePoint.fromHex(n.pub),point=k===0n?parent:parent.add(secp256k1.ProjectivePoint.BASE.multiply(k));
  if(point.equals(secp256k1.ProjectivePoint.ZERO))fail('Invalid BIP32 point');
  return {pub:Buffer.from(point.toRawBytes(true)),chain:Buffer.from(out.subarray(32))};
 };
 const root={pub:raw.subarray(45,78),chain:raw.subarray(13,45)},receive=child(root,0),release=child(root,1);
 const record=(n,path)=>({publicKeyHex:n.pub.toString('hex'),masterFingerprintHex:publicAccount.masterFingerprintHex,path});
 return {funding:record(child(receive,0),`${publicAccount.accountPath}/0/0`),discovery:record(child(receive,index+2),`${publicAccount.accountPath}/0/${index+2}`),destination:record(child(receive,1),`${publicAccount.accountPath}/0/1`),
  recipient:Array.from({length:p.maxReleases},(_,i)=>record(child(release,i),`${publicAccount.accountPath}/1/${i}`))};
}
export function discoveryForPlan({plan,wallet,publicAccount,index}){
 const p=RECOVERY_PROFILE,keys=deriveRecoveryPublicKeys(publicAccount,index);
 if(!Array.isArray(plan.releases)||plan.releases.length<1||plan.releases.length>p.maxReleases)fail('Unsupported release count');
 if(wallet.recipient.length!==plan.releases.length)fail('Recipient key count mismatch');
 plan.releases.forEach((r,i)=>{
  if(r.date<p.firstDate||r.date>p.lastDate)fail('Date outside recovery search bounds');
  const k=wallet.recipient[i],expected=keys.recipient[i];
  if(!k||!same([k.publicKeyHex,k.masterFingerprintHex,k.path],[expected.publicKeyHex,expected.masterFingerprintHex,expected.path]))fail('Release keys must match beneficiary account at /1/0–23');
 });
 const script=bitcoin.payments.p2wpkh({pubkey:Buffer.from(keys.discovery.publicKeyHex,'hex'),network:bitcoin.networks.regtest}).output;
 return {profile:p.id,index,publicAccount:{...publicAccount},key:keys.discovery,valueSats:p.discoveryValueSats,scriptPubKeyHex:script.toString('hex')};
}
export function validateDiscoveryIntent(intent){
 const d=intent.discovery;if(!d||d.profile!==RECOVERY_PROFILE.id)fail('Discovery output/profile required');
 const keys=deriveRecoveryPublicKeys(d.publicAccount,d.index);
 const plan={releases:intent.gifts.map(g=>({date:g.date}))};
 const expected=discoveryForPlan({plan,wallet:{recipient:keys.recipient.slice(0,intent.gifts.length)},publicAccount:d.publicAccount,index:d.index});
 if(!d.key||Object.keys(d.key).sort().join(',')!=='masterFingerprintHex,path,publicKeyHex')fail('Unexpected discovery signer fields');
 if(Object.keys(d).sort().join(',')!==Object.keys(expected).sort().join(',')||!same([d.profile,d.index,d.publicAccount.accountXpub,d.publicAccount.accountPath,d.publicAccount.masterFingerprintHex,d.key?.publicKeyHex,d.key?.path,d.key?.masterFingerprintHex,d.valueSats,d.scriptPubKeyHex],[expected.profile,expected.index,expected.publicAccount.accountXpub,expected.publicAccount.accountPath,expected.publicAccount.masterFingerprintHex,expected.key.publicKeyHex,expected.key.path,expected.key.masterFingerprintHex,expected.valueSats,expected.scriptPubKeyHex]))fail('Discovery output changed');
 intent.gifts.forEach((g,i)=>{
  const t=Date.parse(g.date+'T00:00:00Z')/1000;
  if(!Number.isInteger(t)||new Date(t*1000).toISOString().slice(0,10)!==g.date||t!==g.locktime)fail('Invalid release date/locktime');
  const redeem=bitcoin.script.compile([bitcoin.script.number.encode(t),bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,bitcoin.opcodes.OP_DROP,Buffer.from(keys.recipient[i].publicKeyHex,'hex'),bitcoin.opcodes.OP_CHECKSIG]);
  if(bitcoin.payments.p2sh({redeem:{output:redeem},network:bitcoin.networks.regtest}).output.toString('hex')!==g.scriptPubKeyHex)fail('Gift output differs from recoverable beneficiary key');
 });
 return d;
}

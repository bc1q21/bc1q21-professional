// PUBLIC TEST MATERIAL ONLY. Predictable software keys: NEVER send funds to them.
// Node-only fixture generation; not imported by the browser or evidence of hardware use.
import {createHash,createHmac} from 'node:crypto';
import {secp256k1} from '@noble/curves/secp256k1';
import bitcoin from 'bitcoinjs-lib';
const HARD=0x80000000,N=secp256k1.CURVE.n;
const hash=b=>createHash('sha256').update(b).digest();
const hash160=b=>createHash('ripemd160').update(hash(b)).digest();
const pub=node=>Buffer.from(secp256k1.getPublicKey(node.key,true));
const index=n=>{const b=Buffer.alloc(4);b.writeUInt32BE(n);return b;};
function root(){
 const seed=hash(Buffer.from('bc1q21-public-synthetic-fixture-v1'));
 const h=createHmac('sha512','Bitcoin seed').update(seed).digest();
 return {key:Buffer.from(h.subarray(0,32)),chain:Buffer.from(h.subarray(32)),depth:0,parent:Buffer.alloc(4),index:0};
}
function child(node,n){
 const h=createHmac('sha512',node.chain).update(Buffer.concat([n>=HARD?Buffer.concat([Buffer.from([0]),node.key]):pub(node),index(n)])).digest();
 const tweak=BigInt('0x'+h.subarray(0,32).toString('hex'));
 if(tweak>=N)throw Error('Invalid deterministic BIP32 tweak');
 const scalar=(tweak+BigInt('0x'+node.key.toString('hex')))%N;
 if(!scalar)throw Error('Invalid deterministic BIP32 child');
 return {key:Buffer.from(scalar.toString(16).padStart(64,'0'),'hex'),chain:Buffer.from(h.subarray(32)),depth:node.depth+1,parent:hash160(pub(node)).subarray(0,4),index:n};
}
function derive(path){return path.reduce((node,n)=>child(node,n),root());}
function base58check(data){
 const raw=Buffer.concat([data,hash(hash(data)).subarray(0,4)]),alphabet='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
 let n=BigInt('0x'+raw.toString('hex')),s='';while(n){s=alphabet[Number(n%58n)]+s;n/=58n;}
 return '1'.repeat(raw.findIndex(v=>v!==0))+s;
}
const account=derive([84+HARD,HARD,HARD]);
const encoded=Buffer.concat([Buffer.from('0488b21e','hex'),Buffer.from([account.depth]),account.parent,index(account.index),account.chain,pub(account)]);
export const PUBLIC_SYNTHETIC_ACCOUNT=Object.freeze({xpub:base58check(encoded),fingerprint:hash160(pub(root())).subarray(0,4).toString('hex'),origin:"m/84'/0'/0'",synthetic:true,hardwareVerified:false});
account.key.fill(0);
export function syntheticSignedCltvFixture(){
 const node=derive([84+HARD,HARD,HARD,1,10]),publicKey=pub(node);
 const redeem=bitcoin.script.compile([bitcoin.script.number.encode(110),bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,bitcoin.opcodes.OP_DROP,publicKey,bitcoin.opcodes.OP_CHECKSIG]);
 const funding=new bitcoin.Transaction();funding.version=2;funding.addInput(Buffer.alloc(32,1),0);
 funding.addOutput(bitcoin.payments.p2sh({redeem:{output:redeem},network:bitcoin.networks.regtest}).output,100000);
 const psbt=new bitcoin.Psbt({network:bitcoin.networks.regtest});psbt.setVersion(2);psbt.setLocktime(110);
 psbt.addInput({hash:funding.getId(),index:0,sequence:0xfffffffe,nonWitnessUtxo:funding.toBuffer(),redeemScript:redeem,bip32Derivation:[{masterFingerprint:Buffer.from(PUBLIC_SYNTHETIC_ACCOUNT.fingerprint,'hex'),path:"m/84'/0'/0'/1/10",pubkey:publicKey}]});
 psbt.addOutput({script:Buffer.from('0014'+'42'.repeat(20),'hex'),value:99000});
 const unsignedBase64=psbt.toBase64();
 psbt.signInput(0,{publicKey,sign:message=>Buffer.from(secp256k1.sign(message,node.key,{lowS:true,prehash:false}).toCompactRawBytes())});
 node.key.fill(0);
 return {signed:psbt.toBuffer(),unsignedBase64,publicKeyHex:publicKey.toString('hex'),fundingHex:funding.toHex(),account:PUBLIC_SYNTHETIC_ACCOUNT,synthetic:true,hardwareVerified:false,broadcast:false};
}
export function syntheticPublicKey(branch,index){
 if(![0,1].includes(branch)||!Number.isSafeInteger(index)||index<0||index>100000)throw Error('Invalid synthetic public child');
 const n=derive([84+HARD,HARD,HARD,branch,index]);const result=pub(n);n.key.fill(0);return result;
}

import {PUBLIC_SYNTHETIC_ACCOUNT,syntheticPublicKey} from './public-synthetic-wallet.mjs';
// Deterministic UNSIGNED unit fixture, not blockchain or hardware evidence.
// No filesystem artifacts, wallet secrets, RPC, or live transactions.
import bitcoin from 'bitcoinjs-lib';
import {createHash} from 'node:crypto';
import {buildUnsignedCltvPsbt} from '../unsigned-cltv-psbt.mjs';
export function recipientUnitFixture(count=5){
 const pubs=Array.from({length:count},(_,i)=>syntheticPublicKey(1,i));
 const redeems=Array.from({length:count},(_,i)=>bitcoin.script.compile([
  bitcoin.script.number.encode(110+i),bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
  bitcoin.opcodes.OP_DROP,pubs[i],bitcoin.opcodes.OP_CHECKSIG]));
 const tx=new bitcoin.Transaction();tx.addInput(Buffer.alloc(32,1),0);
 for(const redeem of redeems)tx.addOutput(bitcoin.payments.p2sh({redeem:{output:redeem}}).output,20000);
 const destination='0014'+'ab'.repeat(20),psbts=[],releases=[];
 for(let i=0;i<count;i++){
  const built=buildUnsignedCltvPsbt({fundingTxHex:tx.toHex(),expectedTxid:tx.getId(),
   vout:i,expectedSats:20000,redeemScriptHex:redeems[i].toString('hex'),
   signerPubkeyHex:pubs[i].toString('hex'),masterFingerprintHex:PUBLIC_SYNTHETIC_ACCOUNT.fingerprint,
   derivationPath:[0x80000054,0x80000000,0x80000000,1,i],locktime:110+i,
   destinationScriptHex:destination,destinationSats:19000});
  psbts.push({releaseNumber:i+1,approvedUnsignedBase64:built.psbtBase64,
   expectedApprovedSha256:createHash('sha256').update(Buffer.from(built.psbtBase64,'base64')).digest('hex')});
  releases.push({releaseNumber:i+1,fundingTxid:tx.getId(),fundingVout:i,
   lockHeight:110+i,amountSats:19000,destinationScriptHex:destination,
   fundingScriptHex:tx.outs[i].script.toString('hex'),inputSats:20000});
 }
 const tip='a'.repeat(64),block='b'.repeat(64);
 const rpc=async(method,args)=>{
  switch(method){
   case 'getbestblockhash':return tip;
   case 'getblockchaininfo':return {chain:'regtest',blocks:200,bestblockhash:tip};
   case 'getblockheader':return args[0]===tip?{hash:tip,height:200,confirmations:1,mediantime:1800000000}:
    {hash:block,height:100,confirmations:101};
   case 'getrawtransaction':return {txid:tx.getId(),confirmations:101,blockhash:block,
    vout:tx.outs.map((o,n)=>({n,value:o.value/1e8,scriptPubKey:{hex:o.script.toString('hex')}}))};
   case 'gettxout':return {bestblock:tip,confirmations:101,value:20000/1e8,
    scriptPubKey:{hex:tx.outs[args[1]].script.toString('hex')}};
   default:throw Error('Unexpected unit RPC: '+method);
  }
 };
 return {gift:{fundingAddress:bitcoin.payments.p2sh({redeem:{output:redeems[0]},network:bitcoin.networks.regtest}).address,releases},psbts,rpc};
}

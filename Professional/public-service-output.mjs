// Public-only diagnostic destination. Ownership still requires separately pinned
// wallet registration in the trusted regtest coordinator; this grants no power.
import bitcoin from 'bitcoinjs-lib';
import {secp256k1} from '@noble/curves/secp256k1';
export function previewServiceFeeOutput({publicKeyHex,valueSats}){
 if(typeof publicKeyHex!=='string'||!/^(02|03)[0-9a-f]{64}$/.test(publicKeyHex)||
  !Number.isSafeInteger(valueSats)||valueSats<1000||valueSats>6750)
  throw Error('Explicit disposable public service key and valid service amount required');
 secp256k1.ProjectivePoint.fromHex(publicKeyHex);
 const output=bitcoin.payments.p2wpkh({pubkey:Buffer.from(publicKeyHex,'hex'),network:bitcoin.networks.regtest}).output;
 return {valueSats,scriptPubKeyHex:output.toString('hex')};
}

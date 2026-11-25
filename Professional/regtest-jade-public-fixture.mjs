// Software-only public regression fixture. Legacy exported names do not assert hardware use.
import {PUBLIC_SYNTHETIC_ACCOUNT,syntheticPublicKey} from './fixtures/public-synthetic-wallet.mjs';
// Professional isolated experiment: public-only, disposable Jade V7-derived regtest fixture.
// No owner wallet, hardware access, network or broadcast; predictable Node-only test keys.
// The private historical capture is not distributed; derive coherent public test metadata
// from the explicitly software-only fixture instead.
import { readFileSync } from 'node:fs';
import bitcoin from 'bitcoinjs-lib';
import assert from 'node:assert/strict';

export function getCapturedJadePublicFixture() {
  // Compatibility name only. Original hardware evidence remains in the private archive.
  return Object.freeze({pubkeyHex:syntheticPublicKey(1,10).toString('hex'),masterFingerprintHex:PUBLIC_SYNTHETIC_ACCOUNT.fingerprint,
    derivationPath:[0x80000054,0x80000000,0x80000000,1,10],
    source:'software-generated public fixture; NOT device-attested',synthetic:true,hardwareVerified:false});
}

/**
 * Construct the PUBLIC-only legacy P2SH CLTV funding handoff for a disposable
 * regtest fixture. This neither funds an output nor proves hardware spendability.
 * The pubkey and origin are software-generated, not a hardware capture.
 */
export async function getCapturedJadeRegtestCltvHandoff(locktime=110) {
  if(!Number.isSafeInteger(locktime)||locktime<1||locktime>0xffffffff)
    throw Error('Invalid CLTV locktime');
  const jade=getCapturedJadePublicFixture();
  const bitcoin=(await import('bitcoinjs-lib')).default;
  const pubkey=Buffer.from(jade.pubkeyHex,'hex');
  const redeem=bitcoin.script.compile([bitcoin.script.number.encode(locktime),
    bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,bitcoin.opcodes.OP_DROP,
    pubkey,bitcoin.opcodes.OP_CHECKSIG]);
  const payment=bitcoin.payments.p2sh({
    redeem:{output:redeem},network:bitcoin.networks.regtest
  });
  return Object.freeze({
    publicHandoff:Object.freeze({
      version:1,network:'regtest',signerPubkeyHex:jade.pubkeyHex,
      locktime,redeemScriptHex:redeem.toString('hex'),
      fundingAddress:payment.address
    }),
    masterFingerprintHex:jade.masterFingerprintHex,
    derivationPath:jade.derivationPath,
    fundingScriptPubKeyHex:payment.output.toString('hex'),
    signerSource:jade.source
  });
}

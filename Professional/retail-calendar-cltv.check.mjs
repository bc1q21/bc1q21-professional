// Software-only synthetic account; not a captured hardware identity.
import {PUBLIC_SYNTHETIC_ACCOUNT} from './fixtures/public-synthetic-wallet.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import bitcoin from 'bitcoinjs-lib';
import { retailDateToCltvTimestamp } from './retail-calendar-cltv.mjs';
import { deriveJadePublicCltvHandoff } from './jade-xpub-cltv-handoff.mjs';

const xpub=PUBLIC_SYNTHETIC_ACCOUNT.xpub;
test('calendar UTC midnight matches retail date conversion across leap year and year boundaries',()=>{
 for (const day of ['2028-02-29','2029-01-01','2031-12-31','2032-01-01']) {
   assert.equal(retailDateToCltvTimestamp(day),Math.floor(new Date(day+'T00:00:00Z').getTime()/1000));
 }
});
test('public Jade xpub handoff commits exactly to retail UTC release date',()=>{
 const locktime=retailDateToCltvTimestamp('2031-12-31');
 const h=deriveJadePublicCltvHandoff({accountXpub:xpub,masterFingerprintHex:PUBLIC_SYNTHETIC_ACCOUNT.fingerprint,childIndex:10,locktime});
 const script=bitcoin.script.compile([bitcoin.script.number.encode(locktime),bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
   bitcoin.opcodes.OP_DROP,Buffer.from(h.signerPubkeyHex,'hex'),bitcoin.opcodes.OP_CHECKSIG]);
 assert.equal(h.redeemScriptHex,script.toString('hex'));
 assert.equal(h.locktime,locktime);
});
test('invalid and non-timestamp dates rejected',()=>{
 for(const date of ['2027-02-29','2028-13-01','2030-00-02','2030-04-31','2030-1-01','1970-01-01','2107-01-01',''])
   assert.throws(()=>retailDateToCltvTimestamp(date));
});

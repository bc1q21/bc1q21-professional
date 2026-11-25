// Software-only synthetic account; not a captured hardware identity.
import {PUBLIC_SYNTHETIC_ACCOUNT} from './fixtures/public-synthetic-wallet.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createPublicScheduleChallenge,verifyPublicScheduleReturn } from './public-schedule-return.mjs';
import { composeApprovedPublicScheduleResponse } from './synthetic-offline-schedule-compose.mjs';
import { deriveJadePublicCltvHandoff } from './jade-xpub-cltv-handoff.mjs';
import { retailDateToCltvTimestamp } from './retail-calendar-cltv.mjs';

const accountXpub=PUBLIC_SYNTHETIC_ACCOUNT.xpub;
const masterFingerprintHex=PUBLIC_SYNTHETIC_ACCOUNT.fingerprint,giftTxid='ab'.repeat(32);
const dates=['2031-01-15','2031-02-15'];
const outputScriptsHex=dates.map((date,childIndex)=>deriveJadePublicCltvHandoff({
 accountXpub,masterFingerprintHex,childIndex,locktime:retailDateToCltvTimestamp(date)
}).fundingScriptPubKeyHex);
const challenge=createPublicScheduleChallenge({giftTxid,outputScriptsHex,nonceHex:'a1'.repeat(16)});
const args={challenge,giftTxid,outputScriptsHex,firstDate:dates[0],interval:'month',approved:true};
test('synthetic approval emits only public schedule fields and verifies against gift',()=>{
 const response=composeApprovedPublicScheduleResponse(args);
 assert.deepEqual(Object.keys(response),['version','kind','giftTxid','nonceHex','outputCommitment','firstDate','interval']);
 const verified=verifyPublicScheduleReturn({challenge,response,giftTxid,outputScriptsHex,
  accountXpub,masterFingerprintHex});
 assert.equal(verified.schedule.releaseCount,2);
 assert.equal(verified.deviceAuthenticated,false);
 assert.equal(verified.beneficiaryAuthorized,false);
});
test('missing approval, mismatched challenge, extra field, and wrong gift are rejected',()=>{
 assert.throws(()=>composeApprovedPublicScheduleResponse({...args,approved:false}));
 assert.throws(()=>composeApprovedPublicScheduleResponse({...args,challenge:{...challenge,seed:'forbidden'}}));
 assert.throws(()=>composeApprovedPublicScheduleResponse({...args,giftTxid:'cd'.repeat(32)}));
 assert.throws(()=>composeApprovedPublicScheduleResponse({...args,firstDate:'not-a-date'}));
});

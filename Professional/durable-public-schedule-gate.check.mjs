// Software-only synthetic account; not a captured hardware identity.
import {PUBLIC_SYNTHETIC_ACCOUNT} from './fixtures/public-synthetic-wallet.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveJadePublicCltvHandoff } from './jade-xpub-cltv-handoff.mjs';
import { retailDateToCltvTimestamp } from './retail-calendar-cltv.mjs';
import { DurablePublicScheduleGate } from './durable-public-schedule-gate.mjs';

const accountXpub=PUBLIC_SYNTHETIC_ACCOUNT.xpub;
const masterFingerprintHex=PUBLIC_SYNTHETIC_ACCOUNT.fingerprint,giftTxid='ab'.repeat(32);
const dates=['2031-01-15','2031-02-15'];
const outputScriptsHex=dates.map((date,childIndex)=>deriveJadePublicCltvHandoff({
 accountXpub,masterFingerprintHex,childIndex,locktime:retailDateToCltvTimestamp(date)
}).fundingScriptPubKeyHex);
const args={giftTxid,outputScriptsHex,accountXpub,masterFingerprintHex};
const used=new Set();
const fixtureStore={async claimOnce(key) {if(used.has(key))return false;used.add(key);return true;}};
// Test fixture only: this Set is NOT a durable transactional production store.
function responseFor(challenge){return {version:1,kind:'bc1q21-professional-schedule-response',
 giftTxid,nonceHex:challenge.nonceHex,outputCommitment:challenge.outputCommitment,
 firstDate:dates[0],interval:'month'};}
test('transactional store contract denies replay across separate gate instances',async()=>{
 const first=new DurablePublicScheduleGate({store:fixtureStore});
 const challenge=first.create({...args,nonceHex:'a1'.repeat(16)});
 const response=responseFor(challenge);
 const result=await first.complete({...args,challenge,response});
 assert.equal(result.nonceClaimedDurablyByStore,true);
 assert.equal(result.deviceAuthenticated,false);
 const restarted=new DurablePublicScheduleGate({store:fixtureStore});
 await assert.rejects(()=>restarted.complete({...args,challenge,response}),/already consumed/);
});
test('failed verification burns nonce and cannot be retried',async()=>{
 const gate=new DurablePublicScheduleGate({store:fixtureStore});
 const challenge=gate.create({...args,nonceHex:'b2'.repeat(16)});
 await assert.rejects(()=>gate.complete({...args,challenge,response:{...responseFor(challenge),firstDate:'2031-01-16'}}));
 await assert.rejects(()=>gate.complete({...args,challenge,response:responseFor(challenge)}),/already consumed/);
});
test('missing transactional store is rejected',()=>{
 assert.throws(()=>new DurablePublicScheduleGate({store:new Map()}),/Transactional durable/);
});

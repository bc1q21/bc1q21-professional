// Software-only synthetic account; not a captured hardware identity.
import {PUBLIC_SYNTHETIC_ACCOUNT} from './fixtures/public-synthetic-wallet.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {deriveJadePublicCltvHandoff} from './jade-xpub-cltv-handoff.mjs';
import {retailDateToCltvTimestamp} from './retail-calendar-cltv.mjs';
import {auditOptionBLinkCompatibility} from './option-b-link-compatibility.mjs';

const accountXpub=PUBLIC_SYNTHETIC_ACCOUNT.xpub;
const masterFingerprintHex=PUBLIC_SYNTHETIC_ACCOUNT.fingerprint;
const firstDate='2031-01-15';
const h=deriveJadePublicCltvHandoff({accountXpub,masterFingerprintHex,childIndex:0,locktime:retailDateToCltvTimestamp(firstDate)});
const published={accountXpub,masterFingerprintHex,firstDate,interval:'month',outputScriptsHex:[h.fundingScriptPubKeyHex]};
test('release-address prototype locator is matched but never authorized for live routing',()=>{
 const result=auditOptionBLinkCompatibility('https://example.invalid/gift/'+h.fundingAddress+'?interval=month',published);
 assert.equal(result.status,'release-address-link-matched');
 assert.equal(result.readyForLiveRouting,false);
 assert.equal(result.canSign,false);
});
test('creator funding address cannot silently impersonate first release address',()=>{
 const creatorFundingAddress='bcrt1q'+ 'q'.repeat(38);
 const result=auditOptionBLinkCompatibility('https://example.invalid/gift/'+creatorFundingAddress+'?interval=month',published);
 assert.equal(result.status,'funding-locator-not-release-address');
 assert.equal(result.readyForLiveRouting,false);
 assert.equal(result.chainVerified,false);
 assert.equal(result.canBroadcast,false);
});
test('invalid published scripts are rejected, not downgraded to locator mismatch',()=>{
 assert.throws(()=>auditOptionBLinkCompatibility('https://example.invalid/gift/'+h.fundingAddress+'?interval=month',
 {...published,outputScriptsHex:['a914'+'00'.repeat(20)+'87']}),/does not match/);
});

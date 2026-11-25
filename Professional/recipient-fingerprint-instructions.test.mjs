// Approved template permits same-origin PDF loading; external sources remain disallowed.
// Software-only synthetic account; not a captured hardware identity.
import {PUBLIC_SYNTHETIC_ACCOUNT} from './fixtures/public-synthetic-wallet.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {deriveJadePublicCltvHandoff} from './jade-xpub-cltv-handoff.mjs';
import {retailDateToCltvTimestamp} from './retail-calendar-cltv.mjs';
import {renderOptionBRecipientPage} from './render-option-b-recipient-page.mjs';

const accountXpub=PUBLIC_SYNTHETIC_ACCOUNT.xpub;
const h=deriveJadePublicCltvHandoff({accountXpub,masterFingerprintHex:PUBLIC_SYNTHETIC_ACCOUNT.fingerprint,childIndex:0,locktime:retailDateToCltvTimestamp('2031-01-15')});
const published={accountXpub,masterFingerprintHex:PUBLIC_SYNTHETIC_ACCOUNT.fingerprint,firstDate:'2031-01-15',interval:'month',outputScriptsHex:[h.fundingScriptPubKeyHex]};
const url='https://example.invalid/gift/'+h.fundingAddress+'?interval=month';
test('recipient page keeps script-verified dates without asking for a separate fingerprint',()=>{
 const html=renderOptionBRecipientPage(url,published);
 assert.match(html,/2031-01-15/);
 assert.match(html,/id="sign" disabled/);
 assert.match(html,/connect-src 'self'/);
 assert.doesNotMatch(html,/recipientFingerprint|checkFingerprint|64-character gift fingerprint|independently retained fingerprint|Check your gift fingerprint/i);
 assert.doesNotMatch(html,/<textarea\\b|type="password"/i);
});

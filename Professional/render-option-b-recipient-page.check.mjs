// Approved template permits same-origin PDF loading; external sources remain disallowed.
// Software-only synthetic account; not a captured hardware identity.
import {PUBLIC_SYNTHETIC_ACCOUNT} from './fixtures/public-synthetic-wallet.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {deriveJadePublicCltvHandoff} from './jade-xpub-cltv-handoff.mjs';
import {retailDateToCltvTimestamp} from './retail-calendar-cltv.mjs';
import {renderOptionBRecipientPage} from './render-option-b-recipient-page.mjs';

const accountXpub=PUBLIC_SYNTHETIC_ACCOUNT.xpub;
const masterFingerprintHex=PUBLIC_SYNTHETIC_ACCOUNT.fingerprint;
const dates=['2031-01-15','2031-02-15'];
const handoffs=dates.map((date,childIndex)=>deriveJadePublicCltvHandoff({accountXpub,masterFingerprintHex,childIndex,locktime:retailDateToCltvTimestamp(date)}));
const published={accountXpub,masterFingerprintHex,firstDate:dates[0],interval:'month',outputScriptsHex:handoffs.map(h=>h.fundingScriptPubKeyHex)};
const url='https://example.invalid/gift/'+handoffs[0].fundingAddress+'?interval=month';
test('renders Option B dates from verified scripts, never signing or networking',()=>{
 const html=renderOptionBRecipientPage(url,published);
 for(const date of dates)assert.ok(html.includes('<td>'+date+'</td>'));
 assert.match(html,/2 scheduled releases/);
 assert.match(html,/id="sign" disabled/);
 assert.match(html,/connect-src 'self'/);
 assert.doesNotMatch(html,/<td>130<\/td>/);
 assert.doesNotMatch(html,/66,000 disposable/);
 assert.doesNotMatch(html,/<textarea\b|<input\b[^>]*type=["']password/i);
 assert.doesNotMatch(html,/broadcastTransaction\s*\(/);
});
test('does not render an altered schedule',()=>{
 assert.throws(()=>renderOptionBRecipientPage(url,{...published,firstDate:'2031-01-16'}));
});

test('renders original funding-address gift locator with explicit public mapping',()=>{
 const fundingAddress='bcrt1q'+'q'.repeat(38);
 const originalGiftUrl='https://example.invalid/gift/'+fundingAddress+'?interval=month';
 const commitment={fundingAddress,releaseScriptsHex:published.outputScriptsHex};
 const html=renderOptionBRecipientPage(originalGiftUrl,published,commitment);
 for(const date of dates)assert.ok(html.includes('<td>'+date+'</td>'));
 assert.ok(html.includes('const value="'+fundingAddress+'";'));
 assert.match(html,/No live funding or Bitcoin spending is established/);
 assert.match(html,/id="sign" disabled/);
 assert.match(html,/connect-src 'self'/);
 assert.throws(()=>renderOptionBRecipientPage(originalGiftUrl,published,
  {...commitment,fundingAddress:handoffs[0].fundingAddress}),/disagree/);
 assert.throws(()=>renderOptionBRecipientPage(originalGiftUrl,published,
  {...commitment,releaseScriptsHex:['a914'+'00'.repeat(20)+'87']}),/do not match/);
});

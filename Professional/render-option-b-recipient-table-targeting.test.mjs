import test from 'node:test';import assert from 'node:assert/strict';
import {PUBLIC_SYNTHETIC_ACCOUNT as a} from './fixtures/public-synthetic-wallet.mjs';
import {deriveJadePublicCltvHandoff as derive} from './jade-xpub-cltv-handoff.mjs';
import {retailDateToCltvTimestamp as cltv} from './retail-calendar-cltv.mjs';
import {renderOptionBRecipientPage as render} from './render-option-b-recipient-page.mjs';
test('verified dates replace only giftScheduleRows and leave the earlier draft table empty',()=>{
 const dates=['2031-01-15','2031-02-15'];
 const hs=dates.map((date,childIndex)=>derive({accountXpub:a.xpub,masterFingerprintHex:a.fingerprint,childIndex,locktime:cltv(date)}));
 const html=render('https://example.invalid/gift/'+hs[0].fundingAddress+'?interval=month',{accountXpub:a.xpub,masterFingerprintHex:a.fingerprint,firstDate:dates[0],interval:'month',outputScriptsHex:hs.map(h=>h.fundingScriptPubKeyHex)});
 assert.match(html,/<tbody id="draftGiftRows"><\/tbody>/);
 const body=html.match(/<tbody id="giftScheduleRows">([\s\S]*?)<\/tbody>/)[1];
 assert.equal((body.match(/<tr>/g)||[]).length,2);
 for(const date of dates)assert.ok(body.includes('<td>'+date+'</td>'));
 assert.doesNotMatch(body,/<td>130<\/td>|12,000 sats|class="status">Tested/);
 assert.ok(body.includes('chain status not checked'));assert.match(html,/id="sign" disabled/);
});

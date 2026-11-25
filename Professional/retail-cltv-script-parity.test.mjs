// Software-only synthetic account; not a captured hardware identity.
import {PUBLIC_SYNTHETIC_ACCOUNT} from './fixtures/public-synthetic-wallet.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {deriveJadePublicCltvHandoff} from './jade-xpub-cltv-handoff.mjs';
import {encodeRetailCltvScript,compareRetailCltvScriptWithProfessional} from './retail-cltv-script-parity.mjs';

const accountXpub=PUBLIC_SYNTHETIC_ACCOUNT.xpub;
for(const locktime of [1926115200,2147483647,2147483648,2208988800]){
 test('retail CLTV script bytes equal Professional at '+locktime,()=>{
  const input={accountXpub,masterFingerprintHex:PUBLIC_SYNTHETIC_ACCOUNT.fingerprint,childIndex:0,locktime};
  const actual=deriveJadePublicCltvHandoff(input);
  assert.equal(encodeRetailCltvScript(locktime,actual.signerPubkeyHex),actual.redeemScriptHex);
  const result=compareRetailCltvScriptWithProfessional(input);
  assert.equal(result.sameScript,true);
  assert.equal(result.offlineSignerKeyOwnershipVerified,false);
 });
}
test('retail CLTV encoding rejects invalid pubkeys and locktimes',()=>{
 assert.throws(()=>encodeRetailCltvScript(1,'02'+'11'.repeat(32)),/Timestamp/);
 assert.throws(()=>encodeRetailCltvScript(2147483648,'04'+'11'.repeat(32)),/Compressed/);
});

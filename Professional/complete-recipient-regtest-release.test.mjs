import test from 'node:test';
import assert from 'node:assert/strict';
import {recipientUnitFixture} from './fixtures/recipient-unit-fixture.mjs';
import { validateProfessionalRecipientSignedReturn } from './complete-recipient-regtest-release.mjs';
const {gift,psbts}=recipientUnitFixture(1);
const evidence=psbts[0];
const baseline={
 format:'bc1q21-professional-verified-jade-return-v1',network:'regtest',
 releaseNumber:evidence.releaseNumber,approvedUnsignedSha256:evidence.expectedApprovedSha256,
 signedPsbtBase64:evidence.approvedUnsignedBase64,signatureCryptographicallyVerified:true,
 chainVerified:false,broadcast:false
};
test('rejects unsigned PSBT masquerading as signed Jade return',()=>{
 assert.throws(()=>validateProfessionalRecipientSignedReturn({gift,evidence,signedReturn:baseline}),
 /signature|Expected|signed|finalization/i);
});
for(const [name,change] of [
 ['wrong release',{releaseNumber:evidence.releaseNumber+1}],
 ['wrong approved digest',{approvedUnsignedSha256:'00'.repeat(32)}],
 ['wrong network',{network:'mainnet'}],
 ['broadcast flag',{broadcast:true}],
 ['fake chain verification',{chainVerified:true}],
 ['wrong format',{format:'invalid'}]
]){
 test('rejects '+name,()=>{
  assert.throws(()=>validateProfessionalRecipientSignedReturn({
   gift,evidence,signedReturn:{...baseline,...change}}));
 });
}
test('rejects tampered public gift output',()=>{
 const modified={...gift,releases:gift.releases.map(r=>({...r,amountSats:r.amountSats+1}))};
 assert.throws(()=>validateProfessionalRecipientSignedReturn({gift:modified,evidence,signedReturn:baseline}));
});

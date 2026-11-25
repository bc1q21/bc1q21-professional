// Legacy filename, now a software-generated transport regression. No Jade capture claim.
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';import {URDecoder} from '@ngraveio/bc-ur';import cbor from 'cbor';
import {syntheticSignedCltvFixture} from './fixtures/public-synthetic-wallet.mjs';
const ref=JSON.parse(readFileSync(new URL('./jade-v7-ur-reference-frames.json',import.meta.url),'utf8'));
test('synthetic crypto-psbt fountain frames reconstruct the exact software-only fixture',()=>{
 assert.equal(ref.synthetic,true);assert.equal(ref.hardwareCaptured,false);
 const decoder=new URDecoder();for(const frame of ref.frames){assert.match(frame,/^ur:crypto-psbt\//i);decoder.receivePart(frame);}
 assert.equal(decoder.isComplete(),true);assert.equal(decoder.isSuccess(),true);
 const raw=Buffer.from(cbor.decodeFirstSync(decoder.resultUR().cbor));
 assert.ok(raw.equals(Buffer.from(syntheticSignedCltvFixture().unsignedBase64,'base64')));
 assert.equal(createHash('sha256').update(raw).digest('hex'),ref.syntheticUnsignedPsbtSha256);
});

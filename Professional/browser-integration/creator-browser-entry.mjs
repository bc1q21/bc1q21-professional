import {accountFromPublicFrames,accountIdentity,accountProofChallenge,verifyAccountProof,assembleCustomerWallet,approvedServiceKey} from '../creator-wallet-setup.mjs';
import {CREATOR_SERVICE_POLICY} from '../creator-service-policy.mjs';
import {publicAccountReceiver} from '../public-account-camera.mjs';
// Browser-only creator engine. No coordinator, SQLite, private filesystem or RPC.
import {Buffer} from 'buffer';
import bitcoin from 'bitcoinjs-lib';
import QRCode from 'qrcode';
import {prepareBetaCreation,betaFundingQuote,validateRecovery,recoveryManifest,prepareRecoveredClaim,finalizeRecoveredClaim,GENESIS,digest,canonical,keyScript} from '../lifecycle/public-model.mjs';
import {deriveRecoveryPublicKeys} from '../independent-recovery-profile.mjs';
import {verifyWalletRegistration} from '../lifecycle/public-wallet-registration.mjs';
import {verifyJadeRequest,verifyLifecycleJadeReturn,readJadeSignedPayload} from '../lifecycle/jade-signed-return.mjs';
import {finalizeVerifiedCreatorRegtestTransaction} from '../verify-signed-funded-distribution.mjs';
import {makeCryptoPsbtFrames} from '../crypto-psbt-frames.mjs';
import {createJadeSignedCameraReceiver} from '../recipient-jade-signed-camera.browser.mjs';
globalThis.bc1q21CreatorEngine={accountFromPublicFrames,accountIdentity,accountProofChallenge,verifyAccountProof,publicAccountReceiver,
 servicePolicy:CREATOR_SERVICE_POLICY,checkServicePolicy:()=>approvedServiceKey(CREATOR_SERVICE_POLICY),
 verifyServiceWallet(wallet){const expected=approvedServiceKey(CREATOR_SERVICE_POLICY);if(canonical(wallet.service)!==canonical(expected))throw Error('Service destination differs from approved build policy');},
 assembleCustomerWallet(options){return assembleCustomerWallet({...options,policy:CREATOR_SERVICE_POLICY});},
 signedPayload:payload=>readJadeSignedPayload(Buffer.from(payload)),
prepareBetaCreation,betaFundingQuote,validateRecovery,recoveryManifest,prepareRecoveredClaim,finalizeRecoveredClaim,GENESIS,digest,canonical,keyScript,deriveRecoveryPublicKeys,verifyWalletRegistration,verifyJadeRequest,verifyLifecycleJadeReturn,createJadeSignedCameraReceiver,
 verifySignedBase64(request,signed){return verifyLifecycleJadeReturn({request,independentRequestDigest:request.requestDigest,signedPsbtBase64:signed});},
 decodeTransaction(raw){const tx=bitcoin.Transaction.fromHex(raw);return {txid:tx.getId(),outputs:tx.outs.map(o=>({valueSats:o.value,scriptPubKeyHex:o.script.toString('hex')}))};},
 address:key=>bitcoin.payments.p2wpkh({pubkey:Buffer.from(key.publicKeyHex,'hex'),network:bitcoin.networks.regtest}).address,
 drawAddress:(canvas,address)=>QRCode.toCanvas(canvas,address,{width:240,margin:2}),
 async unsignedQr(request){return this.psbtQr(request.unsigned.unsignedPsbtBase64);},
 async psbtQr(base64){const frames=makeCryptoPsbtFrames(Buffer.from(base64,'base64'),{fragmentLength:120,frameCount:128});return {frames,images:await Promise.all(frames.map(frame=>QRCode.toDataURL(frame,{width:360,margin:2,errorCorrectionLevel:'L'})))};},
 verifyReturn(request,payload){const signed=readJadeSignedPayload(Buffer.from(payload));const receipt=verifyLifecycleJadeReturn({request,independentRequestDigest:request.requestDigest,signedPsbtBase64:signed});const finalized=finalizeVerifiedCreatorRegtestTransaction(request.unsigned,signed);return {receipt,signedPsbtBase64:signed,rawTransactionHex:finalized.rawTransactionHex};},
};

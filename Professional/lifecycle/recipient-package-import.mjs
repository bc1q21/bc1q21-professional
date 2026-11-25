// Offline public-package acceptance only: no RPC, signing or claim authorization.
import {verifyRecipientDeliveryPackage} from './creator-recipient-package.mjs';
import {canonical} from './public-model.mjs';
import {PlanRequestError} from './creator-plan-store.mjs';
const fail=m=>{throw new PlanRequestError(m,409);};
function pins(request, importing){
 const keys=importing?'expectedDigest,package,recipientPin':'expectedDigest,recipientPin';
 if(!request||Object.keys(request).sort().join(',')!==keys||! /^[a-f0-9]{64}$/.test(request.expectedDigest||''))fail('Independent package digest and recipient public identity pin required.');
 const p=request.recipientPin;
 if(!p||Object.keys(p).sort().join(',')!=='destinationScriptHex,recipientId,recipientKeysDigest'||! /^[a-z0-9][a-z0-9-]{0,63}$/.test(p.recipientId)||! /^[a-f0-9]{64}$/.test(p.recipientKeysDigest)||! /^0014[a-f0-9]{40}$/.test(p.destinationScriptHex))fail('Independent recipient identity, public-key digest and destination script required.');
}
export class RecipientPackageImports {
 constructor(store){
  this.db=store.db;
  this.db.exec('CREATE TABLE IF NOT EXISTS recipient_package_imports (package_id TEXT PRIMARY KEY, transaction_id TEXT UNIQUE NOT NULL, digest TEXT UNIQUE NOT NULL, recipient_pin TEXT NOT NULL, package_json TEXT NOT NULL)');
 }
 import(request){
  pins(request,true);
  const verified=verifyRecipientDeliveryPackage(request.package,request.expectedDigest,request.recipientPin);
  const existing=this.db.prepare('SELECT * FROM recipient_package_imports WHERE package_id=? OR transaction_id=? OR digest=?').all(verified.packageId,verified.transactionId,request.expectedDigest);
  if(existing.length){
   if(existing.length!==1||existing[0].package_id!==verified.packageId||existing[0].transaction_id!==verified.transactionId||existing[0].digest!==request.expectedDigest||existing[0].recipient_pin!==canonical(request.recipientPin))fail('Conflicting recipient package; no replacement permitted.');
   return this.recover({expectedDigest:request.expectedDigest,recipientPin:request.recipientPin},true);
  }
  this.db.prepare('INSERT INTO recipient_package_imports VALUES (?,?,?,?,?)').run(verified.packageId,verified.transactionId,request.expectedDigest,canonical(request.recipientPin),JSON.stringify(request.package));
  return this.recover({expectedDigest:request.expectedDigest,recipientPin:request.recipientPin});
 }
 recover(request,duplicate=false){
  pins(request,false);
  const row=this.db.prepare('SELECT * FROM recipient_package_imports WHERE digest=?').get(request.expectedDigest);
  if(!row||row.recipient_pin!==canonical(request.recipientPin))fail('No matching independently pinned recipient import. Re-import the original export with its independent digest and identity.');
  const pkg=JSON.parse(row.package_json),verified=verifyRecipientDeliveryPackage(pkg,request.expectedDigest,request.recipientPin);
  if(verified.packageId!==row.package_id||verified.transactionId!==row.transaction_id)fail('Stored recipient package binding mismatch.');
  return {status:'PACKAGE IMPORTED',duplicate,packageId:verified.packageId,packageDigest:row.digest,transactionId:verified.transactionId,recipientId:request.recipientPin.recipientId,fundingVerified:false,claimAvailable:false,signingAuthorized:false,broadcastAuthorized:false,package:pkg};
 }
}

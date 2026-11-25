// Public recovery package preparation only. No delivery, claim signing or submission.
import {createHash,randomUUID} from 'node:crypto';
import {canonical,digest,recoveryManifest,validateRecovery,prepareClaim,keyScript,keyAddress,finalizeCreation} from './public-model.mjs';
import {assertRegtest,confirmedOutpoints,recoverPublicGift} from './coordinator.mjs';
import {prepareProfessionalCustomerHandoff,verifyProfessionalCustomerHandoff} from '../customer-recipient-handoff.mjs';
import {PlanRequestError} from './creator-plan-store.mjs';
const fail=(m,s=409)=>{throw new PlanRequestError(m,s);};
const sha=b=>createHash('sha256').update(b).digest('hex');
function handoffFor(manifest,destination){
 const claims=manifest.releases.map((_,i)=>prepareClaim({manifest,releaseNumbers:[i+1],destinationScriptHex:destination,rate:2}));
 const gift={fundingAddress:keyAddress(manifest.wallet.creator),releases:claims.map((c,i)=>({releaseNumber:i+1,fundingTxid:manifest.creatorTxid,fundingVout:i,lockHeight:manifest.releases[i].locktime,amountSats:c.payoutSats,destinationScriptHex:destination,fundingScriptHex:manifest.releases[i].scriptPubKeyHex,inputSats:c.principalSats}))};
 return prepareProfessionalCustomerHandoff({gift,psbts:claims.map((c,i)=>({releaseNumber:i+1,approvedUnsignedBase64:c.unsignedPsbtBase64,expectedApprovedSha256:sha(Buffer.from(c.unsignedPsbtBase64,'base64'))}))});
}
export function verifyRecipientDeliveryPackage(pkg,independentDigest,recipientPin){
 if(!pkg||Object.keys(pkg).sort().join(',')!=='body,digest'||!recipientPin)fail('Independent recipient pin and package digest required.');
 const b=pkg.body;
 if(!b||Object.keys(b).sort().join(',')!=='confirmation,customerHandoff,deliveryAuthorized,format,manifest,network,packageId,planDigest,recipient,signingAuthorized,walletDigest'||b.format!=='professional-recipient-delivery-regtest-v1'||b.network!=='regtest'||b.deliveryAuthorized!==false||b.signingAuthorized!==false||pkg.digest!==independentDigest||digest(b)!==independentDigest)fail('Recipient package integrity mismatch.');
 const c=b.confirmation;if(!c||Object.keys(c).sort().join(',')!=='blockHeight,blockhash,confirmations,tip,tipHeight,transactionId'||! /^[a-f0-9]{64}$/.test(c.blockhash)||! /^[a-f0-9]{64}$/.test(c.tip)||!Number.isSafeInteger(c.blockHeight)||c.blockHeight<0||!Number.isSafeInteger(c.confirmations)||c.confirmations<1||!Number.isSafeInteger(c.tipHeight)||c.tipHeight-c.blockHeight+1!==c.confirmations)fail('Invalid packaged confirmation snapshot.');
 validateRecovery(b.manifest,b.manifest.digest);
 if(b.planDigest!==digest(b.manifest.plan)||b.walletDigest!==digest(b.manifest.wallet)||canonical(b.recipient)!==canonical(recipientPin)||b.recipient.recipientKeysDigest!==digest(b.manifest.wallet.recipient)||!b.manifest.wallet.recipient.some(k=>keyScript(k)===b.recipient.destinationScriptHex)||b.confirmation.transactionId!==b.manifest.creatorTxid)fail('Recipient, plan or transaction mismatch.');
 verifyProfessionalCustomerHandoff(b.customerHandoff,b.customerHandoff.sha256);
 if(JSON.stringify(b.customerHandoff)!==JSON.stringify(handoffFor(b.manifest,b.recipient.destinationScriptHex)))fail('Claim/recovery handoff differs from manifest.');
 return {integrityVerified:true,packageId:b.packageId,transactionId:b.manifest.creatorTxid,deliveryAuthorized:false,signingAuthorized:false,chainCurrentlyVerified:false};
}
export class CreatorRecipientPackages {
 constructor(broadcast,{recipientPins=[],rpc=null,minimumConfirmations=1,enableExport=false,clock=()=>Date.now()}={}){
  this.broadcast=broadcast;this.sessions=broadcast.sessions;this.db=broadcast.db;this.pins=JSON.parse(JSON.stringify(recipientPins));this.minimum=minimumConfirmations;this.enableExport=enableExport===true;this.clock=clock;
  if(!Array.isArray(recipientPins)||recipientPins.some(p=>!p||Object.keys(p).sort().join(',')!=='destinationScriptHex,planDigest,recipientId,walletDigest'||! /^[a-f0-9]{64}$/.test(p.planDigest)||! /^[a-f0-9]{64}$/.test(p.walletDigest)||! /^[a-z0-9][a-z0-9-]{0,63}$/.test(p.recipientId)||! /^0014[a-f0-9]{40}$/.test(p.destinationScriptHex))||!Number.isSafeInteger(this.minimum)||this.minimum<1)throw Error('Invalid recipient configuration');
  const allowed=new Set(['getblockchaininfo','getblockhash','getbestblockhash','getblockheader','getrawtransaction','gettxout']);
  this.rpc=async(m,p=[])=>{if(!allowed.has(m)||typeof rpc!=='function')throw Error('Read-only recipient evidence adapter unavailable');return rpc(m,p);};
  this.db.exec('CREATE TABLE IF NOT EXISTS creator_recipient_exports (authorization_id TEXT PRIMARY KEY, package_id TEXT UNIQUE NOT NULL, binding TEXT NOT NULL, expires INTEGER NOT NULL, state TEXT NOT NULL, consumed INTEGER NOT NULL, file_digest TEXT, generated_at INTEGER)');
  this.db.exec('CREATE TABLE IF NOT EXISTS creator_recipient_packages (operation_id TEXT UNIQUE NOT NULL, session_id TEXT PRIMARY KEY, package_id TEXT UNIQUE NOT NULL, binding TEXT NOT NULL, digest TEXT NOT NULL, package_json TEXT NOT NULL, state TEXT NOT NULL, delivery_state TEXT NOT NULL)');
 }
 async prepare(body){
  if(!body||Object.keys(body).sort().join(',')!=='operationId,recipientId,requestDigest,sessionId,transactionId'||! /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(body.operationId||''))fail('Exact recipient packaging request required.',400);
  const request=JSON.parse(JSON.stringify(body)),c=this.sessions.artifactContext(request.sessionId);
  if(c.receipt.txid!==request.transactionId||c.receipt.requestDigest!==request.requestDigest)fail('Creator transaction binding mismatch.');
  const recorded=this.broadcast.latest(request.sessionId);if(recorded?.status!=='CONFIRMED'||recorded.transactionId!==request.transactionId)fail('Confirmed creator observation required.');
  const pin=this.pins.find(p=>p.planDigest===c.receipt.planDigest&&p.walletDigest===c.receipt.walletDigest&&p.recipientId===request.recipientId);
  if(!pin||Object.keys(pin).sort().join(',')!=='destinationScriptHex,planDigest,recipientId,walletDigest'||typeof pin.recipientId!=='string'||! /^[a-z0-9][a-z0-9-]{0,63}$/.test(pin.recipientId)||!c.engine.wallet.recipient.some(k=>keyScript(k)===pin.destinationScriptHex))fail('Independently pinned recipient identity and registered payout key required.',403);
  this.sessions.recoverArtifact(request.sessionId);
  const verified=this.sessions.verifyArtifact(request.sessionId,this.sessions.artifactStore.get(c.receipt.signedPsbtSha256)),final=finalizeCreation(c.engine,verified.bytes.toString('base64'));
  const manifest=recoveryManifest(c.engine,final.rawTransactionHex);
  let chain,raw,header;
  try{
   chain=await assertRegtest(this.rpc);raw=await this.rpc('getrawtransaction',[request.transactionId,true]);
   if(raw.txid!==request.transactionId||raw.hex!==final.rawTransactionHex||!Number.isSafeInteger(raw.confirmations)||raw.confirmations<this.minimum||!raw.blockhash)throw Error('Unconfirmed/mismatched creator');
   header=await this.rpc('getblockheader',[raw.blockhash,true]);
   if(header.hash!==raw.blockhash||header.confirmations!==raw.confirmations||chain.blocks-header.height+1!==raw.confirmations)throw Error('Inactive/mismatched creator block');
   await confirmedOutpoints(this.rpc,manifest.releases.map(r=>({txid:manifest.creatorTxid,vout:r.vout,valueSats:r.valueSats,scriptPubKeyHex:r.scriptPubKeyHex})));
   const recovered=await recoverPublicGift({manifest,independentDigest:manifest.digest,rpc:this.rpc});
   if(recovered.chainTip!==chain.bestblockhash||recovered.unspentPrincipalSats!==manifest.ledger.principalSats||await this.rpc('getbestblockhash',[])!==chain.bestblockhash)throw Error('Reorganization or spent recipient output');
  }catch{fail('Fresh creator confirmation/output/recovery evidence failed; delivery remains disabled.',422);}
  const recipient={recipientId:pin.recipientId,recipientKeysDigest:digest(manifest.wallet.recipient),destinationScriptHex:pin.destinationScriptHex};
  const binding=digest({sessionId:request.sessionId,transactionId:request.transactionId,planDigest:c.receipt.planDigest,walletDigest:c.receipt.walletDigest,recipient});
  const old=this.db.prepare('SELECT * FROM creator_recipient_packages WHERE session_id=?').get(request.sessionId);
  if(old){if(JSON.parse(old.package_json).body.confirmation.blockhash!==raw.blockhash)fail('Stored package confirmation was reorganized; explicit review required.');if(old.operation_id!==request.operationId||old.binding!==binding)fail('Conflicting or duplicate recipient package operation.');verifyRecipientDeliveryPackage(JSON.parse(old.package_json),old.digest,recipient);return this.status(request.sessionId);}
  const confirmation={transactionId:request.transactionId,blockhash:raw.blockhash,blockHeight:header.height,confirmations:raw.confirmations,tip:chain.bestblockhash,tipHeight:chain.blocks};
  const packageId=randomUUID(),b={format:'professional-recipient-delivery-regtest-v1',network:'regtest',packageId,planDigest:c.receipt.planDigest,walletDigest:c.receipt.walletDigest,recipient,confirmation,manifest,customerHandoff:handoffFor(manifest,pin.destinationScriptHex),deliveryAuthorized:false,signingAuthorized:false};
  const pkg={body:b,digest:digest(b)};verifyRecipientDeliveryPackage(pkg,pkg.digest,recipient);
  this.db.exec('BEGIN IMMEDIATE');
  try{
   if(this.db.prepare('SELECT session_id FROM creator_recipient_packages WHERE session_id=? OR operation_id=?').get(request.sessionId,request.operationId))fail('Package operation already prepared concurrently.');
   this.db.prepare('INSERT INTO creator_recipient_packages VALUES (?,?,?,?,?,?,?,?)').run(request.operationId,request.sessionId,packageId,binding,pkg.digest,JSON.stringify(pkg),'PREPARED','NOT_AUTHORIZED');this.db.exec('COMMIT');return this.status(request.sessionId);
  }catch(e){this.db.exec('ROLLBACK');throw e;}
 }

 async exportContext(body,extras=[]){
  if(!this.enableExport)fail('Recipient export disabled by operator.',403);
  const keys=['sessionId','packageId','packageDigest','recipientId','authorizationId',...extras];
  if(!body||Object.keys(body).sort().join(',')!==keys.sort().join(',')||! /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(body.authorizationId||''))fail('Exact recipient export authorization required.',400);
  const row=this.db.prepare('SELECT * FROM creator_recipient_packages WHERE session_id=?').get(body.sessionId);
  if(!row||row.package_id!==body.packageId||row.digest!==body.packageDigest||row.state!=='PREPARED')fail('Recipient package is missing, superseded or mismatched.');
  const pkg=JSON.parse(row.package_json);
  if(pkg.body.recipient.recipientId!==body.recipientId)fail('Recipient identity mismatch.');
  const startTip=await this.rpc('getbestblockhash',[]);
  await this.prepare({sessionId:body.sessionId,transactionId:pkg.body.manifest.creatorTxid,requestDigest:this.sessions.artifactContext(body.sessionId).receipt.requestDigest,recipientId:body.recipientId,operationId:row.operation_id});
  verifyRecipientDeliveryPackage(pkg,row.digest,pkg.body.recipient);
  if(await this.rpc('getbestblockhash',[])!==startTip)fail('Chain changed during export revalidation.',422);
  const binding=digest({packageId:row.package_id,packageDigest:row.digest,planDigest:pkg.body.planDigest,walletDigest:pkg.body.walletDigest,transactionId:pkg.body.manifest.creatorTxid,recipient:pkg.body.recipient,confirmationBlock:pkg.body.confirmation.blockhash});
  return {row,pkg,binding};
 }
 async authorizeExport(body){
  const request=JSON.parse(JSON.stringify(body)),c=await this.exportContext(request,['explicitDeliveryApproval']);
  if(request.explicitDeliveryApproval!==c.binding)fail('Explicit approval of exact package/recipient binding required.',400);
  this.db.exec('BEGIN IMMEDIATE');
  try{
   if(this.db.prepare('SELECT authorization_id FROM creator_recipient_exports WHERE package_id=? OR authorization_id=?').get(request.packageId,request.authorizationId))fail('Delivery/export authorization duplicated or conflicting.');
   this.db.prepare('INSERT INTO creator_recipient_exports VALUES (?,?,?,?,?,0,NULL,NULL)').run(request.authorizationId,request.packageId,c.binding,this.clock()+600000,'AUTHORIZED');
   this.db.prepare("UPDATE creator_recipient_packages SET delivery_state='AUTHORIZED' WHERE package_id=?").run(request.packageId);this.db.exec('COMMIT');return this.status(request.sessionId);
  }catch(e){this.db.exec('ROLLBACK');throw e;}
 }
 async exportPackage(body){
  const request=JSON.parse(JSON.stringify(body)),c=await this.exportContext(request);
  const bytes=Buffer.from(JSON.stringify(c.pkg)+'\n','utf8');
  this.db.exec('BEGIN IMMEDIATE');
  try{
   const a=this.db.prepare('SELECT * FROM creator_recipient_exports WHERE authorization_id=?').get(request.authorizationId);
   if(!a||a.package_id!==c.row.package_id||a.binding!==c.binding||a.state!=='AUTHORIZED'||a.consumed||this.clock()>=a.expires)fail('Export authorization expired, consumed or mismatched.');
   this.db.prepare("UPDATE creator_recipient_exports SET consumed=1,state='EXPORTED',file_digest=?,generated_at=? WHERE authorization_id=?").run(sha(bytes),this.clock(),request.authorizationId);
   this.db.prepare("UPDATE creator_recipient_packages SET delivery_state='EXPORTED' WHERE package_id=?").run(request.packageId);this.db.exec('COMMIT');
   return {bytes,filename:'bc1q21-recipient-'+request.packageId+'.json',fileDigest:sha(bytes),packageDigest:c.row.digest,status:this.status(request.sessionId)};
  }catch(e){this.db.exec('ROLLBACK');throw e;}
 }
 exportApproval(sessionId){
  const p=this.db.prepare('SELECT * FROM creator_recipient_packages WHERE session_id=?').get(sessionId);if(!p)return null;
  const b=JSON.parse(p.package_json).body;
  return digest({packageId:p.package_id,packageDigest:p.digest,planDigest:b.planDigest,walletDigest:b.walletDigest,transactionId:b.manifest.creatorTxid,recipient:b.recipient,confirmationBlock:b.confirmation.blockhash});
 }
 status(sessionId){
  const p=this.db.prepare('SELECT * FROM creator_recipient_packages WHERE session_id=?').get(sessionId);if(!p)return null;
  const auth=this.db.prepare('SELECT * FROM creator_recipient_exports WHERE package_id=?').get(p.package_id),state=auth?.state==='AUTHORIZED'&&this.clock()>=auth.expires?'EXPIRED':p.delivery_state;
  return {packageId:p.package_id,integrityDigest:p.digest,recipientId:JSON.parse(p.package_json).body.recipient.recipientId,preparationStatus:p.state,deliveryAuthorization:state,exportAuthorized:state==='AUTHORIZED'&&this.enableExport,authorizationId:auth?.authorization_id||null,expiresAt:auth?.expires||null,exportFileDigest:auth?.file_digest||null,explicitApprovalDigest:this.exportApproval(sessionId),deliveryAuthorized:false,delivered:false,signingAuthorized:false};
 }
}

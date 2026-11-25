// Loopback-only development service. Optional operator-selected read-only Core adapter.
import http from 'node:http';
import {createHash,timingSafeEqual} from 'node:crypto';
import {CreatorPrivateArtifacts} from './creator-private-artifacts.mjs';
import {digest} from './public-model.mjs';
import {RecipientClaimSigning} from './recipient-claim-signing.mjs';
import {RecipientClaimReview} from './recipient-claim-review.mjs';
import {RecipientClaimPreparation} from './recipient-claim-preparation.mjs';
import {RecipientFundingVerification} from './recipient-funding-verification.mjs';
import {RecipientPackageImports} from './recipient-package-import.mjs';
import {CreatorRecipientPackages} from './creator-recipient-package.mjs';
import {CreatorBroadcast} from './creator-broadcast.mjs';
import {CreatorSubmissionPreflight} from './creator-submission-preflight.mjs';
import {readFileSync,realpathSync} from 'node:fs';
import {resolve,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {CreatorPlanStore,PlanRequestError} from './creator-plan-store.mjs';
import {CreatorPlanFunding} from './creator-plan-funding.mjs';
import {CreatorSigningSessions} from './creator-signing-session.mjs';
import {persistentCore} from './persistent-core.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const validRecoveryToken=(token,expected)=>typeof token==='string'&&token.length>=32&&token.length<=512&&/^[a-f0-9]{64}$/.test(expected||'')&&timingSafeEqual(createHash('sha256').update(token).digest(),Buffer.from(expected,'hex'));
const assets=new Set(['recipient-gift-specific-prototype.html','recipient-package-import.browser.mjs','recipient-jade-review.browser.mjs','index.html','funding-workspace.html','jade-signing-workspace.html','finish-workspace.html','customer-walkthrough.html','customer-controls.css','disclaimer-gate.mjs','disclaimer-policy.mjs','professional-branding.mjs','planner-amounts.mjs','public-date-planner.mjs','retail-calendar-cltv.mjs','prepare-funding-preview.mjs','creator-plan-acceptance.browser.mjs','creator-jade-review.browser.mjs','creator-finish.browser.mjs','retail-mirror/index.html','retail-mirror/planner.css','retail-mirror/planner.browser.mjs','assets/original/pico.min.css','assets/original/style.css','assets/original/bc1q21-logo.png','browser-integration/professional-verifier.bundle.js']);
export function createCreatorPlanService({databasePath,walletPins=[],rpc=null,enableSigningSessions=false,artifactDirectory=null,recoveryTokenSha256=null,enableSubmissionPreflight=false,preflightTokenSha256=null,broadcastRpc=null,enableBroadcastWorkflow=false,broadcastTokenSha256=null,recipientPins=[],minimumDeliveryConfirmations=1,recipientPackageTokenSha256=null,enableRecipientExport=false,recipientDeliveryTokenSha256=null,recipientClaimPins=[],recipientClaimTokenSha256=null,enableRecipientSigningSessions=false,recipientSigningTokenSha256=null,recipientArtifactDirectory=null,recipientRecoveryTokenSha256=null}){
 if(enableRecipientSigningSessions&&!recipientArtifactDirectory)throw Error('Enabled recipient signing sessions require explicit private artifact storage.');
 if(enableSigningSessions&&!artifactDirectory)throw Error('Enabled signing sessions require explicit private artifact storage.');
 const store=new CreatorPlanStore(databasePath);
 const funding=new CreatorPlanFunding(store,{walletPins,rpc});
 const sessions=new CreatorSigningSessions(funding,{enabled:enableSigningSessions,artifactStore:artifactDirectory?new CreatorPrivateArtifacts(artifactDirectory):null});
 const preflight=new CreatorSubmissionPreflight(sessions,{rpc,enabled:enableSubmissionPreflight});
 const broadcast=new CreatorBroadcast(preflight,{rpc:broadcastRpc,enabled:enableBroadcastWorkflow&&typeof broadcastRpc==='function'});
 const recipientPackages=new CreatorRecipientPackages(broadcast,{recipientPins,rpc,minimumConfirmations:minimumDeliveryConfirmations,enableExport:enableRecipientExport});
 const recipientImports=new RecipientPackageImports(store);
 const recipientFunding=new RecipientFundingVerification(recipientImports,{rpc,minimumConfirmations:minimumDeliveryConfirmations});
 const recipientClaims=new RecipientClaimPreparation(recipientFunding,{claimPins:recipientClaimPins});
 const recipientClaimReview=new RecipientClaimReview(recipientClaims);
 const recipientSigning=new RecipientClaimSigning(recipientClaimReview,{enabled:enableRecipientSigningSessions,artifactStore:recipientArtifactDirectory?new CreatorPrivateArtifacts(recipientArtifactDirectory):null});
 const finish=data=>{const r=sessions.finish(data),submission=broadcast.latest(data.sessionId);return {...r,stage:submission&&submission.status!=='NOT SUBMITTED'?'SUBMISSION_STATUS_OBSERVED':r.stage,preflight:preflight.latest(data.sessionId),submission,recipientPackage:recipientPackages.status(data.sessionId)};};
 const server=http.createServer(async(req,res)=>{
  const send=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(body));};
  try{
   const expected=`127.0.0.1:${server.address().port}`;
   if(req.headers.host!==expected)return send(403,{error:'Loopback Host required.'});
   if(['/api/regtest/recipient-artifact-recover','/api/regtest/recipient-artifact-import','/api/regtest/recipient-package-signing-authorize','/api/regtest/recipient-package-signing-state','/api/regtest/recipient-package-signing-return','/api/regtest/recipient-package-review-intent','/api/regtest/recipient-package-review-acknowledge','/api/regtest/recipient-package-review-handoff','/api/regtest/recipient-package-review-restore','/api/regtest/recipient-package-claim-prepare','/api/regtest/recipient-package-claim-recover','/api/regtest/recipient-package-verify','/api/regtest/recipient-package-history','/api/regtest/recipient-package-import','/api/regtest/recipient-package-recover','/api/regtest/creator-plans','/api/regtest/creator-registration','/api/regtest/creator-funding','/api/regtest/creator-prepare','/api/regtest/creator-acknowledge','/api/regtest/creator-handoff','/api/regtest/creator-review','/api/regtest/creator-signing-authorize','/api/regtest/creator-signing-state','/api/regtest/creator-signing-return','/api/regtest/creator-finish','/api/regtest/creator-artifact-recover','/api/regtest/creator-artifact-import','/api/regtest/creator-preflight-authorize','/api/regtest/creator-preflight-run','/api/regtest/creator-broadcast-authorize','/api/regtest/creator-broadcast-run','/api/regtest/creator-broadcast-reconcile','/api/regtest/creator-recipient-package','/api/regtest/creator-recipient-authorize','/api/regtest/creator-recipient-export'].includes(req.url)){
    if(req.method!=='POST')return send(405,{error:'POST required.'});
    if(req.headers.origin!==`http://${expected}`||req.headers['content-type']!=='application/json')return send(403,{error:'Same-origin JSON required.'});
    let body='';for await(const part of req){body+=part.toString('utf8');if(Buffer.byteLength(body)>(req.url==='/api/regtest/recipient-package-import'?700000:['/api/regtest/recipient-artifact-import','/api/regtest/recipient-package-signing-return','/api/regtest/recipient-package-claim-prepare','/api/regtest/creator-registration','/api/regtest/creator-signing-return','/api/regtest/creator-finish','/api/regtest/creator-artifact-recover','/api/regtest/creator-artifact-import'].includes(req.url)?262144:16384))return send(413,{error:'Request too large.'});}
    let data;try{data=JSON.parse(body);}catch{return send(400,{error:'Invalid JSON.'});}
    if(['/api/regtest/recipient-artifact-recover','/api/regtest/recipient-artifact-import'].includes(req.url)){
     const token=req.headers['x-professional-recovery-token'];
     if(!validRecoveryToken(token,recipientRecoveryTokenSha256))return send(403,{error:'Separate recipient artifact recovery operator token required. Never provide wallet credentials.'});
     const importing=req.url.endsWith('-import');
     if(!data||Object.keys(data).sort().join(',')!==(importing?'expectedDigest,recipientPin,sessionId,signedPayload':'expectedDigest,recipientPin,sessionId'))return send(400,{error:'Exact independent recipient recovery binding required.'});
     recipientImports.recover({expectedDigest:data.expectedDigest,recipientPin:data.recipientPin});
     const c=recipientSigning.artifactContext(data.sessionId);
     if(data.expectedDigest!==c.binding.expectedDigest||digest(data.recipientPin)!==digest(c.binding.recipientPin))return send(409,{error:'Independent recipient recovery identity mismatch.'});
     return send(200,importing?recipientSigning.importArtifact(data.sessionId,data.signedPayload):recipientSigning.recoverArtifact(data.sessionId));
    }
    if(req.url.startsWith('/api/regtest/recipient-package-signing-')){
     const token=req.headers['x-professional-recipient-signing-token'];
     if(typeof token!=='string'||token.length<32||token.length>512||! /^[a-f0-9]{64}$/.test(recipientSigningTokenSha256||'')||!timingSafeEqual(createHash('sha256').update(token).digest(),Buffer.from(recipientSigningTokenSha256,'hex')))return send(403,{error:'Separate recipient signing operator token required. Never provide wallet credentials.'});
     return send(200,req.url.endsWith('-authorize')?await recipientSigning.authorize(data):req.url.endsWith('-return')?await recipientSigning.acceptReturn(data):await recipientSigning.restore(data));
    }
    if(['/api/regtest/recipient-package-review-intent','/api/regtest/recipient-package-review-acknowledge','/api/regtest/recipient-package-review-handoff','/api/regtest/recipient-package-review-restore','/api/regtest/recipient-package-claim-prepare','/api/regtest/recipient-package-claim-recover'].includes(req.url)){
     const token=req.headers['x-professional-recipient-claim-token'];
     if(typeof token!=='string'||token.length<32||token.length>512||! /^[a-f0-9]{64}$/.test(recipientClaimTokenSha256||'')||!timingSafeEqual(createHash('sha256').update(token).digest(),Buffer.from(recipientClaimTokenSha256,'hex')))return send(403,{error:'Separate operator unsigned-claim preparation token required. Never provide wallet secrets.'});
     if(req.url.includes('/recipient-package-review-')){const action=req.url.split('-').at(-1);return send(200,{...await recipientClaimReview[action](data),recipientSigningSessionsEnabled:enableRecipientSigningSessions===true&&/^[a-f0-9]{64}$/.test(recipientSigningTokenSha256||'')});}
     return send(200,req.url.endsWith('-prepare')?await recipientClaims.prepare(data):recipientClaims.recover(data));
    }
    if(req.url==='/api/regtest/recipient-package-verify')return send(200,await recipientFunding.verify(data));
    if(req.url==='/api/regtest/recipient-package-history')return send(200,recipientFunding.historical(data));
    if(req.url==='/api/regtest/recipient-package-import')return send(200,recipientImports.import(data));
    if(req.url==='/api/regtest/recipient-package-recover')return send(200,recipientImports.recover(data));
    if(req.url.startsWith('/api/regtest/creator-artifact-')){
     const token=req.headers['x-professional-recovery-token'];
     if(!validRecoveryToken(token,recoveryTokenSha256))return send(403,{error:'Operator recovery access token required. Never provide wallet credentials.'});
     const importing=req.url.endsWith('-import');
     if(!data||Object.keys(data).sort().join(',')!==(importing?'sessionId,signedPayload':'sessionId')||typeof data.sessionId!=='string'||! /^[a-f0-9-]{36}$/.test(data.sessionId))return send(400,{error:'Exact recovery request required.'});
     return send(200,importing?sessions.importArtifact(data.sessionId,data.signedPayload):sessions.recoverArtifact(data.sessionId));
    }

    if(req.url.startsWith('/api/regtest/creator-preflight-')){
     const token=req.headers['x-professional-preflight-token'];
     if(typeof token!=='string'||token.length<32||token.length>512||! /^[a-f0-9]{64}$/.test(preflightTokenSha256||'')||!timingSafeEqual(createHash('sha256').update(token).digest(),Buffer.from(preflightTokenSha256,'hex')))return send(403,{error:'Separate operator preflight token required.'});
     return send(200,req.url.endsWith('-authorize')?preflight.authorize(data):await preflight.run(data));
    }
    if(req.url.startsWith('/api/regtest/creator-broadcast-')){
     const token=req.headers['x-professional-broadcast-token'];
     if(typeof token!=='string'||token.length<32||token.length>512||! /^[a-f0-9]{64}$/.test(broadcastTokenSha256||'')||!timingSafeEqual(createHash('sha256').update(token).digest(),Buffer.from(broadcastTokenSha256,'hex')))return send(403,{error:'Separate transaction-broadcast operator token required.'});
     return send(200,req.url.endsWith('-authorize')?broadcast.authorize(data):req.url.endsWith('-reconcile')?await broadcast.reconcile(data):await broadcast.run(data));
    }
    if(req.url==='/api/regtest/creator-recipient-package'){
     const token=req.headers['x-professional-recipient-package-token'];
     if(typeof token!=='string'||token.length<32||token.length>512||! /^[a-f0-9]{64}$/.test(recipientPackageTokenSha256||'')||!timingSafeEqual(createHash('sha256').update(token).digest(),Buffer.from(recipientPackageTokenSha256,'hex')))return send(403,{error:'Recipient package operator token required.'});
     return send(200,await recipientPackages.prepare(data));
    }
    if(['/api/regtest/creator-recipient-authorize','/api/regtest/creator-recipient-export'].includes(req.url)){
     const token=req.headers['x-professional-recipient-delivery-token'];
     if(typeof token!=='string'||token.length<32||token.length>512||! /^[a-f0-9]{64}$/.test(recipientDeliveryTokenSha256||'')||!timingSafeEqual(createHash('sha256').update(token).digest(),Buffer.from(recipientDeliveryTokenSha256,'hex')))return send(403,{error:'Separate recipient delivery/export operator token required.'});
     if(req.url.endsWith('-authorize'))return send(200,await recipientPackages.authorizeExport(data));
     const exported=await recipientPackages.exportPackage(data);
     res.writeHead(200,{'Content-Type':'application/json','Content-Disposition':'attachment; filename="'+exported.filename+'"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Package-Digest':exported.packageDigest,'X-Export-File-Digest':exported.fileDigest});res.end(exported.bytes);return;
    }
    const result=req.url==='/api/regtest/creator-plans'?store.accept(data):req.url==='/api/regtest/creator-registration'?funding.register(data):req.url==='/api/regtest/creator-funding'?await funding.inspect(data):req.url==='/api/regtest/creator-prepare'?await funding.prepare(data):req.url==='/api/regtest/creator-acknowledge'?await funding.acknowledge(data):req.url==='/api/regtest/creator-handoff'?await funding.handoff(data):req.url==='/api/regtest/creator-review'?await funding.restoreReview(data):req.url==='/api/regtest/creator-signing-authorize'?await sessions.authorize(data):req.url==='/api/regtest/creator-signing-state'?await sessions.restore(data):req.url==='/api/regtest/creator-signing-return'?await sessions.acceptReturn(data):finish(data);return send(result.status==='accepted'?201:200,result);
   }
   if(req.method!=='GET')return send(405,{error:'GET required.'});
   const name=req.url==='/'?'index.html':req.url.slice(1);
   if(!assets.has(name))return send(404,{error:'Resource unavailable.'});
   const file=realpathSync(resolve(root,name));if(!file.startsWith(realpathSync(root)+'/'))return send(403,{error:'Resource outside preview.'});
   const types={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.png':'image/png'};
   res.writeHead(200,{'Content-Type':types[extname(file)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(readFileSync(file));
  }catch(e){send(e instanceof PlanRequestError?e.status:500,{error:e instanceof PlanRequestError?e.message:'Local service unavailable; retry the same request.'});}
 });
 server.requestTimeout=10000;server.headersTimeout=10000;
 server.on('close',()=>store.close());return server;
}
// Explicit operator-selected descriptor only; never start/recreate a node or use stale fallback.
export function configuredReadOnlyRpc(descriptorFile){
 const config=JSON.parse(readFileSync(descriptorFile,'utf8'));
 if(config.status!=='ACTIVE_OWNER_APPROVED'||config.network!=='regtest'||config.datadir!==resolve(config.root,'data'))throw Error('Invalid active regtest descriptor');
 const core=persistentCore(config.root);
 if(core.container!==config.container)throw Error('Regtest container binding mismatch');
 return async(method,params)=>{
  const cp=await core.verifyCheckpoint();
  if(cp.height!==config.expectedHeight||cp.tip!==config.expectedTip)throw Error('Active checkpoint mismatch');
  return core.readOnlyRpc(method,params);
 };
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const path=process.argv[2];if(!path)throw Error('Explicit durable SQLite path required.');
 const config=process.argv[3]?JSON.parse(readFileSync(process.argv[3],'utf8')):{};
 const rpc=config.activeEnvironmentFile?configuredReadOnlyRpc(config.activeEnvironmentFile):null;
 const server=createCreatorPlanService({databasePath:resolve(path),walletPins:config.walletPins||[],rpc,enableSigningSessions:config.enableSigningSessions===true,artifactDirectory:config.artifactDirectory||null,recoveryTokenSha256:config.recoveryTokenSha256||null,enableSubmissionPreflight:config.enableSubmissionPreflight===true,preflightTokenSha256:config.preflightTokenSha256||null,recipientPins:config.recipientPins||[],minimumDeliveryConfirmations:config.minimumDeliveryConfirmations||1,recipientPackageTokenSha256:config.recipientPackageTokenSha256||null,enableRecipientExport:config.enableRecipientExport===true,recipientDeliveryTokenSha256:config.recipientDeliveryTokenSha256||null,recipientClaimPins:config.recipientClaimPins||[],recipientClaimTokenSha256:config.recipientClaimTokenSha256||null,enableRecipientSigningSessions:config.enableRecipientSigningSessions===true,recipientSigningTokenSha256:config.recipientSigningTokenSha256||null,recipientArtifactDirectory:config.recipientArtifactDirectory||null,recipientRecoveryTokenSha256:config.recipientRecoveryTokenSha256||null});server.listen(8766,'127.0.0.1',()=>console.log('Regtest plan acceptance only: http://127.0.0.1:8766/'));
}

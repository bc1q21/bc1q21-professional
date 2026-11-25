// Local filesystem-authorized operator helper. No HTTP/Core/signing/broadcast.
import {readFileSync,openSync,writeFileSync,fsyncSync,closeSync,constants,lstatSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {RecipientPackageImports} from './recipient-package-import.mjs';
import {RecipientFundingVerification} from './recipient-funding-verification.mjs';
import {RecipientClaimPreparation} from './recipient-claim-preparation.mjs';
import {RecipientClaimReview} from './recipient-claim-review.mjs';
import {RecipientClaimSigning} from './recipient-claim-signing.mjs';
import {CreatorPlanStore} from './creator-plan-store.mjs';
import {CreatorPlanFunding} from './creator-plan-funding.mjs';
import {CreatorSigningSessions} from './creator-signing-session.mjs';
import {CreatorPrivateArtifacts} from './creator-private-artifacts.mjs';
const args=process.argv.slice(2),recipient=args[0]==='--recipient';if(recipient)args.shift();
const [mode,database,configFile,sessionId,path]=args;
if(!['recover','export','import'].includes(mode)||!database||!configFile||!sessionId)throw Error('Use [--recipient] recover|export|import DB OPERATOR_CONFIG SESSION_ID [PRIVATE_FILE]');
const config=JSON.parse(readFileSync(configFile,'utf8'));
const store=new CreatorPlanStore(resolve(database));
try{
 const artifactStore=new CreatorPrivateArtifacts(recipient?config.recipientArtifactDirectory:config.artifactDirectory);
 const sessions=recipient?new RecipientClaimSigning(new RecipientClaimReview(new RecipientClaimPreparation(new RecipientFundingVerification(new RecipientPackageImports(store)),{claimPins:config.recipientClaimPins||[]})),{artifactStore}):new CreatorSigningSessions(new CreatorPlanFunding(store,{walletPins:config.walletPins||[]}),{artifactStore});
 if(mode==='import'){
  if(!path)throw Error('Private signed capture file required');const bytes=readFileSync(path);sessions.importArtifact(sessionId,bytes.subarray(0,5).toString('hex')==='70736274ff'?bytes.toString('base64'):bytes.toString('utf8'));
 }
 const result=sessions.recoverArtifact(sessionId);
 if(mode==='export'){
  if(!path)throw Error('Explicit private destination required');const dest=resolve(path),repo=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
  if(dest.startsWith(repo+'/'))throw Error('Export outside repository only');
  new CreatorPrivateArtifacts(dirname(dest));
  const c=sessions.artifactContext(sessionId),bytes=sessions.artifactStore.get(c.receipt.signedPsbtSha256);
  const fd=openSync(dest,constants.O_WRONLY|constants.O_CREAT|constants.O_EXCL|constants.O_NOFOLLOW,0o600);try{writeFileSync(fd,bytes);fsyncSync(fd);}finally{closeSync(fd);}
 }
 console.log(JSON.stringify(result)); // Public recovery context only, never signed bytes/token.
}finally{store.close();}

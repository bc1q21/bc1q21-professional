// Clean-process public recovery, no website/session storage or wallet secrets.
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {recoverPublicGift} from './coordinator.mjs';
import {dockerCoreRpc} from './local-core-lab.mjs';
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const [file,pinnedDigest,container]=process.argv.slice(2);
 const result=await recoverPublicGift({manifest:JSON.parse(readFileSync(file,'utf8')),
  independentDigest:pinnedDigest,rpc:dockerCoreRpc(container,{readOnlyOnly:true})});
 process.stdout.write(JSON.stringify(result)+'\n');
}

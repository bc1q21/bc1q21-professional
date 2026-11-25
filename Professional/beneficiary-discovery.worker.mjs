// Public-only script matching off the UI thread; seed words never accepted.
import {matchPublicOutputs} from './recovery-proof/public-discovery.mjs';
self.onmessage=e=>{try{self.postMessage({result:matchPublicOutputs(e.data)});}catch(error){self.postMessage({error:error.message});}};

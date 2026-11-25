// Non-writing test adapter; never used by accepted runtime/build commands.
import {createRequire} from 'node:module';import {fileURLToPath} from 'node:url';
const require=createRequire(new URL('../browser-integration/package.json',import.meta.url)),real=require('esbuild');
function options(o){if(o?.write!==false)throw Error('PUBLIC_TEST_SAFETY_BLOCK: writing esbuild build');return {...o,nodePaths:[...(o.nodePaths||[]),fileURLToPath(new URL('../browser-integration/node_modules',import.meta.url))]};}
export const build=o=>real.build(options(o)),buildSync=o=>real.buildSync(options(o)),context=o=>real.context(options(o));
export const {transform,transformSync,formatMessages,formatMessagesSync,analyzeMetafile,analyzeMetafileSync,initialize,stop,version}=real;
export default {...real,build,buildSync,context};

// Test runner only: reuse already-installed packages; never install or serve.
import {createRequire} from 'node:module';
const require=createRequire(new URL('../browser-integration/package.json',import.meta.url));
export async function resolve(specifier,context,next){
 if(specifier==='esbuild'&&process.env.BC1Q21_TEST_PORTS)return next(new URL('../test-support/esbuild.mjs',import.meta.url).href,context);
 try{return await next(specifier,context);}catch(error){
  if(error.code!=='ERR_MODULE_NOT_FOUND'||specifier.startsWith('.')||specifier.startsWith('/')||specifier.startsWith('node:'))throw error;
  // Resolve with ESM import conditions, not createRequire's CommonJS condition.
  return next(specifier,{...context,parentURL:new URL('../browser-integration/package.json',import.meta.url).href});
 }
}

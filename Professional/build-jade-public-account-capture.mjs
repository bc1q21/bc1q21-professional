// Reproducible standalone capture tool. Bundles existing pinned dependencies;
// no npm install, network calls or owner wallet material is part of the build.
import {build} from 'esbuild';
import {polyfillNode} from 'esbuild-plugin-polyfill-node';
import {createHash} from 'node:crypto';
import {writeFileSync,mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
export async function buildPublicAccountCapture(){
 const result=await build({entryPoints:[fileURLToPath(new URL('./jade-public-account-capture.browser.mjs',import.meta.url))],bundle:true,write:false,
  platform:'browser',format:'iife',target:'es2022',minify:true,plugins:[polyfillNode()]});
 const script=result.outputFiles[0].text.replaceAll('</script','<\\/script');
 const style='body{font:18px system-ui;max-width:800px;margin:24px auto;padding:0 16px;line-height:1.5}video{width:100%;max-height:480px;background:#111}button{font:inherit;margin:8px;padding:10px}strong{color:#8b3300}';
 const sha=s=>createHash('sha256').update(s).digest('base64');
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src data:; media-src blob:; style-src \'sha256-'+sha(style)+'\'; script-src \'sha256-'+sha(script)+'\'">'+
 '<title>TEF Jade public-account capture</title><style>'+style+'</style></head><body><h1>Jade public-account capture</h1>'+
 '<p><strong>Scan only Options → Wallet → Export Xpub. Never scan recovery words, SeedQR, backup or private-key QR codes.</strong></p>'+
 '<p>Expected: E29AC13C · Single Sig · Native SegWit · m/84\'/0\'/0\' · Account 0.</p>'+
 '<p>Everything stays on this computer. No remote libraries, uploads, signing or Bitcoin transactions. The saved public export reveals wallet addresses; keep it private.</p>'+
 '<video id="video" muted autoplay playsinline></video><canvas id="canvas" hidden></canvas><p><button id="start">Start camera</button><button id="stop" disabled>Stop camera</button><button id="reset">Reset</button><button id="save" disabled>Save public export</button></p>'+
 '<p id="status" role="status">Ready. Camera is off.</p><script>'+script+'</script></body></html>\n';
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const output=process.argv[2]||fileURLToPath(new URL('./tools/Jade-Public-Account-Capture.html',import.meta.url));
 mkdirSync(dirname(output),{recursive:true});const html=await buildPublicAccountCapture();writeFileSync(output,html);console.log('Built public-only standalone capture tool:',output,Buffer.byteLength(html),'bytes');
}

// Public-only packet generation and return verification. No Core, signing,
// device connection, seed import or network requests. Outputs remain local.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import QRCode from 'qrcode';
import bitcoin from 'bitcoinjs-lib';
import {build} from 'esbuild';
import {polyfillNode} from 'esbuild-plugin-polyfill-node';
import {makeCryptoPsbtFrames} from '../crypto-psbt-frames.mjs';
import {decodeCryptoPsbtFrames} from '../crypto-psbt-transport.mjs';
import {verifyJadeRequest,readJadeSignedPayload,verifyLifecycleJadeReturn} from './jade-signed-return.mjs';
import {decodeJadeRegtestAccount,publicWalletFromJadeAccount} from './jade-public-wallet.mjs';
import {verifyFundedJadeRegistration} from './jade-funded-registration.mjs';
import {jadeRegistrationChallenge,verifyJadeRegistration} from './jade-registration.mjs';
const style='body{font:18px system-ui;margin:24px auto;max-width:900px;padding:0 16px}img{display:block;width:492px;max-width:100%;margin:auto}button,input{font:inherit;margin:8px;padding:10px}pre{white-space:pre-wrap;overflow-wrap:anywhere}video{width:100%;max-width:640px}strong{color:#8b3300}';
const hash=s=>createHash('sha256').update(s).digest('base64');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function page(title,body,script){
 return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
  '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src data:; media-src blob:; style-src \'sha256-'+hash(style)+'\'; script-src \'sha256-'+hash(script)+'\'">'+
  '<title>'+esc(title)+'</title><style>'+style+'</style><h1>'+esc(title)+'</h1>'+body+'<script>'+script+'</script></html>';
}
// Jade may render a testnet HRP instead of Core's regtest HRP. Show both
// locally derived forms of each EXACT output script; never accept an arbitrary
// differing address merely because it looks like testnet.
export function jadeOutputReview(unsignedPsbtBase64){
 const psbt=bitcoin.Psbt.fromBase64(unsignedPsbtBase64,{network:bitcoin.networks.regtest});
 return psbt.txOutputs.map((o,index)=>{
  const address=network=>{try{return bitcoin.address.fromOutputScript(o.script,network)}catch{return null}};
  return {index,valueSats:o.value,scriptPubKeyHex:o.script.toString('hex'),
   regtestAddress:address(bitcoin.networks.regtest),testnetDisplayAlias:address(bitcoin.networks.testnet),coinType0DeviceDisplayAlias:address(bitcoin.networks.bitcoin)};
 });
}
export async function jadeDisplayHtml({unsignedPsbtBase64,fingerprint,review,synthetic=false,fragmentLength=60}){
 assert.match(fingerprint,/^[a-f0-9]{64}$/);
 const bytes=Buffer.from(unsignedPsbtBase64,'base64');
 const frameCount=Math.min(512,Math.ceil((bytes.length+5)/fragmentLength)*2+8);
 const frames=makeCryptoPsbtFrames(bytes,{fragmentLength,frameCount});
 assert.ok(decodeCryptoPsbtFrames([...frames].reverse()).equals(bytes),'QR transport round trip failed');
 const images=await Promise.all(frames.map(f=>QRCode.toDataURL(f,{width:492,margin:4,errorCorrectionLevel:'L'})));
 const script='const images='+JSON.stringify(images)+';let index=0,playing=true,last=Date.now();'+
  'const el=id=>document.getElementById(id);function show(){el("qr").src=images[index];el("progress").textContent="Frame "+(index+1)+" of "+images.length;}show();'+
  'el("pause").onclick=()=>{playing=!playing;el("pause").textContent=playing?"Pause":"Play";};'+
  'el("prev").onclick=()=>{index=(index+images.length-1)%images.length;show();last=Date.now();};'+
  'el("next").onclick=()=>{index=(index+1)%images.length;show();last=Date.now();};'+
  'setInterval(()=>{if(playing&&Date.now()-last>=Number(el("delay").value)){index=(index+1)%images.length;show();last=Date.now();}},80);';
 return page('Professional — disposable Jade regtest acceptance',
  '<p><strong>Disposable regtest only. Never use a wallet holding real Bitcoin. No signing or broadcast is performed by this page.</strong></p>'+
  (synthetic?'<p><strong>SYNTHETIC POSSESSION CHALLENGE — no real funding inputs. Never fund or broadcast this challenge.</strong></p>':'')+
  '<p>Independently compare this fingerprint before scanning:</p><pre>'+esc(fingerprint)+'</pre><pre>'+esc(review)+'</pre>'+
  '<img id="qr" alt="Unsigned PSBT QR"><p id="progress"></p><button id="pause">Pause</button><button id="prev">Previous</button><button id="next">Next</button>'+
  '<label>Milliseconds per frame <input id="delay" type="number" min="250" max="2000" value="750"></label>',script);
}
export async function jadeCaptureHtml(){
 const result=await build({entryPoints:[fileURLToPath(new URL('./jade-capture.browser.mjs',import.meta.url))],bundle:true,write:false,
  platform:'browser',format:'iife',target:'es2022',plugins:[polyfillNode()]});
 return page('Professional — capture unverified Jade PSBT',
  '<p><strong>Disposable signer only. Never scan seed, recovery, account or private-key QR codes.</strong></p>'+
  '<p>This local-only tool captures crypto-psbt data. Run the exact-request verifier afterward. It cannot sign, fund or broadcast.</p>'+
  '<video id="video" muted playsinline></video><canvas id="canvas" hidden></canvas>'+
  '<p><button id="start">Start camera</button><button id="stop">Stop camera</button><button id="reset">Reset</button><button id="save" disabled>Save unverified PSBT</button></p>'+
  '<p id="status" role="status">No capture. No signature verification or broadcast.</p>',result.outputFiles[0].text);
}
const readJson=file=>{const raw=readFileSync(file);assert.ok(raw.length<=4000000,'Public input file too large');return JSON.parse(raw.toString('utf8'));};
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const [mode,input,pin,output,expectedAccountPath="m/84'/1'/0'"]=process.argv.slice(2);
 if(mode==='account'){
  const raw=readFileSync(input);assert.ok(raw.length<=4195328,'Account export too large');
  const registered=publicWalletFromJadeAccount(decodeJadeRegtestAccount(raw.toString('utf8'),{expectedAccountPath}),Number(pin));
  writeFileSync(output,JSON.stringify(registered.wallet,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({walletDigest:registered.walletDigest,masterFingerprintHex:registered.wallet.creator.masterFingerprintHex,walletOriginAuthenticated:false,fundingAuthorized:false,broadcastAuthorized:false}));
 }else if(mode==='display'||mode==='challenge'){
  let packet,review,synthetic=mode==='challenge';const data=readJson(input);
  if(synthetic){packet=jadeRegistrationChallenge(data,pin);review=JSON.stringify({notice:'SYNTHETIC proof only; no funding',roles:packet.inputCount,outputs:jadeOutputReview(packet.unsignedPsbtBase64)},null,2);}
  else{packet=verifyJadeRequest(data,pin);review=JSON.stringify({outputs:jadeOutputReview(packet.unsignedPsbtBase64),kind:data.kind,principalSats:data.principalSats,feeSats:data.feeSats,
   ...(data.kind==='create'?{releases:data.plan.releases,serviceFeeSats:data.serviceFeeSats,changeSats:data.changeSats}:{releases:data.releaseNumbers,payoutSats:data.payoutSats,destinationScriptHex:data.destinationScriptHex})},null,2);}
  assert.ok(output,'Output directory required');const dir=resolve(output);mkdirSync(dir,{recursive:true});
  writeFileSync(join(dir,'unsigned-jade.html'),await jadeDisplayHtml({unsignedPsbtBase64:packet.unsignedPsbtBase64,fingerprint:pin,review,synthetic}),{flag:'wx'});
  writeFileSync(join(dir,'capture-jade.html'),await jadeCaptureHtml(),{flag:'wx'});
  writeFileSync(join(dir,'fingerprint.txt'),pin+'\n',{flag:'wx'});
  console.log('Prepared local public-only QR pages in '+dir+'. Device compatibility remains unverified.');
 }else if(mode==='verify-funded-registration'){
  const request=readJson(input),raw=readFileSync(output);assert.ok(raw.length<=4200000);
  console.log(JSON.stringify(verifyFundedJadeRegistration({request,independentRequestDigest:pin,independentWalletDigest:request.walletDigest,signedPsbtBase64:readJadeSignedPayload(raw)}),null,2));
 }else if(mode==='verify'||mode==='verify-registration'){
  const data=readJson(input),raw=readFileSync(output);assert.ok(raw.length<=4200000,'Signed input too large');
  const signedPsbtBase64=readJadeSignedPayload(raw);
  console.log(JSON.stringify(mode==='verify'?verifyLifecycleJadeReturn({request:data,independentRequestDigest:pin,signedPsbtBase64}):
   verifyJadeRegistration(data,pin,signedPsbtBase64),null,2));
 }else throw Error('Use display REQUEST PIN DIR; challenge PUBLIC_WALLET PIN DIR; verify REQUEST PIN SIGNED_FILE; or verify-registration PUBLIC_WALLET PIN SIGNED_FILE');
}

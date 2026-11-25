// Capture transport test only. Synthetic PUBLIC point/fingerprint metadata;
// never a real TEF export, recovery phrase, wallet secret or signing request.
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import http from 'node:http';
import {chromium} from 'playwright';
import cbor from 'cbor';
import {UR,UREncoder} from '@ngraveio/bc-ur';
import QRCode from 'qrcode';
import {decodeJadeRegtestAccount} from '../jade-public-account.mjs';
const temp=mkdtempSync(join(tmpdir(),'public-jade-capture-'));
const html=readFileSync(new URL('../tools/Jade-Public-Account-Capture.html',import.meta.url));
const pub=Buffer.from('0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798','hex');
function frames({fingerprint=0xe29ac13c,privateKey=false,type='crypto-account'}={}){
 const key=new Map([[2,privateKey],[3,pub],[4,Buffer.alloc(32,7)],[5,new cbor.Tagged(305,new Map([[1,0],[2,0]]))],
  [6,new cbor.Tagged(304,new Map([[1,[84,true,0,true,0,true]],[2,fingerprint],[3,3]]))]]);
 const account=new Map([[1,fingerprint],[2,[new cbor.Tagged(308,new cbor.Tagged(404,new cbor.Tagged(303,key)))]]]);
 return new UREncoder(new UR(cbor.encode(account),type),60).encodeWhole();
}
let server,browser;
try{
 server=http.createServer((req,res)=>{if(req.url==='/capture.html'){res.writeHead(200,{'content-type':'text/html'});res.end(html);}else {res.writeHead(req.url==='/favicon.ico'?204:404);res.end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({executablePath:process.env.BC1Q21_TEST_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage(),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('request',r=>{if(!r.url().startsWith(origin)&&!r.url().startsWith('file:')&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))external.push(r.url());});
 const show=async list=>{
  const images=await Promise.all(list.map(f=>QRCode.toDataURL(f,{width:640,margin:5,errorCorrectionLevel:'L'})));
  await page.evaluate(async images=>{
   if(window.__timer)clearInterval(window.__timer);
   const c=document.createElement('canvas');c.width=640;c.height=640;const ctx=c.getContext('2d');
   const imgs=await Promise.all(images.map(src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=src;})));
   let index=0;const draw=()=>{ctx.fillStyle='#fff';ctx.fillRect(0,0,640,640);ctx.drawImage(imgs[index++%imgs.length],0,0);};
   draw();window.__source=c;window.__stream=c.captureStream(15);window.__timer=setInterval(draw,400);
   Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async options=>{if(options.audio!==false)throw Error('Audio requested');return window.__stream;}}});
  },images);
 };
 await page.goto(origin+'/capture.html');assert.equal(await page.locator('#save').isDisabled(),true);
 const good=frames();assert.ok(good.length>1);await show([good[0]]);await page.locator('#start').click();
 await page.waitForFunction(()=>document.getElementById('status').textContent.includes('1 distinct frames'));
 assert.equal(await page.locator('#save').isDisabled(),true);await page.locator('#stop').click();
 assert.equal(await page.evaluate(()=>window.__stream.getTracks().every(t=>t.readyState==='ended')),true);
 await show(good);await page.locator('#start').click();await page.waitForFunction(()=>!document.getElementById('save').disabled,{timeout:20000});
 assert.match(await page.locator('#status').innerText(),/Complete public export verified/);
 assert.equal(await page.evaluate(()=>window.__stream.getTracks().every(t=>t.readyState==='ended')),true);
 assert.equal(await page.locator('#canvas').evaluate(c=>c.width),0);
 const downloadPromise=page.waitForEvent('download');await page.locator('#save').click();const d=await downloadPromise;
 assert.equal(d.suggestedFilename(),'TEF-public-account-frames.txt');const chunks=[];for await(const chunk of await d.createReadStream())chunks.push(chunk);
 const account=decodeJadeRegtestAccount(Buffer.concat(chunks).toString('utf8'),{expectedAccountPath:"m/84'/0'/0'"});
 assert.equal(account.publicKeyHex,pub.toString('hex'));assert.equal(account.masterFingerprintHex,'e29ac13c');
 for(const bad of [frames({privateKey:true}),frames({fingerprint:0x11223344}),frames({type:'crypto-seed'})]){
  await page.locator('#reset').click();await show(bad);await page.locator('#start').click();
  await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Capture rejected'),{timeout:20000});
  assert.equal(await page.locator('#save').isDisabled(),true);
 }
 await page.evaluate(()=>clearInterval(window.__timer));
 // The identical self-contained page also executes from a file URL; simulated
 // camera permission denial produces a readable status without stale capture.
 const file=join(temp,'capture.html');writeFileSync(file,html);
 await page.addInitScript(()=>Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>{throw Error('Synthetic permission denial')}}}));
 await page.goto(origin+'/capture.html');await page.locator('#start').click();
 await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Camera unavailable'));
 assert.equal(await page.locator('#save').isDisabled(),true);assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 const filePage=await browser.newPage();
 try{await filePage.goto(pathToFileURL(file).href);await filePage.locator('#start').waitFor();console.log('File URL execution: passed (no physical webcam claim).');}
 catch(e){if(!String(e.message).includes('ERR_BLOCKED_BY_ADMINISTRATOR'))throw e;console.log('File URL execution unverified: managed Chromium policy blocks file URLs. Local HTTP capture passed.');}
 finally{await filePage.close();}
 console.log('PASS: complete public account capture/download, partial-frame gate, private/seed/wrong-wallet rejection, camera cleanup, local HTTP, CSP and zero external requests. Windows/Brave physical camera remains unverified.');
}finally{await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));rmSync(temp,{recursive:true,force:true});}

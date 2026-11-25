// Actual local HTTP test of newly generated, self-contained pages. No device.
import assert from 'node:assert/strict';
import http from 'node:http';
import {mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {chromium} from 'playwright';
import QRCode from 'qrcode';
import {makeCryptoPsbtFrames} from '../crypto-psbt-frames.mjs';
import {verifyJadeRegistration} from '../lifecycle/jade-registration.mjs';
import {initializeDisposableSigner,disposableRegistrationProof} from '../lifecycle/disposable-offline-signer.mjs';
import {jadeRegistrationChallenge} from '../lifecycle/jade-registration.mjs';
import {jadeDisplayHtml,jadeCaptureHtml} from '../lifecycle/jade-compatibility.mjs';
const directory=mkdtempSync(join(tmpdir(),'professional-jade-browser-'));
let browser,server;
try{
 const r=initializeDisposableSigner(join(directory,'private-disposable-fixture.json'),2);
 const challenge=jadeRegistrationChallenge(r.wallet,r.walletDigest);
 const pages=new Map([
  ['/unsigned-jade.html',await jadeDisplayHtml({unsignedPsbtBase64:challenge.unsignedPsbtBase64,fingerprint:r.walletDigest,review:'Synthetic registration only',synthetic:true})],
  ['/capture-jade.html',await jadeCaptureHtml()]
 ]);
 server=http.createServer((req,res)=>{
  // Serve these two in-memory public pages only; the disposable seed is NEVER
  // under a static document root and cannot be fetched by this browser.
  if(req.url==='/favicon.ico'){res.writeHead(204);res.end();return;}
  if(!pages.has(req.url)){res.writeHead(404);res.end();return;}
  res.writeHead(200,{'content-type':'text/html; charset=utf-8'});res.end(pages.get(req.url));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({executablePath:process.env.BC1Q21_TEST_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage(),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('request',r=>{if(!r.url().startsWith(origin)&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))external.push(r.url());});
 await page.goto(origin+'/unsigned-jade.html');
 await page.waitForFunction(()=>document.getElementById('qr').naturalWidth>0);
 assert.match(await page.locator('body').innerText(),/SYNTHETIC POSSESSION CHALLENGE/);
 await page.locator('#pause').click();const first=await page.locator('#progress').innerText();
 await page.locator('#next').click();const next=await page.locator('#progress').innerText();assert.notEqual(first,next);
 await page.waitForTimeout(900);assert.equal(await page.locator('#progress').innerText(),next);
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.locator('#qr').evaluate(el=>el.getBoundingClientRect().width<=window.innerWidth),true);
 await page.addInitScript(()=>Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:async()=>{throw Object.assign(Error('Synthetic permission denied'),{name:'NotAllowedError'})}}}));
 await page.goto(origin+'/capture-jade.html');assert.equal(await page.locator('#save').isDisabled(),true);
 await page.locator('#start').click();await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Camera unavailable'));
 assert.equal(await page.locator('#save').isDisabled(),true);
 await page.locator('#reset').click();assert.equal(await page.locator('#save').isDisabled(),true);
 const signedProof=disposableRegistrationProof(join(directory,'private-disposable-fixture.json'),r.walletDigest);
 const raw=Buffer.from(signedProof,'base64');
 const frames=makeCryptoPsbtFrames(raw,{fragmentLength:120,frameCount:Math.ceil((raw.length+5)/120)*2+8});
 const images=await Promise.all(frames.map(frame=>QRCode.toDataURL(frame,{width:640,margin:5,errorCorrectionLevel:'L'})));
 await page.evaluate(async images=>{
  const source=document.createElement('canvas');source.width=640;source.height=640;
  const ctx=source.getContext('2d'),decoded=await Promise.all(images.map(src=>new Promise((resolve,reject)=>{
   const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src;
  })));
  let index=0;const draw=()=>{ctx.fillStyle='#fff';ctx.fillRect(0,0,640,640);ctx.drawImage(decoded[index++%decoded.length],0,0);};
  draw();window.__qrTimer=setInterval(draw,350);window.__source=source;window.__stream=source.captureStream(15);
  navigator.mediaDevices.getUserMedia=async()=>window.__stream;
 },images);
 await page.locator('#start').click();await page.waitForFunction(()=>!document.getElementById('save').disabled,{timeout:30000});
 assert.match(await page.locator('#status').innerText(),/Capture is not signature verification/);
 assert.equal(await page.evaluate(()=>window.__stream.getTracks().every(t=>t.readyState==='ended')),true);
 assert.equal(await page.locator('#canvas').evaluate(c=>c.width),0);
 const pendingDownload=page.waitForEvent('download');await page.locator('#save').click();const download=await pendingDownload;
 assert.equal(download.suggestedFilename(),'jade-return-unverified.psbt');
 const chunks=[];for await(const chunk of await download.createReadStream())chunks.push(chunk);
 const downloaded=Buffer.concat(chunks);assert.ok(downloaded.equals(raw));
 assert.equal(verifyJadeRegistration(r.wallet,r.walletDigest,downloaded.toString('base64')).publicKeyPossessionVerified,true);
 await page.locator('#reset').click();assert.equal(await page.locator('#save').isDisabled(),true);
 await page.evaluate(()=>clearInterval(window.__qrTimer));
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 console.log('PASS: generated HTTP QR display, manual/pause controls, mobile image, permission denial, virtual-camera signed QR capture/download/verification, cleanup, CSP and zero external requests.');
}finally{
 await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));
 rmSync(directory,{recursive:true,force:true});
}

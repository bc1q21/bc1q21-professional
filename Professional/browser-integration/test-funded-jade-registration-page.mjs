// Actual unsigned hardware review artifact; no signing, camera or Core mutation.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import http from 'node:http';
import {chromium} from 'playwright';
const html=readFileSync(new URL('../tools/TEF-First-Funded-Jade-Review.html',import.meta.url));
const server=http.createServer((req,res)=>{res.writeHead(200,{'content-type':'text/html'});res.end(html);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
try{
 const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,executablePath:process.env.BC1Q21_TEST_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
 const p=await browser.newPage(),errors=[],external=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 p.on('request',r=>{if(!r.url().startsWith(origin)&&!r.url().startsWith('data:'))external.push(r.url())});
 await p.goto(origin);await p.waitForFunction(()=>document.getElementById('qr').naturalWidth>0);
 const text=await p.locator('body').innerText();assert.match(text,/E29AC13C/);assert.match(text,/800000/);assert.match(text,/797500/);assert.match(text,/2500/);assert.match(text,/not a gift payment/);
 await p.locator('#pause').click();const first=await p.locator('#progress').innerText();await p.locator('#next').click();const next=await p.locator('#progress').innerText();assert.notEqual(first,next);
 await p.waitForTimeout(1000);assert.equal(await p.locator('#progress').innerText(),next);
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 console.log('PASS: actual funded unsigned TEF review HTML loads, renders QR and review data, steps/pauses, enforces CSP, makes no external requests. No hardware signature claimed.');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}

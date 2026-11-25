import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('./',import.meta.url);
const bytes=name=>readFileSync(new URL(name,root));
const sha=(type,data)=>createHash(type).update(data).digest();

test('original assets retain the exact recovered Git blob identities',()=>{
 const expected={
  'pico.min.css':'b7bbabb8293f0dab7e437dca64ac527ef3e717aa',
  'style.css':'e07b2c828f42a6fbba972178c04ec70bae3fd2f0',
  'bc1q21-logo.png':'08a6adb937d043ee24dfae8dc1fa2f1c9430ef71'
 };
 for(const [name,id] of Object.entries(expected)){
  const data=bytes('assets/original/'+name);
  const gitBlob=Buffer.concat([Buffer.from('blob '+data.length+'\0'),data]);
  assert.equal(sha('sha1',gitBlob).toString('hex'),id,name);
 }
});

test('every planner stylesheet has matching SHA-384 integrity in original cascade order',()=>{
 const html=bytes('retail-mirror/index.html').toString();
 const links=[...html.matchAll(/<link rel="stylesheet" href="([^"]+)" integrity="([^"]+)"/g)];
 assert.equal(links.length,4);
 assert.deepEqual(links.map(x=>x[1]),['../assets/original/pico.min.css','../assets/original/style.css','./planner.css','../customer-controls.css']);
 for(const [,path,integrity] of links){
  const data=readFileSync(new URL(path,new URL('retail-mirror/index.html',root)));
  assert.equal(integrity,'sha384-'+sha('sha384',data).toString('base64'));
 }
 assert.match(html,/<html lang="en" data-theme="light">/);
});

test('restored public layout uses the preserved structural classes without legacy runtime',()=>{
 const html=bytes('retail-mirror/index.html').toString();
 for(const name of ['brand','stepper-wrap','progress','bubble','label','section-bar','card','wizard-actions','tbl-wrap','professional-brand-info'])
  assert.ok(html.includes(name),name);
 assert.doesNotMatch(html,/Frontend\/|<base|x-cloak|x-data|alpine|CryptoManager|AESHelper|mnemonicToSeed|<iframe/);
 assert.match(html,/connect-src 'self';/);assert.match(html,/frame-src 'self' blob:/);assert.doesNotMatch(html,/connect-src[^;]*(?:https:|\*)/);assert.match(html,/form-action 'none'/);
});

test('recovered CSS loads only embedded icons, with no remote imports or image dependencies',()=>{
 for(const file of ['pico.min.css','style.css']){
  const css=bytes('assets/original/'+file).toString();
  assert.doesNotMatch(css,/@import\b/);
  for(const [,url] of css.matchAll(/url\((.*?)\)/g))assert.match(url,/^["']?data:image\/svg\+xml,/);
  assert.doesNotMatch(css,/bc1q21-logo-nt|giftbackground/);
 }
});

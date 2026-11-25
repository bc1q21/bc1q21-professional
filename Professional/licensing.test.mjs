// Licensing integrity only. No network, rebuilds or application operations.
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root)),hash=b=>createHash('sha256').update(b).digest('hex');
const inventory=JSON.parse(read('Professional/third-party-notices/runtime-notice-sources.json')),lock=JSON.parse(read('Professional/browser-integration/package-lock.json'));
test('standard Apache text, accepted PDF and contributor attribution are preserved',()=>{
 assert.equal(hash(read('LICENSE')),'c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4');assert.equal(hash(read('Professional/assets/documents/bc1q21_Professional_Liability_Disclaimer.pdf')),'617602ff48f768a6a5d233bbdd767c16eb4bcbb332a47f43a0471a5419c75543');
 const notice=read('NOTICE').toString();for(const name of ['Dale Wells','Edgar Borja'])assert.ok(notice.includes(name));
});
test('all 73 notice records match exact locked installed sources including nested versions',()=>{
 // Notice prose may use platform-native line endings; raw source hashes stay exact.
 const normalize=s=>s.replace(/\r\n/g,'\n');const notices=normalize(read('THIRD_PARTY_NOTICES.md').toString());assert.equal(inventory.packages.length,73);const seen=new Set();
 for(const x of inventory.packages){const key=x.package+'@'+x.version;assert.ok(!seen.has(key));seen.add(key);const source='Professional/browser-integration/'+x.installedSource;const bytes=read(source);assert.equal(hash(bytes),x.sha256,key);assert.ok(notices.includes(normalize(bytes.toString()).trim()),key+' full notice omitted');const path=x.installedSource.slice(0,-('/'+x.file).length);assert.equal(lock.packages[path].version,x.version,key);}
 for(const key of ['qrcode@1.5.4','dijkstrajs@1.0.3','esbuild-plugin-polyfill-node@0.3.0','@jspm/core@2.1.0'])assert.ok(seen.has(key));
});
test('distributed bundle package labels are covered regardless of dev classification',()=>{
 const names=new Set(inventory.packages.map(x=>x.package));for(const artifact of inventory.bundledArtifacts){const bytes=read(artifact.path);assert.equal(hash(bytes),artifact.sha256);const observed=new Set([...bytes.toString().matchAll(/node_modules\/((?:@[^/\s"']+\/)?[^/\s"']+)/g)].map(x=>x[1]));for(const name of observed)assert.ok(names.has(name),artifact.path+': '+name);assert.deepEqual(artifact.missingNotices,[]);assert.deepEqual(artifact.unresolvedModuleLabels,[]);}
});
test('asset scope is explicit and owner representation is not stated as verified assignment',()=>{
 const scope=read('LICENSING.md').toString(),asset=read('ASSET_LICENSE.md').toString(),brand=read('BRANDING_POLICY.md').toString(),rights=read('RIGHTS_PROVENANCE.md').toString();
 for(const f of ['ASSET_LICENSE.md','BRANDING_POLICY.md','RIGHTS_PROVENANCE.md'])assert.ok(scope.includes(f));assert.match(asset,/excluded from the default Apache/);assert.match(asset,/redistribute the approved\nPDF unchanged/);assert.match(brand,/may remove or replace branding/);assert.match(rights,/not an independently verified copyright assignment/);assert.match(rights,/No signed\nassignments/);
});

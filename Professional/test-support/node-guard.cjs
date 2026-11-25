const fs=require('node:fs'),path=require('node:path'),net=require('node:net'),cp=require('node:child_process'),moduleApi=require('node:module');
const originalRead=fs.readFileSync.bind(fs),originalAppend=fs.appendFileSync.bind(fs);
const root=path.resolve(__dirname,'../..');
const ledger=process.env.BC1Q21_TEST_PORTS,events=process.env.BC1Q21_TEST_EVENTS;
if(!ledger||!events)throw Error('Use run-public-source-tests.mjs to initialize safety guards');
function event(kind,detail){try{originalAppend(events,JSON.stringify({language:'node',kind,detail})+'\n')}catch{}}
function deny(kind,detail){event(kind,detail);throw Error('PUBLIC_TEST_SAFETY_BLOCK: '+kind+' '+detail)}
function pstr(v){if(v instanceof URL)return require('node:url').fileURLToPath(v);if(Buffer.isBuffer(v))return v.toString();return typeof v==='string'?v:null}
function checkWrite(v){let s=pstr(v);if(!s)return;let p=path.resolve(s);if((p===root||p.startsWith(root+path.sep)||p.startsWith('/workspace/'))||p.includes('/.git/'))deny('protected write',p)}
for(const name of ['writeFile','writeFileSync','appendFile','appendFileSync','truncate','truncateSync','unlink','unlinkSync','rm','rmSync','rmdir','rmdirSync','mkdir','mkdirSync','createWriteStream','chmod','chmodSync']){const old=fs[name];if(old)fs[name]=function(...a){checkWrite(a[0]);return old.apply(this,a)}}
for(const name of ['copyFile','copyFileSync','cp','cpSync']){const old=fs[name];if(old)fs[name]=function(...a){checkWrite(a[1]);return old.apply(this,a)}}
for(const name of ['rename','renameSync']){const old=fs[name];if(old)fs[name]=function(...a){checkWrite(a[0]);checkWrite(a[1]);return old.apply(this,a)}}
for(const name of ['open','openSync']){const old=fs[name];fs[name]=function(...a){if(typeof a[1]==='string'&&/[wa+]/.test(a[1]))checkWrite(a[0]);return old.apply(this,a)}}
for(const name of ['writeFile','appendFile','truncate','unlink','rm','rmdir','mkdir','chmod']){const old=fs.promises[name];if(old)fs.promises[name]=async function(...a){checkWrite(a[0]);return old.apply(this,a)}}
const listen=net.Server.prototype.listen;
net.Server.prototype.listen=function(...a){let port=typeof a[0]==='object'?a[0].port:a[0];if(typeof port==='number'||/^\d+$/.test(String(port))){if(Number(port)!==0)deny('non-ephemeral test listener',String(port));this.prependOnceListener('listening',()=>{const p=this.address()?.port;if(p)originalAppend(ledger,String(p)+'\n')});}return listen.apply(this,a)};
function allowedPort(p){try{return originalRead(ledger,'utf8').split('\n').includes(String(p))}catch{return false}}
function checkNet(host,port){if(!['127.0.0.1','localhost','::1','[::1]'].includes(host||'localhost')||!allowedPort(port))deny('unregistered network destination',String(host||'localhost')+':'+String(port))}
const connect=net.Socket.prototype.connect;
net.Socket.prototype.connect=function(...a){let o=Array.isArray(a[0])?a[0]:a;let x=o[0];if(x&&typeof x==='object'){if(!x.path)checkNet(x.host||x.hostname||'localhost',x.port)}else if(typeof x==='number')checkNet(typeof o[1]==='string'?o[1]:'localhost',x);else if(typeof x==='string'&&/^\d+$/.test(x))checkNet(typeof o[1]==='string'?o[1]:'localhost',x);return connect.apply(this,a)};
const realFetch=global.fetch;if(realFetch)global.fetch=function(input,...rest){const u=new URL(typeof input==='string'||input instanceof URL?input:input.url);checkNet(u.hostname,u.port||(u.protocol==='https:'?443:80));return realFetch.call(this,input,...rest)};
for(const name of ['spawn','spawnSync','execFile','execFileSync','exec','execSync']){const old=cp[name];cp[name]=function(command,...rest){const b=path.basename(String(command)),args=Array.isArray(rest[0])?rest[0]:[];const service=b==='esbuild'&&String(command).includes('/node_modules/@esbuild/')&&args.every(x=>/^--service=|^--ping$/.test(x));if(!service&&!['node','nodejs','python','python3','git','chromium','chrome','chromium-browser','headless_shell'].includes(b))deny('unapproved external command',b);if(!service&&(/bitcoin|bitcoind|docker|podman|ssh|scp|curl|wget|systemctl|certbot|nginx|npm|npx|esbuild|make|cmake/.test(b)||name==='exec'||name==='execSync'||['sh','bash','powershell','pwsh'].includes(b)))deny('external operation/build',b);if(b==='git'&&!['show','status','diff','log','rev-parse','cat-file','ls-files','ls-tree','show-ref'].includes(args[0]))deny('git mutation',String(args[0]));let oi=Array.isArray(rest[0])?1:0;if(typeof rest[oi]!=='object'||rest[oi]===null)rest.splice(oi,0,{});rest[oi]={...rest[oi],env:{...(rest[oi].env||process.env),NODE_OPTIONS:process.env.NODE_OPTIONS||'--require='+__filename,PYTHONPATH:path.join(__dirname)+(process.env.PYTHONPATH?path.delimiter+process.env.PYTHONPATH:'')}};return old.call(this,command,...rest)}}
moduleApi.syncBuiltinESMExports();


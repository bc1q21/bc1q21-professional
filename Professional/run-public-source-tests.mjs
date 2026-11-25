// Offline, explicit default profile. No live Bitcoin, installation or in-place builds.
import {readFileSync,mkdtempSync,existsSync} from 'node:fs';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';import {join,delimiter} from 'node:path';import {tmpdir} from 'node:os';import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url)),support=join(root,'Professional/test-support'),list=JSON.parse(readFileSync(join(root,'Professional/public-source-test-suite.json'))),frozen=JSON.parse(readFileSync(join(support,'frozen-source.json')));
function integrity(){for(const [file,hash] of Object.entries(frozen))if(createHash('sha256').update(readFileSync(join(root,file))).digest('hex')!==hash)throw Error('Frozen source changed: '+file);}
integrity();const temp=mkdtempSync(join(tmpdir(),'professional-public-tests-'));
const env={...process.env,BC1Q21_TEST_PORTS:join(temp,'ports'),BC1Q21_TEST_EVENTS:join(temp,'events'),NODE_OPTIONS:'--require='+JSON.stringify(join(support,'node-guard.cjs'))+' --experimental-loader='+JSON.stringify(join(root,'Professional/recovery-proof/dependency-loader.mjs')),PYTHONPATH:support+delimiter+join(root,'Professional'),PYTHONDONTWRITEBYTECODE:'1'};
if(!env.BC1Q21_TEST_CHROMIUM&&existsSync('/usr/bin/chromium'))env.BC1Q21_TEST_CHROMIUM='/usr/bin/chromium';
const args=process.argv.slice(2);if(args.some(x=>!['--node','--python','--browser','--legacy-coordinator'].includes(x)))throw Error('Usage: node Professional/run-public-source-tests.mjs [--node|--python|--browser|--legacy-coordinator]');
const mode=args[0]||'--default';let failed=false;
function run(command,args){const p=spawnSync(command,args,{cwd:root,env,stdio:'inherit'});if(p.error)console.error(p.error.message);if(p.error||p.status!==0)failed=true;}
try{
 if(mode==='--legacy-coordinator')run(process.execPath,['--test',...list.optionalProfiles['legacy-coordinator'].filter(f=>f.endsWith('.mjs'))]);
 if(mode==='--default'||mode==='--node')run(process.execPath,['--test',...list.files]);
 if(mode==='--default'||mode==='--python')for(const f of list.pythonFiles)run(process.env.BC1Q21_TEST_PYTHON||'python',['-m','unittest','discover','-s','Professional','-p',f]);
 if(mode==='--default'||mode==='--browser'){
  run(process.execPath,['--test',...list.browserFiles]);
  for(const f of list.pythonBrowserFiles)run(process.env.BC1Q21_TEST_PYTHON||'python',['-m','unittest','discover','-s','Professional','-p',f]);
 }
}finally{integrity();}
console.error('Private local guard log directory: '+temp);process.exitCode=failed?1:0;

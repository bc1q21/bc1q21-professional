import os,json,pathlib,socket,subprocess,builtins,io
_ROOT=pathlib.Path(__file__).resolve().parents[2]
_ORIGINAL_OPEN=builtins.open
_ALLOWED=os.environ['BC1Q21_TEST_PORTS']
_EVENTS=os.environ['BC1Q21_TEST_EVENTS']
def _deny(kind,detail):
 with _ORIGINAL_OPEN(_EVENTS,'a') as f:f.write(json.dumps({'language':'python','kind':kind,'detail':str(detail)})+'\n')
 raise RuntimeError('PUBLIC_TEST_SAFETY_BLOCK: '+kind+' '+str(detail))
def _writecheck(p):
 if isinstance(p,int):return
 try:q=os.path.abspath(os.fspath(p))
 except TypeError:return
 if q==str(_ROOT) or q.startswith(str(_ROOT)+os.sep) or q.startswith('/workspace/') or '/.git/' in q:_deny('protected write',q)

def _guard_open(old):
 def opened(file,mode='r',*a,**k):
  if any(x in str(mode) for x in 'wax+'):_writecheck(file)
  return old(file,mode,*a,**k)
 return opened
builtins.open=_guard_open(builtins.open);io.open=_guard_open(io.open)
for _name in ['remove','unlink','rmdir','mkdir','chmod']:
 _old=getattr(os,_name)
 def _wrapped(p,*a,_old=_old,**k):_writecheck(p);return _old(p,*a,**k)
 setattr(os,_name,_wrapped)
_oldpopen=subprocess.Popen
class _GuardPopen(_oldpopen):
 def __init__(self,args,*a,**k):
  values=args if isinstance(args,(list,tuple)) else [args];b=os.path.basename(str(values[0]));s=' '.join(map(str,values[1:]))
  if b not in ['node','nodejs','python','python3','git','chromium','chrome','chromium-browser','headless_shell']:_deny('unapproved external command',b)
  if k.get('shell') or any(x in b for x in ['bitcoin','docker','podman','ssh','scp','curl','wget','systemctl','nginx','certbot','npm','npx','esbuild','cmake']) or b in ['sh','bash','powershell','pwsh']:_deny('external operation/build',b)
  if b=='git':
   tail=list(values[1:])
   if len(tail)>=2 and tail[0]=='-c' and tail[1] in ['core.autocrlf=true','core.autocrlf=false']:tail=tail[2:]
   if not tail or tail[0] not in ['archive','show','status','diff','log','rev-parse','cat-file','ls-files','ls-tree','show-ref']:_deny('git mutation','git')
  env=dict(k.get('env') or os.environ);env['PYTHONPATH']=str(pathlib.Path(__file__).parent)+(':'+env['PYTHONPATH'] if env.get('PYTHONPATH') and not env['PYTHONPATH'].startswith(str(pathlib.Path(__file__).parent)) else '');env['NODE_OPTIONS']=os.environ.get('NODE_OPTIONS','--require='+str(pathlib.Path(__file__).with_name('node-guard.cjs')));env['PYTHONDONTWRITEBYTECODE']='1';k['env']=env
  super().__init__(args,*a,**k)
subprocess.Popen=_GuardPopen
_bind=socket.socket.bind;_connect=socket.socket.connect

def _ports():
 try:
  with _ORIGINAL_OPEN(_ALLOWED) as f:return set(f.read().splitlines())
 except FileNotFoundError:return set()
def _guard_bind(self,address):
 if isinstance(address,tuple):
  if address[0] not in ['127.0.0.1','localhost','::1'] or (address[1]!=0 and str(address[1]) not in _ports()):_deny('non-ephemeral test listener',str(address))
 result=_bind(self,address)
 if isinstance(address,tuple):
  with _ORIGINAL_OPEN(_ALLOWED,'a') as f:f.write(str(self.getsockname()[1])+'\n')
 return result
def _guard_connect(self,address):
 if isinstance(address,tuple) and (address[0] not in ['127.0.0.1','localhost','::1'] or str(address[1]) not in _ports()):_deny('unregistered network destination',str(address))
 return _connect(self,address)
socket.socket.bind=_guard_bind;socket.socket.connect=_guard_connect
# Browser networking is intercepted too; mocked route fulfilments remain usable.
try:
 import playwright.sync_api as _pw
 _continue=_pw.Route.continue_
 def _route_continue(self,*a,**k):
  from urllib.parse import urlparse
  u=urlparse(k.get('url') or self.request.url)
  if u.scheme in ['http','https'] and (u.hostname not in ['127.0.0.1','localhost','::1'] or str(u.port or (443 if u.scheme=='https' else 80)) not in _ports()):return self.abort('blockedbyclient')
  return _continue(self,*a,**k)
 _pw.Route.continue_=_route_continue
 _newpage=_pw.BrowserContext.new_page
 def _safe_page(self,*a,**k):
  page=_newpage(self,*a,**k)
  page.route('**/*',lambda route:_route_continue(route))
  return page
 _pw.BrowserContext.new_page=_safe_page
except ImportError:pass

"""Focused unprivileged filesystem tests; GitHub, root identity and HTTP mocked.
Run: python3 -B -m unittest discover -s infrastructure/deployment -p 'test_*.py' -v
No SSH, nginx, production paths, credentials or external network are used.
"""
import contextlib,hashlib,importlib.machinery,importlib.util,io,json,os,pathlib,shutil,stat,tempfile,unittest
from unittest.mock import patch
P=pathlib.Path(__file__).resolve().parent
loader=importlib.machinery.SourceFileLoader('professional_static_deploy',str(P/'bc1q21-professional-deploy'))
spec=importlib.util.spec_from_loader(loader.name,loader);d=importlib.util.module_from_spec(spec);loader.exec_module(d)
def gitid(kind,data):return hashlib.sha1(kind.encode()+b' '+str(len(data)).encode()+b'\0'+data).hexdigest()
class DeploymentRegressions(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory(prefix='professional-synthetic-regression-');self.root=pathlib.Path(self.tmp.name);self.uid=os.getuid()
  self.releases=self.root/'releases';self.releases.mkdir();self.state=self.root/'.deployment';self.state.mkdir();self.config=self.root/'config';self.config.mkdir()
  self.old=self.releases/'legacy/site/Professional';self.old.mkdir(parents=True);(self.old/'creator.html').write_bytes(b'original synthetic site')
  (self.root/'current').symlink_to(self.old)
  self.payload=b'<html>synthetic approved release</html>';self.blob=gitid('blob',self.payload)
  leaf=b'100644 creator.html\0'+bytes.fromhex(self.blob);leafid=gitid('tree',leaf)
  tree=b'40000 Professional\0'+bytes.fromhex(leafid);self.tree=gitid('tree',tree)
  commit=('tree '+self.tree+'\nauthor Synthetic <test@example.invalid> 1 +0000\ncommitter Synthetic <test@example.invalid> 1 +0000\n\nSynthetic test only\n').encode();self.commit=gitid('commit',commit)
  self.objects={self.blob:self.payload,leafid:leaf,self.tree:tree,self.commit:commit}
  self.release=self.releases/('git-'+self.commit);self.new=self.release/'site/Professional'
  policy={'schema':2,'repository':'bc1q21/bc1q21-professional','max_bytes':1048576,'entries':[{'path':'Professional/creator.html','destinations':['site/Professional/creator.html'],'git_mode':'100644','role':'runtime'}]}
  (self.config/'professional-static-allowlist.json').write_text(json.dumps(policy));self.health_calls=[]
 def tearDown(self):
  for base,dirs,files in os.walk(self.root):os.chmod(base,0o700)
  self.tmp.cleanup()
 def fixture_trusted(self,p,directory=False):
  # Root ownership/ancestor policy intentionally mocked for UID1000 temp fixture.
  p=pathlib.Path(p);self.assertFalse(p.is_symlink())
  self.assertTrue(p.is_dir() if directory else p.is_file())
  if p.is_file():self.assertEqual(p.stat().st_nlink,1)
  return p
 def git(self,*args,**kwargs):
  if args[0]=='fetch' or args[0]=='merge-base':return b''
  if args[0]=='rev-parse':return self.commit.encode()+b'\n'
  if args[0]=='cat-file':return self.objects[args[2]]
  self.fail('Unexpected Git operation')
 def health(self,path,expected):
  self.health_calls.append(path)
  self.assertEqual((self.root/'current').resolve(),path)
  if path==self.new:self.assertEqual((path/'creator.html').read_bytes(),self.payload)
 def run_deploy(self,health=None,syncdir=None,switch=None):
  fds=[];flock=d.fcntl.flock
  def capture(fd,flags):fds.append(fd);return flock(fd,flags)
  old_umask=os.umask(0o027)
  try:
   with contextlib.ExitStack() as stack:
    for name,value in [('ROOT',self.root),('STATE',self.state),('CONFIG',self.config),('trusted',self.fixture_trusted),('git',self.git),('public_api',lambda path:{'commit':{'sha':self.commit}}),('health',health or self.health)]:stack.enter_context(patch.object(d,name,value))
    stack.enter_context(patch.object(d.os,'geteuid',return_value=0));stack.enter_context(patch.object(d.fcntl,'flock',side_effect=capture));stack.enter_context(contextlib.redirect_stdout(io.StringIO()));stack.enter_context(contextlib.redirect_stderr(io.StringIO()))
    if syncdir:stack.enter_context(patch.object(d,'syncdir',side_effect=syncdir))
    if switch:stack.enter_context(patch.object(d,'switch',side_effect=switch))
    return d.main(self.commit)
  finally:
   os.umask(old_umask)
   # CLI process exit closes its lock. Tests model separate invocations here.
   for fd in fds:os.close(fd)
 def fail_first_candidate(self,path,expected):
  self.health(path,expected)
  if path==self.new:raise RuntimeError('synthetic temporary HTTP failure')
 def prepare_failed_release(self):
  with self.assertRaisesRegex(RuntimeError,'synthetic temporary HTTP failure'):self.run_deploy(health=self.fail_first_candidate)
  self.assertEqual((self.root/'current').resolve(),self.old);self.assertFalse((self.state/'pending.json').exists())
 def test_public_asset_is_0444_under_production_umask(self):
  self.run_deploy();self.assertEqual(stat.S_IMODE((self.new/'creator.html').stat().st_mode),0o444)
  for directory in [self.release,self.release/'site',self.new]:self.assertEqual(stat.S_IMODE(directory.stat().st_mode),0o555)
 def test_private_records_remain_0600(self):
  self.run_deploy();self.assertEqual(stat.S_IMODE((self.state/(self.commit+'.json')).stat().st_mode),0o600)
 def test_fsync_failure_after_replace_restores_old_pointer(self):
  original=d.syncdir;failed=[]
  def fail_after_switch(path):
   if path==self.root and (self.root/'current').resolve()==self.new and not failed:failed.append(True);raise OSError('synthetic post-replace fsync failure')
   return original(path)
  with self.assertRaisesRegex(OSError,'post-replace'):self.run_deploy(syncdir=fail_after_switch)
  self.assertEqual((self.root/'current').resolve(),self.old);self.assertIn(self.old,self.health_calls);self.assertFalse((self.state/'pending.json').exists())
 def test_pre_replace_failure_also_preserves_old_site(self):
  original=d.switch
  def fail_before(path):
   if path==self.new:raise OSError('synthetic pre-replace failure')
   return original(path)
  with self.assertRaisesRegex(OSError,'pre-replace'):self.run_deploy(switch=fail_before)
  self.assertEqual((self.root/'current').resolve(),self.old);self.assertFalse((self.state/'pending.json').exists())
 def test_restoration_failure_retains_pending_record(self):
  original=d.syncdir
  def always_fail_root(path):
   if path==self.root:raise OSError('synthetic pointer fsync failure')
   return original(path)
  with self.assertRaises(OSError):self.run_deploy(syncdir=always_fail_root)
  self.assertTrue((self.state/'pending.json').exists());self.assertEqual((self.root/'current').resolve(),self.old)
 def test_same_commit_retry_reuses_without_overwrite(self):
  self.prepare_failed_release();asset=self.new/'creator.html';before=asset.stat();manifest=(self.state/(self.commit+'.json')).read_bytes()
  self.run_deploy();after=asset.stat();self.assertEqual((before.st_ino,before.st_mtime_ns),(after.st_ino,after.st_mtime_ns));self.assertEqual((self.state/(self.commit+'.json')).read_bytes(),manifest);self.assertEqual((self.root/'current').resolve(),self.new)
 def test_changed_reusable_release_is_rejected(self):
  self.prepare_failed_release();asset=self.new/'creator.html';asset.chmod(0o644);asset.write_bytes(b'tampered');asset.chmod(0o444)
  with self.assertRaisesRegex(RuntimeError,'content mismatch'):self.run_deploy()
  self.assertEqual((self.root/'current').resolve(),self.old)
 def test_reusable_release_permissions_are_verified(self):
  self.prepare_failed_release();(self.new/'creator.html').chmod(0o440)
  with self.assertRaisesRegex(RuntimeError,'permission mismatch'):self.run_deploy()
  self.assertEqual((self.root/'current').resolve(),self.old)
 def test_reusable_manifest_is_verified(self):
  self.prepare_failed_release();record=self.state/(self.commit+'.json');m=json.loads(record.read_text());m['policy_sha256']='0'*64;record.write_text(json.dumps(m))
  with self.assertRaisesRegex(RuntimeError,'manifest mismatch'):self.run_deploy()
  self.assertEqual((self.root/'current').resolve(),self.old)
 def test_release_symlink_cannot_be_reused(self):
  self.release.symlink_to(self.old)
  with self.assertRaises(AssertionError):self.run_deploy()
  self.assertEqual((self.root/'current').resolve(),self.old)
if __name__=='__main__':unittest.main(verbosity=2)

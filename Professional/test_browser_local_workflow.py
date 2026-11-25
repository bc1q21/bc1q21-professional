"""Current wrapper/RAM and beneficiary security checks; synthetic local HTTP only."""
import functools,http.server,os,pathlib,threading,unittest
from playwright.sync_api import sync_playwright
from planner_browser_test_helpers import prepare_plan,review_schedule
ROOT=pathlib.Path(__file__).resolve().parent
class BrowserLocalWorkflowTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(ROOT)))
  cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.thread.start();cls.base=f'http://127.0.0.1:{cls.server.server_port}'
  cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch(executable_path=os.environ.get('BC1Q21_TEST_CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
 @classmethod
 def tearDownClass(cls):
  cls.browser.close();cls.pw.stop();cls.server.shutdown();cls.server.server_close();cls.thread.join()
 def setUp(self):
  self.context=self.browser.new_context();self.page=self.context.new_page();self.errors=[];self.unexpected=[]
  self.page.on('pageerror',lambda e:self.errors.append(str(e)))
  def local_only(route):
   if route.request.url.startswith((self.base+'/','chrome://','chrome-extension://')):route.continue_()
   else:self.unexpected.append(route.request.url);route.abort()
  self.page.route('**/*',local_only)
 def tearDown(self):
  self.context.close();self.assertEqual(self.errors,[]);self.assertEqual(self.unexpected,[])
 def planner(self):
  self.page.goto(self.base+'/creator.html');self.page.locator('#creator-screen').evaluate("f=>f.src='./retail-mirror/index.html'")
  frame=self.page.locator('#creator-screen').element_handle().content_frame();frame.wait_for_url('**/retail-mirror/index.html');frame.locator('#disclaimer-acceptance:not([disabled])').wait_for();return frame
 def assert_no_web_storage(self):
  self.assertEqual(self.page.evaluate('localStorage.length+sessionStorage.length'),0)
  self.assertEqual(self.context.cookies(),[])
 def test_exact_plan_and_ram_only_approval_reset_on_wrapper_reload(self):
  f=self.planner();self.assertFalse(f.locator('#disclaimer-acceptance').is_checked());f.locator('#disclaimer-acceptance').check()
  self.assertTrue(prepare_plan(f));review_schedule(f)
  self.assertEqual(f.locator('#schedule-rows tr td:nth-child(4)').all_text_contents(),['20,001','20,001','20,000','20,000','20,000'])
  self.assertTrue(f.locator('#approve').is_disabled());f.locator('#schedule-next').click();f.locator('#approve').click();f.wait_for_url('**/funding-workspace.html')
  plan=self.page.evaluate("JSON.parse(window.bc1q21CreatorSession.values.get('bc1q21-professional-approved-plan-preview'))")
  self.assertEqual(plan['totalSats'],100002)
  for k in ['signingAuthorized','fundingAuthorized','broadcastAuthorized']:self.assertFalse(plan[k])
  self.assert_no_web_storage();self.page.reload();self.assertEqual(self.page.evaluate('window.bc1q21CreatorSession.values.size'),0);self.assert_no_web_storage()
 def test_changed_transaction_and_back_revoke_approval(self):
  f=self.planner();f.locator('#disclaimer-acceptance').check();self.assertTrue(prepare_plan(f));review_schedule(f);f.locator('#schedule-next').click()
  f.locator('#start').evaluate("e=>e.value='2030-01-03'");f.locator('#approve').click()
  self.assertIn('Cannot approve',f.locator('#status').inner_text());self.assertTrue(f.locator('#approve').is_disabled())
  self.assertIsNone(self.page.evaluate("window.bc1q21CreatorSession.values.get('bc1q21-professional-approved-plan-preview')||null"));self.assert_no_web_storage()
 def test_beneficiary_starts_unauthorized_and_legacy_import_cannot_authorize(self):
  self.page.goto(self.base+'/recipient-gift-specific-prototype.html');self.page.locator('#beneficiary-local').wait_for()
  for name in ['authorize','scan-return','signed-file','save','submit','refresh']:self.assertTrue(self.page.locator('#beneficiary-'+name).is_disabled())
  self.assertTrue(self.page.locator('#verifiedHandoffSection').is_hidden());self.page.locator('#beneficiary-discover').click()
  self.assertTrue(self.page.locator('#beneficiary-submit').is_disabled());self.assertEqual(self.page.locator('#giftScheduleRows tr').count(),0)
  self.page.locator('#beneficiary-account-stop').click();self.page.locator('#beneficiary-stop-return').click()
  self.assertIn('No wallet connected',self.page.locator('#beneficiary-account-status').inner_text());self.assert_no_web_storage()
if __name__=='__main__':unittest.main()

"""Planner acceptance on loopback using installed Chromium; no wallet or RPC.
Run: python -B Professional/test_public_date_planner_browser.py
Override browser with BC1Q21_TEST_CHROMIUM=/path/to/chromium if necessary.
"""
import http.server
import json
import os
import pathlib
import threading
import unittest
from playwright.sync_api import sync_playwright
from planner_browser_test_helpers import prepare_plan, review_schedule

ROOT = pathlib.Path(__file__).resolve().parent
PLAN = 'bc1q21-professional-approved-plan-preview'
DRAFT = 'bc1q21-professional-public-planner-draft-v1'
SAVED = 'bc1q21-professional-last-approved-plan-preview'

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def log_message(self, *_):
        pass

class PublicPlannerBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), QuietHandler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base = f'http://127.0.0.1:{cls.server.server_port}'
        cls.playwright = sync_playwright().start()
        try:
            cls.browser = cls.playwright.chromium.launch(
                executable_path=os.environ.get('BC1Q21_TEST_CHROMIUM', '/usr/bin/chromium'),
                headless=True, args=['--no-sandbox'])
        except Exception:
            cls.playwright.stop()
            cls.server.shutdown()
            cls.server.server_close()
            raise

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=3)

    def setUp(self):
        self.context = self.browser.new_context()
        self.page = self.context.new_page()
        self.errors, self.failed, self.external = [], [], []
        self.page.on('pageerror', lambda error: self.errors.append(str(error)))
        self.page.on('response', lambda response: self.failed.append(response.url)
                     if response.status >= 400 else None)
        self.page.on('requestfailed', lambda request: self.failed.append(request.url))
        def route(request_route):
            if request_route.request.url.startswith(self.base + '/'):
                request_route.continue_()
            else:
                self.external.append(request_route.request.url)
                request_route.abort()
        self.page.route('**/*', route)
        self.page.goto(self.base + '/retail-mirror/index.html')
        self.page.wait_for_function("document.querySelector('#approve').disabled")

    def tearDown(self):
        self.context.close()

    def equal_plan(self, *, btc='0.00100002', count='5', date='2027-11-03', period='yearly', manual=None, one=False):
        if prepare_plan(self.page, btc=btc, count=count, date=date, period=period, manual=manual, one=one):
            review_schedule(self.page)

    def test_real_review_approval_and_add_funds_preserve_exact_schedule(self):
        self.equal_plan()
        rows = self.page.locator('#schedule-rows tr')
        self.assertEqual(rows.count(), 5)
        for i in range(5):
            self.assertEqual(rows.nth(i).locator('td').nth(1).inner_text(), f'{2027+i}-11-03')
            self.assertEqual(rows.nth(i).locator('td').nth(3).inner_text(), '20,001' if i < 2 else '20,000')
        self.assertIn('103,752', self.page.locator('#deposit-total').inner_text())
        self.assertEqual(self.errors + self.failed + self.external, [])
        self.assertTrue(self.page.locator('input[name=strategy][value=suggest]').is_enabled())
        self.page.locator('#schedule-next').click()
        self.page.locator('#approve').click()
        self.page.wait_for_url('**/funding-workspace.html')
        self.page.wait_for_function("document.querySelectorAll('#releases tr').length === 5")
        self.assertEqual(self.page.locator('#releases tr').count(), 5)
        plan = self.page.evaluate('(key) => JSON.parse(sessionStorage.getItem(key))', PLAN)
        self.assertEqual(plan['totalSats'], 100002)
        self.assertEqual(sum(r['amountSats'] for r in plan['releases']), 100002)
        for key in ('signingAuthorized', 'fundingAuthorized', 'broadcastAuthorized'):
            self.assertIs(plan[key], False)
        self.assertTrue(self.page.locator('#construct-unsigned').is_disabled())
        self.assertTrue(self.page.locator('#handoff-jade').is_disabled())
        self.assertEqual(self.errors + self.failed + self.external, [])

    def test_manual_preserves_handover_amounts_and_rejects_mismatch(self):
        amounts = ['0.00025944', '0.00022553', '0.00019613', '0.00017057', '0.00014833']
        self.equal_plan(btc='0.00100000', manual='\n'.join(f'{2027+i}-11-03, {amount}' for i, amount in enumerate(amounts)))
        self.assertTrue(self.page.locator('#schedule-review').is_visible())
        self.assertIn('100,000', self.page.locator('#schedule-total').inner_text())
        self.equal_plan(btc='0.00100000', manual='2027-11-03, 0.00025944')
        self.assertTrue(self.page.locator('#schedule-review').is_hidden())
        self.assertIn('exactly match', self.page.locator('#status').inner_text())
        self.assertEqual(self.errors + self.failed + self.external, [])

    def test_month_end_rollover_and_single_release(self):
        self.equal_plan(count='3', date='2031-01-31', period='monthly')
        dates = self.page.locator('#schedule-rows tr td:nth-child(2)').all_text_contents()
        self.assertEqual(dates, ['2031-01-31', '2031-03-03', '2031-04-03'])
        self.equal_plan(one=True, date='2031-01-31')
        self.assertEqual(self.page.locator('#schedule-rows tr').count(), 1)
        self.assertIn('100,002', self.page.locator('#schedule-total').inner_text())
        self.assertEqual(self.errors + self.failed + self.external, [])

    def test_edit_and_back_navigation_revoke_all_downstream_previews(self):
        self.equal_plan()
        self.page.locator('#schedule-next').click()
        self.page.locator('#approve').click()
        self.page.wait_for_url('**/funding-workspace.html')
        self.page.evaluate("""() => {
            sessionStorage.setItem('bc1q21-professional-diagnostic-jade-handoff', '{}');
            sessionStorage.setItem('bc1q21-professional-regtest-unsigned-preview', '{}');
            sessionStorage.setItem('bc1q21-professional-verified-creator-preview', '{}');
        }""")
        self.page.go_back()
        self.page.wait_for_url('**/retail-mirror/index.html')
        self.page.wait_for_function('(key) => sessionStorage.getItem(key) === null', arg=PLAN)
        self.page.locator('#btc').fill('0.00200000')
        for key in [PLAN, 'bc1q21-professional-diagnostic-jade-handoff',
                    'bc1q21-professional-regtest-unsigned-preview',
                    'bc1q21-professional-verified-creator-preview']:
            self.assertIsNone(self.page.evaluate('(key) => sessionStorage.getItem(key)', key))
        self.assertIsNone(self.page.evaluate('(key) => localStorage.getItem(key)', SAVED))
        self.assertIsNotNone(self.page.evaluate('(key) => sessionStorage.getItem(key)', DRAFT))
        self.assertTrue(self.page.locator('#schedule-review').is_hidden())
        self.equal_plan(btc='0.00200000')
        self.assertIn('200,000', self.page.locator('#schedule-total').inner_text())

    def test_invalid_satoshis_and_programmatic_stale_review_cannot_approve(self):
        self.equal_plan(btc='0.000000001')
        self.assertTrue(self.page.locator('#schedule-review').is_hidden())
        self.assertIsNone(self.page.evaluate('(key) => sessionStorage.getItem(key)', PLAN))
        self.equal_plan()
        self.page.locator('#schedule-next').click()
        self.page.locator('#btc').evaluate("el => el.value = '0.00200000'")
        self.page.locator('#approve').click()
        self.assertIn('Plan changed', self.page.locator('#status').inner_text())
        self.assertIsNone(self.page.evaluate('(key) => sessionStorage.getItem(key)', PLAN))
        self.assertTrue(self.page.locator('#approve').is_disabled())
        self.assertEqual(self.errors + self.failed + self.external, [])

    def test_mobile_review_and_storage_failure_remain_safe(self):
        self.page.set_viewport_size({'width': 390, 'height': 844})
        self.equal_plan()
        self.page.locator('#schedule-next').click()
        self.assertTrue(self.page.locator('#approve').is_visible())
        self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'), 390)
        self.page.evaluate("() => {Storage.prototype.removeItem = () => {throw Error('blocked storage')}}")
        self.equal_plan(btc='0.00200000')
        self.assertTrue(self.page.locator('#approve').is_disabled())
        self.assertTrue(self.page.locator('#storage-warning').is_visible())
        self.assertEqual(self.errors + self.failed + self.external, [])

if __name__ == '__main__':
    unittest.main()

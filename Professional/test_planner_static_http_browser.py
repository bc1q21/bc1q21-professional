"""Static-preview regression: real python -m http.server, no request interception.
Linux can emulate a bad Windows .mjs MIME mapping without claiming Windows testing.
"""
import contextlib
import http.client
import os
import pathlib
import socket
import subprocess
import sys
import time
import unittest
from playwright.sync_api import sync_playwright
from planner_browser_test_helpers import prepare_plan, review_schedule

ROOT = pathlib.Path(__file__).resolve().parent

@contextlib.contextmanager
def static_preview(*, bad_mjs_mime=False):
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        port = sock.getsockname()[1]
    if bad_mjs_mime:
        command = [sys.executable, '-B', '-c',
                   "import mimetypes,runpy; mimetypes.add_type('text/plain','.mjs'); "
                   "runpy.run_module('http.server',run_name='__main__')"]
    else:
        command = [sys.executable, '-B', '-m', 'http.server']
    process = subprocess.Popen(command + [str(port), '--bind', '127.0.0.1'], cwd=ROOT,
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(100):
            if process.poll() is not None:
                raise RuntimeError('Static preview server stopped')
            try:
                connection = http.client.HTTPConnection('127.0.0.1', port, timeout=1)
                connection.request('GET', '/retail-mirror/index.html')
                response = connection.getresponse()
                response.read()
                connection.close()
                break
            except OSError:
                time.sleep(0.05)
        else:
            raise RuntimeError('Static preview server did not start')
        yield f'http://127.0.0.1:{port}'
    finally:
        process.terminate()
        process.wait(timeout=5)

class StaticHttpPlannerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(
            executable_path=os.environ.get('BC1Q21_TEST_CHROMIUM', '/usr/bin/chromium'),
            headless=True, args=['--no-sandbox'])

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def test_review_survives_delayed_duplicate_change_without_native_submission(self):
        with static_preview() as base, self.browser.new_context() as context:
            page = context.new_page()
            errors, scripts = [], []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.on('response', lambda response: scripts.append(
                (response.url, response.status, response.headers.get('content-type', '')))
                if response.request.resource_type == 'script' else None)
            page.goto(base + '/retail-mirror/index.html')
            page.evaluate("""() => {
                document.documentElement.dataset.submissions = '0';
                document.getElementById('planner').addEventListener('submit', () => {
                    document.documentElement.dataset.submissions = String(
                        Number(document.documentElement.dataset.submissions) + 1);
                });
                document.addEventListener('securitypolicyviolation', e => {
                    document.documentElement.dataset.cspViolation = e.violatedDirective;
                });
            }""")
            self.assertTrue(prepare_plan(page))
            review_schedule(page, no_wait_after=True)
            self.assertTrue(page.locator('#schedule-review').is_visible())
            # Browser controls may commit a duplicate change after an input/click.
            # Unchanged values must not erase the just-rendered review.
            page.locator('#start').dispatch_event('change')
            self.assertTrue(page.locator('#schedule-review').is_visible(),
                            'An unchanged, delayed date change erased the review')
            self.assertIn('Review your public dates', page.locator('#status').inner_text())
            self.assertEqual(page.locator('html').get_attribute('data-submissions'), '0')
            self.assertEqual(page.locator('#schedule-rows tr td:nth-child(2)').all_text_contents(),
                             [f'{year}-01-02' for year in range(2030, 2035)])
            self.assertEqual(page.locator('#schedule-rows tr td:nth-child(4)').all_text_contents(),
                             ['20,001', '20,001', '20,000', '20,000', '20,000'])
            self.assertIn('100,002', page.locator('#schedule-total').inner_text())
            self.assertIn('103,752', page.locator('#deposit-total').inner_text())
            self.assertIsNone(page.locator('html').get_attribute('data-csp-violation'))
            self.assertEqual(errors, [])
            self.assertTrue(scripts)
            for url, status, mime in scripts:
                self.assertEqual(status, 200, url)
                self.assertIn(mime.split(';')[0], ('text/javascript', 'application/javascript'), url)
            # A native control may expose its new value before committing its
            # change event. Review must snapshot what was actually displayed.
            self.assertTrue(prepare_plan(page))
            page.locator('#start').evaluate("el => el.value = '2030-01-03'")
            review_schedule(page)
            page.locator('#start').dispatch_event('change')
            self.assertTrue(page.locator('#schedule-review').is_visible())
            self.assertEqual(page.locator('#schedule-rows tr td:nth-child(2)').first.inner_text(),
                             '2030-01-03')
            # Actual edits still invalidate. Enter on the final one-time
            # date screen reviews through the same local action.
            self.assertTrue(prepare_plan(page, one=True, date='2030-01-04'))
            self.assertTrue(page.locator('#schedule-review').is_hidden())
            self.assertTrue(page.locator('#approve').is_disabled())
            page.locator('#start').press('Enter')
            self.assertTrue(page.locator('#schedule-review').is_visible())
            self.assertEqual(page.locator('html').get_attribute('data-submissions'), '0')
            page.locator('#schedule-next').click()
            page.locator('#approve').click()
            page.wait_for_url('**/funding-workspace.html')
            page.wait_for_function("document.querySelectorAll('#releases tr').length === 1")
            plan = page.evaluate("JSON.parse(sessionStorage.getItem('bc1q21-professional-approved-plan-preview'))")
            self.assertEqual(plan['totalSats'], 100002)
            self.assertEqual(plan['releases'][0]['date'], '2030-01-04')
            for flag in ('signingAuthorized', 'fundingAuthorized', 'broadcastAuthorized'):
                self.assertFalse(plan[flag])

    def test_wrong_module_mime_has_visible_locked_startup_feedback(self):
        with static_preview(bad_mjs_mime=True) as base, self.browser.new_context() as context:
            page = context.new_page()
            page.goto(base + '/retail-mirror/index.html')
            self.assertTrue(page.locator('#review').is_disabled())
            self.assertTrue(page.locator('#approve').is_disabled())
            self.assertTrue(page.locator('#planner-startup').is_visible())
            self.assertIn('Review is locked', page.locator('#planner-startup').inner_text())
            self.assertTrue(page.locator('#schedule-review').is_hidden())

    def test_validation_error_is_visible_next_to_review_control(self):
        with static_preview() as base, self.browser.new_context() as context:
            page = context.new_page()
            page.set_viewport_size({'width': 390, 'height': 650})
            page.goto(base + '/retail-mirror/index.html')
            self.assertFalse(prepare_plan(page, btc='0.000000001'))
            self.assertIn('eight decimal places', page.locator('#status').inner_text())
            box = page.locator('#status').bounding_box()
            self.assertIsNotNone(box)
            self.assertGreaterEqual(box['y'], 0)
            self.assertLess(box['y'] + box['height'], 650)
            self.assertTrue(page.locator('#approve').is_disabled())

    def test_disabled_javascript_does_not_expose_a_silent_review_button(self):
        with static_preview() as base, self.browser.new_context(java_script_enabled=False) as context:
            page = context.new_page()
            page.goto(base + '/retail-mirror/index.html')
            self.assertTrue(page.locator('#review').is_disabled())
            self.assertTrue(page.locator('#approve').is_disabled())
            self.assertTrue(page.locator('#planner-startup').is_visible())
            self.assertIn('Review is locked', page.locator('#planner-startup').inner_text())
            self.assertTrue(page.locator('#schedule-review').is_hidden())

if __name__ == '__main__':
    unittest.main()

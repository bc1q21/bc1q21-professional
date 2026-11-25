"""Focused disclaimer checks; static loopback only, no Bitcoin services."""
import functools
import http.server
import pathlib
import threading
import unittest
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent

class DisclaimerBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT)))
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base = f'http://127.0.0.1:{cls.server.server_port}'
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])

    @classmethod
    def tearDownClass(cls):
        cls.browser.close(); cls.pw.stop(); cls.server.shutdown(); cls.server.server_close()

    def test_pdf_and_navigation(self):
        with self.browser.new_context() as context:
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.goto(self.base + '/creator.html')
            page.locator('#creator-screen').evaluate("f=>f.src='./retail-mirror/index.html'")
            page = page.frame_locator('#creator-screen')
            box = page.locator('#disclaimer-acceptance')
            box.wait_for()
            page.locator('#disclaimer-acceptance:not([disabled])').wait_for()
            self.assertFalse(box.is_checked())
            self.assertTrue(page.locator('#plan-next').is_disabled())
            self.assertEqual(page.locator('#disclaimer-frame iframe').get_attribute('src'), self.base + '/assets/documents/bc1q21_Professional_Liability_Disclaimer.pdf')
            url = page.locator('#disclaimer-download').get_attribute('href')
            response = context.request.get(url)
            self.assertEqual(response.body(), (ROOT/'assets/documents/bc1q21_Professional_Liability_Disclaimer.pdf').read_bytes())
            # Removing the disabled attribute cannot bypass the navigation guard.
            page.locator('#plan-next').evaluate('(b)=>b.disabled=false')
            page.locator('#plan-next').click()
            self.assertTrue(page.locator('[data-panel=welcome]').is_visible())
            # Form submission and an enabled Review control must also stay locked.
            page.locator('#planner').evaluate("f=>f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))")
            self.assertTrue(page.locator('[data-panel=welcome]').is_visible())
            page.locator('#review').evaluate("b=>{b.disabled=false;b.click()}")
            self.assertTrue(page.locator('[data-panel=welcome]').is_visible())
            box.check()
            self.assertFalse(page.locator('#plan-next').is_disabled())
            box.uncheck()
            self.assertTrue(page.locator('#plan-next').is_disabled())
            box.check()
            with context.pages[0].expect_popup() as opened:
                page.locator('#disclaimer-open').click()
            self.assertEqual(opened.value.url, url)
            opened.value.close()
            with context.pages[0].expect_download() as downloaded:
                page.locator('#disclaimer-download').click()
            self.assertEqual(pathlib.Path(downloaded.value.path()).read_bytes(), response.body())
            page.locator('#plan-next').click()
            self.assertTrue(page.locator('[data-panel=amount]').is_visible())
            context.pages[0].reload()
            context.pages[0].locator('#creator-screen').evaluate("f=>f.src='./retail-mirror/index.html'")
            page.locator('#disclaimer-acceptance:not([disabled])').wait_for()
            self.assertFalse(box.is_checked())
            self.assertTrue(page.locator('[data-panel=welcome]').is_visible())
            self.assertTrue(page.locator('#plan-next').is_disabled())
            self.assertEqual(errors, [])

    def test_missing_pdf_cannot_advance(self):
        with self.browser.new_context() as context:
            page = context.new_page()
            page.route('**/assets/documents/*.pdf', lambda route: route.fulfill(status=404, body='missing'))
            page.goto(self.base + '/creator.html')
            page.locator('#creator-screen').evaluate("f=>f.src='./retail-mirror/index.html'")
            page = page.frame_locator('#creator-screen')
            page.locator('#legal-status:not(:empty)').wait_for()
            self.assertTrue(page.locator('#disclaimer-acceptance').is_disabled())
            page.locator('#plan-next').evaluate('(b)=>b.disabled=false')
            page.locator('#plan-next').click()
            self.assertTrue(page.locator('[data-panel=welcome]').is_visible())

if __name__ == '__main__': unittest.main()

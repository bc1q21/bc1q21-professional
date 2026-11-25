"""Customer review boundaries and the actual private allowlisted ZIP."""
import importlib.util
import json
import pathlib
import tempfile
import unittest
import zipfile
from unittest.mock import patch
from playwright.sync_api import sync_playwright
import os
import test_public_date_planner_browser as planner_tests
import test_planner_static_http_browser as static_tests
from planner_browser_test_helpers import prepare_plan, review_schedule, choose_card

ROOT = pathlib.Path(__file__).resolve().parent
PLAN = planner_tests.PLAN
# Explicit software-only public account; no owner export is embedded.
# Not a customer wallet, not device-attested, and not permission to fund.
PUBLIC_TEST_XPUB = json.loads((ROOT / 'fixtures/public-synthetic-cltv.json').read_text())['account']['xpub']


class FinalReviewTests(unittest.TestCase):
    setUpClass = planner_tests.PublicPlannerBrowserTests.__dict__['setUpClass']
    tearDownClass = planner_tests.PublicPlannerBrowserTests.__dict__['tearDownClass']
    setUp = planner_tests.PublicPlannerBrowserTests.setUp
    tearDown = planner_tests.PublicPlannerBrowserTests.tearDown

    def test_distinct_reviews_revalidate_and_back_never_authorizes(self):
        self.assertTrue(prepare_plan(self.page))
        review_schedule(self.page)
        self.assertTrue(self.page.locator('#schedule-review').is_visible())
        self.assertTrue(self.page.locator('#plan-ready').is_hidden())
        self.assertTrue(self.page.locator('#approve').is_disabled())
        self.assertIsNone(self.page.evaluate('(k) => sessionStorage.getItem(k)', PLAN))
        # Programmatic dispatch cannot skip final review.
        self.page.locator('#approve').dispatch_event('click')
        self.assertIsNone(self.page.evaluate('(k) => sessionStorage.getItem(k)', PLAN))
        self.page.goto(self.base + '/retail-mirror/index.html')
        self.assertTrue(prepare_plan(self.page))
        review_schedule(self.page)
        rows = self.page.locator('#schedule-rows').text_content()
        self.page.locator('#schedule-next').click()
        self.assertTrue(self.page.locator('#schedule-review').is_hidden())
        self.assertTrue(self.page.locator('#plan-ready').is_visible())
        self.assertIn('2,000', self.page.locator('#service-fee').inner_text())
        self.assertIn('1,750', self.page.locator('#mining-fee').inner_text())
        for text in ['each additional release', 'distribution transaction', 'mempool', 'Exact fees']:
            self.assertIn(text, self.page.locator('#plan-ready').inner_text())
        self.page.locator('#ready-back').click()
        self.assertEqual(self.page.locator('#schedule-rows').text_content(), rows)
        self.assertTrue(self.page.locator('#approve').is_disabled())
        self.assertIsNone(self.page.evaluate('(k) => sessionStorage.getItem(k)', PLAN))
        # Changed inputs must be rejected when advancing, even without events.
        self.page.locator('#btc').evaluate("el => el.value = '0.00200000'")
        self.page.locator('#schedule-next').click()
        self.assertTrue(self.page.locator('#plan-ready').is_hidden())
        self.assertIn('Plan changed', self.page.locator('#status').inner_text())

    def test_navigation_buttons_match_at_desktop_and_mobile(self):
        for width in [1440, 390, 320]:
            self.page.set_viewport_size({'width': width, 'height': 900})
            self.page.goto(self.base + '/retail-mirror/index.html')
            self.assertTrue(prepare_plan(self.page))
            review_schedule(self.page)
            for back, forward in [('#edit', '#schedule-next'),
                                  ('#ready-back', '#approve')]:
                b, f = self.page.locator(back), self.page.locator(forward)
                self.assertEqual(b.inner_text(), 'Back')
                self.assertEqual(f.inner_text(), 'Continue')
                for button in [b, f]:
                    self.assertGreaterEqual(button.bounding_box()['height'], 48)
                self.assertEqual(b.bounding_box()['height'], f.bounding_box()['height'])
                self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'), width)
                if forward != '#approve':
                    f.click()
        self.assertEqual(self.errors + self.failed + self.external, [])


class PackagedPreviewTests(unittest.TestCase):
    def test_allowlisted_zip_loads_and_displays_only_public_regtest_qr(self):
        spec = importlib.util.spec_from_file_location('preview_packager', ROOT / 'package-local-preview.py')
        packager = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(packager)
        with tempfile.TemporaryDirectory(prefix='professional-package-') as temp:
            zip_path = packager.package_preview(pathlib.Path(temp) / 'preview.zip')
            with zipfile.ZipFile(zip_path) as archive:
                self.assertEqual(set(archive.namelist()),
                                 {'Professional/' + n for n in packager.FILES} |
                                 {'Start-Professional-Preview.cmd', 'README.txt'} |
                                 set(packager.LEGAL_FILES) |
                                 {'Professional/third-party-notices/' + p.name for p in (ROOT / 'third-party-notices').glob('*') if p.is_file()})
                archive.extractall(pathlib.Path(temp) / 'extracted')
            root = pathlib.Path(temp) / 'extracted/Professional'
            with patch.object(static_tests, 'ROOT', root), static_tests.static_preview() as base:
                with sync_playwright() as p:
                    browser = p.chromium.launch(executable_path=os.environ.get(
                        'BC1Q21_TEST_CHROMIUM', '/usr/bin/chromium'), args=['--no-sandbox'])
                    try:
                        page = browser.new_page()
                        errors, missing, external = [], [], []
                        page.on('pageerror', lambda e: errors.append(str(e)))
                        page.on('response', lambda r: missing.append(r.url) if r.status >= 400 else None)
                        def route(r):
                            if r.request.url.startswith(base + '/'):
                                r.continue_()
                            else:
                                external.append(r.request.url)
                                r.abort()
                        page.route('**/*', route)
                        page.goto(base + '/index.html')
                        page.locator('#continue').click()
                        self.assertEqual(page.locator('.section-bar').evaluate(
                            'el => getComputedStyle(el).backgroundColor'), 'rgb(55, 91, 110)')
                        self.assertTrue(prepare_plan(page))
                        # Exercise the new adapter from the actual extracted ZIP,
                        # not just from the development server's source tree.
                        page.locator('#choose-variable').click()
                        page.locator('#plan-next').click()
                        choose_card(page, 'suggest')
                        page.locator('#plan-next').click()
                        page.locator('#growth').fill('10')
                        review_schedule(page)
                        self.assertEqual(page.locator('#schedule-rows tr td:nth-child(4)').all_text_contents(),
                                         ['23,981', '21,803', '19,822', '18,016', '16,380'])
                        self.assertTrue(prepare_plan(page))
                        review_schedule(page)
                        page.locator('#schedule-next').click()
                        page.locator('#approve').click()
                        page.wait_for_url('**/funding-workspace.html')
                        page.locator('#professional-wallet-setup > details > summary').first.click()
                        page.locator('#funding-xpub').fill(PUBLIC_TEST_XPUB)
                        page.locator('#derive-funding-key').click()
                        page.locator('#customer-address-qr').wait_for(state='visible')
                        address = page.locator('#funding-test-address').inner_text()
                        self.assertTrue(address.startswith('bcrt1q'))
                        page.add_script_tag(path=str(ROOT / 'browser-integration/node_modules/jsqr/dist/jsQR.js'))
                        decoded = page.evaluate('''() => {
                            const c=document.querySelector('#customer-address-qr');
                            const d=c.getContext('2d').getImageData(0,0,c.width,c.height);
                            return jsQR(d.data,d.width,d.height)?.data;
                        }''')
                        self.assertEqual(decoded, address)
                        self.assertIn(address, page.locator('#customer-payment-address').inner_text())
                        derived = page.evaluate('(xpub) => bc1q21ProfessionalPreviewFundingPublicKey({accountXpub:xpub})', PUBLIC_TEST_XPUB)
                        self.assertFalse(derived['accountXpubOriginAuthenticated'])
                        for flag in ['paymentAuthorized', 'canSign', 'canBroadcast']:
                            self.assertFalse(derived[flag])
                        rejected = page.evaluate('''async () => {
                            try {
                                await bc1q21ProfessionalRenderFundingAddressQr({
                                    address:'bc1qinvalid', canvas:document.createElement('canvas')});
                                return false;
                            } catch { return true; }
                        }''')
                        self.assertTrue(rejected)
                        plan = page.evaluate('(k) => JSON.parse(sessionStorage.getItem(k))', PLAN)
                        for key in ['fundingAuthorized', 'signingAuthorized', 'broadcastAuthorized']:
                            self.assertFalse(plan[key])
                        self.assertTrue(page.locator('#construct-unsigned').is_disabled())
                        self.assertTrue(page.locator('#handoff-jade').is_disabled())
                        # Changed public wallet revokes the visible QR immediately.
                        page.locator('#funding-xpub').fill('invalid')
                        self.assertTrue(page.locator('#customer-address-qr').is_hidden())
                        self.assertTrue(page.locator('#copy-test-funding-address').is_disabled())
                        page.locator('#derive-funding-key').click()
                        self.assertTrue(page.locator('#customer-address-qr').is_hidden())
                        for name in ['jade-signing-workspace.html', 'finish-workspace.html']:
                            page.goto(base + '/' + name)
                            if name.startswith('jade'):
                                self.assertTrue(page.locator('#scan').is_disabled())
                            else:
                                summary = page.locator('#summary').inner_text()
                                self.assertIn('No authoritative verified signing receipt is available', summary)
                                self.assertIn('No completed gift, broadcast or confirmation is established', summary)
                                self.assertTrue(page.locator('#verified-transaction').is_hidden())
                        self.assertEqual(errors + missing + external, [])
                    finally:
                        browser.close()


if __name__ == '__main__':
    unittest.main()

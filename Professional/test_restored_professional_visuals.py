"""Real browser coverage for recovered presentation and unchanged public workflow."""
import os
import pathlib
import struct
import unittest
import zlib
from planner_browser_test_helpers import prepare_plan, review_schedule, choose_card
import test_public_date_planner_browser as planner_tests

def make_test_logo():
    """Disposable raster fixture; no external image or repository fixture needed."""
    def chunk(kind, data):
        return struct.pack('!I', len(data)) + kind + data + struct.pack('!I', zlib.crc32(kind + data))
    return (b'\x89PNG\r\n\x1a\n' +
            chunk(b'IHDR', struct.pack('!IIBBBBB', 180, 100, 8, 2, 0, 0, 0)) +
            chunk(b'IDAT', zlib.compress((b'\x00' + b'\x35\x5b\x6e' * 180) * 100)) +
            chunk(b'IEND', b''))

class RestoredProfessionalVisualTests(unittest.TestCase):
    # Share server/browser lifecycle without inheriting/re-running planner tests.
    setUpClass = planner_tests.PublicPlannerBrowserTests.__dict__['setUpClass']
    tearDownClass = planner_tests.PublicPlannerBrowserTests.__dict__['tearDownClass']
    def setUp(self):
        planner_tests.PublicPlannerBrowserTests.setUp(self)
        self.superseded_default_logos = []
        self.page.on('requestfailed', lambda request: self.superseded_default_logos.append(request.url)
                     if request.failure == 'net::ERR_ABORTED' and
                     request.url == self.base + '/assets/original/bc1q21-logo.png' else None)
    tearDown = planner_tests.PublicPlannerBrowserTests.tearDown

    def identity(self, *, branded=True, logo=True):
        self.page.goto(self.base + '/index.html')
        self.assertEqual(self.page.locator('header img').get_attribute('src'), './assets/original/bc1q21-logo.png')
        if branded:
            for key, value in {'business': 'Example Advisory Practice', 'contact': 'Example Advisor',
                               'address': '123 Example Street', 'email': 'advisor@example.invalid',
                               'phone': '555-0100'}.items():
                self.page.locator('#' + key).fill(value)
            if logo:
                self.page.locator('#logo').set_input_files({
                    'name': 'test-logo.png', 'mimeType': 'image/png', 'buffer': make_test_logo()})
                self.page.locator('#logoPreview').wait_for(state='visible')
        self.page.locator('#continue').click()
        self.page.wait_for_url('**/retail-mirror/index.html')
        self.page.locator('#plan-next').wait_for(state='visible')

    def check_no_errors(self):
        failures = list(self.failed)
        for url in self.superseded_default_logos:
            # Inline white-label branding can cancel the default PNG request
            # while replacing it with the advisor's loaded data image. This
            # is not a missing resource: HTTP errors/other failures still fail.
            if url in failures:
                logo = self.page.locator('header img').first
                self.assertTrue(logo.is_hidden() or (
                    logo.get_attribute('src').startswith('data:image/') and
                    logo.evaluate('el => el.complete && el.naturalWidth > 0')))
                failures.remove(url)
        self.assertEqual(self.errors + failures + self.external, [])

    def screenshot(self, name):
        folder = os.environ.get('BC1Q21_VISUAL_OUTPUT')
        if folder:
            path = pathlib.Path(folder)
            path.mkdir(parents=True, exist_ok=True)
            self.page.screenshot(path=str(path / name), full_page=True, animations='disabled')

    def test_full_advisor_identity_and_logo_reach_planner_and_add_funds(self):
        self.identity()
        details = self.page.locator('#professional-advisor-details')
        for text in ['Example Advisory Practice', 'Example Advisor', '123 Example Street',
                     'advisor@example.invalid', '555-0100']:
            self.assertIn(text, details.inner_text())
        self.assertEqual(self.page.locator('#professional-wizard-brand-logo').get_attribute('alt'),
                         'Example Advisory Practice logo')
        self.assertTrue(self.page.locator('#professional-wizard-brand-logo').get_attribute('src').startswith('data:image/png'))
        self.assertIn('Powered by bc1q21', self.page.locator('.professional-footer').inner_text())
        self.assertTrue(prepare_plan(self.page))
        review_schedule(self.page)
        self.screenshot('desktop-advisor-review.png')
        self.page.locator('#schedule-next').click()
        self.page.locator('#approve').click()
        self.page.wait_for_url('**/funding-workspace.html')
        self.page.wait_for_function("document.querySelector('#customer-payment-amount').textContent.includes('103,752')")
        for text in ['Example Advisory Practice', 'Example Advisor', '123 Example Street',
                     'advisor@example.invalid', '555-0100']:
            self.assertIn(text, self.page.locator('.advisor-details').inner_text())
        self.assertTrue(self.page.locator('#handoff-jade').is_disabled())
        self.assertTrue(self.page.locator('#construct-unsigned').is_disabled())
        self.screenshot('desktop-advisor-add-funds.png')
        for name in ['jade-signing-workspace.html', 'finish-workspace.html']:
            self.page.goto(self.base + '/' + name)
            header = self.page.locator('#professional-brand-header')
            for text in ['Example Advisory Practice', 'Example Advisor', '123 Example Street',
                         'advisor@example.invalid', '555-0100']:
                self.assertIn(text, header.inner_text())
            self.assertEqual(header.locator('img').get_attribute('alt'), 'Example Advisory Practice logo')
            if name.startswith('jade'):
                self.assertTrue(self.page.locator('#scan').is_disabled())
            else:
                self.assertIn('No Bitcoin has been broadcast', self.page.locator('#summary').inner_text())
        self.check_no_errors()

    def test_business_without_logo_does_not_keep_platform_logo_prominent(self):
        self.identity(logo=False)
        self.assertTrue(self.page.locator('#professional-wizard-brand-logo').is_hidden())
        self.assertIn('Example Advisory Practice', self.page.locator('#professional-advisor-details').inner_text())
        self.assertIn('555-0100', self.page.locator('#professional-advisor-details').inner_text())
        self.check_no_errors()

    def test_blank_identity_uses_recovered_original_logo_and_light_theme(self):
        self.identity(branded=False)
        self.assertEqual(self.page.locator('html').get_attribute('data-theme'), 'light')
        self.assertTrue(self.page.locator('#professional-advisor-details').is_hidden())
        self.assertTrue(self.page.locator('#professional-wizard-brand-logo').is_visible())
        self.assertEqual(self.page.locator('#professional-wizard-brand-logo').evaluate('el => el.naturalWidth'), 375)
        self.assertEqual(self.page.locator('.section-bar').evaluate('el => getComputedStyle(el).backgroundColor'),
                         'rgb(55, 91, 110)')
        self.assertEqual(self.page.locator('nav .step').count(), 4)
        self.assertTrue(self.page.locator('[data-panel=welcome]').is_visible())
        self.screenshot('desktop-original-welcome.png')
        self.check_no_errors()

    def test_desktop_tablet_and_phone_layouts_have_no_page_overflow(self):
        for width, height in [(1440, 1000), (768, 1024), (390, 844), (320, 800)]:
            with self.subTest(viewport=width):
                self.page.set_viewport_size({'width': width, 'height': height})
                self.page.goto(self.base + '/retail-mirror/index.html')
                self.assertTrue(prepare_plan(self.page))
                self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'), width)
                self.assertTrue(self.page.locator('#choose-equal').is_visible())
                self.assertTrue(self.page.locator('[data-panel=amount]').is_hidden())
                self.assertTrue(self.page.locator('[data-panel=schedule]').is_hidden())
                review_schedule(self.page)
                self.assertTrue(self.page.locator('#schedule-review').is_visible())
                self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'), width)
                self.assertIn('103,752', self.page.locator('#deposit-total').inner_text())
                self.screenshot(f'schedule-{width}.png')
                self.page.locator('#schedule-next').click()
                self.assertTrue(self.page.locator('#plan-ready').is_visible())
                self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'), width)
                self.screenshot(f'review-{width}.png')
                self.page.locator('#ready-back').click()
                self.page.locator('#edit').click()
                self.assertTrue(self.page.locator('[data-panel=allocation]').is_visible())
                self.assertTrue(self.page.locator('#schedule-review').is_hidden())
        self.check_no_errors()

    def test_mobile_advisor_header_and_option_cards_preserve_full_identity(self):
        self.page.set_viewport_size({'width': 390, 'height': 844})
        self.identity()
        self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'), 390)
        self.assertIn('advisor@example.invalid', self.page.locator('#professional-advisor-details').inner_text())
        self.screenshot('mobile-advisor-welcome.png')
        self.assertTrue(prepare_plan(self.page))
        self.assertEqual(self.page.locator('#choose-equal').evaluate(
            'el => getComputedStyle(el).backgroundColor'), 'rgb(255, 255, 255)')
        self.assertTrue(self.page.locator('[data-panel=allocation]').is_visible())
        self.screenshot('mobile-advisor-options.png')
        review_schedule(self.page)
        self.assertTrue(self.page.locator('#schedule-review').is_visible())
        self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'), 390)
        self.check_no_errors()

    def test_stage_navigation_keeps_values_and_keyboard_selection(self):
        self.page.locator('#plan-next').click()
        self.page.locator('#btc').fill('0.00100002')
        self.page.locator('#btc').press('Enter')
        self.assertTrue(self.page.locator('[data-panel=type]').is_visible())
        self.page.locator('[data-gift=multiple]').focus()
        self.page.locator('[data-gift=multiple]').press('Space')
        self.page.locator('#plan-next').click()
        self.page.locator('#start').fill('2030-01-02')
        self.page.locator('#plan-back').click()
        self.assertTrue(self.page.locator('[data-panel=type]').is_visible())
        self.page.locator('[data-gift=multiple]').click()
        self.page.locator('#plan-next').click()
        self.assertEqual(self.page.locator('#start').input_value(), '2030-01-02')
        self.page.locator('#plan-next').click()
        self.page.locator('#choose-variable').click()
        self.page.locator('#plan-next').click()
        self.page.locator('input[name=strategy][value=manual]').focus()
        self.page.locator('input[name=strategy][value=manual]').press('Space')
        self.page.locator('#plan-next').click()
        self.assertTrue(self.page.locator('#manual').is_visible())
        self.page.locator('#manual').fill('2030-01-02, 0.00100002')
        self.page.locator('#manual').press('Enter')
        self.assertTrue(self.page.locator('#schedule-review').is_hidden())
        review_schedule(self.page)
        self.assertIn('100,002', self.page.locator('#schedule-total').inner_text())
        self.check_no_errors()

    def test_advisor_fields_are_rendered_as_text_without_markup_execution(self):
        self.page.goto(self.base + '/index.html')
        self.page.locator('#business').fill('<img src=x onerror=alert(1)>')
        self.page.locator('#contact').fill('<script>alert(1)</script>')
        self.page.locator('#continue').click()
        self.page.wait_for_url('**/retail-mirror/index.html')
        self.assertIn('<script>alert(1)</script>', self.page.locator('#professional-advisor-details').inner_text())
        self.assertEqual(self.page.locator('#professional-advisor-details script, #professional-advisor-details img').count(), 0)
        self.check_no_errors()

    def test_browser_rejects_tampered_stylesheet_integrity_without_relaxing_csp(self):
        messages = []
        self.page.on('console', lambda message: messages.append(message.text))
        css = (pathlib.Path(__file__).resolve().parent / 'assets/original/style.css').read_text()
        self.page.route('**/assets/original/style.css', lambda route: route.fulfill(
            status=200, content_type='text/css', body=css + '\n/* tampered test response */'))
        self.page.goto(self.base + '/retail-mirror/index.html')
        self.assertEqual(self.page.locator('html').evaluate(
            "el => getComputedStyle(el).getPropertyValue('--bc1q-blue').trim()"), '')
        self.assertTrue(any('integrity' in message.lower() for message in messages), messages)
        # HTTP succeeds with 200; SRI rejects applying the bytes afterward.
        # The missing CSS variable and integrity error prove browser enforcement.
        self.assertTrue(self.page.locator('#approve').is_disabled())
        self.assertEqual(self.errors + self.external, [])

    def test_logo_rejects_unsupported_type_and_oversize_then_preserves_blank_default(self):
        self.page.goto(self.base + '/index.html')
        for name, mime, buffer in [('test.svg', 'image/svg+xml', b'<svg/>'),
                                   ('large.png', 'image/png', b'0' * 250001)]:
            self.page.locator('#logo').set_input_files({'name': name, 'mimeType': mime, 'buffer': buffer})
            self.assertIn('smaller than 250 KB', self.page.locator('#status').inner_text())
            self.assertTrue(self.page.locator('#logoPreview').is_hidden())
        self.check_no_errors()

if __name__ == '__main__':
    unittest.main()

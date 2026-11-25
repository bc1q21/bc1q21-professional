"""November 11: seven distinct interface checks, plus production gate failures.
Production legal artifacts below are synthetic test fixtures, not approved terms.
"""
import base64
import hashlib
import json
import os
import pathlib
import unittest
import test_public_date_planner_browser as base_tests
from planner_browser_test_helpers import prepare_plan, choose_card, review_schedule


class CustomerInterfaceCorrections(unittest.TestCase):
    setUpClass = base_tests.PublicPlannerBrowserTests.__dict__['setUpClass']
    tearDownClass = base_tests.PublicPlannerBrowserTests.__dict__['tearDownClass']
    setUp = base_tests.PublicPlannerBrowserTests.setUp
    tearDown = base_tests.PublicPlannerBrowserTests.tearDown

    def fresh(self, width=1440):
        self.page.set_viewport_size({'width': width, 'height': 1000})
        self.page.emulate_media(reduced_motion='reduce')
        self.page.goto(self.base + '/retail-mirror/index.html')
        self.page.evaluate('sessionStorage.clear(); localStorage.clear()')
        self.page.reload()

    def shot(self, name):
        folder = os.environ.get('BC1Q21_VISUAL_OUTPUT')
        if folder:
            target = pathlib.Path(folder)
            target.mkdir(parents=True, exist_ok=True)
            self.page.screenshot(path=str(target / name), full_page=True, animations='disabled')

    def type_screen(self):
        self.page.locator('#plan-next').click()
        self.page.locator('#btc').fill('0.00100002')
        self.page.locator('#plan-next').click()

    def pair(self, left, right, *, unit=False):
        a, b = self.page.locator(left), self.page.locator(right)
        ba, bb = a.bounding_box(), b.bounding_box()
        font = float(a.evaluate('el => getComputedStyle(el).fontSize').removesuffix('px'))
        self.assertAlmostEqual(ba['y'], bb['y'], delta=.5)
        self.assertAlmostEqual(bb['x'] - ba['x'] - ba['width'], font * .5, delta=.5)
        self.assertAlmostEqual(ba['height'], bb['height'], delta=.5)
        self.assertEqual(a.evaluate('el => getComputedStyle(el).borderTopWidth'), '1px')
        self.assertAlmostEqual(float(a.evaluate('el => getComputedStyle(el).paddingLeft').removesuffix('px')), font)
        parent = a.locator('..').bounding_box()
        self.assertLessEqual(bb['x'] + bb['width'], parent['x'] + parent['width'] + .5)
        self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'), self.page.viewport_size['width'])
        if unit:
            for box in [ba, bb]:
                self.assertGreaterEqual(box['width'], 72)
                self.assertLess(box['width'], 100)
        else:
            self.assertLess(ba['width'], 300)
            self.assertLess(bb['width'], 300)

    def test_01_pending_legal_preview_records_nothing_and_production_requires_acceptance(self):
        self.fresh()
        self.assertTrue(self.page.locator('#disclaimer-acceptance').is_disabled())
        self.assertIn('Professional legal review pending', self.page.locator('#disclaimer-frame').inner_text())
        self.assertTrue(self.page.locator('#plan-next').is_enabled())
        self.assertEqual(self.page.locator('iframe').count(), 0)
        self.shot('01-pending-legal.png')
        self.page.locator('#plan-next').click()
        self.assertFalse(self.page.evaluate("Object.keys(sessionStorage).some(k => /legal|disclaimer|acceptance/i.test(k))"))
        # Serve a test-only trusted build policy. No production policy is shipped.
        pdf = b'%PDF-1.4\nSynthetic test artifact, NOT legal terms.\n%%EOF'
        policy = {'mode': 'production', 'terms': {'approved': True, 'version': 'synthetic-v1',
                  'acceptanceText': 'Synthetic acknowledgement for automated testing only',
                  'bytesBase64': base64.b64encode(pdf).decode(),
                  'integrity': 'sha384-' + base64.b64encode(hashlib.sha384(pdf).digest()).decode()}}
        self.page.route('**/disclaimer-policy.mjs', lambda route: route.fulfill(
            content_type='text/javascript', body='export const DISCLAIMER_POLICY=' + json.dumps(policy) + ';'))
        self.page.reload()
        self.page.wait_for_function("() => !document.querySelector('#disclaimer-acceptance').disabled")
        self.assertTrue(self.page.locator('[data-panel=welcome]').is_visible())
        self.assertTrue(self.page.locator('#plan-next').is_disabled())
        self.page.locator('#plan-next').dispatch_event('click')
        self.assertTrue(self.page.locator('[data-panel=welcome]').is_visible())
        self.page.locator('#review').dispatch_event('click')
        self.assertTrue(self.page.locator('#schedule-review').is_hidden())
        self.page.locator('#disclaimer-acceptance').check()
        self.assertTrue(self.page.locator('#plan-next').is_enabled())
        self.page.locator('#plan-next').click()
        self.assertTrue(self.page.locator('[data-panel=amount]').is_visible())
        self.page.locator('#plan-back').click()
        self.page.locator('#disclaimer-acceptance').uncheck()
        self.assertTrue(self.page.locator('#plan-next').is_disabled())
        self.page.locator('#approve').dispatch_event('click')
        self.assertIsNone(self.page.evaluate('(k) => sessionStorage.getItem(k)', base_tests.PLAN))

    def test_02_currency_buttons_are_compact_reference_metrics_and_keep_exact_amount(self):
        for width in [1440, 768, 390, 320]:
            self.fresh(width)
            self.page.locator('#plan-next').click()
            self.page.locator('#btc').fill('0.00100002')
            self.pair('#unit-btc', '#unit-usd', unit=True)
            self.page.locator('#unit-usd').click()
            self.assertEqual(self.page.locator('#usd').input_value(), '80.0016')
            self.assertEqual(self.page.locator('#unit-usd').get_attribute('aria-pressed'), 'true')
            self.assertEqual(self.page.locator('#unit-usd').evaluate('el => getComputedStyle(el).backgroundColor'), 'rgb(55, 91, 110)')
            self.assertEqual(self.page.locator('#unit-btc').evaluate('el => getComputedStyle(el).backgroundColor'), 'rgb(255, 255, 255)')
            self.page.locator('#unit-btc').click()
            self.assertEqual(self.page.locator('#btc').input_value(), '0.00100002')
            self.shot(f'02-currency-{width}.png')

    def test_03_gift_choices_are_compact_side_by_side_at_all_widths(self):
        for width in [1440, 768, 390, 320]:
            self.fresh(width)
            self.type_screen()
            self.pair('[data-gift=one]', '[data-gift=multiple]')
            self.page.locator('[data-gift=one]').click()
            self.assertEqual(self.page.locator('[data-gift=one]').get_attribute('aria-pressed'), 'true')
            self.assertEqual(self.page.locator('[data-gift=multiple]').get_attribute('aria-pressed'), 'false')
            self.assertTrue(self.page.locator('[data-panel=type]').is_visible())
            self.shot(f'03-gift-type-{width}.png')

    def test_04_gift_type_initially_unselected_continue_guarded_and_back_preserves_choice(self):
        self.fresh()
        self.type_screen()
        for value in ['one', 'multiple']:
            self.assertFalse(self.page.locator(f'input[name=giftType][value={value}]').is_checked())
            self.assertEqual(self.page.locator(f'[data-gift={value}]').get_attribute('aria-pressed'), 'false')
        self.assertTrue(self.page.locator('#plan-next').is_disabled())
        self.page.locator('#plan-next').dispatch_event('click')
        self.assertTrue(self.page.locator('[data-panel=type]').is_visible())
        self.page.locator('[data-gift=one]').click()
        self.assertTrue(self.page.locator('#plan-next').is_enabled())
        self.assertTrue(self.page.locator('[data-panel=type]').is_visible())
        self.page.locator('#plan-next').click()
        self.assertTrue(self.page.locator('#count').is_hidden())
        self.page.locator('#start').fill('2030-01-02')
        self.page.locator('#plan-back').click()
        self.assertEqual(self.page.locator('[data-gift=one]').get_attribute('aria-pressed'), 'true')
        choose_card(self.page, 'multiple')
        self.assertTrue(self.page.locator('#count').is_visible())
        self.assertEqual(self.page.locator('#start').input_value(), '2030-01-02')
        self.page.reload()
        self.page.locator('#plan-next').click()
        self.assertEqual(self.page.locator('[data-gift=multiple]').get_attribute('aria-pressed'), 'true')

    def test_05_release_fields_match_grid_spacing_and_keep_monthly_yearly_policy(self):
        for width in [1440, 768, 390, 320]:
            self.fresh(width)
            self.type_screen()
            choose_card(self.page, 'multiple')
            self.assertEqual(self.page.locator('#period').evaluate('el => el.tagName'), 'SELECT')
            self.assertEqual(self.page.locator('#period option').all_text_contents(), ['Yearly', 'Monthly'])
            count = self.page.locator('#count').bounding_box()
            period = self.page.locator('#period').bounding_box()
            if width > 780:
                self.assertAlmostEqual(count['y'], period['y'], delta=1)
                self.assertAlmostEqual(count['width'], period['width'], delta=1)
            else:
                self.assertGreater(period['y'], count['y'])
            self.assertEqual(self.page.locator('#start').get_attribute('max'), '2105-12-31')
            self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'), width)
            self.shot(f'05-dates-{width}.png')
        for period, date, expected in [
            ('monthly', '2031-01-31', ['2031-01-31', '2031-03-03', '2031-04-03']),
            ('yearly', '2032-02-29', ['2032-02-29', '2033-03-01', '2034-03-01'])]:
            self.fresh()
            self.assertTrue(prepare_plan(self.page, count='3', date=date, period=period))
            review_schedule(self.page)
            self.assertEqual(self.page.locator('#schedule-rows tr td:nth-child(2)').all_text_contents(), expected)

    def test_06_equal_variable_start_unselected_then_continue_into_exact_flows(self):
        for width in [1440, 768, 390, 320]:
            self.fresh(width)
            self.assertTrue(prepare_plan(self.page))
            self.pair('#choose-equal', '#choose-variable')
            self.assertTrue(self.page.locator('#plan-next').is_disabled())
            for key in ['choose-equal', 'choose-variable']:
                self.assertEqual(self.page.locator('#' + key).get_attribute('aria-pressed'), 'false')
            self.page.locator('#plan-next').dispatch_event('click')
            self.assertTrue(self.page.locator('[data-panel=allocation]').is_visible())
            self.shot(f'06-allocation-{width}.png')
            self.page.locator('#choose-equal').click()
            self.assertTrue(self.page.locator('[data-panel=allocation]').is_visible())
            self.assertTrue(self.page.locator('#plan-next').is_enabled())
            self.page.locator('#plan-next').click()
            self.assertEqual(self.page.locator('#schedule-rows tr td:nth-child(4)').all_text_contents(),
                             ['20,001', '20,001', '20,000', '20,000', '20,000'])
            self.page.locator('#edit').click()
            self.assertEqual(self.page.locator('#choose-equal').get_attribute('aria-pressed'), 'true')
            self.page.locator('#choose-variable').click()
            self.assertTrue(self.page.locator('[data-panel=allocation]').is_visible())
            self.page.locator('#plan-next').click()
            choose_card(self.page, 'manual')
            self.page.locator('#plan-next').click()
            review_schedule(self.page)
            self.assertIn('100,002', self.page.locator('#schedule-total').inner_text())

    def test_07_navigation_metrics_and_enabled_states_are_consistent_across_customer_pages(self):
        for width in [1440, 768, 390, 320]:
            self.fresh(width)
            reference = self.page.locator('#plan-next').evaluate('''el => {
                const s=getComputedStyle(el);return [s.fontSize,s.paddingTop,s.paddingLeft,s.borderTopWidth,el.getBoundingClientRect().height];
            }''')
            # Planner panels use a common row, with Back and Continue aligned.
            for stage in ['welcome', 'amount', 'type', 'schedule', 'allocation']:
                self.assertTrue(self.page.locator(f'[data-panel={stage}]').is_visible())
                back, forward = self.page.locator('#plan-back'), self.page.locator('#plan-next')
                self.assertAlmostEqual(back.bounding_box()['y'], forward.bounding_box()['y'], delta=.5)
                self.assertEqual(back.inner_text(), 'Back')
                self.assertEqual(forward.inner_text(), 'Continue')
                self.assertEqual(forward.evaluate('''el => {const s=getComputedStyle(el);return [s.fontSize,s.paddingTop,s.paddingLeft,s.borderTopWidth,el.getBoundingClientRect().height];}'''), reference)
                if stage == 'welcome': forward.click()
                elif stage == 'amount':
                    self.page.locator('#btc').fill('0.00100002');forward.click()
                elif stage == 'type': choose_card(self.page, 'multiple')
                elif stage == 'schedule':
                    self.page.locator('#start').fill('2030-01-02');forward.click()
            self.assertTrue(self.page.locator('#plan-next').is_disabled())
            self.assertEqual(self.page.locator('#plan-next').evaluate('el => getComputedStyle(el).opacity'), '0.5')
            def check_review_row(back, forward):
                a, b = self.page.locator(back), self.page.locator(forward)
                self.assertTrue(a.is_visible())
                self.assertTrue(b.is_visible())
                self.assertAlmostEqual(a.bounding_box()['y'], b.bounding_box()['y'], delta=.5)
                measured = b.evaluate('''el => {const s=getComputedStyle(el);return [s.fontSize,s.paddingTop,s.paddingLeft,s.borderTopWidth,el.getBoundingClientRect().height];}''')
                self.assertEqual(measured, reference)
            self.page.locator('#choose-variable').click()
            self.page.locator('#plan-next').click()
            check_review_row('#plan-back', '#plan-next')
            self.assertTrue(self.page.locator('#plan-next').is_disabled())
            choose_card(self.page, 'manual')
            self.page.locator('#plan-next').click()
            check_review_row('#plan-back', '#review')
            review_schedule(self.page)
            check_review_row('#edit', '#schedule-next')
            self.page.locator('#schedule-next').click()
            check_review_row('#ready-back', '#approve')
            self.page.locator('#ready-back').click()
            self.page.locator('#edit').click()
            self.page.locator('#plan-back').click()
            choose_card(self.page, 'suggest')
            self.page.locator('#plan-next').click()
            check_review_row('#plan-back', '#review')
            review_schedule(self.page)
            self.page.locator('#schedule-next').click()
            check_review_row('#ready-back', '#approve')
            for path, selector in [('index.html', '#continue'), ('funding-workspace.html', '#return-to-plan'),
                                   ('jade-signing-workspace.html', '#jade-back'),
                                   ('finish-workspace.html', '.screen-navigation a:first-child')]:
                self.page.goto(self.base + '/' + path)
                self.assertTrue(self.page.locator(selector).is_visible())
                measured = self.page.locator(selector).evaluate('''el => {const s=getComputedStyle(el);return [s.fontSize,s.paddingTop,s.paddingLeft,s.borderTopWidth,el.getBoundingClientRect().height];}''')
                self.assertEqual(measured, reference, (width, path))
                self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'), width)
                self.shot(f'07-{path}-{width}.png')
                if path.startswith('jade'):
                    self.assertTrue(self.page.locator('#finish-gift').is_disabled())
                    self.assertTrue(self.page.locator('#scan').is_disabled())

    def test_production_missing_or_tampered_terms_cannot_be_bypassed(self):
        self.fresh()
        for terms in [None, {'approved': True, 'version': 'test', 'acceptanceText': 'Synthetic only',
                       'bytesBase64': base64.b64encode(b'%PDF-tampered').decode(), 'integrity': 'sha384-' + 'A' * 64}]:
            policy = {'mode': 'production', 'terms': terms}
            self.page.route('**/disclaimer-policy.mjs', lambda route, request, p=policy: route.fulfill(
                content_type='text/javascript', body='export const DISCLAIMER_POLICY=' + json.dumps(p) + ';'))
            self.page.reload()
            self.page.locator('#legal-status').wait_for(state='visible')
            self.assertTrue(self.page.locator('#plan-next').is_disabled())
            self.page.locator('#disclaimer-acceptance').evaluate('el => {el.disabled=false;el.checked=true;el.dispatchEvent(new Event("change",{bubbles:true}));}')
            self.page.locator('#plan-next').dispatch_event('click')
            self.assertTrue(self.page.locator('[data-panel=welcome]').is_visible())
            self.assertTrue(self.page.locator('#approve').is_disabled())


if __name__ == '__main__':
    unittest.main()

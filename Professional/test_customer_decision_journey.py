"""Restored public decisions on real HTTP controls; no wallet or backend."""
import os
import pathlib
import unittest
import test_public_date_planner_browser as base_tests
from planner_browser_test_helpers import prepare_plan, review_schedule, choose_card


class CustomerDecisionJourneyTests(unittest.TestCase):
    setUpClass = base_tests.PublicPlannerBrowserTests.__dict__['setUpClass']
    tearDownClass = base_tests.PublicPlannerBrowserTests.__dict__['tearDownClass']
    setUp = base_tests.PublicPlannerBrowserTests.setUp
    tearDown = base_tests.PublicPlannerBrowserTests.tearDown

    def screenshot(self, name):
        folder = os.environ.get('BC1Q21_VISUAL_OUTPUT')
        if folder:
            target = pathlib.Path(folder)
            target.mkdir(parents=True, exist_ok=True)
            self.page.screenshot(path=str(target / name), full_page=True, animations='disabled')

    def assert_safe(self):
        self.assertEqual(self.errors + self.failed + self.external, [])
        plan = self.page.evaluate('(k) => JSON.parse(sessionStorage.getItem(k))', base_tests.PLAN)
        if plan:
            for key in ['signingAuthorized', 'fundingAuthorized', 'broadcastAuthorized']:
                self.assertFalse(plan[key])

    def test_pending_disclaimer_is_visible_but_no_terms_or_acceptance_are_activated(self):
        self.assertIn('Professional legal review pending', self.page.locator('#disclaimer-pending').inner_text())
        self.assertTrue(self.page.locator('#disclaimer-acceptance').is_disabled())
        self.assertFalse(self.page.locator('#disclaimer-acceptance').is_checked())
        self.assertTrue(self.page.locator('#disclaimer-pending button').is_disabled())
        self.assertEqual(self.page.locator('iframe').count(), 0)
        self.page.locator('#plan-next').click()
        self.assertTrue(self.page.locator('[data-panel=amount]').is_visible())
        self.assertIsNone(self.page.evaluate("sessionStorage.getItem('disclaimerAccepted')"))
        self.assert_safe()

    def test_btc_usd_toggle_is_lossless_and_usd_entry_reaches_exact_review(self):
        self.page.locator('#plan-next').click()
        self.page.locator('#btc').fill('0.00100002')
        for _ in range(5):
            self.page.locator('#unit-usd').click()
            self.assertEqual(self.page.locator('#usd').input_value(), '80.0016')
            self.assertEqual(self.page.locator('#unit-usd').get_attribute('aria-pressed'), 'true')
            self.page.locator('#unit-btc').click()
            self.assertEqual(self.page.locator('#btc').input_value(), '0.00100002')
        self.page.locator('#unit-usd').click()
        self.page.locator('#usd').fill('80.0016')
        self.page.locator('#plan-next').click()
        choose_card(self.page, 'one')
        self.page.locator('#start').fill('2030-01-02')
        review_schedule(self.page)
        self.assertIn('100,002', self.page.locator('#schedule-total').inner_text())
        self.page.locator('#schedule-next').click()
        self.page.locator('#approve').click()
        self.page.wait_for_url('**/funding-workspace.html')
        plan = self.page.evaluate('(k) => JSON.parse(sessionStorage.getItem(k))', base_tests.PLAN)
        self.assertEqual(plan['totalSats'], 100002)
        self.assertTrue(self.page.locator('#construct-unsigned').is_disabled())
        self.assert_safe()

    def test_usd_rounding_invalid_input_and_reload_preserve_the_visible_amount(self):
        self.page.locator('#plan-next').click()
        self.page.locator('#unit-usd').click()
        for value in ['-1', 'Infinity', '1e3', '0.00039999']:
            self.page.locator('#usd').fill(value)
            self.page.locator('#plan-next').click()
            self.assertTrue(self.page.locator('[data-panel=amount]').is_visible())
        self.page.locator('#usd').fill('80.0016')
        self.page.reload()
        self.assertTrue(self.page.locator('#usd').is_visible())
        self.assertEqual(self.page.locator('#usd').input_value(), '80.0016')
        self.assertIn('0.00100002', self.page.locator('#usd-preview').inner_text())
        self.assert_safe()

    def test_gift_buttons_require_continue_and_back_preserves_inputs(self):
        self.page.locator('#plan-next').click()
        self.page.locator('#btc').fill('0.00100002')
        self.page.locator('#plan-next').click()
        self.assertTrue(self.page.locator('#plan-next').is_disabled())
        self.page.locator('[data-gift=one]').press('Space')
        self.assertTrue(self.page.locator('[data-panel=type]').is_visible())
        self.page.locator('#plan-next').click()
        self.assertTrue(self.page.locator('[data-panel=schedule]').is_visible())
        self.assertTrue(self.page.locator('#count').is_hidden())
        self.page.locator('#start').fill('2030-01-02')
        self.page.locator('#plan-back').click()
        choose_card(self.page, 'multiple')
        self.assertTrue(self.page.locator('#count').is_visible())
        self.assertEqual(self.page.locator('#start').input_value(), '2030-01-02')
        self.page.locator('#plan-back').click()
        self.page.locator('#plan-back').click()
        self.assertEqual(self.page.locator('#btc').input_value(), '0.00100002')
        self.assert_safe()

    def test_two_stage_manual_choice_prefills_exact_sats_and_tracks_difference(self):
        self.assertTrue(prepare_plan(self.page))
        self.page.locator('#choose-variable').click()
        self.page.locator('#plan-next').click()
        self.assertTrue(self.page.locator('[data-panel=strategy]').is_visible())
        self.assertTrue(self.page.locator('#manual').is_hidden())
        self.assertTrue(self.page.locator('#plan-next').is_disabled())
        choose_card(self.page, 'manual')
        self.page.locator('#plan-next').click()
        self.assertIn('2030-01-02, 0.00020001', self.page.locator('#manual').input_value())
        self.assertIn('Totals match perfectly', self.page.locator('#manual-difference').inner_text())
        self.page.locator('#manual').fill('2030-01-02, 0.00100001')
        self.assertIn('-1 sats', self.page.locator('#manual-difference').inner_text())
        review_schedule(self.page)
        self.assertTrue(self.page.locator('#schedule-review').is_hidden())
        self.page.locator('#manual').fill('2030-01-02, 0.00100002')
        self.page.locator('#plan-back').click()
        self.assertTrue(self.page.locator('[data-panel=strategy]').is_visible())
        self.page.locator('#plan-next').click()
        self.assertEqual(self.page.locator('#manual').input_value(), '2030-01-02, 0.00100002')
        review_schedule(self.page)
        self.assertIn('100,002', self.page.locator('#schedule-total').inner_text())
        self.page.locator('#edit').click()
        self.assertTrue(self.page.locator('#manual').is_visible())
        self.assert_safe()

    def suggested(self, growth='10'):
        self.assertTrue(prepare_plan(self.page))
        self.page.locator('#choose-variable').click()
        self.page.locator('#plan-next').click()
        choose_card(self.page, 'suggest')
        self.page.locator('#plan-next').click()
        self.assertTrue(self.page.locator('[data-panel=growth]').is_visible())
        self.page.locator('#growth').fill(growth)
        review_schedule(self.page)

    def test_suggested_journey_uses_reference_and_rejects_stale_final_review(self):
        self.suggested()
        self.assertEqual(self.page.locator('#schedule-rows tr td:nth-child(4)').all_text_contents(),
                         ['23,981', '21,803', '19,822', '18,016', '16,380'])
        self.assertIn('100,002', self.page.locator('#schedule-total').inner_text())
        self.assertIn('10%', self.page.locator('#projection-summary').inner_text())
        self.assertTrue(self.page.locator('#projection-price-heading').is_visible())
        self.page.locator('#schedule-next').click()
        # Stale public inputs, even without input/change events, cannot approve.
        self.page.locator('#growth').evaluate("el => el.value = '20'")
        self.page.locator('#approve').click()
        self.assertIn('Plan changed', self.page.locator('#status').inner_text())
        self.assertIsNone(self.page.evaluate('(k) => sessionStorage.getItem(k)', base_tests.PLAN))
        self.assert_safe()

    def test_zero_growth_projection_can_approve_only_the_unfunded_public_plan(self):
        self.suggested('')
        self.assertEqual(self.page.locator('#schedule-rows tr td:nth-child(4)').all_text_contents(),
                         ['20,000', '20,000', '20,000', '20,000', '20,002'])
        self.page.locator('#schedule-next').click()
        self.page.locator('#ready-back').click()
        self.assertTrue(self.page.locator('#approve').is_disabled())
        self.page.locator('#schedule-next').click()
        self.page.locator('#approve').click()
        self.page.wait_for_url('**/funding-workspace.html')
        self.assert_safe()
        self.assertTrue(self.page.locator('#customer-address-qr').is_hidden())
        self.assertTrue(self.page.locator('#handoff-jade').is_disabled())

    def test_invalid_growth_and_dust_stay_locked(self):
        for growth in ['-1', 'Infinity', '9' * 60]:
            self.suggested(growth)
            self.assertTrue(self.page.locator('#schedule-review').is_hidden())
            self.assertTrue(self.page.locator('#approve').is_disabled())
        self.assert_safe()

    def test_all_new_panels_fit_desktop_tablet_and_phone_and_keep_branding(self):
        for width in [1440, 768, 390, 320]:
            self.page.set_viewport_size({'width': width, 'height': 900})
            self.page.goto(self.base + '/retail-mirror/index.html')
            self.assertTrue(prepare_plan(self.page))
            for name in ['allocation', 'strategy', 'growth']:
                self.assertTrue(self.page.locator(f'[data-panel={name}]').is_visible())
                self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'), width)
                self.screenshot(f'{name}-{width}.png')
                if name == 'allocation':
                    self.page.locator('#choose-variable').click()
                    self.page.locator('#plan-next').click()
                elif name == 'strategy':
                    choose_card(self.page, 'suggest')
                    self.page.locator('#plan-next').click()
            self.page.locator('[data-growth="10"]').click()
            self.assertEqual(self.page.locator('#growth').input_value(), '10')
            review_schedule(self.page)
            self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'), width)
            self.screenshot(f'projection-{width}.png')
        self.assert_safe()

    def test_disclaimer_amount_currency_gift_and_manual_layouts_fit(self):
        for width in [1440, 768, 390, 320]:
            self.page.set_viewport_size({'width': width, 'height': 900})
            self.page.goto(self.base + '/retail-mirror/index.html')
            self.page.evaluate('sessionStorage.clear()')
            self.page.reload()
            for stage in ['welcome', 'amount', 'type', 'schedule']:
                self.assertTrue(self.page.locator(f'[data-panel={stage}]').is_visible())
                self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'), width)
                self.screenshot(f'{stage}-{width}.png')
                if stage == 'welcome':
                    self.page.locator('#plan-next').click()
                elif stage == 'amount':
                    self.page.locator('#unit-usd').click()
                    self.page.locator('#usd').fill('80.0016')
                    self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'), width)
                    self.screenshot(f'usd-{width}.png')
                    self.page.locator('#plan-next').click()
                elif stage == 'type':
                    choose_card(self.page, 'multiple')
            self.page.locator('#start').fill('2030-01-02')
            self.page.locator('#plan-next').click()
            self.page.locator('#choose-variable').click()
            self.page.locator('#plan-next').click()
            choose_card(self.page, 'manual')
            self.page.locator('#plan-next').click()
            self.assertTrue(self.page.locator('#manual').is_visible())
            self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'), width)
            self.screenshot(f'manual-{width}.png')
        self.assert_safe()


if __name__ == '__main__':
    unittest.main()

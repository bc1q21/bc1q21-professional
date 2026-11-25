"""Exercise Git's Windows text conversion and the actual exported HTTP preview.
No network Git operation, checkout, config mutation or branch change is used.
"""
import base64
import hashlib
import io
import pathlib
import posixpath
import re
import subprocess
import tempfile
import unittest
from unittest.mock import patch
import zipfile
import os
from playwright.sync_api import sync_playwright
import test_planner_static_http_browser as static_tests
from planner_browser_test_helpers import prepare_plan, review_schedule

REPO = pathlib.Path(__file__).resolve().parent.parent
EXPORT_PATHS = [
    'Professional/customer-controls.css', 'Professional/disclaimer-gate.mjs', 'Professional/disclaimer-policy.mjs', 'Professional/index.html', 'Professional/retail-mirror', 'Professional/assets/original',
    'Professional/professional-branding.mjs', 'Professional/planner-amounts.mjs', 'Professional/public-date-planner.mjs',
    'Professional/retail-calendar-cltv.mjs', 'Professional/funding-workspace.html',
    'Professional/prepare-funding-preview.mjs', 'Professional/jade-signing-workspace.html',
    'Professional/finish-workspace.html', 'Professional/customer-walkthrough.html',
]

def preview_archive(autocrlf):
    # --worktree-attributes lets this regression exercise an attribute repair
    # before committing it. A separate final check uses the committed archive
    # without this option, matching the owner's Windows command exactly.
    return subprocess.check_output([
        'git', '-c', 'core.autocrlf=' + autocrlf, 'archive', '--worktree-attributes',
        '--format=zip', 'HEAD', *EXPORT_PATHS,
    ], cwd=REPO)

def stylesheet_links(html):
    return re.findall(r'<link rel="stylesheet" href="([^"]+)" integrity="([^"]+)"', html)

def integrity(data):
    return 'sha384-' + base64.b64encode(hashlib.sha384(data).digest()).decode()

class WindowsArchiveStylesheetTests(unittest.TestCase):
    def test_export_preserves_every_stylesheet_with_windows_and_unix_git_settings(self):
        for setting in ('false', 'true'):
            with zipfile.ZipFile(io.BytesIO(preview_archive(setting))) as archive:
                html = archive.read('Professional/retail-mirror/index.html').decode('utf-8')
                links = stylesheet_links(html)
                self.assertEqual(len(links), 4)
                for ref, expected in links:
                    path = posixpath.normpath(posixpath.join('Professional/retail-mirror', ref))
                    with self.subTest(autocrlf=setting, stylesheet=path):
                        exported = archive.read(path)
                        self.assertEqual(integrity(exported), expected,
                                         'Git archive changed integrity-protected CSS bytes')
                        committed = subprocess.check_output(['git', 'show', 'HEAD:' + path], cwd=REPO)
                        self.assertTrue(exported == committed, path)

    def test_windows_export_loads_css_over_real_http_and_preserves_planner(self):
        with tempfile.TemporaryDirectory(prefix='professional-windows-export-') as folder:
            with zipfile.ZipFile(io.BytesIO(preview_archive('true'))) as archive:
                archive.extractall(folder)
            root = pathlib.Path(folder) / 'Professional'
            with patch.object(static_tests, 'ROOT', root), static_tests.static_preview() as base:
                with sync_playwright() as playwright:
                    browser = playwright.chromium.launch(
                        executable_path=os.environ.get('BC1Q21_TEST_CHROMIUM', '/usr/bin/chromium'),
                        headless=True, args=['--no-sandbox'])
                    try:
                        page = browser.new_page()
                        # Identity and planner now share an SRI stylesheet.
                        # Force fresh HTTP bodies (like a hard refresh), rather
                        # than mistake a valid conditional 304 for a missing CSS.
                        devtools = page.context.new_cdp_session(page)
                        devtools.send('Network.enable')
                        devtools.send('Network.setCacheDisabled', {'cacheDisabled': True})
                        css_responses, console, page_errors = [], [], []
                        page.on('response', lambda response: css_responses.append(response)
                                if response.request.resource_type == 'stylesheet' else None)
                        page.on('console', lambda message: console.append(message.text))
                        page.on('pageerror', lambda error: page_errors.append(str(error)))
                        page.goto(base + '/index.html')
                        self.assertIn('Professional Gifting Wizard', page.locator('h1').inner_text())
                        css_responses.clear()
                        page.locator('#continue').click()
                        page.wait_for_url('**/retail-mirror/index.html')
                        links = stylesheet_links((root / 'retail-mirror/index.html').read_text())
                        self.assertEqual(len(css_responses), 4)
                        for response in css_responses:
                            self.assertEqual(response.status, 200, response.url)
                            self.assertTrue(response.headers.get('content-type', '').startswith('text/css'))
                            match = next(expected for ref, expected in links
                                         if response.url == base + '/' + posixpath.normpath(
                                             posixpath.join('retail-mirror', ref)))
                            self.assertEqual(integrity(response.body()), match,
                                             'HTTP 200 is insufficient when SRI rejects converted CSS')
                        self.assertFalse(any('integrity' in message.lower() for message in console), console)
                        self.assertEqual(page.locator('.section-bar').evaluate(
                            'el => getComputedStyle(el).backgroundColor'), 'rgb(55, 91, 110)')
                        self.assertEqual(page.locator('#professional-wizard-brand-logo').evaluate(
                            'el => el.naturalWidth'), 375)
                        self.assertTrue(prepare_plan(page))
                        review_schedule(page)
                        self.assertTrue(page.locator('#schedule-review').is_visible())
                        self.assertEqual(page.locator('#schedule-rows tr td:nth-child(4)').all_text_contents(),
                                         ['20,001', '20,001', '20,000', '20,000', '20,000'])
                        self.assertIn('100,002', page.locator('#schedule-total').inner_text())
                        self.assertIn('103,752', page.locator('#deposit-total').inner_text())
                        self.assertEqual(page_errors, [])
                    finally:
                        browser.close()

if __name__ == '__main__':
    unittest.main()

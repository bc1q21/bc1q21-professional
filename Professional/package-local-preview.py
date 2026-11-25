"""Build a private, allowlisted HTTP preview. No Git changes or network calls.

Requires the existing browser-integration npm dependencies. The generated
bundle belongs in this local ZIP, not in source control. ZIP writes preserve
CSS bytes and therefore SRI, independently of Windows Git newline settings.
"""
import argparse
import pathlib
import subprocess
import shutil
import zipfile
import base64
import hashlib
import re

ROOT = pathlib.Path(__file__).resolve().parent
FILES = (
    'assets/documents/bc1q21_Professional_Liability_Disclaimer.pdf','camera-ownership.mjs','creator.html','creator-shell.js','creator-memory.js','creator-browser-common.mjs',
    'creator-wallet-setup.browser.mjs','creator-independent-service.mjs','creator-browser-funding.mjs','creator-browser-jade.mjs',
    'creator-browser-finish.mjs','browser-transaction-network.mjs','creator-workspace-route.mjs','browser-integration/creator-browser.bundle.js',
    'recipient-gift-specific-prototype.html','beneficiary-browser.mjs','beneficiary-browser-engine.mjs','browser-integration/beneficiary-discovery.worker.js', 'recipient-package-import.browser.mjs', 'recipient-jade-review.browser.mjs', 'LOCAL_PREVIEW.md', 'customer-controls.css', 'disclaimer-gate.mjs', 'disclaimer-policy.mjs', 'index.html', 'retail-mirror/index.html', 'retail-mirror/planner.css',
    'retail-mirror/planner.browser.mjs', 'assets/original/pico.min.css',
    'assets/original/style.css', 'assets/original/bc1q21-logo.png',
    'professional-branding.mjs', 'planner-amounts.mjs', 'public-date-planner.mjs', 'retail-calendar-cltv.mjs',
    'funding-workspace.html', 'prepare-funding-preview.mjs', 'creator-plan-acceptance.browser.mjs', 'creator-jade-review.browser.mjs', 'creator-finish.browser.mjs',
    'jade-signing-workspace.html', 'finish-workspace.html', 'customer-walkthrough.html',
    'browser-integration/professional-verifier.bundle.js',
)


# Source-level legal additions; the accepted 44 runtime entries above stay unchanged.
LEGAL_FILES = ('LICENSE', 'NOTICE', 'THIRD_PARTY_NOTICES.md', 'LICENSING.md',
               'ASSET_LICENSE.md', 'BRANDING_POLICY.md', 'RIGHTS_PROVENANCE.md')


def package_preview(destination):
    # Build using the pinned lockfile/dependencies; never implicitly install.
    npm = shutil.which('npm')
    if not npm:
        raise RuntimeError('npm is required on the packaging machine, not the preview machine')
    subprocess.run([npm, 'run', 'build'], cwd=ROOT / 'browser-integration', check=True)
    for name in FILES:
        if not (ROOT / name).is_file():
            raise FileNotFoundError(name)
    for name in FILES:
        if not name.endswith('.html'):
            continue
        page = ROOT / name
        html = page.read_text(encoding='utf-8')
        for ref, expected in re.findall(r'<link rel="stylesheet" href="([^"]+)" integrity="([^"]+)"', html):
            css = (page.parent / ref).read_bytes()
            actual = 'sha384-' + base64.b64encode(hashlib.sha384(css).digest()).decode()
            if actual != expected:
                raise RuntimeError('Stylesheet integrity mismatch; do not package: ' + ref)
    for name in LEGAL_FILES:
        if not (ROOT.parent / name).is_file():
            raise FileNotFoundError('Required source license notice: ' + name)
    with zipfile.ZipFile(destination, 'w', zipfile.ZIP_DEFLATED) as archive:
        for name in FILES:
            archive.write(ROOT / name, 'Professional/' + name)
        for name in LEGAL_FILES:
            archive.write(ROOT.parent / name, name)
        for notice in sorted((ROOT / 'third-party-notices').glob('*')):
            if notice.is_file():
                archive.write(notice, 'Professional/third-party-notices/' + notice.name)
        archive.writestr('Start-Professional-Preview.cmd',
                         '@echo off\r\ncd /d "%~dp0"\r\n'
                         'echo Open http://127.0.0.1:8766/index.html in Brave.\r\n'
                         'python -m http.server 8766 --bind 127.0.0.1 --directory Professional\r\n'
                         'pause\r\n')
        archive.writestr('README.txt',
                         'PRIVATE LOCAL PREVIEW ONLY. No real Bitcoin or wallet credentials.\n'
                         'Windows: run Start-Professional-Preview.cmd (Python required).\n'
                         'Open http://127.0.0.1:8766/index.html in Brave; Ctrl+Shift+R.\n'
                         'Stop an older server with Ctrl+C first.\n'
                         'Read and explicitly accept the Professional Liability Disclaimer before continuing. Simulated Bitcoin only.\n')
    return destination


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output', type=pathlib.Path, help='Destination ZIP outside source files')
    args = parser.parse_args()
    print(package_preview(args.output.resolve()))

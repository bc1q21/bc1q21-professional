# Public-source test profiles

The accepted application remains Regtest-only. These commands do not operate Bitcoin
Core, contact a Bitcoin service, access hardware, or rebuild accepted browser assets.
A passing software profile is not a new physical-wallet or mainnet qualification.

## Setup and default command

Run from the repository root with Node 24.22.1 or compatible Node 24 (built-in SQLite
is required), Python 3.11+, and the committed dependency lockfile:

```
npm --prefix Professional/browser-integration ci
python -m pip install -r Professional/requirements-test.txt
node Professional/run-public-source-tests.mjs
```

Dependency installation is a separate setup step requiring registry access; the runner
never installs anything. This preparation reused installed dependencies; a clean
registry installation was not performed as part of this phase.

Use an existing Chromium-compatible browser by setting BC1Q21_TEST_CHROMIUM to its
full executable path. Linux automatically uses /usr/bin/chromium if present. If no
system browser is available, install the browser matching each Playwright version
or supply one explicit executable for both Node and Python. Missing browsers are
failures, not silent skips. BC1Q21_TEST_PYTHON selects the Python executable.

Examples:

```
# Linux/macOS, use an existing browser
BC1Q21_TEST_CHROMIUM=/usr/bin/chromium node Professional/run-public-source-tests.mjs
```

```powershell
# Windows PowerShell; substitute the existing browser's actual path
$env:BC1Q21_TEST_CHROMIUM = 'C:\Path\To\Existing\Browser\chrome.exe'
node Professional/run-public-source-tests.mjs
```

The manifest public-source-test-suite.json is authoritative. Default includes all
Phase 2B passing public Node component files, repaired applicable failures, current
wrapper/RAM tests, PDF-gating tests, and synthetic beneficiary verification. Subsets:

```
node Professional/run-public-source-tests.mjs --node
node Professional/run-public-source-tests.mjs --python
node Professional/run-public-source-tests.mjs --browser
```

The runner checks frozen-source.json before and after execution, starts only newly
created loopback test fixtures, denies source writes and Bitcoin/deployment commands,
and permits esbuild only through a write:false test adapter. No protected bundle
is regenerated. Both ESM import conditions and esbuild nodePaths resolve dependencies
from browser-integration/node_modules. The guards constrain trusted tests; they are
not an operating-system sandbox for arbitrary hostile native programs.

Python fixture listeners may reuse a port reserved by the same test run. Read-only
Git archive/show operations are allowed; only the specific core.autocrlf=true/false
command-local option is accepted. Guard logs and generated synthetic pages go to a
fresh OS temporary directory, never public assets. Source integrity is checked even
when a test fails. The wrappers preserve the application's security assertions;
missing setup, crashes and assertion failures produce a nonzero result.

## Optional and historical profiles — not hidden passes

The manifest lists every previously failing file outside default. None of the
following is claimed passing merely because it is optional:

- `legacy-coordinator`: retired SQLite/operator workflow, not the production
  browser-local path. Its corrected Node HTTP/security regression can be run with
  `node Professional/run-public-source-tests.mjs --legacy-coordinator` (Node only).
  The historical Python coordinator/package browser test remains unported: it
  expects hidden legacy controls, durable browser storage and the old handoff.
- `retail-comparison`: two tests require an independently supplied Retail
  Frontend/AESHelper.js and its documented environment. A third requires independent
  bip32 and tiny-secp256k1 test libraries. Do not copy Retail or introduce browser
  seed intake merely to run these optional historical comparisons.
- `private-hardware-replay`: the two same-gift browser scripts require explicit
  handoff and signed-frame arguments from privately held historical evidence.
  Never include those records in the public candidate. These are replay tests,
  not permission to operate a Jade or create signatures.
- `legacy-browser`: the eight named older browser modules preserve useful
  historical assertions but are not a current workflow acceptance suite. They
  expect direct child-page navigation, persistent browser state, pending legal
  terms, or an in-place packaging build. Their previously recorded failures remain
  outstanding. Current default tests cover wrapper entry, explicit PDF acceptance,
  exact plan amounts, stale-plan rejection, RAM reset, no Web Storage/cookies,
  beneficiary default denial, identity/funding/script/reorg/MTP checks, QR display
  and cryptographic component tests. Older visual/layout, every legacy planning
  branch, Windows Git-export and retired coordinator-browser behavior are not all
  re-proven by those replacement current-workflow checks.

Do not run in-place packaging/build commands while accepted files are frozen.
Testing those commands requires an independently writable disposable source copy
and separate authorization where the protected-file restriction applies.
The existing private-capture test embedded in jade-claim-normalization.test.mjs
remains skipped without its private evidence directory. Its other synthetic tests
run in default. This one skip is reported, never counted as a pass.

Historical tests of git archive HEAD do not verify uncommitted candidate files.
The current default packager test compares actual candidate bytes with generated
ZIP entries while mocking the bundle-build invocation; it does not certify a
new in-place production build.

Bitcoin-dependent and physical-hardware acceptance remains an explicitly authorized
manual activity outside every automated profile above. No new blockchain or hardware
acceptance occurred in Phase 2D. Private evidence remains excluded. Publication also
requires the separately tracked history/privacy and redistribution decisions.

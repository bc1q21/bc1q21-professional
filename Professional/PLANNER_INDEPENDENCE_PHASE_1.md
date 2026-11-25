# Professional Planner Independence — Phase 1

Historical Phase 1 report: the original CSS/logo recovery is now complete.
See `ORIGINAL_APPEARANCE_RESTORATION.md` for the separate visual integration,
updated asset provenance, nine-resource planner graph and remaining limits.

Scope: `bc1q21/bc1q21-Professional-Development`, `Professional/` only.
No original Retail repository access, deployment or broadcast. The owner has
authorized the review branch `professional/planner-independence-phase-1`, its
commit/push and a pull request to development `main`; merging is not authorized.

## Implementation and boundaries

`retail-mirror/index.html` remains the customer planning entry. It now loads
`planner.css` and `planner.browser.mjs`, which imports `public-date-planner.mjs`
and the existing browser-safe `retail-calendar-cltv.mjs`. These five files are
the complete planner resource graph. No npm packages, generated verifier bundle,
remote fonts, external URLs, wallet modules, iframe or encryption are needed.
The full wallet/signing engine is not recreated. Existing transaction modules
and hardware-signing boundaries are unchanged.

The missing Alpine/UI engine is replaced with a small native form controller.
The existing light/teal header, four-stage stepper, planning choices, schedule
review and fee-summary structure are retained. CSS is newly maintained here;
exact pixel parity with the unavailable stylesheet/logo is not established.
The default brand is text. Identity and Add Funds use a newly written local SVG
text-wordmark fallback in place of their missing logo paths. No original logo
is recreated. Optional existing public profile name/logo is read
from session storage (only bounded raster data URLs, never a remote image).

The existing approved-plan format is retained. Amounts are decimal BTC strings
parsed with integer arithmetic, bounded by Bitcoin supply; releases are integer
satoshis with a 546-sat minimum and an exact total. Monthly/yearly UTC overflow
matches the repository's date-reference vectors (not month-end clamping).
The existing creator maximum is 24 releases; the existing UI date maximum is
2105-12-31. Manual rows use explicit dates and amounts. Equal amounts use floor
division and distribute remainder satoshis to earliest releases; this rule is
visible in the UI. The missing original engine's remainder rule is unverified.

Service fee: 1,000 + 250 per additional release. Estimated mining fees:
500 + 250 per release. The old fixed $80,000/BTC development estimate is
retained for display only, not a live price or trusted transaction quote.
The input is exact BTC; the old USD-entry conversion is not reconstructed
without its rounding specification. No claims of original price/allocation
engine parity are made.

Review does not approve a plan. Explicit approval revalidates the current
inputs against the reviewed schedule, clears all prior Professional session
context except identity/draft, and saves only the public unfunded plan before
navigating to Add Funds. All authorization flags remain false. Edits and
planner entry/back navigation clear old approved plans, diagnostic handoffs,
unsigned previews, verified-result summaries and the localStorage fallback.
Storage failures lock approval. This is tab-local preview invalidation, not
cross-tab coordination or a production authorization service.

## Missing dependency inventory (from this repository's pre-change HTML)

All paths below resolved beneath the absent `Frontend/` directory. None was
retrieved from Retail. The inventory covers direct references; dependencies
inside unavailable source files cannot be exhaustively inferred.

| Referenced file(s) | Role and Phase 1 disposition |
| --- | --- |
| `static/pico.min.css`, `static/style.css` | Layout/style; replaced by local minimal planner CSS. Original pixel parity blocked. |
| `static/img/bc1q21-logo.png` | Branding; default text wordmark, optional supplied profile raster logo. Original image unavailable. |
| `static/collapse.min.js` | UI interaction; native form/fieldset controls. |
| `static/alpine-csp-3.15.12.min.js`, `alpine-csp-adapter.js` | Template/UI runtime; removed, native controller. No expression evaluator introduced. |
| `SchedulePlanner.js` | Missing allocation engine; documented calendar rules reused; exact manual/equal accounting implemented. Suggested algorithm unavailable. |
| `NavigationManager.js`, `UIRenderer.js`, `bc1q21-h08.js` | Mixed wizard orchestration; public planning/review/approval implemented locally; recovery/payment/finish code not loaded. |
| `PriceManager.js` | Price display/conversion; fixed local display estimate retained; live pricing and USD-entry rounding not recreated. |
| `gift-card-preview.js` | Card generation belongs to later delivery lifecycle; not required for public schedule creation. |
| `BtcBackendClient.js`, `service-fee-address.js` | Backend/payment destination; not needed for planning; no service connection or destination created. Fee estimate is numeric only. |
| `CryptoUtils.js`, `CryptoManager.js`, `TransactionManager.js` | Mixed wallet/transaction operations; excluded. Public calendar conversion uses the existing isolated module. |
| `static/modules/bip39.bundle.js`, `static/modules/scure.wordlist.english.js` | Recovery-word operations; exclusively outside this planner; no substitutes. |
| `static/modules/bip32.bundle.js`, `static/modules/bech32.js` | Public wallet/address derivation may be needed in later funding, not schedule planning; not loaded. |
| `static/modules/noble-hashes.js`, `static/modules/btc-signer.js`, `static/modules/qrcode.min.js` | Hashing/signing/QR lifecycle; not required for public-date planning, existing isolated implementations remain separate. |
| `AESHelper.js` | Legacy encrypted-date metadata/recovery; not required for public dates. No replacement, no encrypted-gift compatibility claim. |

Other removed runtime dependencies: `content-config.json` (noted by the old
page's same-origin-fetch comment), dynamic `getHelpUrl()`/`giftCardPdfUrl`,
and the production disclaimer iframe/link at
`https://www.bc1q21.com/doc/bc1q21_disclaimers.pdf`. No replacement legal
content or remote help behavior is invented. The old developer creator and
recipient iframes are existing Professional files, not missing assets; they
are no longer loaded by customer planning. Their standalone prototypes remain.

## Explicit compatibility blockers

- Exact suggested growth allocation, original equal-remainder/USD-conversion
  rounding, original CSS/logo and dynamic help/legal content need an approved
  source artifact/specification if exact Retail parity is required. Suggested
  allocation stays visibly unavailable; a manual schedule can reproduce known
  amounts without pretending they were calculated by the missing engine.
- Legacy recovery tests still import the absent `Frontend/AESHelper.js`.
  They are not public-date planner dependencies. They remain blocked and were
  not changed or made to pass with substitute cryptography.
- Add Funds schedule import works in the browser test. Broader downstream
  funding/signing integration is outside Phase 1. Its generated verifier
  bundle was already untracked before this work and is not part of the planner.
- No hardware behavior, live Core consensus, complete recipient delivery or
  production readiness is established by this phase.

## Reconciled old assertions

1. `retail-plan-bridge.test.mjs`: obsolete banner/event-routing expectations
   replaced with checks for the local controller, explicit approval, schedule
   revalidation, correct destination and exclusion of wallet/recovery frames.
   The original bridge's data-validation and creator-prototype tests remain.
2. `jade-address-check.test.mjs`: old placeholder text was obsolete because a
   regtest-only public-address QR already exists. Retain disabled payment and
   signing assertions; additionally check QR/copy initial state, non-authorizing
   derivation results and async wallet/plan checks.
3. The same file incorrectly required `intent.serviceFee!==null`, although
   existing construction includes a fixture service fee. Require its presence
   and exact amount AND output script binding instead. Funding implementation
   was not changed.

## Validation

Run from repository root:

```sh
npm --prefix Professional/browser-integration run build
node --test Professional/public-date-planner.test.mjs Professional/retail-plan-bridge.test.mjs Professional/jade-address-check.test.mjs Professional/retail-calendar-cltv.test.mjs Professional/gift-edit-gate.test.mjs Professional/unsigned-cltv-psbt.test.mjs Professional/recipient-integration-boundary.test.mjs
BC1Q21_TEST_CHROMIUM=/usr/bin/chromium PYTHONDONTWRITEBYTECODE=1 python -B -m unittest discover -s Professional -p 'test_*.py'
```

The existing browser journey test accepts `BC1Q21_TEST_CHROMIUM` as an optional
executable override; its default remains Playwright's bundled Chromium. The
new planner browser suite uses installed system Chromium by default. No browser
or package was installed for this phase. Browser tests use isolated profiles,
loopback pages and disposable public planning data; planner checks reject
external requests and failed planner resources. The Add Funds handoff also
checks for browser errors, failed resources and accidental external requests.

For manual acceptance, serve only `Professional/` locally:

```sh
python -m http.server 8766 --bind 127.0.0.1 --directory Professional
```

Open `http://127.0.0.1:8766/retail-mirror/index.html`. Create equal/manual,
monthly/yearly or one-time public-date plans, review exact sats and estimated
fees, approve into Add Funds, then return and edit to verify invalidation.
Do not import a real wallet, fund, sign or broadcast. Review this phase before
starting any subsequent engineering phase.

Observed validation on 2026-11-08: 52 focused Node tests passed; the documented
calendar-rollover script passed; Python discovery passed 38 tests, including
six new planner browser checks and seven existing browser-journey checks using
system Chromium. No failures in these selected suites. The full Node suite,
legacy encrypted-date recovery, live Core and hardware acceptance were not
run. The verifier bundle was rebuilt successfully before the review-branch test
run. It remains a generated, excluded artifact; existing browser-journey tests
require that build (dependencies must be installed in `browser-integration`); the new planner suite's planner resource graph does not require it.
The planner is ready for manual browser acceptance of the supported public-date
BTC equal/manual workflow, with the compatibility blockers above remaining open.

## Static HTTP Review repair (PR #1)

Owner Windows/Brave acceptance reported an inert Review button. The owner also
confirmed that the USD estimate and 'Plan changed' feedback appeared, which
rules out a complete module-loading failure in that session.

Reproduced defect on Linux Chromium against an actual subprocess running
`python -m http.server`, with no request interception: after rendering the
owner's exact 0.00100002 BTC / five yearly releases / 2030-01-02 schedule,
a delayed `change` event for an unchanged date cleared the review and restored
'Plan changed' without an error. The original handler revoked state for every
input/change event, regardless of whether values changed. This is a confirmed
controller defect; the precise native Windows/Brave event sequence has not
been observed, so owner retesting is still required to confirm it explains
that session's symptom.

The controller now compares input snapshots, including the values actually
reviewed, and ignores redundant events. Actual edits still invalidate approval.
Review invokes the local review function directly with a `type=button` control;
Enter in a text/number/date input uses the same function without a native form
navigation. This removes reliance on native submission under `form-action
'none'`, without relaxing CSP. Validation feedback is beside Review and scrolled
into view. Review and approval start disabled; a static visible startup message
remains if modules/JavaScript cannot initialize. A deliberately incorrect .mjs
MIME mapping reproduces that separate startup failure, now visibly locked;
it is not asserted to be the owner's root cause given their working estimates.

`test_planner_static_http_browser.py` adds four real static-server browser
checks: exact reported schedule plus delayed/duplicate events and Enter,
visible validation feedback, disabled JavaScript, and incorrect module MIME.
The pre-repair code failed the duplicate-event and locked-startup checks. The new test uses the standard Python HTTP server on loopback, with no
Playwright request routing; Windows MIME misconfiguration is explicitly
simulated on Linux. No Windows, Brave, hardware or Core verification is claimed.

Repair validation: 52 focused Node tests and 42 Python tests passed, including
17 browser tests (four new real static-HTTP checks). Calendar-rollover checks
and `git diff --check` passed. CSP remains unchanged. No merge, deployment,
Retail access or new hardware/funding functionality is part of this repair.

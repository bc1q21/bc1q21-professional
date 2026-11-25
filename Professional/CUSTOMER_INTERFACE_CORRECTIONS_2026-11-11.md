# Seven-item customer interface correction pass — November 11, 2026

Scope: Professional development, existing PR #2 branch
`professional/restore-approved-professional-ui`, starting at `3df8c02`.
Customer acceptance remains pending. No merge, deployment or payment activation.

## Impact assessment and authoritative references

The preserved Retail Pico/style assets supply the compact control metrics:
16/17/18/19/20px font breakpoints; .75em vertical and 1em horizontal padding;
1px borders; .5em choice gaps; 72px currency-button minimum; 140px primary
navigation minimum; Back/Continue aligned at opposite ends of the row.
Retail index blob `c9235161ae8d0f68d936fd495546d338d97949e9` was inspected
read-only. The owner's November 11 explicit selection followed by Continue
supersedes its immediate-branch handlers. The frequency dropdown is retained
as requested, in the reference's count/frequency grid and date arrangement,
collapsing below 780px. No Retail file was changed or downloaded into the app.

The actual Nov 10 code defaulted to Multiple dates/equal and advanced on the
choice click. This pass removes those defaults and immediate transitions.
Choice buttons update selection; Continue validates and advances. Back retains
explicit choices. Old drafts lacking `decisionVersion:2` do not establish a
customer choice; amounts, dates, manual text and branding remain recoverable.

`customer-controls.css` scopes shared metrics to decision/navigation controls,
including identity, planner, Add Funds, Jade and Finish. It explicitly prevents
flex growth and mobile stacking of choice buttons and Back/Continue. Long
navigation labels are shortened with descriptive aria-labels. It also prevents
the funding help group overflowing a narrow viewport. No diagnostic signing or
transaction buttons are enabled. Original asset bytes remain unchanged.

Each customer page loads the shared stylesheet with SHA-384 SRI, and its Git
attribute preserves exact bytes on Windows. Shell CSP style policies permit
only the new same-origin stylesheet in addition to their existing inline CSS.
Planner connect-src remains none. A blob-only frame directive supports a future
hash-verified, embedded approved PDF; there is no external document fetch.

## Disclaimer boundary

The shipped `disclaimer-policy.mjs` is development mode with `terms:null`.
Its pending document and acknowledgement remain disabled. Development-only
Continue is explicitly labelled as unfunded navigation and records no legal
acceptance in storage or on a server.

The separate gate supports a future trusted production build policy containing
an approved PDF's base64 bytes, SHA-384 digest, revision and separately approved
acknowledgement text. Nothing in a URL or browser storage selects this policy.
Production navigation stays locked until the PDF bytes/header/digest are
verified and the user explicitly checks that revision's acknowledgement.
Missing, malformed, altered or unapproved artifacts and unknown modes fail
closed. Unchecking or preparing a new artifact clears acceptance. Welcome,
review and final approval handlers all enforce the gate, including synthetic
click/submit attempts. Reload requires fresh acceptance.

Only synthetic bytes/wording are used by tests, via intercepted test policy
responses. No synthetic or Retail/proprietorship terms are shipped as approved
Professional terms. This is a client navigation gate, not a legal opinion,
production release or a server-side consent/audit implementation. Approved
Professional legal content and production consent policy remain separate work.

## Seven-item verification evidence

`test_customer_interface_corrections.py` checks each item independently:

| Item | Evidence |
| --- | --- |
| 1. Disclaimer | `test_01`: pending controls/no acceptance; production fixture requires explicit acceptance; hidden review/final navigation cannot bypass it. Additional malformed/missing/tampered test and three Node gate tests. |
| 2. BTC/USD | `test_02`: compact same-row bounds, reference gaps/padding/borders, selected colors and exact 100,002-satoshi round trip. |
| 3. Gift choice layout | `test_03`: same-row bounds at 1440/768/390/320px, compact widths and explicit selected state; clicking does not advance. |
| 4. Gift selection | `test_04`: neither selected initially; disabled Continue and synthetic-click guard; explicit choice then Continue; Back/reload preserve the choice. |
| 5. Dates | `test_05`: dropdown options and grid/date spacing, responsive arrangement and ceiling; exact monthly/yearly overflow schedules. |
| 6. Equal/variable | `test_06`: neither selected; disabled Continue/guard; compact pair; equal remainder preserved; variable/manual exact totals and Back preservation. |
| 7. Navigation | `test_07`: reference font/padding/border/height, same-row alignment and disabled state on every planner screen, identity and downstream pages; locked Jade controls. |

Screenshots supplement exact computed-style/bounds assertions; merely rendering
a component is not accepted as a passing result. Tests use Linux Chromium.
Windows/Brave owner acceptance and hardware behaviour are not certified here.

## Existing-suite results and reproducibility

No dependencies were installed. Root Node tests were temporarily given access
to the already-installed browser-integration dependencies, identically for a
clean local archive of `3df8c02` and the current tree; the temporary symlink was
removed afterwards. No checkout/branch or source test was modified to make
these baseline comparisons pass.

- Baseline full root Node suite: 66 files, 246 tests, 234 passed, 12 failed.
- Current full root Node suite: 67 files, 249 tests, 237 passed, the same 12 failed.
- Focused planner/security/gate suite: 63 passed, zero failed.

The 12 existing failures consist of three missing generated artifact-dependent
test files (`recipient-public-gift-regtest.json` / `five-funded-recipient-gift-regtest.json`),
the legacy test importing absent `Frontend/AESHelper.js`, and eight Core
snapshot assertions stopping at missing funding confirmations. Their failure
identities match the baseline. No fixtures are fabricated, no security check
is weakened, and this UI pass does not attempt to repair them.

The complete Python discovery suite includes the eight new interface/gate
tests, the existing financial/navigation/branding/QR tests and committed
Windows-archive checks. Final counts are recorded in the completion report.
The package contains all new local assets and modules, but no approved legal
artifact, signed transaction fixtures, wallet credentials or dependencies.

## Preserved behaviour and next preview

The financial core, amount/suggested adapter, date generator, fee calculations,
branding module and browser verifier source are unchanged. Inline scripts in
identity, funding, Jade and Finish are byte-identical to `3df8c02`; changes to
those pages are presentation/CSP stylesheet links only. All old hardware
evidence and commits remain. No real funds, hardware, signing or broadcast are
used, and both main branches and PR #1 remain untouched.

Reuse the existing Windows detached build folder and installed dependencies:
fetch the restoration branch, detach that build folder at the reported new
commit, then run `package-local-preview.py` with a fresh November 11 ZIP name.
Do not repeat npm installation or use the old hand-picked git archive command.
Stop the old loopback server, extract into a fresh directory, run the supplied
local-only launch script, open `http://127.0.0.1:8766/index.html` and hard-refresh.
See `LOCAL_PREVIEW.md` for the exact build workflow. Acceptance is the owner's
next step, not an engineering declaration of completion.

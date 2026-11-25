# Professional original appearance integration

November 10 update: customer decision controls and the located suggested
calculation are covered in [the focused follow-up](CUSTOMER_INTERFACE_RESTORATION_2026-11-10.md).
Earlier missing-source/disabled-feature statements below describe prior phases.

Development repository only: `bc1q21/bc1q21-Professional-Development`.
Branch: `professional/restore-approved-professional-ui`, based on PR #1 head
`57bff4e3d10860536f24d8c622f02a587b7f5fd8`. The planner branch, recovery branch,
main and PR #1 are not rewritten or merged. No deployment is authorized.

## Preserved sources

- Original Professional layout and branding source: baseline `d6e05a993140fbfc43d415136898fce558727dce`,
  especially `Professional/retail-mirror/index.html` and the existing identity,
  Add Funds, Jade and Finish pages.
- Recovered assets: commit `6892b56c0c81170bd7b88d7657a31a125c1f46a1` on
  `professional/restore-original-assets`, in this same private development repo.
  These are recovered once, not downloaded from Retail or recreated.
- Exact original bytes copied to `Professional/assets/original/`, with the same
  filenames. `ASSET_PROVENANCE.json` records source paths, Git blob identities,
  SHA-256 hashes and fresh SHA-384 integrity values. Pico's original MIT header
  and all original CSS/image bytes are retained.

The original stylesheet integrity values in baseline HTML do not match the
recovered bytes. Every stylesheet link in the planner has recalculated SHA-384
integrity, including the integration-only `planner.css`. Tests enforce both
byte identity and integrity values and exercise browser rejection of a tampered
CSS response. No SRI or CSP protection was disabled.

## Customer presentation

The existing identity page remains the entry, with its optional business name,
contact, address, email, phone and 250 KB raster-logo handling unchanged.
Its default logo, and those of Add Funds, Jade, Finish and the walkthrough, now
resolve to the recovered original PNG under Professional/.

The planner uses the original header, progress structure, teal section bar,
help-button treatment, cards, option-card selection, tables and Back/Continue
navigation. The existing logo/advisor/title header arrangement is restored,
including ALL advisor contact fields and discreet attribution. Business-only
profiles do not retain a prominent bc1q21 logo when no advisor logo is supplied.
Blank profiles retain the recovered default logo. Advisor fields are text, not
HTML, and logos are restricted to bounded PNG/JPEG/WebP data URLs.

The public planning panels follow the preserved planning sequence: welcome,
amount, gift type, release dates, equal/manual choice, optional manual entry,
review, then direct Add Funds navigation. One-time gifts bypass irrelevant
multiple-release controls. Back navigation retains entered values. There is no
second scheduler or duplicate developer handoff page. Native controls replace
unavailable legacy Alpine bindings; no old wallet runtime is loaded.

Load order is recovered Pico, recovered style.css, then a small Professional
integration stylesheet. The last layer provides native hidden-state guards,
white-label header placement, keyboard focus, responsive adjustments and the
original fixed-label scrollable tables. Mobile tables scroll inside their
containers; the entire page should not overflow horizontally. Light theme is
explicit as in the baseline. Reduced-motion preferences disable animation.

The identity and Add Funds page styles/behavior are otherwise preserved; Pico
is not applied globally to those pages, avoiding an uncontrolled cascade change.

## Functional/security boundary

`public-date-planner.mjs` and `retail-calendar-cltv.mjs` are unchanged from PR #1.
Exact BTC parsing, all satoshi arithmetic, UTC calendar policy, dust/release
limits, remainder rule, fee estimates and public unfunded-plan format stay the
same. Review, input-snapshot deduplication, stale-approval checks, storage
failure behavior and back-navigation invalidation are retained. Stage movement
uses those same public validation functions; Enter advances or reviews without
native form navigation. Enter in a manual textarea remains a newline.

Only the public preview plan is transferred. Funding/signing/broadcast flags
remain false. Existing diagnostic funding/Jade behavior is not expanded or
made customer-authorized by this visual work. The generated verifier bundle
remains excluded from commits and is built locally for existing journey tests.

No legacy mnemonic, private-key, encryption, signing or production API code is
reintroduced. Historical CSS selectors for recovery/transaction panels are
cosmetic rules only; no corresponding private-operation implementation is
loaded. The planner's nine-resource graph resolves entirely within Professional/.
It has no base href, Alpine runtime, production requests or external assets.

## Explicit remaining limitations

- Original liability PDF/help video content is not available in this repository.
  The restored welcome states that the preview requests no legal acceptance;
  the help control retains the design but stays disabled. Nothing is fabricated
  or fetched from production.
- USD-entry conversion and suggested growth allocation remain unavailable as
  in Phase 1. The fixed $80,000/BTC development display and fee estimates are
  not market/transaction quotes.
- `bc1q21-logo-nt.png` and `giftbackground.png` are not referenced by this public
  planner or the recovered CSS and are not needed for this integration. Future
  gift-card generation is outside this change and has not been certified.
- The recovered assets and preserved structure are used directly, but exact
  pixel parity with every historical local preview is not claimed. The owner
  should review the combined restored interface in Windows/Brave before merge.
- No new Windows/Brave, hardware, live Core, funding, broadcast or complete
  recipient-lifecycle verification is claimed. Full Node-suite/legacy recovery
  tests remain outside the selected regressions.

## Reproducible validation

From the repository root, with existing browser-integration Node dependencies
and Python Playwright installed:

```sh
npm --prefix Professional/browser-integration run build
node --test Professional/original-visual-assets.test.mjs Professional/public-date-planner.test.mjs Professional/retail-plan-bridge.test.mjs Professional/jade-address-check.test.mjs Professional/retail-calendar-cltv.test.mjs Professional/gift-edit-gate.test.mjs Professional/unsigned-cltv-psbt.test.mjs Professional/recipient-integration-boundary.test.mjs
node Professional/test-retail-date-policy.mjs
BC1Q21_TEST_CHROMIUM=/usr/bin/chromium PYTHONDONTWRITEBYTECODE=1 python -B -m unittest discover -s Professional -p 'test_*.py'
```

The restored-design tests exercise identity/default/advisor branding through
planner, Add Funds, Jade and Finish; logo validation; text-safe fields;
keyboard/stage navigation; hidden panels; 1440, 768, 390 and 320 pixel layouts;
resource errors and accidental external requests; and actual stylesheet SRI
rejection. Existing planner regressions drive the restored customer controls,
not a state-injected mockup, retaining exact equal/manual and stale-state checks.
Optional `BC1Q21_VISUAL_OUTPUT` saves local screenshots to a scratch directory;
those screenshots are not build assets and are excluded from commits.

For owner acceptance, serve only Professional/ on loopback:

```sh
python -m http.server 8766 --bind 127.0.0.1 --directory Professional
```

Open `http://127.0.0.1:8766/index.html`, leave identity blank or use fictional
advisor details, then follow the restored planning stages. Test 0.00100002 BTC,
five yearly releases from 2030-01-02: 20,001/20,001/20,000/20,000/20,000 sats;
100,002 total; 103,752 estimated deposit. Test manual amounts and invalidation
on edits. Do not import a real wallet, fund, sign or broadcast.

This integration is submitted as a separate stacked PR targeting the existing
planner branch so its visual changes can be reviewed without rewriting PR #1.
Any eventual retarget, merge or deployment requires separate owner approval.

## Windows ZIP stylesheet regression

Reproduced using `git -c core.autocrlf=true archive`: Git converted all three
integrity-protected stylesheets to CRLF. Their paths and HTTP 200 responses
were correct, but their changed bytes failed SHA-384 integrity verification.
The identity page retained its inline styling, explaining the difference
between the entry page and planner. This reproduces Windows-style Git export
behavior on Linux; execution in Windows/Brave is still owner acceptance work.

`Professional/.gitattributes` now disables text conversion for exactly those
three stylesheets, preserving original bytes and existing integrity values.
Neither CSP nor SRI is relaxed. A fresh export from the repaired revision is
required; reloading an old ZIP's extracted files cannot repair their bytes.
The archive regression checks both Git newline settings and serves the actual
Windows-style export over loopback HTTP, following identity into the planner,
checking CSS responses, computed styling, logo and exact schedule totals.

Read-only baseline inspection also located the original `getHelpUrl()` link
in `d6e05a9:Professional/retail-mirror/index.html`, plus camera-enabled creator
and recipient diagnostic iframes. Their preserved sources include
`professional-creator-prototype.html`, `recipient-gift-specific-prototype.html`,
`funding-workspace.html` and `jade-signing-workspace.html`. These implementations
are not lost and are not rebuilt or enabled by the stylesheet repair. Original
help content/runtime availability remains the limitation described above.

Observed integration validation: 56 focused Node tests passed; 51 Python tests
passed, including 26 browser tests; calendar rollover checks and verifier build
passed. The staged diff check passes for application/tests/docs. The full check
reports three trailing-whitespace warnings in the recovered original style.css
(lines 230, 231, 471); those upstream bytes are intentionally preserved and
covered by the original-blob identity test rather than reformatted. Screenshots at desktop/tablet/phone widths and
with advisor/default branding were inspected on Linux Chromium. All three
recovered Git blob identities match; all three stylesheet SRI values match.
The browser negative test confirms tampered CSS is rejected. A canceled default
logo request during replacement by an already-loaded advisor data image is
explicitly distinguished from missing files; genuine HTTP errors and other
resource failures remain test failures. No Windows/Brave visual certification
or merge/deployment approval is implied.


## Focused customer acceptance follow-up

The schedule and final Plan ready totals now occupy separate screens, following
baseline `prefilled_equal_table` / `finish_schedule` presentation. The original
Back/Continue button classes, colors, opposing placement and primary minimum
width are retained, with explicit consistent control sizing. Final Continue
approves only an unfunded public plan and goes directly to Add Funds. There is
no extra developer handoff. Native state revalidates using the unchanged
`createPublicPlan()` before entering final review and again before approval;
Back clears downstream state and rebuilds the schedule. Duplicate input/change
handling and storage-failure locks remain intact.

Fee rows restore the original base/per-additional-date and distribution/per-
release explanations. All totals still come from `previewFees()`; USD uses the
existing fixed development display. These are explicitly estimates rather than
payment requests or final transaction quotes.

`package-local-preview.py` builds the existing browser verifier and packages an
explicit allowlist, including its generated bundle, so Add Funds no longer has
a missing script in the complete local preview. It validates CSS SRI before
writing the ZIP. Generated JS/ZIPs remain local build outputs, not commits.
`LOCAL_PREVIEW.md` documents build/run steps and the existing public-only xpub
regression fixture. The package browser test follows identity/planning/final
review/Add Funds over actual HTTP, derives the existing diagnostic regtest
address, independently decodes the QR and verifies the address match and false
authorization flags. It rejects non-regtest QR input and checks wallet-edit
invalidation and locked transaction/Jade controls. No Core service, signing,
broadcast or physical wallet is used. This demonstrates an address QR, not an
authenticated payable wallet or a funded gift.

The known Retail/proprietorship legal PDF is deliberately not installed or
accepted as Professional terms. `LOCAL_PREVIEW.md` preserves the intended
embedded/open-document presentation and fail-closed acceptance requirements
for later approved legal integration. Suggested allocations remain disabled
pending original approved calculations. Neither item is represented as ready
for customer beta.

Follow-up validation: 56 focused Node tests; 56 Python tests (including the
three new final-review/package tests); date-policy checks; desktop/tablet/phone
layout checks at 1440/768/390/320px. Linux Chromium screenshots were inspected.
Windows/Brave package execution and hardware behavior remain unverified.

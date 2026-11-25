# Customer decision-sequence restoration — November 10, 2026

Professional development repository only. Based on `ff6aa42`, on the existing
`professional/restore-approved-professional-ui` branch / PR #2. Neither main
branch, PR #1, recovered original assets nor Jade implementation is modified.
This is an unfunded local acceptance preview, not beta approval or deployment.

## Assessed sources and boundaries

The owner authorized read-only inspection of the relevant Retail sources before
implementation. No Retail clone, write or production request was performed.
Professional baseline `d6e05a9` was compared with these GitHub source blobs:

| Retail path under Frontend/ | Inspected blob |
| --- | --- |
| index.html | c9235161ae8d0f68d936fd495546d338d97949e9 |
| SchedulePlanner.js | 8678771c7292e47532fc252640c75dca26c20577 |
| NavigationManager.js | cd9f8a57b1f82ec50642ff33094a156f3d3f013c |
| PriceManager.js | 218420d4cee3d521e8e81511804c463ced22772c |
| bc1q21-h08.js | 6e083012f5fa8b477b533fe4daab24c2cd5cdf6b |
| alpine-csp-adapter.js | 4ff611105dc5d0a37b6b1913a3be70e0bf6784de |

The reference is inspected source, not certification of the production site's
deployed revision. Only the public `createEqualUsdSchedule` calculation is
retained in inert `reference/retail-suggested-allocation.json` for differential
tests. No Retail runtime, wallet, encryption or recovery code is imported into
the browser. No live price endpoint is used. The reference JSON is not packaged.

## Customer controls restored

- Welcome retains Professional's hardware-wallet security pledge. The original
  document-area shape, open-document control and acceptance position are
  reserved with a clear pending-review placeholder and disabled controls. The
  Retail/proprietorship PDF is not installed. Development continuation records
  no acceptance. A customer release still requires approved Professional terms
  and a fail-closed, version-aware acceptance gate.
- BTC/USD choice uses the existing $80,000/BTC development quote. Integer
  satoshis remain authoritative. USD is parsed using decimal integers and
  rounded to nearest satoshi (positive half-satoshi rounds up), consistent with
  the reference's eight-decimal conversion intent, without binary-float drift.
  Unit switching preserves the exact amount rather than reconverting the
  rounded two-decimal display. Invalid amounts cannot advance.
- Gift-type buttons branch immediately. Multiple dates lead to equal/variable
  choice buttons. Equal opens the schedule immediately. Variable opens the
  separate manual/suggested selection, then manual entry or growth guess.
- Manual entry restores target/current totals, approximate development USD,
  exact difference feedback and Back navigation. Prefill uses Professional's
  exact equal schedule, avoiding the reference manual-prefill rounding loss.
- Suggested choice leads to the original optional growth guess and chips,
  hypothetical projections, schedule, then the separate Plan ready screen.
  One-time gifts retain the existing explicit Professional schedule and final
  approval boundary rather than skipping directly to final review.

## Financial and authorization impact

`public-date-planner.mjs` and `retail-calendar-cltv.mjs` are unchanged. The new
isolated adapter delegates equal/manual plans to that existing model and
suggested outputs to its strict public-plan validator. Dust, supply/release
limits, increasing dates, exact totals, fees, calendar rollover and unfunded
authorization flags are retained.

Do not copy current Retail's monthly clamping or equal-plan last-row remainder:
these differ from Professional's validated overflow calendar and earliest-row
equal remainder. Retail's more permissive manual tolerance is not adopted.

Suggested calculations retain the located reference model: annual compounding,
365.25-day years, inverse projected-price weighting for equal projected USD,
eight-decimal BTC rounding, and last-row remainder. Professional dates are
supplied explicitly. A projection reference timestamp is frozen in the draft
so review/approval do not drift with the clock. The last-row integer correction
must match the reference result; otherwise the plan is rejected, not silently
reallocated. Nonfinite projections, dust and unsafe rounding remain unsupported.

Input/change deduplication remains. Monetary/strategy edits revoke downstream
state. Both final-review entry and approval recalculate and compare the public
plan. Back from the schedule returns to the preceding decision; Back from final
review clears downstream authorization and rebuilds the schedule. Storage
failure and startup/module failure remain fail-closed.

## Validation and preview packaging

`planner-amounts.test.mjs` checks USD boundaries/lossless toggles, golden suggested
vectors and 270 reference combinations covering dates, periods, counts, growth
and totals. Accepted results must match the pinned calculation exactly; unsafe
reference results must be rejected. Existing equal/manual/calendar regressions
and security/resource graph checks remain.

Browser tests drive the actual decision buttons, manual/growth routes, USD
entry, reload, keyboard controls, stale approvals and pending legal state.
Desktop/tablet/phone layouts cover 1440/768/390/320px. The complete allowlisted
ZIP includes the new calculation adapter and existing generated verifier;
it excludes test references, wallet/transaction fixtures and dependencies.
Its real-HTTP test retains the regtest-only diagnostic QR and false authorization
checks. Windows-style Git export integrity is checked separately against the
committed revision. SHA-384 for the modified adapter stylesheet is recalculated;
recovered asset bytes, SRI and CSP are not relaxed.

No dependencies were installed, assets recovered, hardware retested, funds used,
signatures requested or broadcasts performed. Windows/Brave owner acceptance,
Professional legal approval and authenticated funding integration remain open.
Older handover statements that suggested allocation source is unavailable are
historical and superseded by this source assessment and isolated implementation.

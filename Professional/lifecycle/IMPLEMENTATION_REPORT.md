# November 11, 2026 — Bitcoin lifecycle implementation

Repository: `bc1q21/bc1q21-Professional-Development`.
Base: `8de1af26460a8732307fa0cfc8d7b238276a62d8` (PR #2).
Feature branch: `professional/complete-regtest-lifecycle`.
Implementation commits: `2fbf8a0` (baseline regressions and mempool-aware reads),
`0ee424a` (integrated lifecycle). Public evidence/report follow separately.

PR #1 and #2 were checked open/unmerged; their heads remain `57bff4e` and
`8de1af2`. No main branch, Retail file, production configuration, real wallet,
physical hardware or live Bitcoin service was modified/used. Retail source was
inspected read-only as authorized. No dependency installation was performed.

## Result and scope

A complete **actual Bitcoin Core regtest** lifecycle is demonstrated, not just
mock policy acceptance: deposit, confirmed creator distribution, offline software
signing, signature checks, premature claim rejection, individual/accumulated
claims, confirmed recipient receipts, independent recovery and exact accounting.

The customer browser is still development-only. This is an integrated local
engineering coordinator/runner, not an enabled web payment system, production
backend or beta authorization. No real-Bitcoin funding/signing/broadcast path was
enabled. No claim of new physical Jade or Windows acceptance is made.

## Financial result

Five gross releases: 20,001; 20,001; 20,000; 20,000; 20,000 sats.

| Item | Sats |
|---|---:|
| Deposit received | 103,752 |
| Locked principal | 100,002 |
| Service output | 2,000 |
| Creator mining fee (approved Retail quote) | 1,750 |
| Creator change | 0 |
| Claim mining fees | 1,826 |
| Confirmed beneficiary receipts | 98,176 |
| Remaining gift principal | 0 |

`100002 = 98176 + 1826`; `103752 = 2000 + 1750 + 1826 + 98176`.
The external depositor separately paid 282 sats to send the deposit; that is
recorded outside the received gift amount. Total external sender outflow in this
fixture is 104,034 sats including that separate deposit transaction fee.

The 1,000 + 250-per-additional-date service formula and 500 + 250-per-release
normal fallback remain unchanged. Retail's optional public-rate quote heuristic
is also covered. Transaction size is independently bounded, but does not silently
replace the approved mining quote with a new refund/reserve model. Claim fees
come from the gross claim. Dust change is explicit; accumulation remains possible
when a release cannot be economically claimed alone. No net-recipient guarantee.

An initial engineering run used a size-only creator fee; source review caught
that difference from Retail, and it was corrected **before the implementation
commit**. Only the final quote-preserving result is checked in as evidence.

## Actual Core evidence

See `regtest-evidence.json` for all public transaction IDs, releases, fees,
intermediate ledgers, final chain tip and assertion outcomes. Fresh random wallets
produce new txids on rerun; no private/signed fixture is checked in.

- Deposit: `bf0774eaf0a214ff6dc15b06ac6bb113f535bb9bce49356c50bf1c1c8259a575`.
- Creator: `f6df3e1bcdbf9fc2fe8b48f65f246601993c353e835a8e807b98b393afe8d6ae`.
- Creator block: `4fecc0db5b61648316ddb4c36f12f10ed8c22e610f4c59a0a5b5b0d523de3a89`.
- Release [1]: `342514f6270f5ae5bcac1d29c12f0c2eceabccab47c6f76408982c30644612e2`;
  398 fee, 19,603 payout. **The identical txid was rejected `non-final` before
  maturity and accepted/confirmed afterward.**
- Releases [2,3]: `d60609acd9d09998fe890c0383a574e3d4a3c9cd8a647bfcfd097d8117ce67a4`;
  714 fee, 39,287 payout.
- Releases [4,5]: `ce5823ebe0fe750e3bd14436a0eaf95af97221461f72e1034e6d0a7e9e8c7ac1`;
  714 fee, 39,286 payout.

The chain uses custom UTC dates January 2–6, 2030 and explicit mock-time/block
advancement to exercise all maturities. Maturity uses Core median-time-past,
not wall-clock time. Containers and disposable wallets were removed afterward.
These txids cannot be queried on a public explorer; they belong to this discarded
isolated regtest chain. Reproduce with the committed acceptance runner.

## Reuse and air-gap changes

Exact Retail source blobs and behavior mapping are in `SOURCES.md`.
Reused Professional planner, amount/calendar modules, funded intent, creator
PSBT builder, CLTV checker, signed-creator verifier/finalizer, Core evidence
collector, and Jade BC-UR transport. Planner/calendar/branding/Jade workspace
files are byte-identical to reference `8de1af2`.

New multi-input claim construction supports individual or accumulated matured
outputs and preserves Retail's CLTV script, maximum selected timestamp,
non-final RBF sequence and gross-principal fee deduction. Every signature and
exact transaction/prevout/origin/output is checked before Core submission.

Instead of Retail's online WIF signing and preliminary signed fee estimate,
Professional transfers PSBTs to a separate network-disabled software fixture,
reconstructs the financial intent there, then independently checks the returned
signatures online. Conservative signature-size bounds avoid a second offline
round. This can cost a few extra sats compared with Retail's measured estimate;
exact approved claim fees are visible before signing. No Retail private-key or
mnemonic browser code was copied. The exact AES helper is test-only compatibility
reference, excluded from customer code and preview packaging.

Wallet roles require distinct valid public keys, independently pinned bundle
digest and possession proofs. The lab's random per-run wallet is disposable.
These proofs are not legal identity verification or hardware-origin attestation.
Plan edits invalidate stored authorizations; replay/concurrent submission and
mutable public-return objects cannot rewrite a stored approval. An ambiguous
submission consumes the request and requires reconciliation rather than retry.

## Lifecycle readiness

| Stage | Demonstrated now | Remaining boundary |
|---|---|---|
| Plan/conversion/allocation/calendar | Existing calculator suites pass unchanged | Market quote service is not enabled |
| Create/scripts/fees/PSBT | Actual regtest distribution, independent binding | Production service registration/configuration |
| Fund/detect/confirm | Actual deposit; coherent confirmed outputs; mempool-aware spends | No enabled customer funding backend |
| Offline signing/returned verification | Separate network-disabled software signer; creator and accumulated-claim QR codec round-trips | New Jade/device/operator acceptance not authorized/performed |
| Release/maturity/broadcast/confirm | Core rejects early claim, confirms all five releases through three claims | No mainnet/production broadcast capability enabled |
| Recovery | Clean process and public record; offline backup removed/restored before claims | Requires public manifest + offline key backup; not mnemonic-only Retail discovery |
| Reconciliation | Actual prevouts, outputs, confirmed claims and final beneficiary UTXOs | Operational multi-user monitoring/reorg handling before customer integration |

## Regression results

- `node --test Professional/*.test.mjs`: **273 passed, 0 failed, 0 skipped**,
  using the already-installed browser dependency set through a temporary local
  `Professional/node_modules` link. Includes 14 new lifecycle tests and a new
  mempool-spend regression. Link is not committed and is removed after testing.
- `BC1Q21_TEST_CHROMIUM=/usr/bin/chromium python -m unittest discover -s Professional -p 'test_*.py'`:
  **76 passed, 0 failed**, including actual static HTTP browser journeys,
  desktop/mobile, branding, approvals/invalidation and allowlisted packaged ZIP
  resource/QR checks. The initial command without this environment setting
  failed to locate Playwright's default browser and caused cascading setup errors;
  specifying existing system Chromium fixed the environment without installing.
- `node Professional/lifecycle/run-regtest-lifecycle.mjs <evidence-file>`:
  **all assertions passed on actual Core 28**, including unconfirmed funding,
  premature claims, reorg rejection, approval invalidation, replay, mempool double
  spend rejection, offline backup restoration and clean-process recovery.
- Existing verifier bundle build passed (deprecation notice only). Generated
  bundle, dependencies, temporary ZIPs, wallets and unrelated `work/` excluded.
- `git diff --check` passed. No CSS, planner financial formulas, calendar policy,
  branding or existing hardware signing implementation was changed.

### The 12 pre-existing Node failures

1. Three modules required absent locally generated public artifacts (one also
   assumed a running Core endpoint). Replace that setup with deterministic,
   unsigned in-memory unit fixtures; retain all negative/security assertions.
   Genuine on-chain behavior is now separately exercised by the live acceptance
   runner. Unit fixtures explicitly do **not** claim blockchain evidence.
2. One module imported absent `../Frontend/AESHelper.js`. Vendor the exact
   inspected artifact under `Professional/compat/`, verify its original Git blob
   hash, and use it only in offline compatibility tests.
3. Five snapshot and three HTTP integration assertions had incomplete Core mocks:
   missing transaction confirmation depth and active-tip confirmation count.
   Correct mock evidence rather than removing the hardened collector checks.
   Additionally, `gettxout(..., true)` now excludes mempool-spent outputs.

## Exact changed files (all under Professional/)

Baseline/test repair:
`compat/SOURCES.md`, `compat/retail-AESHelper.mjs`,
`fixtures/recipient-unit-fixture.mjs`,
`complete-recipient-regtest-release.test.mjs`, `core-readonly-snapshot.mjs`,
`core-readonly-snapshot.test.mjs`, `customer-recipient-handoff.test.mjs`,
`inspect-five-funded-regtest-releases.test.mjs`,
`local-regtest-core-snapshot.integration.test.mjs`,
`retail-generated-offline-date-compatibility.test.mjs`.

Lifecycle/integration:
`README.md`, `browser-integration/browser-verifier-entry.mjs`,
`funding-workspace.html`, `public-service-output.mjs`, `lifecycle.test.mjs`,
`lifecycle/public-model.mjs`, `lifecycle/coordinator.mjs`,
`lifecycle/disposable-offline-signer.mjs`, `lifecycle/local-core-lab.mjs`,
`lifecycle/offline-transfer.mjs`, `lifecycle/recover-public.mjs`,
`lifecycle/run-regtest-lifecycle.mjs`, `lifecycle/README.md`,
`lifecycle/SOURCES.md`, `lifecycle/regtest-evidence.json`,
`lifecycle/IMPLEMENTATION_REPORT.md`.

The existing unsigned browser diagnostic now requires an explicit disposable
service public key instead of an unowned synthetic script; edits invalidate its
review. It remains non-authorizing. This is the only customer-adjacent functional
change; no cosmetic work was undertaken.

## Blockers and next controlled acceptance

The next acceptance is review/rerun of this **software/regtest** workflow, using
`lifecycle/README.md`. The Linux Docker lab has not been verified on Windows;
no new installation or Windows troubleshooting is requested of the owner.
The ordinary Windows static preview remains supported but does not expose these
trusted coordinator operations or demonstrate the lifecycle by itself.

Before a beta or any real Bitcoin: separately approve and perform Jade signing
of these exact new creator/accumulated claim requests, establish authenticated
recipient custody and recovery-record delivery, implement/review durable trusted
multi-user authorization/key allocation and operational handling, register an
approved service wallet, resolve legal review, and complete security review.

**Material recovery limitation:** recovery without the website is implemented,
but requires the portable public manifest plus offline key backup. Retail's
mnemonic-only encrypted OP_RETURN discovery is not equivalent and is not claimed.
It requires an approved offline metadata protocol, not fabricated device AES
support or online seed handling. Existing encrypted Retail gift import remains
unsupported. Do not activate it or real funding implicitly.

No merge, deployment, hardware test or real-Bitcoin beta has been authorized or
performed. Stop for owner review of this implementation and its limitations.

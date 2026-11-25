# Jade Plus historical reuse and PR #3 compatibility

**November 12 update:** the confirmed TEF coin-type-0 origin is now explicitly supported for isolated regtest. See [origin resolution](TEF_ACCOUNT_ORIGIN_RESOLUTION.md). The earlier coin-type-1-only restriction below records the previous implementation, not a Bitcoin chain requirement.

November 11, 2026. Baseline: `bc4a552920c22c796ee160ecb1f24b1468e9df47`.
Work remains on `professional/complete-regtest-lifecycle` / PR #3.
The supplied archive and historical signed/public-wallet artifacts are kept
outside the repository. This report contains findings and content hashes only;
no historical signature, PSBT, wallet public key/fingerprint or archive is added.
Instructions embedded in the HTML are historical test material, not new authority.

## Archive findings

Outer ZIP SHA-256:
`a9721227607f7a36c8171652366c6627d8b8b32b2cfedde05ce5069e691b614b`.
Eight outer entries, including one nested ZIP with one self-contained receiver.
All inspected as data; no historical JavaScript or CDN code was executed.
Eighteen embedded PNG QR images were independently decoded with jsQR and
reassembled with the existing BC-UR decoder.

| Artifact | Finding | Reuse |
|---|---|---|
| `bc1q21-jade-synthetic.psbt` | 283-byte unsigned legacy CLTV; funding txid byte order is reversed relative to its included previous transaction | Negative evidence only; never present this old request as corrected |
| `bc1q21_Jade_Synthetic_PSBT_Animated_QR.html` | Five PNGs decode exactly to that same defective PSBT | Reuse presentation pattern, not its payload |
| `bc1q21_Jade_CLTV_Corrected_Animated_QR.html` | Five PNGs decode to corrected 283-byte PSBT; funding prevout txid matches | Correct framing/byte-order reference |
| `bc1q21_Jade_Signed_PSBT_QR_frames.txt` | Nine saved frames decode to 390-byte signed PSBT; exact corrected unsigned transaction and ECDSA SIGHASH_ALL verification pass | Verified signed-return transport/reference; do not reuse signature for a new transaction |
| `jade-synthetic-signed.psbt` | Separate 388-byte signed experiment; does NOT match corrected animated request | Match only to nested receiver's embedded unsigned fixture |
| Nested `synthetic-jade-signed-qr-receiver.html` | Bundled offline decoder/verifier; embedded 281-byte unsigned fixture matches that 388-byte signed PSBT and passes existing ECDSA verifier | Reuse local bundled capture/file-verification approach, remove fixed fixture |
| `bc1q21_Jade_Signed_PSBT_QR_Capture.html` | Transport capture and download; dynamically loads jsQR from jsDelivr; capture alone is not verification | Reuse controls/saved-frame format, replace CDN with existing local bundle; retain crypto-psbt-only acceptance |
| `two-release-calendar-recipient-preview-camera-fixed.html` | Displays 100,000 + 200,000 sats; eight QR images contain **one input** claiming 99,000 from the first 100,000-sat output; timestamp is November 14, 2023 UTC | Calendar presentation reference, not proof of two-input/accumulated hardware signing; static funding assertions are not current Core evidence; its camera code also loads jsQR from a CDN |

Corrected unsigned SHA-256:
`ee120308ac348227d0f249662ed52108c0ca4f183be6baa9517d7caf35818544`.
Its decoded signed capture SHA-256:
`94f7594277da053fabb3a029c940c189f3aac32b21b23c152bbb4788703dcf96`.
Nested receiver unsigned SHA-256:
`e5cb330d34142c36108a85af4403865c035b21db1475eb715ffff38140a9e931`.
Matching signed file SHA-256:
`e6df69aaf007e2db2d81b4e4bd0d5dd1c41ed7731acca6418f6ccbe6bf42400e`.

Cryptographic verification proves the transactions were signed by the matching
keys. Device provenance/firmware is supplied by the reported historical test;
these files do not cryptographically attest Jade hardware or prove confirmation.

## Comparison with PR #3

- Same PSBT v0 format, compressed secp256k1 keys and legacy
  `<lock> CLTV DROP <pubkey> CHECKSIG` redemption script. The matched old signed
  examples use height 110; the calendar preview supplies a timestamp request,
  but the archive supplies no matched signed return for that timestamp request.
- Historical signing uses coin-type-0 account paths. PR #3 intentionally uses
  regtest coin-type-1 public account paths. A hardened account cannot be relabelled
  or changed from coin 0 to coin 1 by public derivation. Existing preview import
  hardcodes coin 0 and remains read-only; it is not the new regtest import path.
- Old signatures have one input and sequence `0xfffffffe`. Current accumulated
  claims use multiple inputs and `0xfffffffd`, with locktime equal to the maximum
  selected release timestamp. Both are non-final, but they are different signed
  transactions. Preserve and verify the exact new sequence/locktime/prevouts.
- Creator native P2WPKH signing, coin-type-1 origins, multiple beneficiary keys,
  timestamp claims, accumulated claims, funded confirmations and physical backup
  recovery are not established by these old files.
- QR framing is already compatible: CBOR byte-string `ur:crypto-psbt`, historical
  60-byte fragments / 750-ms animation, current default 120-byte fragments.
  The new tools support both; successful local encoding is not an optical test.
- Existing exact creator signature verifier and CLTV finalizer remain authoritative.
  New return tooling calls those PR #3 financial/signature functions; it never
  makes a decoded camera frame a signing/broadcast approval.

## Implemented bounded adaptations

1. Shared bounded/canonical CBOR/crypto-psbt transport, saved-commented-frame
   import, case/duplicate handling, type/size/frame/fountain-count checks. Camera
   receiver reuses this decoder while retaining cancellation/race and track cleanup.
2. Optional 60-byte framing for existing offline transfer. A reusable generator
   makes self-contained unsigned PNG QR pages with pause/manual stepping and
   750-ms default, plus a locally bundled capture page with no CDN or fixed fixture.
3. Exact-request return CLI handles creator and accumulated claims. Independent
   fingerprint, reconstructed financial intent, every signature, origins and
   prevouts remain checked. Results explicitly confer no chain/broadcast authority.
4. Public Jade testnet account adapter retains and verifies public origin/depth,
   rejects private/master/seed exports, refuses coin-type coercion, and derives
   the existing PR #3 public roles. Cross-checked against the existing disposable
   BIP32 fixture; actual Jade export must still be tested.
5. Standard-PSBT key-possession proof bridge. PR #3's raw digest proof was a
   software-fixture mechanism, not a demonstrated Jade QR operation. The optional
   bridge retains independently pinned wallet identity and requires an exact,
   valid SIGHASH_ALL signature from **every** registered role. Existing proof mode
   is preserved. The synthetic proof has fake digest-bound outpoints; NEVER fund,
   submit or broadcast it. Actual Jade acceptance remains unknown; rejection must
   not be bypassed with flags or reduced proof requirements.
6. Each output review supplies regtest address and testnet display alias derived
   from the identical approved script. This handles a possible `bcrt1` / `tb1`
   display distinction without assuming arbitrary different addresses are safe.

No planner formulas, fees, calendars, recovery contract, branding, customer
payment authorization or existing Jade signed evidence was replaced.

## Automated evidence

- Full root Node suite: **283 passed, zero failed/skipped** (nine new compatibility
  tests and one secrecy-assertion regression on top of the prior 273).
- Existing Python/system-Chromium suite: **76 passed**.
- New actual HTTP browser test passed: generated PNG display, pause/step, mobile
  image, bundled capture, permission denial, virtual-camera signed QR capture,
  downloaded PSBT verification, camera cleanup, CSP and zero external requests.
- Historical evidence: both correct unsigned/signed pairs verified with the
  existing signature verifier; mismatched pair rejected; 18 embedded PNGs decoded.
- Full Core 28 lifecycle using the new standard-PSBT possession proof and a
  separate **software** offline signer passed. See
  `jade-compatibility-regtest-evidence.json`. Accounting remains:
  `103752 = 2000 service + 1750 creator mining + 1826 claim mining + 98176 receipts`.
- A full run exposed an unrelated flaky secrecy test: `/wif/i` matched a
  random public base58 address. Correct it to inspect forbidden secret fields
  and actual private-key encodings, add positive/negative regression vectors,
  and retain the strict public manifest schema and cryptographic checks.
- Verifier bundle build and diff checks passed. No dependencies installed.
- No new physical device, webcam optics or Windows/Brave acceptance was performed.
  No historical artifacts, generated pages, signed returns or wallet data are
  committed. New Core evidence is a public summary, not signed transaction bytes.

## Changed source and tests

`crypto-psbt-transport.mjs`, `recipient-jade-signed-camera.browser.mjs`,
`lifecycle/offline-transfer.mjs`, `lifecycle/jade-public-wallet.mjs`,
`lifecycle/jade-registration.mjs`, `lifecycle/jade-signed-return.mjs`,
`lifecycle/jade-compatibility.mjs`, `lifecycle/jade-capture.browser.mjs`,
`lifecycle/coordinator.mjs`, `lifecycle/disposable-offline-signer.mjs`,
`lifecycle/local-core-lab.mjs`, `lifecycle/run-regtest-lifecycle.mjs`,
`jade-compatibility.test.mjs`, `lifecycle.test.mjs`,
`browser-integration/test-jade-compatibility-browser.mjs`.
This report, physical acceptance procedure, README link and fresh public Core
summary document the work. Old archive, signed PSBTs and captured frames remain
outside Git and require separate review before any publication.

## Next owner action

Tell us whether the disposable Temporary Signer used for the previous tests is
still available on Jade Plus. Do not reset/restore a wallet, enter recovery words,
export a backup or sign anything yet. We will then obtain the current firmware
version and guide the public test-account export one step at a time.

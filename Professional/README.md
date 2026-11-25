# bc1q21 Professional

## Current application status

The accepted application is a browser-local, non-custodial **Regtest-only beta**.
Gift planning, transaction preparation, verification and signing coordination run
on the customer's device. Jade Plus signs offline through animated QR; recovery
words and private keys must never be entered into the Professional browser.

- Start the creator wizard at [creator.html](creator.html).
- Start beneficiary discovery and claiming at
  [recipient-gift-specific-prototype.html](recipient-gift-specific-prototype.html).
- See [public source status and security boundaries](PUBLIC_SOURCE_STATUS.md) for
  acceptance scope, recovery, licensing and deployment requirements.
- See [public-source testing](PUBLIC_SOURCE_TESTING.md) for the default test suite.
- The [lifecycle directory](lifecycle/README.md) also retains legacy engineering
  infrastructure. It is not the production customer architecture.

The recorded November 16, 2026 acceptance covered physical Jade Plus QR signing
and a creator-to-beneficiary redemption on isolated Windows Bitcoin Core Regtest.
It does not establish mainnet qualification or authorize real-Bitcoin payments.
The disclaimer PDF must load and be affirmatively accepted before continuing.

## Historical development notes

**Everything below is historical context, not current setup instructions or a
current feature/acceptance checklist.** References to pending legal acceptance,
unconnected payment flows, old branches or other repository directories describe
earlier work. They do not override the browser-local architecture above. Historical
acceptance does not need to be repeated merely because those notes say pending.

## November 11 correction pass

See [the seven-item scope, gate and regression evidence](CUSTOMER_INTERFACE_CORRECTIONS_2026-11-11.md).
Decisions now require explicit selection followed by Continue; legal acceptance
remains disabled in the shipped development preview. Customer acceptance is pending.

## Original appearance integration

The original CSS and logo recovered in the Professional development repository
are integrated with the independent public-date planner on
`professional/restore-approved-professional-ui`. See
[restoration scope, provenance and validation](ORIGINAL_APPEARANCE_RESTORATION.md).
This remains a development preview pending owner visual acceptance and merge approval.

## Isolated planner — Phase 1

The customer entry `retail-mirror/index.html` now uses independently maintained
local public-date planning code. It no longer loads `Frontend/`, wallet/signing
modules or production URLs. Equal/manual schedules retain the validated
Professional accounting/calendar rules. The November 10 customer restoration
adds BTC/USD entry and suggested allocations against a pinned, assessed public
Retail calculation reference; unsafe projections fail closed. See
[customer-interface scope and impact assessment](CUSTOMER_INTERFACE_RESTORATION_2026-11-10.md).
Professional legal approval and payment integration remain unavailable. See [Phase 1 inventory, boundaries and testing](PLANNER_INDEPENDENCE_PHASE_1.md).
Historical branch/repository references below do not override the current
isolated development repository or the user's execution boundaries.

## Isolation rules

- All Professional experiments live under `Professional/` on the `professional/isolated-release-prototype` branch.
- Do not edit retail `Frontend/`, `Backend/`, `Website/`, `Offline/`, deployment workflows, or production configuration.
- Do not merge to `main` or manually run production deployment.
- No real Bitcoin, production recovery words, private keys, or the owner's original Jade wallet in prototype testing.
- Treat signed PSBTs as sensitive transaction authorizations; never automatically broadcast a scanned QR.

## Existing code assessed

- `Frontend/TransactionManager.js` has `buildAndSignRelease({utxos, outputs, wif, locktime})`. It constructs legacy P2SH CLTV inputs and sets non-final sequences, but **requires a WIF private key and signs/finalizes immediately**. This is reference code, not a function Professional can call unchanged.
- `Frontend/CryptoManager.js` and `Frontend/CryptoUtils.js` implement current CLTV script and derivation conventions. Reuse script formats after independent checks; do not copy private-key handling into Professional.
- `Frontend/gift/gift-h08.js` handles the current recipient flow; do not modify it for this prototype.
- `Frontend/static/modules/btc-signer.js` bundles `@scure/btc-signer`, with Transaction and PSBT functionality. Assess API/version and hardware interoperability in isolated tests before selecting an implementation.

## Phase 1: unsigned PSBT builder (next implementation)

**Input:** network; explicit funding transaction hex (legacy nonWitnessUtxo); output index; expected prevout amount and P2SH scriptPubKey; CLTV redeemScript; BIP32 public key, master fingerprint and complete derivation path; locktime; recipient destination and amount; explicit fee policy.

**Checks before construction:**
1. Reject missing/invalid fields, negative or unsafe satoshi values, malformed txids, nonstandard locktimes, mixed block-height/timestamp locktime types, and final sequences.
2. Parse and verify funding transaction's actual txid, referenced output index, amount, and P2SH scriptPubKey. **Never** trust caller-provided prevout metadata without matching funding bytes.
3. Parse redeemScript as the intended `<locktime> OP_CLTV OP_DROP <compressed pubkey> OP_CHECKSIG` template. Verify script hash against funding P2SH output; verify public key and derivation metadata match the intended signer. Confirm locktime is not below the script requirement.
4. Use legacy `nonWitnessUtxo`, not a fabricated `witnessUtxo` substitute. Set transaction version 2, suitable non-final sequence, and explicit nLockTime.
5. Verify destination network, output values, fee calculation, dust/relay policy and recipient address. Never silently change destination or fee.
6. Encode PSBT v0 with correct input redeemScript and BIP32 public derivation metadata, and unsigned transaction. No private keys and no signing operation.
7. Decode the serialized PSBT again and independently assert all security-critical fields.

**Output:** PSBT bytes/base64 and a human-readable immutable transaction summary; do not broadcast.

## Phase 2: QR handoff and signed PSBT acceptance

- Animate PSBT as Jade-compatible `ur:crypto-psbt` frames; document interoperability and framing limits.
- Capture/decode returned signed PSBT without exposing seed words.
- Reject mismatched unsigned transaction, outputs, fee, locktime, outpoints, redeemScript, derivation or unexpected extra inputs/outputs.
- Verify the ECDSA signature against the correct legacy P2SH sighash and expected public key. Do not equate device display with independent verification.
- Finalize correct legacy P2SH scriptSig, independently verify Bitcoin script execution and policy acceptance, then require explicit user authorization before any broadcast.

## Phase 3: real network acceptance

- Use isolated signet/regtest funds, independently inspect final transaction, run Bitcoin Core `testmempoolaccept`, broadcast only to the chosen test network, and verify confirmation and negative tests.
- Do not claim production readiness based on the prior synthetic Jade signature test.

## Previous handover's successful synthetic signing reference

Jade Plus firmware 1.0.41 accepted corrected synthetic PSBT v0 via animated QR and returned a signed PSBT QR. Previous test used a fake 100,000-sat input, 99,000-sat output, 1,000-sat fee, locktime 110, and a disposable signer. This demonstrates signing interoperability, **not** final script execution or broadcast. The signed PSBT artifact should be independently rechecked when available; do not recreate or assume its bytes.

## First implementation acceptance criteria

- Deterministic, offline fixture produces a valid PSBT v0 with **no signing secrets**.
- Round-trip decode confirms all transaction fields and signer metadata.
- Tampered funding tx, wrong prevout, wrong redeemScript, wrong public key, invalid locktime, final sequence, destination/network mismatch, fee underflow and malformed amounts all fail closed.
- Test output is reproducible without the live website, Bitcoin mainnet, or hardware device.

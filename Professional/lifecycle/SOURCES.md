# Functional reference inspected November 11, 2026

All Retail access was read-only. No Retail checkout, modification, transaction,
production API request, or deployment was used.

| Retail file | Git blob | Behavior used |
|---|---|---|
| `Frontend/SchedulePlanner.js` | `8678771c7292e47532fc252640c75dca26c20577` | 1,000 + 250 per additional release service fee; 500 + 250 per release normal mining fallback; 300 + 100 per release low-priority size heuristic |
| `Frontend/bc1q21-h08.js` | `6e083012f5fa8b477b533fe4daab24c2cd5cdf6b` | `onFinishScheduleEnter` live-rate heuristic and fallback; `startDistributionPipeline` gross gifts, service output, approved mining quote, excess change |
| `Frontend/TransactionManager.js` | `2fac4dbd0e48b31e213b975cc9554a091f5a72e4` | P2WPKH distribution inputs, P2SH CLTV claims, maximum selected input locktime, non-final sequence |
| `Frontend/CryptoManager.js` | `bc28d2a647ac2bdcdad6d97a1e2c4c63a48104c3` | Per-release public key, UTC calendar timestamp, `<timestamp> CLTV DROP <pubkey> CHECKSIG` |
| `Frontend/gift/gift-h08.js` | `743b41ba5bad562e3b565e61b63aa893d978a2e9` | All selected matured/unspent outputs, normal claim rate rounded up / 2 sat-vB fallback, fee deducted from gross claim, 100,000-sat claim ceiling, authenticated recovery checks |
| `Backend/main.py` | `fc36aed893e0b39165f5b8e22ea701da03a68e44` | Core estimate/mempool-floor/fallback semantics, transaction retrieval, outspends and recovery discovery; no production service reused |
| `Frontend/BtcBackendClient.js` | `2744a1466bd0359ab9ee404db2031e772521db9f` | Public chain/fee request boundaries; not copied or contacted |
| `Frontend/AESHelper.js` | `66ec78fc2ee56fefc5aa5ad97399e3710061512a` | Exact test-only compatibility artifact in `../compat/` |

## Deliberate Professional differences

- Existing integer-satoshi allocation, earliest-release remainder, UTC calendar
  behavior and approved public-date planner remain unchanged. No cosmetic work.
- Retail signs in the browser with WIF/mnemonic-derived keys. Professional emits
  PSBTs and independently verifies every returned signature. Existing creator
  builder/verifier, CLTV output checker, Core snapshot collector and Jade BC-UR
  codec are reused. No Retail private-key code enters the online application.
- Retail signs a preliminary claim to measure its size. Professional uses a
  conservative 73-byte DER+sighash bound, then verifies actual signed size/rate.
  This avoids two offline signing rounds. It can charge a few additional sats
  relative to Retail's measured-signature estimate. Gross principal and fee
  deduction semantics are unchanged; the exact fee is approved before signing.
- Retail's mining quote is the creator fee, not a refundable mining reserve.
  The coordinator preserves this and verifies a conservative size/rate floor.
  The historical Professional quote remains an explicit fallback, not a live
  market rate. Optional trusted public rate snapshots reproduce Retail's normal
  and low-priority heuristic; no production quote API is contacted.
- Dust policy remains conservatively 546 sats. Change of exactly 546 is retained
  (existing Professional behavior), whereas inspected Retail used `> 546`.
  Smaller change is explicitly included in the approved fee. An individual small
  release may require accumulation. A claim leaving less than 546 is refused.
- Retail encrypted OP_RETURN / mnemonic-only discovery is **not** reproduced.
  Existing Professional public-date recovery uses an independently authenticated
  portable public manifest plus the offline wallet backup. Losing the manifest
  is not covered by this implementation. Restoring encrypted on-chain discovery
  would require an approved offline metadata/key protocol; online seed access
  or invented Jade encryption compatibility is not an acceptable substitute.
- Lab BIP32 keys use regtest coin type 1. Existing Jade tests and coin-type-0
  public preview code remain intact; this run is not hardware interoperability
  evidence and does not revalidate earlier hardware signatures.

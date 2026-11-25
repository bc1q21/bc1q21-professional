# Acceptance evidence and public software fixtures

The owner confirmed completion of isolated Windows Regtest creator and beneficiary
redemption acceptance using physical Blockstream Jade Plus air-gapped QR signing
in November 2026. Original wallet exports, captured PSBTs, transaction records,
chain snapshots and detailed hardware evidence are retained in the verified private
archive. This summary does not distribute those records or independently reproduce
the physical test. No mainnet qualification is claimed.

Public fixtures are deliberately software-generated with predictable test keys.
They are not evidence that a transaction was funded, mined, broadcast, accepted by
Bitcoin Core, or signed by hardware. Their JSON records explicitly identify this.
Never send real funds to any fixture key/address or load these test keys into a
wallet intended for real funds. No private customer material enters the browser.

The offline public component tests exercise BIP32 public derivation, CLTV scripts,
PSBT contents, cryptographic signature rejection, QR reconstruction and transaction
accounting. They reuse the existing engines. Legacy filenames containing Jade,
original, funded or captured may be retained for API compatibility; provenance fields
and test descriptions identify the synthetic replacement, not a new hardware result.

Use the existing dependency lockfile and Node-only test loader. Fixture generation
is explicit: fixtures/generate-public-source-fixtures.mjs writes only the four
software-only JSON fixtures and performs no network, node or hardware operation.
Do not run historical Core/mining helper scripts merely to run these component tests.

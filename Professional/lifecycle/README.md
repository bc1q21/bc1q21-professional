# Lifecycle engines and legacy engineering infrastructure

## Current architecture boundary

The accepted customer application uses browser-local transaction preparation,
verification and independent recovery with air-gapped Jade Plus QR signing. Start
with the [Professional application guide](../README.md) and
[public source status](../PUBLIC_SOURCE_STATUS.md).

Reusable transaction, CLTV, signature verification and recovery components in this
directory remain part of the engineering foundation. Their presence does not mean
that every infrastructure module is required by the browser application.

The coordinator, SQLite workflow stores, operator-token services, private artifact
stores and Docker/Core harnesses are **legacy or optional local engineering tools**.
Do not deploy them as bc1q21-operated customer transaction services. A production
static host must not collect or persist customer wallet or transaction data.

For reproducible default checks, follow [public-source testing](../PUBLIC_SOURCE_TESTING.md).
Optional Bitcoin, Docker or hardware scenarios require their own explicit setup
and authorization; opening this document does not authorize running them.

## Historical engineering reference

**The remaining sections describe an earlier local engineering implementation.**
They are not current customer launch instructions or evidence that the accepted
browser workflow still awaits hardware qualification. Earlier coordinator,
persistence and manifest-required recovery assumptions do not apply to the current
package-independent browser discovery path. The recorded November 16 Regtest
acceptance does not qualify mainnet use.

## Components

- `public-model.mjs`: existing planner validation and Retail fee treatment;
  public wallet identities; CLTV outputs; creator intent and existing PSBT
  builder/verifier; multi-input beneficiary claims; conservative fee/dust/size
  checks; exact public recovery manifest and ledger.
- `coordinator.mjs`: pinned public-wallet registration with possession proofs;
  exact plan approval and invalidation; confirmed active-chain/mempool-aware
  funding checks; fresh maturity checks; independent signed-return verification;
  explicit, single-use regtest submission; independent recovery/reconciliation.
  Public return objects cannot mutate the stored transaction approval.
- `offline-transfer.mjs`: existing Jade `ur:crypto-psbt` codec, tested round-trip
  for creator and accumulated claims. File transfer of the same PSBT is supported.
- `disposable-offline-signer.mjs`: **test-only** random disposable BIP32 software
  fixture. Independently reconstructs the public financial intent and requires
  the exact request fingerprint before signing. Never used by the website.
- `local-core-lab.mjs`: disposable Core 28 and software signer containers with
  `--network=none`, no published ports or host Docker socket inside the signer.
  Core's cookie never enters the signer or browser. Only the offline fixture
  container reads the test seed. All containers/volumes/fixture secrets are
  removed in `finally` cleanup.
- `recover-public.mjs`: clean-process recovery using only the public manifest,
  independently pinned digest, and an authenticated read-only local Core adapter.
- `run-regtest-lifecycle.mjs`: actual Core deposit, distribution, individual and
  accumulated claims, premature rejection, confirmation, reorg/replay/mempool
  negatives, offline backup restoration, clean-process recovery and final UTXOs.

RPC callbacks are trusted local engineering adapters, **not browser inputs**.
Wallet and request digests must be pinned through an independent authenticated
channel in a real integration. Possession proves control of public roles, not a
person's legal identity or a Jade device's origin. Explicit lab authorization
never grants mainnet or customer payment authority.

## Reproduce (Linux engineering environment)

Requires existing Node dependencies in `Professional/browser-integration`, Node
24, Docker local socket, and locally available `bitcoin/bitcoin:28.0`. No install
is performed by these commands. The offline lab reuses the host Linux Node
binary/shared libraries read-only; it has not been verified on Windows/Docker
Desktop. The ordinary Windows static preview procedure remains unchanged.

Existing root Node modules need access to the already-installed browser package
set. From the repository root, if `Professional/node_modules` does not exist:

```sh
ln -s browser-integration/node_modules Professional/node_modules
node --test Professional/*.test.mjs
BC1Q21_TEST_CHROMIUM=/usr/bin/chromium python -m unittest discover -s Professional -p 'test_*.py'
node Professional/lifecycle/run-regtest-lifecycle.mjs /tmp/professional-lifecycle-evidence.json
rm Professional/node_modules
```

The final command is explicit isolated-regtest execution authority. It does not
contact an external Bitcoin node, existing wallet or production configuration.
A fresh run has different keys/txids; assertions/accounting are deterministic.
The checked-in `regtest-evidence.json` contains only public summary evidence,
not seed words, private keys, wallet files, signed PSBTs or reusable authorizations.

## Acceptance and accounting

Five releases total 100,002 sats: 20,001 + 20,001 + 20,000 + 20,000 + 20,000.
The Core scenario uses custom consecutive UTC dates so all maturities can be
exercised quickly. Existing tests also cover monthly/yearly/custom schedules.
Deposit = 103,752; service = 2,000; approved creator mining fee = 1,750; change = 0.
Single claim [1], accumulated [2,3], accumulated [4,5] each undergo independent
PSBT signature verification, Core policy acceptance, submission and confirmation.

The ledger must satisfy both:

```text
principal = beneficiary receipts + claim fees + remaining unspent principal
funding = service + creator mining fee + change + receipts + claim fees + remaining
```

The sender's deposit transaction has its **own** external fee, separately recorded
in evidence, outside the 103,752-sat gift deposit. Reconciliation verifies actual
creator prevouts, actual transaction outputs, approved beneficiary destination,
confirmed claims and active-chain state. It fails on missing/duplicate claims or
unaccounted spent outputs. Current balances are not inferred from a preview.

## Remaining readiness boundaries

- Complete software/regtest path is implemented; the browser wizard is not wired
  to a trusted funding/signing service. This does not authorize live funding.
- New accumulated PSBTs and regtest coin-type-1 paths have not been tested on Jade
  Plus. Earlier device evidence is preserved, not generalized to this workflow.
- The test seed backup is disposable software data. Physical cold-wallet backup,
  operator review and actual recipient custody require separately authorized tests.
- Public manifest + offline key backup recovery works without the website;
  mnemonic-only Retail discovery and existing encrypted Retail gift import do not.
- Production service-wallet registration, recipient/customer identity, durable
  multi-user authorization/replay storage, key-index allocation and operational
  reorg/error handling require review before connecting any customer interface.
- A transport error after submission is ambiguous: the request stays consumed.
  Reconcile with Core; never blindly retry or create another signature.
- Live pricing, market fee service, legal acceptance, public service endpoints,
  production signing and mainnet broadcasting remain disabled/unconfigured.

Next acceptance: review the public evidence and rerun this isolated workflow.
Only after that review should a separately authorized hardware/regtest test and
trusted customer-service integration be scheduled. No real-Bitcoin beta is ready.

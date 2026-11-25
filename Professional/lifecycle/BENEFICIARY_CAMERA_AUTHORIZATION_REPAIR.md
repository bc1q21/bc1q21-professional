# Browser camera and same-request authorization repair — 2026-11-16

Scope: existing browser-local Professional regtest creator/beneficiary flows only.
No transaction, fee, derivation, consensus or Bitcoin service changes. No hardware,
Core RPC, signing with owner keys, broadcast, mining, deployment or Git mutations.

## Actual timeout/state causes

The shared QR receivers had no duration/inactivity deadline. The creator identity
and gift authorization-expiry handlers nevertheless stopped the response camera.
The public receiver/controller also stopped on document visibility changes. Those
expiry/visibility camera stops are removed. QR presentation and signature acceptance
remain authorization-gated; neither is authority to broadcast.

Beneficiary scanning previously invalidated and cleared the public account BEFORE
a replacement export was decoded. Camera start/stop no longer mutates account,
discovered release, selected release, prepared claim, accepted signature or consent
state. Only a confirmed validated different account, service/selection change or
other actual context invalidation revokes dependent state. Same-account imports,
invalid imports and declined replacements preserve it.

## Camera ownership and interruption

`camera-ownership.mjs` serializes beneficiary webcam acquisition, including a
pending permission result. Starting the other scanner cancels the former receiver.
Creator identity keeps its existing serialized camera ownership. The creator gift
workspace has only one scanner. The shared receivers release late permission
results and signal track-ended browser/device interruption without deleting domain
state. There is no application duration/inactivity camera timer. Scan restarts and
explicit Stop controls remain available; page navigation/close and complete capture
still clean up camera resources. Browsers/OS may independently suspend media; that
is not a promise of uninterrupted hardware access. Partial unverified QR assembly
is cleared on stop/interruption; the same displayed response can be scanned again.

## Exact-request renewal

Five-minute authorizations are separate from the camera. Expiry hides the outgoing
signing QR and refuses acceptance but does not stop an active response scanner or
replace its prepared PSBT. Explicit renewal repeats the existing fresh public-wallet,
funding, active-chain, unspentness and (for claims) CLTV-maturity checks. The unchanged
request digest/PSBT, selected releases, outputs and fees must still match. Stale or
spent funding refuses renewal. A new transaction is never silently substituted.

Creator gift renewal requires the original acknowledged request and an explicit
renewal confirmation, including when the prior review lease expired/was consumed.
It grants a new short signing lease only after fresh checks. It does not accept the
expired lease or automatically restore consent after navigation.

A returned exact, cryptographically valid signature captured after expiry is held
in temporary RAM as NOT ACCEPTED. Creator gift and beneficiary explicit renewal
then reverify and accept that retained response while the new consent is valid.
Creator identity exposes Verify retained identity response after explicit renewal.
Identity challenge UUID/account/plan/OP_RETURN and exact signatures remain checked;
an earlier lost challenge can never be replaced by a new one. Successful returns
consume authorization. Duplicate/conflicting returns do not replace verified state.
Identity tests still have no broadcast path. No private keys or seeds are stored.
Closing/reloading the outer application still discards RAM-only work by design.

## Focused verification

- `camera-authorization.test.mjs`: 3 passes. Serialized delayed permission/cancel;
  actual Chromium beneficiary state preservation, stop/restart, OS interruption,
  permission error, same/invalid/cancelled/accepted replacement, elapsed 15 minutes
  without camera shutdown, wrong destination/fee/signature rejection, expired return
  quarantine, fresh spent-funding refusal, and same-response explicit renewal;
  equivalent creator gift expiry/renewal checks. All network requests asserted GET.
- `identity-camera-lifecycle.test.mjs`: 1 pass. Existing virtual camera/fountain
  test additionally proves active camera survives expiry, expired response cannot
  grant possession, and exact retained response verifies after explicit renewal.
- Existing `creator-wallet-setup.test.mjs`: 5 passes.
- Existing `jade-coin1-browser.test.mjs`: 1 pass, current creator and beneficiary
  signing/recovery workflow using synthetic signatures, no broadcast.
- Total: 10 distinct tests pass. Synthetic published fixtures only; no physical
  Jade exercise or real Core node was used. Chromium cannot establish Windows
  hardware camera acceptance.
- Browser bundles rebuilt with existing dependencies. All 43 required static
  resources present, including the camera ownership module; 8 stylesheet integrity
  checks pass. No dependencies installed.

## Preserved evidence and remaining acceptance

The prior 457-byte physical creator signed PSBT remains byte-identical, SHA-256
5feb85fa7f2ca7b3ae1b86a8adc3a7bd3ffa360c49e36be1bafae945a0bcf903.
The Windows confirmed gift was not contacted or changed. No repeat historical
hardware, CLTV or recovery testing is required by this patch.

A replacement static Windows preview must be prepared/transferred before owner
acceptance; the already downloaded preview does not gain these changes. Next is
one physical integrated beneficiary redemption of an eligible existing release,
with separate authorization for broadcast/mining. Broader beta gates remain the
approved legal/release presentation and isolated static HTTPS/service-connectivity
release preparation. No deployment readiness is inferred from these focused tests.
All work remains uncommitted/unpushed for review; old acceptance records unchanged.

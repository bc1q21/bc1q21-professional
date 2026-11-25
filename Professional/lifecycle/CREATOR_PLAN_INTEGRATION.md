# Step 53 — durable creator-plan acceptance (regtest only)

This is the first browser/coordinator slice, not a completed payment application.
Step 53 had no Core adapter; Step 54 adds an optional explicitly configured read-only
adapter as described below. No signing, address generation,
funding, transaction construction or broadcast endpoint is exposed.

## Boundary and durable state

The funding page offers an explicit Save approved plan action. It reads the existing
approved-plan session record, uses the existing integer-satoshi/date validator,
and submits `POST /api/regtest/creator-plans` on the same origin:

```
{network: "regtest", requestId: UUIDv4, plan: existing approved public preview}
```

The server enforces a strict public schema (including all authorization flags false),
16-KiB body limit, loopback Host, same Origin and JSON Content-Type. Unexpected
fields, including secret-bearing fields, are rejected. It shares
`approveCreatorPlan` with `RegtestGiftCoordinator.approvePlan`; that helper uses
existing validatePublicPlan and canonical digest, without changing financial rules.
Only normalized plan data is persisted. This endpoint is local-development-only;
it is not an authenticated multi-user server and must not be bound publicly.

SQLite PRIMARY KEY(requestId), BEGIN IMMEDIATE, WAL and synchronous=FULL persist
request identity, canonical plan digest, normalized snapshot and creation time.
The same ID/content returns HTTP 200 already-processed, even after reopening the
store; first acceptance returns 201. Reusing an ID with different plan content
returns 409 without replacing the record. Validation fails before insertion.
Independent connections serialize writes. SQL parameters are bound, not interpolated.
No in-memory coordinator/session is relied on for durability of this plan record.

The browser stores its retry ID before sending, indexed by normalized plan content.
A lost response/reload can retry that ID. Editing a plan produces a new snapshot
and new ID; an asynchronous response for an edited/removed plan is not displayed
as current approval. The prior saved snapshot remains historical and grants no
signing/funding/broadcast authority. Records are not deduplicated across arbitrary
new IDs: two intentionally separate gifts may have identical schedules. Clearing
browser storage loses its retry identity; recovery of that identity is a future slice.
A saved record is NOT authenticated customer identity or an executable signing request.

## Local use

Use the repository's existing Node dependency resolution (as for lifecycle tests);
no dependency installation is required or performed. Requires Node 24 with node:sqlite.
With an existing private, persistent directory, from repository root:

```
node Professional/lifecycle/creator-plan-service.mjs /absolute/private/persistent/creator-plans.sqlite
```

Open http://127.0.0.1:8766/index.html, approve a schedule, continue to the funding
page and select Save approved plan. A static Python server cannot accept these
requests; the page reports the unavailable service, retaining existing preview use.
The service binds only 127.0.0.1 and serves an explicit preview resource allowlist.
It does not expose lifecycle modules, database, ignored metadata or repository files.
The generated verifier bundle must already exist for the old diagnostic tools;
this new plan button does not depend on that bundle. The preview ZIP includes the
new browser module, but not the server, database or an enabled payment path.

The database directory must outlive the process; retain SQLite WAL/SHM companions
and use SQLite-aware backup or clean shutdown. Persistence across cloud workspace
loss and off-host backups are NOT established. No active regtest metadata, Docker
configuration or blockchain state was accessed or changed for this implementation.

## Validation performed

- 4 new Node tests: durable reopen/idempotency/conflict across connections; strict
  input/authorization/amount rejection; real HTTP success/replay/origin/Host/body
  limit/private-resource checks; browser invalidation/packaging guards.
- 15 existing lifecycle tests pass, preserving calculations, approval binding,
  signature/metadata checks, recovery, dust and prohibited network/execution paths.
- 13 existing planner/amount tests pass, preserving dates, exact satoshi totals,
  remainder allocation, conversions and invalidation. Total Node: 32 pass, 0 fail.
- Actual system Chromium over the local HTTP service: accepted; reload/retry
  already-processed; removing approval rejected. No Windows/Brave test claimed.
- The initial Host-negative test used fetch, which replaced its supplied Host;
  corrected the test to raw HTTP and verified the existing Host rejection.
- git diff --check passes. No new packages, blockchain operations or hardware tests.

## Next smallest slice

Bind one saved request/digest to the existing pinned public-wallet registration
and a read-only funding inspection; persist its state/revision and invalidate any
later authorization when the plan changes. Reuse coordinator identity, Core and
PSBT verification gates. Do not enable transaction submission as part of that slice.
Durable signing-request consumption and broadcast reconciliation remain later gates.

No commit/push, merge, deployment or customer-beta authorization is implied.

## Step 54 — public-wallet binding and read-only funding

New boundaries: POST /api/regtest/creator-registration and
POST /api/regtest/creator-funding. Both retain exact same-origin/Host/JSON gates.
All requests carry network=regtest, saved requestId, exact coordinator planDigest
and a durable UUIDv4 operationId. Registration additionally carries `registration`;
inspection carries the registered walletDigest and an array of {txid,vout}.
Bodies are limited to 256 KiB for possession proofs and 16 KiB otherwise.

Registration reuses verifyWalletRegistration, including the existing signed-PSBT
possession formats and explicit all-role public-key proofs. The operator must
independently pin BOTH the planDigest and full walletDigest before registration.
A client-supplied digest, fingerprint, xpub or UI acknowledgement is insufficient.
Recipient-key count must equal release count. Secret-named fields and unexpected
registration/operation fields are rejected. This does not add a new wallet import
format or generate another hardware challenge. Use existing approved public
registration evidence; omit extraneous test-fixture metadata such as `evidence`.

The SQLite registrations table binds an immutable normalized public wallet to a
saved plan ID/digest. Proof/signature payloads are verified but NOT stored. Only
public wallet records, digests and receipts are persisted. The operation table
stores a content binding and pending/completed receipt; same IDs with changed
content fail. Completed inspection retries return an explicitly historical receipt,
not fresh chain authorization. A failed/pending read can safely resume with the
same ID after reopening the database. The UI creates a new inspection ID on the
next explicit refresh after success; lost responses retain the pending retry ID.
Registration and inspection never grant funding/signing/broadcast authority.

Inspection reuses assertRegtest and confirmedOutpoints/coherent Core snapshots.
Amounts and scripts come from Core, not the browser. Only confirmed, unspent
outputs belonging to the pinned creator key are included; duplicate outpoints,
wrong ownership, wrong genesis/network and moving sampled tips fail closed.
The result is a timestamped observation, NOT a readiness decision, quote, payment
request, active UTXO reservation or authorization to construct/spend transactions.
Historical receipts MUST NOT be used as fresh funding evidence in the next slice.

### Operator configuration (local, not served or committed)

Optional third CLI argument is a trusted local JSON file:

```
node Professional/lifecycle/creator-plan-service.mjs /private/state.sqlite /private/operator.json
```

Schema:

```
{
  "walletPins": [{"planDigest": "<64 lowercase hex>", "walletDigest": "<64 lowercase hex>"}],
  "activeEnvironmentFile": "/absolute/path/to/active-environment.json"
}
```

Without pins, registration is disabled. Without activeEnvironmentFile, funding
inspection is disabled. Restart the local service to apply changed operator pins;
this does not require restarting Core. Existing normalized records alone do not
bypass current operator pins. Public key identity/role allocation remains the
operator's responsibility for this supervised slice; no automated allocation added.
The CLI descriptor adapter binds persistentCore to its explicit root/container,
requires ACTIVE_OWNER_APPROVED, exact datadir, expected height/tip and checkpoint,
and uses only readOnlyRpc. It never calls start/stop, modifies metadata, falls back
to another node, accepts browser RPC addresses or touches RPC credentials in UI.
Each adapter call rechecks checkpoint. Its underlying existing container checks
preserve network=none, no published ports and bound datadir. Application-layer
funding RPC allowlist excludes signing, wallet operations, mining and submission.
Trusted operator configuration must stay outside the static resource allowlist.
No live descriptor/actual Core node was connected in Step 54 tests.

### Step 54 evidence and limitations

Six new tests cover verified registration, external pin enforcement, tampered
proofs/secrets/plan binding, duplicate/conflicting operations/outpoints, database
reopen, retry after failed transport, historical-vs-refreshed receipts, spent and
wrong-owner outputs, wrong network and moving tip, disabled adapter, and actual
HTTP registration/inspection. Tests use disposable software possession fixtures
and synthetic Core responses; they do not claim Jade or real-chain evidence.
The first test run exposed unapproved fixture `evidence` metadata; fixtures now
project only the supported public registration fields rather than loosening input
validation. Existing Step 53 tests and lifecycle/planner regressions pass.
Actual Chromium HTTP button journey passed with a synthetic read-only adapter:
save -> register public proof -> inspect -> reload/refresh -> removed-plan rejection.
Browser harness's initial CSP evaluation error was corrected with a function
predicate; no CSP relaxation. Windows/Brave and live adapter use remain unverified.
No dependencies installed, active blockchain access, mining, signing exercises,
real payments, commits or pushes for Part B. Public registration controls are an
operator-assisted bridge; general customer onboarding is not yet complete.

Next slice: construct a durable unsigned creator signing request from the exact
saved plan + registered wallet + freshly revalidated funding, using prepareCreation
and existing fee/PSBT/request-digest gates. Persist immutable intent/revision and
single-use approval state before exposing QR. Do not activate signing/broadcast
as an incidental side effect. Existing hardware evidence should be reused.

## Step 55 — unsigned creator preparation (no signing permission)

POST /api/regtest/creator-prepare accepts only network, requestId, planDigest,
walletDigest, fundingOperationId and operationId. It requires the exact saved plan,
currently pinned previously verified public registration, and a completed inspection
belonging to that plan/wallet. Stored public-wallet data is revalidated, hashed and
compared to the operator pin; recipient-key count and saved plan digest are checked.
Proofs are not requested again and no new Jade exercise is needed.

Before EVERY preparation, including completed retries after restart, fresh confirmed
unspent/ownership checks run through the existing coherent Core inspection. Cached
inspection receipts alone are not authority. The selected amounts/scripts must still
match the previous inspection; a final tip check precedes persistence. A receipt is
an observation, never a guarantee that an external wallet cannot spend those inputs
later. Future signed-return/submission stages must recheck them again.

prepareCreation retains the established Retail fee quote, calendar CLTV construction,
service output, bounded size/dust/change handling and unsigned PSBT builder. This
slice uses the existing 2 sat/vbyte safety rate and Retail fallback quote (not live
pricing). verifyJadeRequest independently reconstructs the engine payload and checks
its digest. Browser fee/key diagnostic fields cannot override registered roles or
engine fee policy. No formula or existing engine code was changed.

SQLite creator_requests persists the complete unsigned request, exact digest,
selected inputs, plan/wallet/funding-operation bindings and approval state
PREPARED_NOT_AUTHORIZED. The plan is an immutable saved snapshot (revision 1 for
this request), not a live browser draft. A second preparation ID for the same plan
is rejected; retries must use the original ID. Transactional input reservations
prevent other plan records from preparing the same inputs in this local service.
They are local duplicate-prevention records, not on-chain locks. Cancellation,
explicit supersession and releasing reservations are not implemented in this slice.
No signing approval is persisted or inferred; all execution flags stay false.
Unsigned requests contain public data only and stay in the operator database;
the HTTP response exposes summary/digests only, not QR or signable payload download.
A completed retry is revalidated, not silently regenerated with changed intent.

The EXISTING construct-unsigned button and existing unsigned-review fields display
the result. No HTML, layout, stylesheet or recipient-interface changes were made.
After trusted inspection the button's coordinator mode intercepts the old diagnostic
handler, uses the saved funding selection, and keeps review-signing/QR/handoff
controls disabled. Existing collapsed developer details remain where they were;
this slice does not redesign their placement. Reload can recover bindings/retry IDs
from browser storage; the server database remains authoritative. Editing/removing
the approved plan fails closed and hides a stale prepared review on error.

Three additional preparation tests cover exact accounting/unsigned PSBT persistence,
reopen/retry/fresh spent-output rejection, changed bindings/pins, wrong fee fields,
insufficient funds and cross-plan input reuse. Actual HTTP preparation and denied
origin/failed fresh revalidation after service reopen extend the earlier test.
Existing lifecycle and planner regressions remain applicable. Chromium over actual
HTTP with synthetic funding confirms the existing control renders correct summary,
reload returns already-processed and QR/handoff remain disabled. The initial browser
harness tried a control in a collapsed details element; expanding the existing details
fixed the harness without changing page structure. Windows/Brave and the live Core
adapter remain unverified. No active regtest node was accessed or mutated.

Next smallest slice: explicit review acknowledgement bound durably to the exact
prepared request digest, plus a read-only review/restore handoff to the existing
Jade workspace. Keep actual hardware signing and transaction submission disabled
until separately authorized. Existing successful hardware evidence is preserved.
Part B remains uncommitted for owner review; no application deployment is implied.

## Step 56 — durable acknowledgement and review-only Jade handoff

The original review checkbox explicitly acknowledges the exact persisted request
before the original Continue-to-Jade control can hand off. The acknowledgement
binds saved plan ID/digest, registered wallet digest, prepared engine request digest,
selected inputs, gift outputs, service/change outputs and mining fee. The engine
request digest itself commits all transaction details; the additional binding
receipt is stored in creator_reviews. No caller booleans confer signing authority.

New same-origin POST routes: creator-acknowledge (acknowledged:true), creator-handoff
(exact acknowledgementId), creator-review (exact consumed handoffId). All include
the existing network/requestId/planDigest/walletDigest, preparationOperationId,
requestDigest and a UUID operationId. The existing HTTP bounds and origin/Host gates
apply. Each route revalidates the current operator wallet pin, saved plan/public
wallet, persisted engine request, confirmed/unspent funding and coherent current
chain state through the existing preparation verifier. Cached receipts cannot
bypass these checks. No actual Core connection was made during this development.

States: PREPARED_NOT_AUTHORIZED -> ACKNOWLEDGED_REVIEW_ONLY ->
REVIEW_HANDOFF_CONSUMED. Acknowledgement retry with the exact same ID is idempotent
until handoff; conflicting IDs/content and consumed acknowledgement/handoff reuse
are rejected. SQL transactions atomically record transitions and globally reserve
operation IDs. Prepared engine bytes and digest remain unchanged. A read-only
restore route can reload an already consumed handoff without consuming again or
resetting its state. It also revalidates funding; spent/stale inputs fail closed.
A lost handoff response is recovered by restoring that exact handoff ID, not by
creating a new approval. No cancellation/revocation UI is added; after successful
acknowledgement the checkbox is locked for that immutable prepared request. A new
plan requires a separate saved request and existing key/input reservation gates.

Jade page uses its existing transaction review fields/table and existing browser
unsigned PSBT inspector. OfflineTransfer/decodeOfflineTransfer verify the existing
BC-UR transport internally against the exact unsigned PSBT; no signing QR is
rendered, no camera is activated, and Finish remains disabled. Reusing a codec is
not new physical Jade evidence. The existing legacy diagnostic session records are
cleared for this new review-only flow so they cannot accidentally resume scanning.
A separately named module and self-only CSP connection/script references were added;
no HTML layout, CSS, branding or recipient screens were redesigned. The preview
packager includes the module. Static-only previews cannot restore coordinator state
and report unavailable instead of treating browser session JSON as authority.

Validation: 43 focused Node tests pass, including new acknowledgement/restart/
one-time handoff/restore/stale funding/digest and pin rejection cases and expanded
actual HTTP endpoint/consumed/origin tests. Existing plan, amount, lifecycle and
Step53–55 integration regressions pass. Existing verifier bundle rebuild passes
using already-installed dependencies (Node fs.Stats deprecation warning only).
Actual Chromium HTTP with synthetic funding passed preparation -> checkbox ->
handoff -> Jade review -> page reload; signing QR hidden, scan and Finish disabled.
No Windows/Brave, live Core or hardware acceptance is claimed for this slice.
No dependencies installed; no blockchain state changes, deployment or Part B commit.

Next smallest slice: durable, explicitly gated signing-session handoff and signed
return verification using existing Jade components, with exact request/digest and
single-use state retained. Enabling actual hardware signing requires separate
approval; do not repeat completed physical tests merely to develop the interface.
Broadcast and payment submission remain a later separately authorized boundary.

## Step 57 — explicit signing sessions and durable signed-return receipts

Software implementation only. No new physical signature or hardware acceptance
is claimed. Existing historical Jade evidence remains authoritative for its scope.
Operator configuration must explicitly set enableSigningSessions:true; default false
rejects signing authorization even if plan/review state exists. This flag is not
customer consent: the existing Jade scan control first requests separate explicit
confirmation of the exact engine request digest, wallet digest and financial summary.
No new screens, markup, CSS, branding or recipient changes were made.

New same-origin routes: creator-signing-authorize, creator-signing-state,
creator-signing-return. They retain loopback Host, Origin, regtest, strict body
schema and current plan/wallet/funding gates. Authorization includes the exact
consumed review handoff and explicitSigningApproval equal to the prepared request
digest. All original inputs, outputs, fees and key origins are committed by that
digest and the checked review binding. The browser cannot pick an RPC endpoint or
supply another unsigned transaction. No broadcast endpoint or wallet RPC is added.

SQLite creator_signing_sessions stores one session per preparation, immutable
binding/authorization, fixed expires timestamp and AUTHORIZED/VERIFIED_RETURN state.
The server assigns a ten-minute expiry. Exact authorization retry restores the same
unconsumed session without extending expiry; a different session ID, expired session
or consumed authorization is rejected. Read-only session restore after reopening
revalidates wallet, funding and bindings. Current implementation intentionally has no
automatic renewal/reset or second session for the same prepared transaction.
Expiry depends on a trustworthy operator system UTC clock; clock rollback protection
and multi-user deployment are not established by this supervised local service.

Browser uses the existing animated unsigned QR renderer and creator signed-camera
controller, without a replacement signing/QR implementation. The legacy diagnostic
controller is not attached in coordinator mode, avoiding two controllers on the same
controls. Authorization never automatically starts a camera. Expiry or local plan
change hides QR and invalidates capture; the server independently checks expiry,
bindings and fresh funding. Existing Finish remains disabled; nothing is broadcast.
Tests render synthetic QR only; the owner is not asked to scan or sign anything.

The return route accepts bounded canonical PSBT Base64 or saved crypto-psbt UR
frames. Existing readJadeSignedPayload reconstructs frames; verifyLifecycleJadeReturn
reconstructs approved intent and checks exact unsigned transaction, all ECDSA
signatures/SIGHASH rules, prevouts, recipient/service/change outputs and mining fee.
A transaction is finalized in memory only. An atomic compare of current state and
expiry consumes the session only after successful verification. Invalid returns
leave it unconsumed. Identical or conflicting repeated signed-return submissions
are rejected, not executed twice. A read-only state restore retrieves the already
verified receipt after a lost response; it never revives signing authority.

Persisted receipt includes session/plan/wallet/request bindings, signed PSBT SHA-256,
finalized TXID, fee, size and verification time; hardwareOriginAttested:false,
broadcast:false. It stores NO signed PSBT/raw finalized transaction, wallet seed,
private key or software signer data. The camera holds a pending captured return in
memory for explicit network retry; clearing/reloading before server acceptance loses
that pending payload. Keep original public signed capture locally if later authorized
submission needs it; do not request another physical signature merely for transfer.
A separate private signed-artifact retention policy/integration remains required
before enabling submission. Receipts alone cannot reconstruct signed transactions.

Validation: 55 focused Node tests pass, 0 fail: explicit opt-in/approval, fixed expiry,
conflicting/expired/consumed sessions, database reopen, successful synthetic signature
verification, invalid signature/unsigned return, changed digest and stale funding,
duplicate returns, no raw signed payload in receipt, actual HTTP authorization/state/
return endpoints, existing camera/gate and financial/planner/integration regressions.
Actual system Chromium with synthetic funding passed explicit authorization, existing
animated QR display and page-reload session restore. Camera was never started and
Finish stayed disabled. Existing verifier bundle rebuild passed from installed
dependencies; no installation. Generated test bundle removed from source working tree.
Windows/Brave, live Core adapter and physical-device use of this new session path
remain unverified; no blockchain node was accessed or mutated for these tests.

Next smallest slice: connect the verified server receipt to the existing Finish
summary (clearly signed but NOT broadcast/confirmed), with durable reload/recovery.
Then review private signed-artifact retention and explicit single-use submission
boundaries before separately authorizing any regtest submission implementation/use.
No further hardware scenarios, live funding or beta deployment is implied.
Part B is uncommitted pending review.

## Step 58 — authoritative signed receipt on the existing Finish workspace

Step 57 committed as 82bd1e264bf6dd598cb7d7347e221badde04ea68. This section
covers subsequent, uncommitted Finish integration only.

The existing Jade verified-summary link becomes available only after the server
returns or restores a verified signed receipt. Browser storage retains identifiers
(plan/request, wallet, preparation, handoff, signing session and TXID), not signing
authority or signed PSBT bytes. The Finish module fetches POST creator-finish using
those identifiers. It can restore its pointer from local storage indexed by the
current normalized approved plan after session-pointer loss; clearing all browser
state still requires a future recovery lookup mechanism.

The endpoint requires the exact saved plan, current operator-pinned registered
wallet, immutable prepared request, consumed review handoff and VERIFIED_RETURN
signing session. Existing verifyJadeRequest reconstructs unsigned intent; receipt
schema/flags/identity/fees/time are checked against durable records. The finalized
TXID is cross-checked against the prepared native-SegWit transaction, whose TXID
is unaffected by witness signatures. Corrupt, mismatched or unverified receipts
fail closed. Signatures were verified at signed-return acceptance; they cannot be
reverified from a hash-only receipt without the original signed payload. The local
operator database remains trusted storage, not a cryptographically attested audit log.

Finish loading is historical read-only evidence retrieval: it makes NO Core call,
does not re-enable expired signing or require the signing opt-in to remain enabled,
and does not claim current UTXO/mempool/confirmation state. Returning a completed
verification receipt after session expiry is not reviving signing authorization.
Current wallet pin revocation still rejects access. Same-origin/Host/schema gates
remain. No broadcast, mempool-check or wallet endpoint was added.

The existing Finish summary/result/details show SIGNED — NOT BROADCAST, exact
transaction identity, schedule, inputs and fees. Mempool acceptance, current funding
and confirmation are explicitly NOT_CHECKED. Gift completion and recipient delivery
remain false/pending. Legacy browser-only diagnostic flags no longer populate the
verified-result section; the authoritative server receipt is required. Existing
branding, print/navigation controls, layout and CSS are preserved. Only functional
CSP/module references and status text changed. Preview packaging includes the new
module; static serving without the coordinator fails closed.

Tests already passed before interruption: 16 focused integration tests in
creator-plan-funding.test.mjs, including two new Finish cases, actual HTTP success,
same-origin rejection, service/store reopen, invalid TXID/digest, altered fee,
unverified sessions and revoked wallet pin. No successful hardware test was repeated.
Remaining actual Chromium check passed after resumption: synthetic signed return ->
authoritative Finish link -> page reload -> local-pointer restoration -> mismatched
receipt rejection. Initial browser check found property-order-sensitive comparison
of canonical stored release objects; comparing date/amount pairs fixes it without
changing the schedule or satoshi values. No camera/hardware/Core access occurred.
The existing bundle was built for browser validation and removed afterward.
No Windows/Brave, real-chain acceptance, broadcast or confirmation is claimed.

Remaining dependencies: private retention/re-import of signed artifacts (receipts
alone cannot submit a transaction), independent persistent-state backup, durable
recovery after complete browser-storage loss, and separately approved submission/
confirmation integration. Next smallest slice: define and implement bounded private
signed-artifact retention/re-import bound to the existing receipt and exact TXID,
without enabling broadcast; then review explicit single-use regtest submission and
reconciliation. Do not request new physical signatures simply to recover artifacts.
Part B remains uncommitted; no deployment or beta-release approval is implied.

## Step 59 — private signed-artifact retention and recovery

Step 58 committed as 412ca0682a97d3969033f824c76c7c8d1a7528cf. New work below
is uncommitted. No real wallet, physical Jade or active blockchain was accessed.

### Storage and authorization

HTTP signing opt-in now also REQUIRES an explicit artifactDirectory in operator
configuration. It must be outside this repository/public preview assets. The private
store rejects symlink paths, non-owner directories and broad permissions. Linux
owner-only directory 0700 and PSBT files 0600 are enforced; permissions are rechecked
on access. Windows ACL enforcement is NOT implemented: the operator service/private
store is Linux-only for now; Windows Brave can remain the browser client. Do not
weaken permissions or place artifacts under a web/static/repository directory.

After full existing signed-return verification, immutable signed PSBT bytes are
written to SHA256.psbt. A temporary 0600 file is fsynced and atomically hard-linked
without replacement; the directory is fsynced. Existing identical bytes are reusable;
corrupt/conflicting files are never silently overwritten. SQLite maps session ID to
payload hash/length and canonical receipt digest in the SAME transaction that consumes
the signing session and persists its verified receipt. A storage failure rolls back
session consumption. A process failure after file publication but before DB commit
can leave an orphan blob; it confers no authority without the verified receipt/map,
and an exact return retry can reuse it. No automatic orphan deletion is implemented.

No seed phrases/private keys/wallet secrets are retained. Signed PSBTs ARE sensitive
transaction authorizations despite containing no wallet secrets: keep them private.
The static allowlist exposes neither directory, database, operator config nor helper.
Recovery does not authorize broadcasting or mark an input as unspent/confirmed.

Operator config additions (placeholders, not credentials):

```
{
  "artifactDirectory": "/private/operator/creator-artifacts",
  "recoveryTokenSha256": "<SHA-256 of an independent random operator recovery token>"
}
```

Keep the random access token offline/separately, minimum 32 characters, never a wallet
password or recovery phrase. Only its hash is configured; never store it in browser
storage or URLs. Same-origin POST creator-artifact-recover and creator-artifact-import
require X-Professional-Recovery-Token in addition to Host/JSON/body bounds. Recovery
accepts sessionId; import additionally accepts bounded PSBT Base64 or saved UR capture.
Current operator wallet pins and exact verified session/plan/request/TXID/receipt are
mandatory. Recovery returns public context only; no signed-file web download endpoint.
This is a supervised single-operator capability, not multi-user authentication.

### Recovery and retrieval

Every recovery/re-import rechecks blob hash/length/permissions and receipt digest,
then runs the existing complete PSBT signature/intent verifier again, including the
approved TXID, outputs, fee and size. Unverified, mismatched, corrupt or conflicting
artifacts fail closed. Identical re-import is idempotent; duplicate signing returns
remain rejected. Legacy hash-only verified receipts may import the exact original
capture without another hardware signature. Missing files can be restored by exact
verified import; an existing corrupt file requires separately reviewed quarantine
before recovery, never automatic replacement. No on-chain freshness is claimed;
these are historical signed-transaction records, still NOT BROADCAST by this service.

After browser-storage loss, open the SAME local coordinator origin:
http://127.0.0.1:8766/finish-workspace.html#recover=<signing-session-UUID>
The existing Finish workspace uses a native access-token prompt (no layout change),
restores the public plan/binding from the server and loads its authoritative receipt.
The token is not saved; the URL fragment is removed. Session UUID + token must be
retained by the operator. Local public-pointer recovery also survives later reloads.
Optional branding/contact data is not recovered; do not infer it from wallet data.

Filesystem-authorized operator helper (existing Node dependency resolution required):

```
node Professional/lifecycle/creator-artifact-operator.mjs recover /private/state.sqlite /private/operator.json SESSION_ID
node Professional/lifecycle/creator-artifact-operator.mjs export /private/state.sqlite /private/operator.json SESSION_ID /private/export/signed.psbt
node Professional/lifecycle/creator-artifact-operator.mjs import /private/state.sqlite /private/operator.json SESSION_ID /private/export/signed.psbt
```

Export is exclusive-create, owner-only and outside the repository; never overwrites.
Import supports exported binary PSBT, Base64 or saved UR text. The helper trusts local
operator filesystem access (not an unauthenticated web request), does not use Core,
and prints public recovery context only. It contains no signing or broadcast path.
Do not upload exported files to Git, a public website or logs.

### Retention and backup

No automatic expiry/deletion: preserve unsigned request, receipt/map and blob until
an explicitly approved lifecycle/retention decision. Signing-session expiry does not
delete previously verified signed evidence. Back up the coordinator DB using a
SQLite-aware consistent snapshot or clean shutdown, along with immutable mapped
blobs, operator configuration/pins and separately protected access token. Copying
live DB/WAL files independently is not a proven backup. Encryption at rest and
independent off-host backup/restore are NOT established here. Loss of both blob and
original signed capture cannot be repaired from the receipt hash. Full coordinator
DB loss likewise requires backup, not inferred identity from an uploaded PSBT.

### Validation and remaining boundary

61 focused Node regression tests passed (20 integration tests plus existing planner,
lifecycle and camera/verifier coverage), including new retention/reopen, hash/receipt
binding, tamper/conflict rejection, exact re-import, permissions/symlinks, failure
rollback and real helper export/binary re-import. HTTP tests cover denied missing
token, authorized recovery with no payload leak and recovery after service reopen.
Existing planner/lifecycle/camera regression checks remain separate from physical
hardware evidence. Actual Chromium with synthetic signing/funding passed complete
browser-storage-loss recovery, reload and invalid-token rejection. Initial browser
harness issues (dialog listener API and hash-only same-document navigation) were
corrected without changing application security or layout. No camera/Core/hardware
was used. Existing verifier build succeeded; generated bundle excluded afterward.

Next smallest slice: explicit, durable single-use regtest submission authorization
and reconciliation using the retained, reverified artifact, with a non-broadcast
preflight first. Implementing/using broadcast requires separate approval; there is
no broadcast endpoint in this slice. Operational backups and live-adapter/Windows
acceptance remain unverified. No deployment or beta release is authorized.

## Step 60 — controlled non-broadcast submission preflight

Step 59 committed as 2b4365ba5f61f3627b30c06b9187b7232063176d. This slice
adds no sendrawtransaction, mining, wallet or signing operation. Tests use synthetic
Core responses; the active regtest node was not contacted or changed.

Operator config must separately enable enableSubmissionPreflight:true and provide
preflightTokenSha256, the SHA-256 of a separate random operator access token (at least
32 characters). Signing/recovery opt-ins do not grant preflight permission. Routes
creator-preflight-authorize and creator-preflight-run enforce the existing same-origin,
Host/JSON bounds plus X-Professional-Preflight-Token. No token is stored in browser
storage/URL or logged. Tokens/config files remain operator-private.

Each request contains sessionId, transactionId, requestDigest, receiptDigest and UUID
 authorizationId. Authorization additionally requires explicitPreflightApproval equal
to the canonical digest of {transactionId,requestDigest,receiptDigest}. The server
validates the exact authoritative verified session/plan/wallet receipt and private
artifact, and computes a binding over the receipt, request, wallet, selected inputs,
recipient/service/change outputs and fee. Current pinned wallet identity is required.
The operator authorizes ONLY a read-only preflight, not transaction submission.

SQLite creator_preflights persists the binding, fixed ten-minute expiry, consumed
state and exact result. Duplicate authorization IDs or another active authorization
for the same session are rejected. Before any Core call the run atomically changes
AUTHORIZED to RUNNING; a duplicate/concurrent/expired run cannot call Core again.
Completed results survive coordinator reopen. An interrupted RUNNING operation is
not automatically retried or reset; operator reconciliation is required. Expired
unused authorization remains non-executable; renewal/reset is intentionally not added.
A lost authorization response can be recovered by its original durable ID/status.

The run re-verifies retained PSBT bytes/signatures and finalizes with the existing
engine, checks isolated regtest genesis/synchronization and coherent current confirmed,
unspent creator inputs, then calls read-only testmempoolaccept with the EXACT finalized
transaction. No caller supplies transaction bytes or Core endpoints. A strict method
allowlist permits only read-only chain/funding methods and testmempoolaccept. Tip and
expiry are checked again after policy evaluation. No passing preflight is a durable
promise of later acceptance; future broadcast MUST repeat fresh checks.

Results: ACCEPTED means Core returned allowed:true; REJECTED preserves exact
reject-reason/response; STALE includes spent/mismatched funding, wrong chain/identity,
invalid artifact, tip changes or authorization expiry during checking; UNAVAILABLE
covers inaccessible Core/artifact or malformed Core response. The exact response array,
sampled tip, timestamp and reason are stored, including allowed:true responses later
marked STALE. All results assert broadcast:false, mempoolSubmitted:false, confirmed:false
and giftCompleted:false. An RPC invocation does not submit to the mempool.

Existing Finish status fields show historical preflight results while keeping
SIGNED — NOT BROADCAST and recipient delivery pending. No layout/CSS/control redesign.
An operator can open the current Finish context with #preflight=<signing-session-UUID>
for a native token prompt and explicit transaction confirmation. Save/restore of the
exact authorization ID avoids accidental repeated policy calls. Reload reads the
stored result only; it does not rerun preflight. Denied/cancelled preflight preserves
the signed receipt and displays an error in the existing next-action field. No token
or permission is inferred from the fragment. A valid Finish binding is still required.

Validation: 64 focused Node tests pass (23 integration tests plus existing financial,
planner, lifecycle, camera and signature regressions). New tests cover explicit binding,
disabled opt-in, expiry, authorization/run duplication, database reopen, exact Core
rejection, unavailable Core, spent funding and changed post-check tip. Actual HTTP
checks cover missing token, authorized execution and duplicate run rejection.
Actual Chromium uses a synthetic read-only adapter: explicit operator authorization,
ACCEPTED status, durable reload and unchanged SIGNED — NOT BROADCAST semantics pass.
Existing verifier build succeeds from installed dependencies; generated bundle is
excluded. No physical Jade, active Core, real Bitcoin, Windows/Brave acceptance,
network deployment or blockchain mutation was performed/claimed.

Remaining requirements: explicit separately authorized single-use broadcast execution,
ambiguous-send reconciliation, independent block/confirmation evidence, durable gift
manifest creation/delivery, recipient claim handoff and tested operator backup/recovery.
Do not reuse a saved accepted preflight as future spend authority. Next smallest slice:
implement a separate transaction-specific broadcast authorization/state machine with
mocked submission and reconciliation tests, leaving actual broadcast disabled until
owner approval. This step provides no broadcast endpoint and Part B is uncommitted.

## Step 61 — controlled broadcast state machine (MOCK EXECUTION ONLY)

Step 60 committed as 366779ec89865572aba05f62d83f5227e336f859. All send calls
in this development step were to injected in-memory mocks. No actual Core/node,
network transaction, mining, clock advancement or physical Jade was used.

### Explicit authorization and durable intent

CreatorBroadcast reuses the exact verified private artifact, receipt/request/plan/
wallet binding and successful preflight record. Authorization requires a separate
operator broadcast token and explicitBroadcastApproval digest over transactionId,
requestDigest, receiptDigest and the exact preflightId. A successful preflight must
match the same receipt/intent and be at most ten minutes old. A preflight token or
signing acknowledgement does NOT authorize broadcast.

SQLite creator_submissions records a unique server-generated submission UUID,
session/TXID (both unique), authorization UUID, full intent binding, pinned preflight,
fixed ten-minute expiry, consumed flag, attempted flag, phase and latest observation.
Authorization first persists NOT SUBMITTED. Execution atomically consumes it before
checks. Before ANY send callback, it durably writes attempted=1, SUBMISSION UNKNOWN,
ATTEMPT_RECORDED. Duplicate/conflicting/expired/consumed calls cannot send. There is
no RBF/replacement or automatic retry. An already observed matching transaction is
recorded without resubmission. All selected inputs, outputs and fee remain immutable.

Fresh preparation re-verifies the signed artifact/signatures and finalized TXID,
checks regtest genesis/synchronization, known transaction state, coherent confirmed
unspent inputs, exact scripts/values and fresh testmempoolaccept, then rechecks tip
and expiry. No older accepted preflight substitutes for these immediate checks.
An explicit policy rejection records its exact response and does not attempt send.
A failing integrity/funding/Core check consumes authorization without sending.

### Reconciliation and honest states

- NOT SUBMITTED: no external attempt recorded; may have a consumed/failed check.
- SUBMISSION UNKNOWN: attempt persisted but acceptance cannot be established.
- MEMPOOL OBSERVED: exact transaction bytes plus Core mempool-entry evidence.
- CONFIRMED: exact bytes, active block/header/depth and stable-tip evidence.
- REJECTED: explicit fresh policy rejection or structured Core rejection with
  consistent reconciliation showing no expected transaction.
- CONFLICTED: expected transaction absent and Core identifies a DIFFERENT mempool
  transaction spending a selected input. Unavailable inputs without identified
  conflicting spender remain UNKNOWN; never infer permission to replace/retry.

RPC response TXID alone is insufficient for mempool/confirmation success. Timeouts,
lost responses and restart checkpoints reconcile the exact TXID/bytes against Core.
A negative lookup alone never permits resend. Mempool eviction/reorg or node
unavailability can downgrade current certainty to UNKNOWN; append-only
creator_submission_events retains earlier observations, so historical confirmation
is not erased. Unknown-send or interrupted CHECKING records never automatically
retry. Explicit safe retry/reset policy remains unimplemented and requires review.

### Runtime boundary and interface

Same-origin loopback routes creator-broadcast-authorize/run/reconcile require
X-Professional-Broadcast-Token, independent of recovery/preflight tokens. Workflow
and transport are injected explicitly into createCreatorPlanService for MOCK tests.
The ordinary CLI does NOT read an enableBroadcastWorkflow flag or supply broadcastRpc;
therefore operator JSON or a browser fragment cannot turn on live sending here.
Live binding/credential isolation and normalizing Core error codes (not-found=-5,
explicit rejection=-22/-25/-26) remain a separately approved integration requirement.
Never interpret an arbitrary timeout or string error as definitive rejection.

Existing Core lab/persistent adapters gained only read-only getmempoolentry and gettxspendingprevout
allowlist entries. Their startup, datadir, regtest and isolation checks are unchanged.
The broadcast module itself allows a narrow set of read methods plus a single send
method, but that method was exercised ONLY by mocked injected callbacks in this step.
No existing active node was connected or restarted.

Finish reuses current status fields and exposes stored submission observations with
recorded time/evidence, not implicit fresh blockchain checks on reload. Minimal span/
id hooks were added to existing text; no CSS/layout/branding/recipient redesign.
SIGNED — NOT BROADCAST remains the default, but UNKNOWN, MEMPOOL, CONFIRMED,
REJECTED and CONFLICTED observations override it accurately. Even CONFIRMED does
not claim recipient delivery or completed gift issuance; both remain pending.
An operator-only #broadcast=SESSION_ID flow prompts separately and never resends an
existing intent: it only reconciles it. The default CLI rejects the workflow.

### Evidence and remaining beta gates

68 focused Node tests pass (27 integration plus existing planner, financial,
lifecycle, camera and signature regressions). Mock tests cover intent-before-send,
one send maximum, explicit rejection, policy rejection, timeout, accepted-but-lost
response, simulated crash at the durable attempt checkpoint, database reopen,
confirmation reconciliation, spent inputs, expiry, conflicting IDs and HTTP tokens.
The initial HTTP fixture used an outdated synthetic clock, correctly rejected as
stale; fixing fixture time aligned it with the service without weakening expiry.
Crash coverage simulates the recorded checkpoint; it is not an OS-kill/live-Core test.
Actual Chromium with synthetic signing/funding and an in-memory mock send passed
operator authorization -> MEMPOOL OBSERVED/NOT CONFIRMED -> reload. No real send.
Existing verifier build passed; generated bundle removed. Windows/Brave, actual
broadcast transport and live-node/reorg behavior of this new workflow are unverified.

Next smallest slice: prepare the independently recoverable recipient delivery package
from a confirmed creator observation and existing recoveryManifest/recipient components,
keeping delivery gated until confirmation, recipient identity/custody and package
integrity checks pass. Operational backups, live-adapter review/authorization and
controlled end-to-end customer acceptance remain beta gates. Do not repeat completed
Jade exercises merely for UI development. Part B is uncommitted for owner review.

## Step 62 — confirmed recipient package preparation (delivery DISABLED)

Step 61 committed as b5e35648b13afa10fe84605dbcff55078485be83. This slice uses
mock confirmation/read-only Core responses only, with no live node connection,
transaction broadcast, mining, clock advancement or physical signing.

### Reused components and confirmation gate

CreatorRecipientPackages requires an authoritative CONFIRMED creator observation
AND a fresh read-only verification of the exact signed creator transaction from the
private artifact/receipt. The stored label alone is insufficient. It checks regtest
genesis, active block/height/depth, required confirmations (default 1; operator may
increase), exact raw transaction and all gift outputs. Existing confirmedOutpoints
and recoverPublicGift check coherent unspent outputs, full source funding/value
accounting and stable active tip. A missing/unconfirmed/reorganized/spent/mismatched
output rejects preparation. A replay after reorg cannot silently reuse a package
whose creator confirmation block changed. No package is re-labelled as delivered.

recoveryManifest/validateRecovery provide existing authenticated public recovery
structure. prepareClaim supplies unsigned single-release claims using the established
recipient-paid fee policy. prepareProfessionalCustomerHandoff and its verifier check
exact outpoint/CLTV/destination/amount bindings; no replacement recovery/claim or
signing system was introduced. Gross principal remains in the manifest; handoff
claim amounts are net of explicitly calculated recipient mining fees. They are
preparation-time estimates, not future signing authorization or guaranteed live fees.
Accumulated claims can later use the existing manifest/prepareClaim path.

### Recipient identity and package contents

Operator recipientPins entries require exact planDigest, walletDigest, recipientId
(opaque non-PII identifier), destinationScriptHex. The payout must match one of the
already registered recipient public keys, not an arbitrary creator change/service
key. The package additionally binds digest(wallet.recipient). Operator pinning is
not legal-identity verification or evidence that a distinct real recipient controls
a hardware wallet. Actual recipient custody and authenticated delivery remain gates.
No new key generation or request for recipient secrets is involved.

The prepared package includes UUID, approved plan/wallet digests, opaque recipient
binding, historical confirmation snapshot, existing public recovery manifest, and
existing customer/recipient handoff with unsigned claim PSBTs. The manifest includes
the already-confirmed creator transaction (public blockchain data), never creator
seed/private keys, raw unconfirmed signing return, account xpub/chain code or a signed
recipient claim. Existing manifest schema retains public creator/service/change keys
needed by its recovery/accounting verification; no incompatible reduced schema was
invented. All delivery/signing authorization flags remain false.

Whole-package canonical digest plus existing manifest and handoff digests bind every
field. verifyRecipientDeliveryPackage requires an independently obtained digest and
recipient pin, validates the manifest/confirmation schema, and reconstructs claims
and handoff to reject tampering. A self-contained hash is NOT sender authentication:
the eventual delivery process must supply the digest/recipient binding through an
independently authenticated channel. Verification returns chainCurrentlyVerified:false;
recipient use must obtain fresh evidence rather than treating a snapshot as live.

### Durability, access and status

SQLite creator_recipient_packages stores operation/session/package IDs, full package,
immutable binding/digest, PREPARED state and NOT_AUTHORIZED delivery state. The same
operation retries idempotently only after fresh confirmation checks; another operation
or recipient for that prepared session conflicts. Parallel preparation is serialized
and cannot overwrite the package. Existing DB/private-runtime backup policy applies;
no package or fixture payload is committed to Git or exposed as a static resource.

POST creator-recipient-package requires same-origin/Host/schema gates and a separate
X-Professional-Recipient-Package-Token. Operator configuration adds recipientPins,
minimumDeliveryConfirmations and recipientPackageTokenSha256. No actual delivery,
export/download endpoint or email/message operation was added. Response/Finish status
contain package ID/digest and disabled-delivery flags only, not package bytes.

Existing Finish handoff-stage text shows stored package preparation and digest,
explicitly NOT authorized/not delivered. An operator-only #recipient-package=SESSION_ID
flow uses native token/opaque-ID prompts; no screen/layout/CSS/branding/control
redesign. Reload shows the stored record, not an implied fresh confirmation check.
Preparation requires revalidation; a later delivery authorization MUST repeat chain,
recipient custody/pin and package integrity checks and handle any intervening reorg.
No recipient interface or established hardware components were changed.

### Validation and remaining beta work

72 focused Node regression tests passed, including existing customer handoff coverage.
New tests cover valid mocked confirmation, manifest/handoff integrity, tampering,
recipient mismatch/pin rejection, insufficient depth, unconfirmation/reorganization,
changed output scripts, database reopen, same-ID retry/conflicting duplicate and
HTTP operator token/disabled delivery. Actual Chromium with synthetic confirmed
creator evidence passed preparation -> existing Finish package status -> reload,
with actual delivery disabled. No live-chain or Windows/Brave acceptance is claimed.
An initial browser harness import-path error was fixed without application changes.

Known limitation: this existing single-release handoff needs each individual claim
to pass current dust/fee checks. A schedule economical only through accumulation
fails closed; support for that package shape requires a bounded follow-up using the
existing accumulated-claim engine, not a new allocation formula. Future fee changes
require fresh claim preparation/approval. A lost DB requires an operational backup;
independent backup/restore, real recipient custody and live adapter remain unverified.

Next smallest slice: explicit durable recipient delivery authorization and bounded
package export/receipt through an authenticated channel, rechecking confirmation,
recipient pin/custody and integrity before release. Keep actual sending/delivery
separately gated. Recipient onboarding/import, independent recovery instructions,
claim authorization/signing and controlled beta end-to-end acceptance remain to be
integrated. Do not repeat passed Jade tests simply to develop those interfaces.
Part B remains uncommitted for review; no deployment or beta launch authorized.

## Step 63 — authorized local recipient export, NOT external delivery

Step 62 committed as 76dfd03cf8c2f2a3e9d98682aa72fbaaffce3a48. This slice uses
synthetic confirmation data only; no real Core, chain mutation, signing, notification,
email, messaging or recipient sending occurred.

### Explicit authorization and fresh export gate

enableRecipientExport defaults false. A separately configured recipientDeliveryTokenSha256
and X-Professional-Recipient-Delivery-Token protect same-origin/Host/schema-validated
creator-recipient-authorize and creator-recipient-export routes. The package-preparation
token alone does not authorize export. Operator configuration/token remain private;
no token is persisted in browser storage or URL.

Authorization includes sessionId, exact packageId/packageDigest, pinned recipientId,
a UUID authorizationId and explicitDeliveryApproval. The approval digest commits the
immutable package, approved plan/wallet, creator TXID, recipient keys/destination and
confirmation block. Before authorization AND export, the existing package-preparation
pipeline rechecks exact creator confirmation, required depth, original outputs and
unspent recipient principal, recovery manifest and independent operator recipient pin.
Whole-package integrity is verified again; the tip must remain stable across the
entire validation interval. Reorg to another confirmation block, spent outputs,
changed recipient, corruption, superseded state or mismatched identity rejects export.
No package contents, fees, allocation formula or claim signing logic is replaced.

SQLite creator_recipient_exports stores unique authorization/package IDs, immutable
binding, fixed ten-minute expiry, consumption, generated-file digest/time and state.
A duplicate/conflicting authorization is rejected; the same unconsumed authorization
can proceed after service reopen. Browser reload can restore the authorized ID from
server status after a lost authorization response. Expired/consumed/mismatched export
calls fail. There is no automatic expiry renewal, reset or conflicting replacement.

After fresh validation, one SQLite transaction checks expiry/state, consumes the
permission, records EXPORTED/file hash and commits BEFORE the HTTP attachment is
returned. Thus a crash before commit produces no export, and a crash/lost response
after commit leaves an authoritative EXPORTED record, never DELIVERED. Duplicate
export is rejected, including after restart. Recovery/re-export of an already
consumed download is intentionally not automated; an operator must review the
record before any separately authorized repeat-export policy is added.

### Integrity, interface and meaning of delivery states

The operator-authenticated response is an attachment of the SAME existing package,
not a new delivery format. X-Package-Digest is its canonical integrity digest;
X-Export-File-Digest binds the exact UTF-8 JSON file bytes. Browser checks both before
initiating its local file download. The package still verifies through existing
verifyRecipientDeliveryPackage, manifest and customer handoff validators. It contains
public recovery data/unsigned claims and the already-confirmed public creator
transaction, never seed phrases, private keys or signed recipient authorizations.
Keep this financial metadata and recipient identifiers in controlled storage.

Recipient authenticity still requires the eventual independently authenticated
channel for the expected digest and recipient identity. A digest embedded in its
own JSON file does NOT prove sender identity. The local token authenticates the
operator export request, not delivery to a remote recipient.

States: NOT_AUTHORIZED -> AUTHORIZED -> EXPORTED; EXPIRED may be reported dynamically.
AUTHORIZED grants ONE local controlled export, not external sending. EXPORTED means
an export response/file was generated, not proof the browser saved it and not proof
a recipient received it. There is NO DELIVERED transition or delivery receipt in this
slice. All APIs retain delivered:false, deliveryAuthorized:false (external delivery)
and signingAuthorized:false. The immutable package's original disabled flags remain
unchanged; authority is the separate operator/database record.

Existing Finish handoff-stage text distinguishes export states and states external
sending is disabled. Operator-only #recipient-export=SESSION_ID uses native token
and exact package/recipient confirmation prompts, then a local JSON download. Reload
shows persisted status only. Existing creator/recipient layouts, styling, branding
and controls are unchanged; no new page, email or notification system was introduced.
Static previews cannot export without the authenticated local coordinator.

### Beta support restriction — do not broaden silently

The controlled beta package path currently supports ONLY schedules for which EVERY
individual release covers the existing recipient mining-fee estimate and leaves a
non-dust payout. Schedules viable only through accumulated claims remain rejected at
package preparation, despite the existing engine's accumulated-claim support. No
allocation or fee formula was changed to bypass this restriction.

Smallest future correction: extend existing handoff normalization/verification to
carry explicitly selected accumulated release groups (or manifest-based deferred
claim preparation), using existing prepareClaim and max-selected-locktime rules.
Retain independent manifest/destination binding, exact principal/fee conservation,
dust checks and explicit recipient claim approval. Do not invent an automatic
allocation/grouping or investment algorithm and do not weaken single-release checks.
That compatibility work is NOT implemented in Step 63.

### Validation and remaining work

74 focused Node regressions pass, including existing customer handoff, planner,
lifecycle and camera/signature checks. New tests cover exact explicit approval,
disabled/missing authorization, recipient mismatch, fresh confirmation loss, corruption,
superseded state, expiry, service/store reopen, one-time export, file digest, duplicate
export rejection and accurate non-delivered HTTP/Finish states. Actual Chromium with
synthetic confirmation evidence passed authorization -> integrity-checked JSON local
download -> EXPORTED after reload, with delivery explicitly not performed. No real
recipient, Core node or hardware was used; Windows/Brave remains unverified.

Remaining requirements: independently authenticated recipient distribution and receipt,
recipient custody/onboarding, import/claim/recovery integration, explicit renewal/
repeat-export recovery policy, operational backups and supervised end-to-end beta
acceptance. Minimum next slice: recipient-side import of this existing package with
an independently supplied digest/identity, reusing current recipient/recovery views
and keeping claim signing/external delivery disabled until separately authorized.
Part B remains uncommitted; no deployment/merge/beta release is authorized.

## Step 64 — recipient public-package import and recovery

`recipient-package-import.mjs` reuses `verifyRecipientDeliveryPackage`, the
existing recovery-manifest validation and existing per-release handoff/claim
verification. No replacement transaction engine or network adapter is involved.
POST `/api/regtest/recipient-package-import` requires exactly `package`,
`expectedDigest` and `recipientPin`. The pin has `recipientId`,
`recipientKeysDigest` (canonical digest of the registered recipient public-key
array) and `destinationScriptHex`. Obtain the digest AND entire public pin
through an independent authenticated channel. Values copied from the imported
JSON do not establish independent verification. Never supply wallet secrets.
The service can compare pins, but cannot prove how a human obtained them.

The existing `recipient-gift-specific-prototype.html` file/digest controls now
import the creator's delivery export through the loopback coordinator. A native
prompt requests the independent public pin; no layout or styling was redesigned.
The schedule displays exact principal satoshis and UTC CLTV dates. Imported
packages cannot enable the page's signing, QR or camera diagnostic controls.
Changing import inputs clears accepted display state. The legacy standalone
handoff-file button is now reserved for this coordinator-backed delivery export;
raw fixture/PSBT diagnostics remain separate from accepted-package authority.
The logo resolves inside Professional. CSP permits same-origin coordinator calls
only; existing Host/Origin/JSON checks apply. The service is supervised local
single-operator infrastructure, not multi-user authentication or an internet API.

Acceptance stores the public package, independent pin, digest, package ID and
creator TXID in `recipient_package_imports` in the existing durable SQLite DB.
Exact repeats are idempotent; another package for an already accepted creator
TXID conflicts instead of replacing it. Stored packages are fully reverified on
every recovery. Browser localStorage retains only the independently supplied
public pins/digest as a recovery locator, not signing authority. Reload recovers
from the coordinator. After browser-storage loss, enter the independent digest
and pin again and click the same verify control without selecting a file, or
re-import the original exported JSON. POST `/api/regtest/recipient-package-recover`
requires exactly `expectedDigest` and `recipientPin`. After coordinator DB loss,
re-import requires the original export and independent pins. Back up this DB and
public exports with access controls: public wallet keys and recipient linkages
are privacy-sensitive even though they cannot sign. No seeds, private keys or
signed claim payloads are added to this table.

Status is always **PACKAGE IMPORTED**, **FUNDING NOT VERIFIED**, **CLAIM
UNAVAILABLE**. The package's confirmation snapshot is historical evidence, not a
fresh chain observation. Import, restore and reload make no Core calls. They do
not prove recipient receipt/delivery, current unspentness, current confirmation,
maturity or spending authority. No signing, broadcasting or external sending is
wired. Offline static previews include the page/module but require the existing
loopback coordinator for import/recovery; Python's static HTTP server alone will
reject API operations. Service invocation/configuration is unchanged.

Next smallest slice: independently revalidate the imported manifest's creator
transaction, active-chain confirmation and exact unspent gift outputs using the
existing read-only Core adapter, with durable evidence/status and reorg handling.
Only then integrate separately authorized claim preparation and signer binding.
Accumulated-only schedules remain unsupported by delivery packaging. The minimal
future integration is explicit accumulated release-group metadata in the existing
handoff validator, backed by `prepareClaim`'s existing max-locktime, fee, dust and
satoshi-conservation checks. Do not invent grouping rules or silently accept such
schedules. Recipient claim signing, external delivery and supervised beta
operational/legal approvals remain separate work.

Step 64 validation (synthetic fixtures, no active-chain access): 77 selected Node
regressions passed. `test_recipient_package_import_browser.py` exercises actual
loopback HTTP in Linux Chromium: exact schedule display, disabled signing/QR/
camera, repeat/reload, recovery without browser storage and wrong-digest
rejection; it also checks packaged script/logo dependencies. Existing verifier
build passed without dependency installation. The broader final-review/package
and dependency-lock suites had four passes and one failure: an unchanged test
expects `No Bitcoin has been broadcast`, while authoritative Finish now says no
verified receipt exists and no completed gift/broadcast/confirmation is
established. That unrelated assertion was not changed or weakened. Windows/
Brave and new physical-device behavior were not tested in Step 64.

Step 65 closure of Step 64: the obsolete static-preview Finish wording assertion
now requires the authoritative missing-receipt message, explicit absence of
completed gift/broadcast/confirmation evidence, and a hidden verified-transaction
panel. No implementation regression or weakened authorization was found. All 77
focused Node tests and all 7 preview/lock/recipient-browser checks passed. The
commit contains only the eight Step 64 source/test/documentation files plus this
justified preview regression correction; no generated bundle or private data.

## Step 65 — fresh recipient funding and CLTV observations

`recipient-funding-verification.mjs` consumes the durable, independently pinned
import via `RecipientPackageImports.recover`. POST
`/api/regtest/recipient-package-verify` takes exactly the same independent
`expectedDigest` and full `recipientPin` as recovery. The existing loopback
Host/Origin/JSON restrictions apply. It uses only the existing operator-selected
read-only `rpc` adapter and confirmation policy (`minimumDeliveryConfirmations`,
default 1). There is no wallet RPC, signing, submission or node-starting path.

The verifier reuses `assertRegtest`, `recoverPublicGift`, `confirmedOutpoints` and
`prepareClaim`: verify genesis/network/synchronization, exact creator raw bytes
and TXID, every gift/service/change output, confirmed active-block depth, original
packaged block identity, recovered public funding-input accounting, recipient
binding/scripts/schedule, and mempool-aware unspent output evidence. Snapshot
tips must agree across reads. A changed packaged confirmation block requires
explicit review; it is not silently rebound. Missing, unconfirmed, explicitly
conflicted, reorganized, insufficient-depth, mismatched, stale and unavailable
observations fail closed. A missing/null outpoint is unavailable/spent or a
mempool spend, not proof identifying a conflicting spender; missing transaction
lookups cannot by themselves prove a confirmed conflict. No wallet-secret RPC or
chain scan is introduced to invent that evidence.

CLTV eligibility uses the transaction's actual finality boundary: timestamp
locktime must be strictly less than the sampled active tip MTP (BIP113); a height
locktime must be strictly less than tip height + 1. Equality at timestamp maturity
is still non-final. The manifest verifier already reconstructs exact CLTV scripts,
keys and locktimes. Current delivery packages contain public-date schedules;
height-boundary tests cover the helper without broadening package acceptance.
Existing `prepareClaim` is reused for recipient-paid fee, dust and payout checks.

Funding confirmation, per-release unspentness, maturity and
`claimPreparationEligible` are separate observations. **Actual `claimAvailable`,
`signingAuthorized` and `broadcastAuthorized` remain false in every result.**
Funding can be confirmed while one or more recipient outputs are unavailable.
A mature/unspent observation is not proof of current recipient private-key
possession or permission to sign. All future claim preparation/signing/submission
gates must make fresh checks and bind their own exact authorization; no future
authorization endpoint is implemented or enabled by this step.

Append-only `recipient_funding_observations` retains public observation IDs,
package/transaction binding, tip, height, MTP, depth, per-release results and
safe failure categories in the existing durable SQLite DB. It contains no signed
payloads or secrets. POST `/api/regtest/recipient-package-history` returns the
latest historical evidence explicitly nested beneath `historicalObservation`;
its current root status is always REVERIFY REQUIRED with fresh/funding/claim
flags false. Restart/reload never promotes a saved PASS into current authority.
Keep this privacy-sensitive public-linkage database in the existing restricted
coordinator workspace and backup policy.

The existing recipient import/recovery control now triggers fresh verification.
Existing total, schedule cells, selected-release status and UTXO status display
the result without layout/styling changes. A failed new check clears old positive
funding/maturity text. Observations expire on screen after 60 seconds or when the
page becomes hidden; re-run the existing import/recover action to refresh. Reload
fetches a new observation. This timeout is a display freshness limit, never an
authorization lease. An offline Python static preview cannot verify funding;
the coordinator must be running with an explicit read-only adapter. No actual
active regtest node was queried or mutated during implementation testing.

Next smallest integration: bind an explicit release selection and independently
verified recipient signer identity to the existing `prepareClaim` engine, then
create a durable, exact unsigned claim review request after fresh confirmation,
unspentness and maturity checks. Signing/submission require separate approval.
For accumulated releases, feed explicitly selected mature release numbers to the
already tested `prepareClaim` engine (its max locktime, sum, fees and dust checks
remain authoritative). Imported manifests already carry all releases/keys and
outpoints. Do not rebuild the accumulated engine. Accumulated-only delivery
packages still fail the existing per-release handoff validation; explicit group
metadata plus matching handoff/import validation is the remaining integration
needed before that supported scope can expand. No additional hardware exercise,
external delivery or deployment was performed.

Step 65 validation: 82 selected Node tests passed (including the five new
recipient-verification tests); the 40-test funding/integration file also passed
after adding wrong-network, altered transaction bytes and wrong-UTXO-amount
cases. All seven preview/lock/recipient-browser checks passed. The updated browser
checks additionally exercised confirmed immature and mature-but-disabled
releases, then Core unavailability after a successful observation, proving old
positive status is cleared. No tests failed. The verifier bundle built using
already-installed dependencies; diff checks passed. Linux Chromium and synthetic
Core mocks only: Windows/Brave and actual-node integration remain unverified by
this step. Existing physical Jade acceptance evidence was neither repeated nor
altered. Part B remains uncommitted pending owner review.

## Step 66 — controlled single-release unsigned claim preparation

`recipient-claim-preparation.mjs` connects an accepted package and explicit single
release selection to the existing `prepareClaim` engine. No new Bitcoin financial
algorithm, signer or transaction finalizer is introduced. The existing recipient
release selector offers a native confirmation for eligible releases; public
registration and the separate operator token are requested through native
prompts. Existing status/evidence elements show RELEASE MATURE versus CLAIM
PREPARED — NOT SIGNED. No HTML, CSS, layout, branding or signing-control changes
are required. Camera, unsigned-QR signing handoff and signing remain locked.

The operator must provision private coordinator configuration:

- `recipientClaimPins`: an array of `{packageDigest, recipientId, walletDigest}`
  obtained from independently verified operator records, never automatically
  trusted from an imported package.
- `recipientClaimTokenSha256`: SHA-256 of a separate high-entropy operator
  preparation/recovery token. It is not a wallet credential. The raw token is
  not stored in the DB, browser storage or repository. It travels only to the
  local coordinator, under the existing Host/Origin/JSON restrictions. Missing
  configuration fails closed; no automatic enablement or token creation occurs.

POST `/api/regtest/recipient-package-claim-prepare`, with
`X-Professional-Recipient-Claim-Token`, requires exactly:
`expectedDigest`, `recipientPin`, UUID-v4 `operationId`, integer `releaseNumber`,
full public `signer` key/origin record, `registration`, and
`explicitPreparationApproval: true`. The registration must pass the existing
`verifyWalletRegistration` gate against the independent operator wallet pin and
match the complete manifest wallet. Its supported existing proof formats include
raw public role proofs, Jade registration proof and verified prior funded
possession. Secret-bearing/unknown registration fields are rejected. The full
public key, derivation path and master fingerprint must exactly match the
selected CLTV recipient key; an eight-character fingerprint alone is insufficient.

This reuses the existing complete-wallet role-possession gate. It proves the
pinned public-key relationship/previous possession, not legal identity, hardware
origin or a fresh physical signature. It does not require the recipient to hold
creator private keys: existing public proof artifacts can be reused. A new
recipient-only possession adapter is not implemented. If the appropriate prior
public registration/proof artifact is unavailable, preparation remains blocked;
do not request seeds or create replacement software signatures. No physical
proof/signing exercise was requested or repeated in this step.

After identity checks, fresh recipient funding verification must pass for the
selected output, including confirmation depth, active-chain membership,
unspentness and strict CLTV finality. The engine's exact unsigned PSBT must match
the delivery package's approved per-release PSBT/hash. Additional policy checks
cover version 2, one exact creator outpoint, sequence `0xfffffffd`, CLTV locktime,
one pinned recipient destination, principal/payout/mining-fee conservation and
absence of signatures. The existing package's rate-2 claim quote, dust and fee
rules remain unchanged. The selected outpoint is checked again immediately
before persistence; changed/unavailable evidence fails closed.

`recipient_claim_preparations` stores the public unsigned PSBT, SHA-256, claim and
operation UUIDs, request digest, independent package/recipient/wallet/signer
binding, exact inputs/outputs/fees/locktime and historical preparation evidence
in the existing coordinator DB. Public registration proofs themselves are NOT
retained, only their digest and successful verification binding. No signed PSBT,
seed, private key or wallet secret is added. Existing private DB permissions and
backup policy apply; do not place the DB under static assets or commit it.

Preparation identity and per-creator-release reservations are committed atomically
before success. Exact duplicates, conflicting operation IDs/release requests and
concurrent duplicate preparations fail; they do not silently replace a claim.
POST `/api/regtest/recipient-package-claim-recover` requires the same separate
operator token and `{expectedDigest, recipientPin, claimId}`. Recovery checks the
operator pin, stored digest and original binding, reconstructs the existing engine
request and verifies exact unsigned bytes. It returns historical CLAIM PREPARED,
`currentEligibilityUnverified: true`, and signing/broadcast/claim availability
flags false. All retained funding evidence is explicitly historical, never fresh
authorization. Recovery can work with Core unavailable; future signing must make
new eligibility checks.

Browser storage retains only the claim ID, release number and package digest.
Selecting that release after reload offers historical recovery instead of a
duplicate prepare request, with a fresh operator token prompt. No token, proof or
signed data is retained there. If browser storage is lost, the operator must
recover the original claim ID from coordinator records/previous evidence and use
the authenticated recovery endpoint; automatic claim discovery/listing is not
implemented. A recovered request never means CLAIM SIGNED or submitted.

Next smallest integration: exact prepared-claim acknowledgement and durable
review-only handoff to the existing Jade QR workspace, bound to claim/request/
PSBT hashes, signer identity, inputs, outputs, fees and fresh funding/maturity
checks. A subsequent signing session needs its own expiring, single-use durable
authorization. Reuse the existing Jade transport and `finalizeClaim`/signed-return
verification; do not build another signing system. Signed-return import and any
broadcast require separate authorization and are not enabled here.

Accumulated-only delivery schedules remain rejected. The existing accumulated
engine can consume an explicitly selected release-number group, use its existing
max locktime and fee/dust checks, and prepare one combined PSBT. Remaining wiring
is an explicit group-selection request plus group-aware handoff/package approval,
verification and atomic per-outpoint reservations. This phase accepts only one
release and does not silently broaden the package or schedule set. Existing
hardware accumulated-claim evidence remains unchanged.


Step 66 validation: all 87 selected Node tests passed, including five new claim
preparation tests covering valid selection, exact approved unsigned bytes,
identity/possession rejection, immature/spent/changed funding, authenticated HTTP,
concurrent duplicates, corruption and clean DB-reopen recovery. All 7 Python
preview/lock/recipient-browser checks passed. Chromium exercised preparation via
the existing selector, exact principal display, NOT SIGNED status and historical
claim recovery after reload, with signing/QR controls still disabled. Verifier
build and diff checks passed without installing dependencies. Tests used
synthetic disposable registrations and mocked Core only. No active-chain reads
or mutations, physical Jade operations, real transactions, external delivery,
Retail access, deployment or merge occurred. Windows/Brave and live coordinator
configuration remain unverified in this step. Part B is not committed or pushed.

## Step 67 — exact-claim acknowledgement and review-only Jade handoff

`recipient-claim-review.mjs` wraps the existing durable prepared claim rather than
creating another transaction or signing system. It reconstructs the existing
claim engine request, checks the package-approved unsigned bytes and reuses
`verifyGiftReleaseBinding`. Its canonical acknowledgement intent binds claim and
request IDs/digest, package/manifest/wallet digests, the independent recipient pin,
full signer key/fingerprint/path, selected release, exact creator outpoint,
locking/redeem scripts, sequence, output destination/address/value, mining fee,
locktime and unsigned PSBT SHA-256. Altered intent data is rejected even if a
caller recomputes its own digest.

Four POST endpoints reuse the existing separate operator claim token in
`X-Professional-Recipient-Claim-Token`, independent claim pins and loopback
Host/Origin/JSON restrictions. No new token, automatic enablement or signing
permission is provisioned:

- `/api/regtest/recipient-package-review-intent`: exact `expectedDigest`,
  `recipientPin`, `claimId`, `requestDigest`; returns current canonical intent and
  acknowledgement digest, not authorization.
- `...-review-acknowledge`: those identities plus UUID-v4 `reviewId`,
  `acknowledgementDigest` and the complete `acknowledgedIntent`. A separate native
  recipient confirmation is required by browser wiring. Matching public wallet
  pins, full signer/manifest identity and the existing verified possession receipt
  are rechecked; no new physical possession/signature operation is implied.
- `...-review-handoff`: identities, `reviewId` and `acknowledgementDigest` only.
  After fresh active-chain/depth/unspentness/CLTV checks, consumes the authorization
  atomically BEFORE returning the unsigned review payload.
- `...-review-restore`: same binding, only for an already consumed, unexpired
  handoff. Fresh identity/funding/maturity checks remain mandatory. This is a
  read-only restore; it never renews expiry, re-acknowledges or consumes again.

`recipient_claim_reviews` retains the acknowledgement intent/digest, review and
claim IDs, ten-minute expiry, AUTHORIZED/CONSUMED state, consumed timestamp and
explicitly historical acknowledgement/handoff funding observations in the
existing private SQLite DB. There is one authorization per prepared claim.
Duplicates/concurrent attempts, changed recipient/output/fee/PSBT data, expired
records, changed/spent/immature funding and unavailable Core fail closed. Expiry
is checked again after fresh RPC reads and immediately before consumption. No
signed PSBT, wallet secret or signing-session authorization is stored. Existing
DB permissions, backup and privacy policies continue to apply.

The existing recipient release-selection/preparation flow offers exact-claim
acknowledgement through a native confirmation, with recipient address, input,
payout, mining fee, locktime and PSBT hash. A public binding locator is saved in
sessionStorage before consuming the handoff; no access token is retained. The
existing `jade-signing-workspace.html#recipient-claim-review` loads
`recipient-jade-review.browser.mjs`, restores the already consumed authorization
using a newly prompted operator token, and displays exact sats/BTC, release date,
input, address/script, fees, locktime/sequence, full signer origin and fingerprints
in the existing review/schedule/status elements. Existing unsigned gift-binding
verification runs again in-browser. No layout, stylesheet or branding is changed.

Recipient mode is selected only by the explicit fragment, so retaining its
locator cannot replace a later normal creator review. In recipient mode, creator
signing-session initialization and diagnostic camera binding are suppressed;
stale creator diagnostic data is discarded. QR panel, scan, stop, finish and
signing controls stay locked. No QR signing transport, camera, signature capture,
signed-return import or broadcast is activated. Existing Jade transport and
physical acceptance evidence remain unchanged for the subsequent authorized
signing slice. The preview allowlist includes the new browser module.

Reload restores only the same consumed unexpired identity, makes fresh checks and
requests the operator token again. Missing/mismatched identity, expired record or
unavailable/stale funding hides the review and remains locked. An on-screen timer
also closes expired review; server expiry remains authoritative. Returning to the
recipient page can restore the same locator after explicit confirmation; no new
authorization is minted. An uncertain handoff outcome must use restore, never a
blind second acknowledgement/handoff. If the saved request remains AUTHORIZED
rather than CONSUMED, operator inspection/resumption of that exact existing
handoff is required; the browser does not infer consumption from an error.

Limitations: expired authorizations cannot be automatically renewed or replaced;
an explicit reviewed cancellation/renewal policy is not implemented. Loss of
browser session state requires the operator to recover the original binding
from coordinator records. All active-node/Windows/device behavior remains
unverified by this mocked integration step. CLAIM PREPARED and REVIEW AUTHORIZED
both remain **NOT SIGNED** and confer no current claim/submission permission.

Next smallest slice: separate explicit signing authorization bound to this exact
review/claim, with durable expiry, single use and fresh funding/maturity checks,
then reuse the existing Jade QR/capture and `finalizeClaim` return verifier. Do not
repeat hardware tests or enable broadcast as part of that software integration.
Accumulated-only schedules remain unsupported; neither the existing accumulated
engine nor its hardware evidence was changed.

Step 67 validation: all 93 selected Node tests passed, including six new review
suites covering exact acknowledgement, changed fees/outputs/digest/recipient,
single use, expiry, stale/spent/unavailable funding, authenticated HTTP, corrupted
intent, DB-reopen restoration and concurrent requests. All 8 Python/browser checks
passed, including packaged resources/SRI, dependency lock, the existing creator
no-handoff lock and actual recipient-to-Jade workspace navigation. Chromium
verified exact amounts/fee, review-only status, reload without renewed identity,
client expiry, missing-binding rejection and isolation from a stale creator
binding. QR/camera/signing controls remained disabled. A harness navigation race
was corrected by waiting for acknowledgement cancellation before navigating;
final checks have no failures. Verifier build/diff checks passed; no dependencies
were installed. Synthetic/mock evidence only; no active node or physical Jade
operation, deployment, external delivery or real Bitcoin activity occurred.

## Step 68 — separately authorized recipient signing sessions

`recipient-claim-signing.mjs` adds explicit recipient signing to the consumed,
exact-claim review. It reuses the existing `prepareClaim` reconstruction,
`verifyLifecycleJadeReturn`/`finalizeClaim` signature and metadata checks,
`readJadeSignedPayload`/crypto-psbt decoder, existing animated gift QR renderer and
existing Jade camera receiver. No replacement signer, cryptographic compatibility
rule, USB/Bluetooth device connection or network hardware transport is introduced.

Operator configuration is fail-closed by default:

- `enableRecipientSigningSessions: true` is required for new/active sessions.
- `recipientSigningTokenSha256` is the hash of a separate high-entropy operator
  signing-access token. Use a distinct token from preparation/review access.
- Existing independent `recipientClaimPins`, imported independent recipient pin,
  verified registration/possession receipt and read-only Core configuration remain
  mandatory. A fingerprint alone is never signer verification.

POST `/api/regtest/recipient-package-signing-authorize` requires the existing six
review-binding fields, UUID-v4 `sessionId`, and `explicitSigningApproval` equal to
the exact acknowledged intent digest. `X-Professional-Recipient-Signing-Token`
is required independently of preparation/review access; all existing loopback
Host/Origin/JSON checks remain. Authorization rechecks full package/claim/wallet/
recipient/signer identity and exact consumed review, then makes fresh active-chain,
confirmation, selected-input unspentness and CLTV maturity checks. The canonical
session binding covers every reviewed input/output/fee/locktime/PSBT hash and the
independently reconstructed offline signing request digest. The prepared-claim
request digest and offline signing request digest are distinct, both bound.

`recipient_claim_signing` persists session, claim and review IDs, binding digest,
explicit authorization, creation/expiry times and AUTHORIZED/VERIFIED_RETURN state
in the existing private SQLite DB. Maximum session duration is five minutes,
capped by the original ten-minute review expiry. There is one session per
claim/review. Duplicate/conflicting/concurrent authorizations and expired sessions
cannot replace or renew it. POST `...-signing-state` restores the exact original
identity; active-session recovery requires fresh eligibility checks and never
extends expiry. Receipt-only recovery is historical, does not require live Core
or unexpired authorization, and cannot authorize signing. The review helper's
historical-expiry exception is used only after a verified-return session exists;
normal review/handoff expiry behavior is unchanged.

POST `...-signing-return` takes the exact session binding plus bounded
`signedPayload` (canonical Base64 PSBT or saved crypto-psbt UR frames). Before
consuming the session, it verifies the exact authorized offline request and
unsigned transaction, all selected outpoints, script/origin metadata, expected
recipient public key, low-S ECDSA signature, SIGHASH_ALL, unchanged outputs/fees,
locktime, finalization and conservative transaction-size policy. Fresh funding
checks run again before acceptance, and expiry/single-use binding is rechecked
inside the receipt transaction. Concurrent or duplicate valid returns cannot
consume twice. Wrong signer/origin, changed amounts/locktime, non-SIGHASH_ALL,
missing/invalid signatures and changed/unavailable funding fail closed.

Only the verified receipt is retained: intent and authorization bindings, exact
signed-PSBT SHA-256, finalized TXID, vsize, fee, verification time and explicit
false broadcast/authority flags. P2SH claim TXID is taken from validated
finalization, never inferred from the unsigned TXID. Receipt digest and all
bindings are checked on recovery. `hardwareOriginAttested: false` distinguishes
cryptographic signature verification from physical-device provenance. No signed
PSBT/raw claim bytes, private key, seed or wallet secret are stored by this slice.
The receipt alone cannot recover or submit the signed transaction.

The existing Jade workspace remains review-only until operator opt-in AND a
separate native signing confirmation/token prompt. Its existing scan button then
exposes the existing animated QR and starts the camera only on a further explicit
click. The new bundle export `bc1q21ProfessionalAttachClaimCameraTransport`
exposes the established camera receiver as transport to the coordinator verifier.
The older diagnostic camera's byte-identical-parent verifier is unchanged: this
new authorized path deliberately uses the previously validated lifecycle
normalization that accepts only the original full parent transaction or its
exact witness-stripped representation. No acceptance checks were weakened.

Browser state stores only the public session locator; no token, signature payload
or wallet secret is retained there. Reload prompts again for signing access and
queries authoritative state. The page distinguishes CLAIM PREPARED, REVIEW
AUTHORIZED, SIGNING AUTHORIZED and CLAIM SIGNED — NOT BROADCAST. QR/camera stop
on verified return, expiry, changed binding, hidden page or navigation; Finish
and completed-gift controls stay disabled. The recipient page can inspect the
same stored session/receipt through its existing selection/status elements;
a historical signature never implies current funding, mempool acceptance or
confirmation. No layout, styling or branding change was made.

Uncertain signed-return responses are reconciled through session state before
any deliberate retry; no blind resend occurs. An uncertain/failed authorization
keeps the original locator and fails closed. If no session was created, operator
inspection and explicit resumption of that original request is required; the UI
does not mint another identity automatically. Expired authorizations still have
no automatic renewal policy. Loss of browser storage requires operator recovery
of the original session/review binding. Windows/Brave, actual Core integration and
physical Jade behavior for this new application wiring are not claimed verified.

Next smallest slice: retain the exact verified signed claim bytes in the existing
restricted private artifact-store architecture, bound to receipt/session/TXID,
with integrity-checked recovery/re-import and backup policy. Until then the
original signed capture/device response must be preserved; losing it cannot be
repaired from a receipt. Later controlled submission needs separate preflight,
explicit broadcast authorization, uncertain-outcome reconciliation, confirmation
and recipient status wiring. None is enabled here. Existing accumulated-claim
engine/hardware evidence are unchanged. To support accumulated delivery later,
add explicit release-group metadata/selection and group-aware package/handoff
validation, then reuse the existing engine's max-locktime, fee/dust and signature
checks with atomic per-outpoint reservations. Accumulated-only schedules remain
rejected in the current delivery path.

Step 68 validation: 126 selected Node tests passed, zero failed, and the opt-in
physical-capture regression was deliberately skipped. Seven new signing tests
cover exact/explicit authorization, operator opt-in, wrong identity, fresh funding,
short/capped expiry, concurrent sessions/returns, duplicate prevention, changed
outputs/locktime/origin/sighash, wrong/invalid signatures, receipt corruption,
verified-receipt DB reopen, saved UR frames and exact witness-stripped parent
compatibility. The focused invalid-return test also passed after adding spent and
reorganized funding at return time. All 9 Python/browser checks passed, including
the actual existing QR renderer, independently decoded expected unsigned frame,
simulated video-camera UR reconstruction, server ECDSA verification, camera-track
cleanup, receipt reload with unavailable Core and historical signed status on the
recipient page. Default review-only and existing creator no-handoff locks remain
covered. The bundle build and diff checks passed with existing dependencies; two
initial syntax errors in the export/test loader were corrected before the final
passing run. No physical device/camera or active blockchain was used. No new
hardware provenance, Windows/Brave or actual-node integration claim is made.
Part B remains uncommitted and unpushed for review.

## Step 69 — private recipient signed-claim retention and recovery

Recipient retention reuses `CreatorPrivateArtifacts` directly. There is no second
blob store, new cryptographic algorithm or signed-transaction filesystem format.
`recipient-claim-signing.mjs` adds a separately namespaced
`recipient_signed_artifacts` table linking session ID, immutable signed-PSBT
SHA-256/length and immutable receipt digest. The existing session/receipt binding
already covers package, recipient pin, wallet/signer origin, selected release,
prepared claim, exact outpoint/output/fee/locktime and finalized TXID. Creator
records remain in their existing tables and operator mode.

New coordinator configuration:

- `recipientArtifactDirectory`: explicit private directory outside the repository
  and static assets. Prefer a distinct recipient directory alongside the creator
  directory. Enabling recipient signing now requires this configuration; no
  implicit directory or fallback is created inside the checkout.
- `recipientRecoveryTokenSha256`: SHA-256 of a separate high-entropy recovery
  operator token. The existing recovery-header/constant-time SHA-256 validator is
  reused with this recipient-specific pin. Signing/preparation tokens do not
  authorize recipient artifact recovery. Never put raw tokens in repository files.

On a new successful signed return, cryptographic and fresh eligibility checks run
as before. Exact returned signed-PSBT bytes are written/fsynced to the immutable
private store before the receipt/session is committed. Expiry is checked again
after durable file I/O. Storage failure/expiry rolls back session consumption and
artifact linkage. A crash between file persistence and SQLite commit may leave
an unreferenced content-addressed blob, never an authorized receipt or permission
to broadcast. Do not delete such evidence automatically; operator reconciliation
is required. No signed bytes are stored in the public receipt, SQLite record,
browser storage, static assets or Git.

Restoring a retained signed state checks file owner/permissions/size, SHA-256,
receipt link and full lifecycle signature/transaction verification against the
original approved claim. `CLAIM SIGNED — NOT BROADCAST` remains historical proof
of signing only. Recovery does not require current Core availability or unexpired
signing permission and never grants new permission; future preflight/submission
must independently recheck chain status. Missing, corrupted, unsafe-permission,
wrong-package/recipient, revoked-wallet-pin and conflicting artifacts fail closed.
A private artifact's existence alone cannot create or replace a receipt.

POST `/api/regtest/recipient-artifact-recover` requires
`X-Professional-Recovery-Token` and exactly `{sessionId, expectedDigest,
recipientPin}`. The expected package digest and full recipient pin must come from
independently verified records, not from the captured signed PSBT. Existing
loopback Host/Origin/JSON and bounded request controls apply. The response contains
public recovery locators, the verified historical receipt and integrity metadata,
never signed transaction bytes. POST `...-import` additionally requires
`signedPayload` (bounded canonical Base64 or saved crypto-psbt frames). It accepts
only the exact SHA-256 already recorded by the authoritative verified receipt,
rechecks signatures/finalization/TXID/fees, and uses the same immutable put path.
Identical imports/recovery retries are idempotent; another signed PSBT cannot
replace the recorded artifact, even if it has valid signatures or the same TXID.
Corrupted existing files are preserved and rejected, not overwritten silently.
An absent file can be recreated from its exact independently retained capture.

Existing Step 68 receipt-only records can acquire retention through authorized
exact re-import without another device signature. Their original receipt and
receipt digest remain unchanged. The receipt's `artifactRetained` field describes
retention at receipt creation; the current response's `artifactRetained` and
`artifactIntegrityVerified` describe the reverified retained artifact today.
This preserves existing acceptance evidence while distinguishing repaired storage
from a replacement or newly signed transaction.

The existing operator tool now supports recipient mode:

```
node Professional/lifecycle/creator-artifact-operator.mjs --recipient recover DB OPERATOR_CONFIG SESSION_ID
node Professional/lifecycle/creator-artifact-operator.mjs --recipient export DB OPERATOR_CONFIG SESSION_ID PRIVATE_OUTPUT_FILE
node Professional/lifecycle/creator-artifact-operator.mjs --recipient import DB OPERATOR_CONFIG SESSION_ID PRIVATE_CAPTURE_FILE
```

Use the checkout's existing dependency-resolution invocation where required;
these commands do not install anything, contact Core or broadcast. Local operator
filesystem access to the private DB/config/store is the CLI authorization boundary,
as with creator recovery. The config supplies independent `recipientClaimPins`
and `recipientArtifactDirectory`. Without `--recipient`, creator behavior is
unchanged. Export reuses the existing exclusive owner-only file writer, refuses
repository/symlink destinations and never overwrites an existing output. It writes
only a private local file; it does not send anything externally or expose a web
export endpoint. No signed bytes or credentials are printed to stdout.

For complete browser-storage loss, open the existing workspace at
`http://127.0.0.1:8766/jade-signing-workspace.html#recipient-claim-recovery=SESSION_ID`
on the configured local coordinator (use its actual port). Native prompts request
the independent package digest, full recipient public pin and separate recovery
token. Successful recovery reconstructs only the original public locators and
shows the retained signature receipt with signing controls locked. It neither
re-authorizes nor asks for a new signature. Missing/wrong binding or token remains
locked. Creator signing/diagnostic initialization is suppressed for this explicit
recovery fragment just as for recipient review; ordinary creator pages are
unchanged. Normal reload still uses the original signed-session locator and
operator signing access; artifact bytes are reverified before retained status is
reported. No layout, branding, stylesheet or new signing interface was added.

Storage/security operations remain those of the established store: POSIX
owner-only 0700 directory and 0600 files, no symlinked path components,
content-addressed names, exclusive writes, file/directory fsync and integrity
checks on every read. **Native Windows ACL enforcement remains unsupported and
fails closed.** Windows/Brave may be a browser client; the private coordinator
store requires the supported Linux operator environment. No permissive Windows
fallback or claim of Windows verification is introduced. Any later Windows
storage backend requires reviewed ACL enforcement and separate validation.

Back up the private blobs together with a consistent coordinator DB snapshot and
operator configuration/independent pins. Keep backups access-restricted, outside
static serving/Git, and preserve receipt/hash relationships. Copying a live WAL
DB without a consistent snapshot is not a backup procedure. No backup destination
or transfer was used by this step. Retain signed claims/captures and recovery
records until an explicitly approved retention policy permits deletion after
submission/confirmation and recovery reconciliation; no automatic expiry,
deletion, artifact replacement or garbage collection is implemented. Workspace
or disk loss still requires an independently protected backup or exact original
capture. The receipt alone cannot reconstruct lost signed bytes.

Next smallest slice: connect the retained verified claim to an explicitly
operator-authorized, durable, read-only Core `testmempoolaccept` preflight, reusing
the existing creator preflight/verification patterns through a claim-bound
adapter. Keep accepted preflight distinct from broadcast. Later submission needs
separate exact-transaction broadcast authorization, durable submission intent,
uncertain-outcome reconciliation, confirmation/reorg handling and recipient
status updates. No such claim submission path is enabled here. Accumulated-only
schedules and new hardware exercises remain outside this slice; existing engine
and hardware evidence are unchanged. Legal, operational backup/restore and
supervised beta environment approval remain separate readiness requirements.

The existing signed-status evidence text also shows the public signing-session
ID, so an operator can retain the recovery locator independently of browser
storage. If it is lost, recover the ID from the protected coordinator records;
do not use wallet credentials or infer identity from the signed capture alone.

Step 69 validation: 132 selected Node tests passed, zero failed; the opt-in
physical-capture regression was deliberately skipped. Six new retention suites
cover exact private bytes/permissions, DB-reopen recovery, missing/corrupted files,
receipt-link corruption, revoked pins, immutable imports, storage-failure and
expiry rollback, shared CLI export/re-import/no-overwrite, independent-pin/token
HTTP recovery, static-path denial and legacy receipt migration without altering
its digest. Existing creator retention/CLI tests remained passing. All 9
Python/browser checks passed, including actual synthetic QR-camera signing,
retained-status reload and full recovery in a separate empty-storage browser
context with Core unavailable. The new recovery fragment rebuilt public locators
and showed SIGNED — NOT BROADCAST with signing controls locked. Bundle build and
diff checks passed with existing dependencies. No active node, real transaction,
physical camera/Jade, deployment, external delivery, Retail or main-branch change
occurred. No new Windows/private-store validation is claimed. Part B remains
uncommitted and unpushed pending review.

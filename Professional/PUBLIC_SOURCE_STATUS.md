# Public source status and security boundaries

## Source and acceptance scope

The independent repository began with 611 approved source files at root commit
`96f60c2211093e2216a43cbd415270699594bb1d`, tree
`e4745f572f59ff5caa4ddfc1ecc0e50cec9a7289`. The initial migration excluded
subsequent cosmetic changes. This document is a later documentation clarification,
not a replacement acceptance test or a claim that the file count never changes.

Recorded acceptance on November 16, 2026 covered the browser-local creator and
beneficiary lifecycle on isolated Windows Bitcoin Core Regtest, including physical
Jade Plus air-gapped QR signing, creator funding confirmation, a mature release
claim and its confirmation, with later releases remaining locked. Same-claim
signing authorization renewal was exercised without repeating the signature.
Private wallet exports, raw hardware captures and signed transaction artifacts
are not required public evidence and must not be added to this repository.

Acceptance is limited to the tested Regtest workflow. It does not certify all
wallets, network conditions or schedules, and is not mainnet qualification.
Do not use real Bitcoin with this Regtest-only application.

## Customer architecture and entry points

- Creator: [creator.html](creator.html).
- Beneficiary: [recipient-gift-specific-prototype.html](recipient-gift-specific-prototype.html).
- Transaction construction, financial checks, public wallet validation and
  signature verification run on the customer's device.
- Jade Plus remains air-gapped: animated QR and camera/file transfer, not USB,
  Bluetooth or network signing. Never enter seed words or private keys here.
- Current customer working state is temporary browser memory. Closing or reloading
  the application can lose progress; customers retain their own recovery materials.
  Browser/OS memory, caches and downloaded files are outside any promise of secure
  erasure. This application does not promise forensic removal of all traces.
- Gift packages are optional conveniences. Independent discovery uses the supported
  seed-reproducible public-account profile and bounded discovery addresses; public
  wallet information is exported independently without entering the seed here.
  Supported paths and search bounds are defined in
  [independent-recovery-profile.mjs](independent-recovery-profile.mjs).

The browser uses customer-selected independent Bitcoin information/submission
services, not a bc1q21 transaction coordinator or relay. Those services necessarily
receive requested addresses, transaction identifiers or submitted transaction bytes
and may observe network metadata. Local raw-transaction and script checks do not
make the browser a full node: confirmation, unspentness and maturity observations
still trust the selected service's chain information. Choose a trusted service or
an appropriately secured connection to a customer-controlled node.

## Legacy and testing boundaries

The [lifecycle guide](lifecycle/README.md) distinguishes reusable Bitcoin engines
from historical coordinator, SQLite, token and persistent artifact-store workflows.
Those workflows are not the production customer architecture. Legacy modules may
contain browser-storage or backend-service behavior; do not activate legacy routes
or deploy the entire source tree as the customer site. Use the approved static
runtime allowlist and correct entry points.

Public synthetic fixtures intentionally use predictable test keys and are not
proof of physical hardware acceptance. Never fund them. Approved disposable
Regtest public service configuration is not a mainnet service destination.
See [default and optional testing](PUBLIC_SOURCE_TESTING.md). Historical pending
statements are not instructions to repeat completed acceptance tests.

## Licensing

Software is provided under [Apache License 2.0](../LICENSE), with existing
[NOTICE](../NOTICE) and [third-party notices](../THIRD_PARTY_NOTICES.md).
[License scope](../LICENSING.md), [branding policy](../BRANDING_POLICY.md) and the
[unchanged-disclaimer redistribution policy](../ASSET_LICENSE.md) remain separate.
The disclaimer PDF is not granted unrestricted Apache modification rights.
[Rights provenance](../RIGHTS_PROVENANCE.md) records the owner's representation
and the limits of independently verified ownership evidence. This document does
not expand any license or claim that those legal uncertainties are resolved.

## Publication and deployment gates

Source publication, development access, software acceptance and deployment
permission are separate decisions. A source review or passing test is not live
website deployment approval. Historical checklist warnings describe their recorded
stage; use later verified findings to determine whether a particular issue was
resolved, rather than treating every historical warning as a current defect.

ChatGPT and Codex may retain authorized development and code-editing capabilities.
**Dale alone must approve every live website deployment.** Before deployment is
enabled, this separation must be technically enforced and verified end to end,
including the deployable revision/artifact and deployment credentials. Development
commits, pushes, merges or tests must not independently activate a release.
A manually triggered workflow or a statement in documentation is insufficient.

These deployment controls are requirements, not controls implemented or verified
by this document. Keep deployment disabled until their enforcement is demonstrated
and explicitly approved. Repository protections and approval capabilities must be
verified for the applicable account plan and visibility; do not assume that merely
configuring a rule makes it enforceable. Hosting must serve static files only and
must not expose local Bitcoin RPC or adapters publicly. Mainnet qualification and
any real-Bitcoin use require separate approval.

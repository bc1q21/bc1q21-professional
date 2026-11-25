# Proposed public-source candidate — NOT APPROVED FOR PUBLICATION

This local file set omits private transfer packages, raw owner evidence and internal
review records. It preserves reusable application code and the accepted runtime
files. The repository history has NOT been sanitized by producing this directory.
No Git metadata is included; do not publish the original repository by assuming this
file-level preparation also cleans historical commits, PR refs, artifacts or logs.

Predictable public software fixtures replace selected historical owner fixtures.
See Professional/PUBLIC_ACCEPTANCE_SUMMARY.md. No new physical wallet or Bitcoin
acceptance is claimed. Historical helper CLI credentials and public accounts must
be configured explicitly; see Professional/REGTEST_CONFIGURATION.md.

Apache-2.0 LICENSE, applicable NOTICE and third-party notices are prepared. Owner/
contributor rights and logo/custom stylesheet/legal-document permissions remain
unresolved. Inclusion here does not assert that those permissions were granted.

Publication remains blocked: frozen accepted runtime/build inputs contain owner-
linked diagnostic/public service data requiring a separate disposition decision.
The legacy generated-page renderer also has an existing example-row regression;
its test is retained and not weakened. The current browser interface is unchanged.
No deployment automation or automatic production trigger is included or activated.

Offline focused suite (existing locked dependencies required, no services started):

    node Professional/run-public-source-tests.mjs
    python -B Professional/test_regtest_rpc_config.py
    python -B Professional/test_public_source_packaging.py

The Node runner reports the known legacy-renderer failure rather than hiding it.
Do not interpret that as a new browser-beta regression: the original inputs produce
it too. A separate decision is needed before changing that generated-page helper.
Fresh dependency installation and the entire historical test program were not
repeated; the preparation checks reuse the existing matching dependency versions.

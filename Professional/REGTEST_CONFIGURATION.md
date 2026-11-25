# Local disposable Regtest helper configuration

The four historical Docker/Core helper scripts no longer contain RPC credentials.
Set BC1Q21_REGTEST_RPC_USER and BC1Q21_REGTEST_RPC_PASSWORD in your own local process
from your own node configuration. Do not commit the values or place them in shared
shell history. Missing, empty or multiline configuration fails closed. The password
is passed to bitcoin-cli via -stdinrpcpass and docker exec -i, not command arguments.
These helpers require Core CLI support for -stdinrpcpass; existing Core 28/31 tools
support it. Existing Docker container names and -regtest/-datadir restrictions remain.
They are historical command-line development tools, not browser/coordinator services.
Some build helpers deliberately mine disposable blocks: do not execute them for a
read-only check. No node, Docker or Bitcoin operations were performed for this change.

build-jade-creator-24-public-psbt.mjs additionally requires these public-only inputs:
BC1Q21_TEST_ACCOUNT_XPUB, BC1Q21_TEST_ACCOUNT_FINGERPRINT and
BC1Q21_TEST_ACCOUNT_ORIGIN. The existing historical helper constructs coin-type-0
metadata, so origin must explicitly be m/84'/0'/0'. It rejects a private extended key
or another origin rather than silently substituting one. This does not change the
browser application's separate coin-type-0 and coin-type-1 support.

No seed words or private keys are needed. Use a disposable test public account.
Existing historical evidence is preserved privately; public tests should use coherent
synthetic public data with scripts, signatures, derivations and hashes regenerated
together where needed, rather than blanket string replacement.

Run focused offline configuration tests:

    node --test Professional/regtest-rpc-config.test.mjs
    python -B Professional/test_regtest_rpc_config.py

This preparation removes literals from the current working copy only. Historical
commits remain sensitive until separately approved repository cleanup is completed.

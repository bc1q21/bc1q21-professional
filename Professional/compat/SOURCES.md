# Reference artifact provenance

`retail-AESHelper.mjs` is a byte-for-byte copy of `Frontend/AESHelper.js` in
`bc1q21/bc1q21`, inspected read-only for this assignment. Git blob:
`66ec78fc2ee56fefc5aa5ad97399e3710061512a`.

It is used **only** by the offline compatibility regression. It is not imported
by customer pages, the lifecycle coordinator, the disposable signer, or the
preview package. No browser wallet, mnemonic or WIF implementation was copied.
The test covers current BC1Q21G1 encryption/decryption compatibility; it does not
establish an end-to-end legacy Retail gift import or seed-only recovery path.

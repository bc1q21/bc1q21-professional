# Private Professional interface acceptance preview

This is an unfunded local preview, not a customer beta or payment service.
Use fictional identity details. No seed, private key, real wallet or funds.
Suggested allocations are hypothetical estimates using the pinned Retail calculation reference; unsafe/dust results are rejected. They do not change the total BTC gift.
The approved Professional PDF is installed separately at
`assets/documents/bc1q21_Professional_Liability_Disclaimer.pdf`.
It is displayed in the existing scrollable area and can be opened or downloaded.
Continue, form submission, review and final approval require explicit acceptance.
Acceptance stays in this page's memory only; reload requires acceptance again.
Missing or non-PDF responses fail closed. This does not enable real Bitcoin.

## Build the complete package (developer/packaging machine)

For an existing Windows preview build, reuse its installed dependencies: update
only the detached build checkout to the reported commit and run the packager.
Do not reinstall dependencies for this correction pass.

Use this Professional repository and the PR #2 branch. With Python, Node/npm
and the existing locked browser dependencies available:

```sh
python Professional/package-local-preview.py /tmp/Professional-preview.zip
```

On Windows, a destination such as
`"%USERPROFILE%\Downloads\bc1q21-Professional-PR2-complete.zip"` can be used.
Only with separate authorization for initial dependency setup on a new packaging
machine, run
`npm --prefix Professional/browser-integration ci`. This installs locked build
dependencies locally; it does not deploy or change a Git branch. Python and
Node/npm are required for packaging; only Python and Brave are needed to run
the resulting ZIP. No software is installed by the packaging script itself.

Do not use the earlier hand-picked `git archive` command as a complete preview:
Git does not contain the generated verifier. The packager builds that existing
bundle and copies an explicit asset allowlist. It excludes transaction fixtures,
wallet data, environment files, node_modules and unrelated source. CSS bytes
are preserved. Extract to a new directory, stop the old server with Ctrl+C,
then run `Start-Professional-Preview.cmd`. Open
`http://127.0.0.1:8766/index.html` in Brave and press Ctrl+Shift+R.

## Interface checks (November 11 correction)

1. Leave identity blank or use fictional advisor branding. Read the Professional
   Liability Disclaimer in the welcome area. The checkbox starts unchecked;
   Continue is locked until it is checked. Open/download must show the complete
   three-page PDF including advisor, customer and joint-customer signature lines.
2. Enter 0.00100002 BTC. Toggle USD/BTC repeatedly: USD entry must retain
   80.0016 and BTC must retain 0.00100002, even though the approximate USD
   display rounds to $80.00. Alternatively enter 80.0016 USD. All conversion
   uses $80,000/BTC, explicitly development-only, never a live quote.
3. Neither gift type is initially selected. Choose **Multiple dates**, then
   click **Continue** to open the date controls. Choose
   five yearly releases from 2030-01-02. Continue to the equal-amount question.
4. Neither equal/variable choice is initially selected. Choose **Yes, same BTC
   each time**, then **Continue** to open Your gift plan:
   20,001 / 20,001 / 20,000 / 20,000 / 20,000 sats; total 100,002. Continue to
   the separate Plan ready screen: service 2,000 sats, estimated mining cost
   1,750 sats, estimated deposit 103,752 sats.
5. Back returns one decision at a time and preserves explicit choices. Choose
   **No, different amounts**, then **Continue** to open
   **How should we set the amounts?** Select manual, Continue, then enter
   exact date/BTC lines. Check Target Total, Current Total and mismatch feedback.
6. Alternatively select **Let bc1q21 suggest amounts**, Continue to **Optional:
   growth guess**, and choose 10%. With the above dates/total, the reference
   allocation is 23,981 / 21,803 / 19,822 / 18,016 / 16,380 sats. Blank/zero
   growth follows the reference's last-release correction: 20,000 / 20,000 /
   20,000 / 20,000 / 20,002. This differs deliberately from equal allocation's
   already-validated earliest-release remainder rule. All totals remain exact.
7. Projections are hypothetical, use Professional calendar dates and a fixed
   reference time saved with the editable draft. No growth is promised. Extreme
   projections, dust and unsafe reference rounding fail closed. Review the
   estimated price/target displays; they are not payment or investment advice.
8. Continue from Plan ready approves only an unfunded public plan and opens
   Add Funds. Changes require fresh review. One-time gifts retain a single-date
   branch and the explicit Professional schedule/final approval boundary.

## Public-only address QR demonstration

No hardware or Bitcoin Core is needed for this display test. This is the
software-only synthetic public account from `fixtures/public-synthetic-wallet.mjs`
(origin `m/84'/0'/0'`), not an authenticated Jade or customer wallet. Its test keys
are publicly predictable: never send funds to them. No hardware acceptance is claimed:

```text
xpub6CWn7FVm9LqggFpxKSUKQesGP7MMvwoD7fkJTebEoUwJSBRVWe7SL3jAhCReWxKUrpcmDuNCaVYwwcQea3yeJdKeDQkgGvFvPKNHL4JJhVW
```

On Add Funds, expand **Development wallet setup and funding diagnostics**,
paste this value in **Jade account xpub (public only)** and click
**Preview public funding key**. The existing diagnostic path derives `/0/0`
and renders a plain `bcrt1q…` regtest address QR. This is not a BIP21 payment
request. Do not scan it with a real wallet or send funds. Changing the xpub
hides the QR; changing the plan requires review again. Do not use the funding
inspection, transaction construction or hardware-signing diagnostic controls.
The fixture does not authorize these operations; signing/broadcast flags stay
false and the unsigned-transaction/Jade handoff controls remain locked.

Automated acceptance builds/extracts the ZIP, serves it using Python over
loopback, follows the actual planner, decodes the rendered QR independently,
checks it matches the displayed address, and checks the authorization locks.
Linux Chromium testing does not certify Windows/Brave or physical Jade.


### Clean-build prerequisite correction

The first PR #2 packaging revision omitted `browser-integration/package-lock.json`;
its documented `npm ci` command could not run from a fresh checkout. The lock
is now committed, including Windows esbuild optional packages. It was generated
without an existing node_modules tree so it is not limited to Linux binaries.
A clean `npm ci` and the packaged browser regression were exercised on Linux;
Windows installation still requires owner acceptance. New regressions check
manifest/lock agreement and the Windows x64 build package and integrity entry.
No application, fee, scheduling or authorization behavior changed in this fix.


### November 17 approved Professional disclaimer correction

Replaces the earlier development-mode bypass; the historical November 11
record remains in `CUSTOMER_INTERFACE_CORRECTIONS_2026-11-11.md`.

Approved attachment: 473,602 bytes, SHA-256
`617602ff48f768a6a5d233bbdd767c16eb4bcbb332a47f43a0471a5419c75543`.
PDF bytes and formatting are unchanged. Printed signature lines are present;
the supplied PDF has no electronic form fields.

Future legal revisions replace the separate approved PDF, not application code.
The gate obtains the document without caching, derives its identity from SHA-256
and binds explicit acceptance to those loaded bytes. PDF publication is a trusted
release operation, not a customer-selected URL. The checksum is document identity,
not an independent authentication signature. A replacement during an already open
session does not revoke that session automatically; reload requires fresh acceptance.
No consent database, browser storage or transmission of acceptance is introduced.
The checkbox does not prove that the user read or signed the printed document.

Deployment requires the six changed runtime assets (PDF, gate, policy, planner HTML,
JavaScript and CSS). Browser bundles and Bitcoin logic are unchanged. Include the
PDF in the static allowlist; serve it as `application/pdf` behind the same access
control. Planner CSP permits only same-origin document loading/frames. If live
response headers impose stricter `connect-src` or `frame-src` directives, reconcile
those during separately approved deployment; this task does not change nginx.
Existing private test-environment notices and all Regtest safety controls remain.
No deployment or commit is authorized by this correction.

Focused checks:
```
node --test Professional/disclaimer-gate.test.mjs
python -B Professional/test_disclaimer_browser.py
```

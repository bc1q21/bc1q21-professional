// Configuration for disposable local Regtest helpers. No network calls or storage.
function required(env,name){
 const value=env[name];
 if(typeof value!=='string'||!value||/[\r\n\0]/.test(value))throw Error(`${name} must be set to a nonempty single-line local value`);
 return value;
}
export function regtestRpcConnection(env=process.env){
 const user=required(env,'BC1Q21_REGTEST_RPC_USER');
 const password=required(env,'BC1Q21_REGTEST_RPC_PASSWORD');
 return Object.freeze({args:Object.freeze([`-rpcuser=${user}`,'-stdinrpcpass']),input:password+'\n'});
}
export function legacyPublicTestAccount(env=process.env){
 const xpub=required(env,'BC1Q21_TEST_ACCOUNT_XPUB');
 const fingerprint=required(env,'BC1Q21_TEST_ACCOUNT_FINGERPRINT');
 const origin=required(env,'BC1Q21_TEST_ACCOUNT_ORIGIN');
 if(!/^xpub[1-9A-HJ-NP-Za-km-z]+$/.test(xpub)||!/^[0-9a-f]{8}$/i.test(fingerprint))throw Error('A public legacy test account and eight-digit fingerprint are required');
 // This historical helper already writes coin-type-0 PSBT origins. Do not silently
 // accept an account from a different origin. Browser coin-type-1 support is separate.
 if(origin!=="m/84'/0'/0'")throw Error('This historical helper requires its explicit coin-type-0 account origin');
 return Object.freeze({xpub,fingerprint:fingerprint.toLowerCase(),origin});
}

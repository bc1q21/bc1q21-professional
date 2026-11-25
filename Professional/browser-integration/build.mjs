import { build } from 'esbuild';
import { polyfillNode } from 'esbuild-plugin-polyfill-node';
import { fileURLToPath } from 'node:url';

const options={
  entryPoints: ['browser-verifier-entry.mjs'],
  bundle: true,
  nodePaths:[fileURLToPath(new URL('./node_modules',import.meta.url))],
  platform: 'browser',
  format: 'iife',
  target: 'es2022',
  outfile: 'professional-verifier.bundle.js',
  alias: {
    'bitcoinjs-lib': fileURLToPath(import.meta.resolve('bitcoinjs-lib')),
    '@noble/hashes/sha256': fileURLToPath(import.meta.resolve('@noble/hashes/sha256')),
    '@noble/curves/secp256k1': fileURLToPath(import.meta.resolve('@noble/curves/secp256k1')),
    jsqr: fileURLToPath(import.meta.resolve('jsqr')),
    '@ngraveio/bc-ur': fileURLToPath(import.meta.resolve('@ngraveio/bc-ur')),
  },
  plugins: [polyfillNode()],
};
await build(options);
await build({...options,entryPoints:['creator-browser-entry.mjs'],outfile:'creator-browser.bundle.js',nodePaths:[fileURLToPath(new URL('./node_modules',import.meta.url))]});
await build({...options,entryPoints:['../beneficiary-discovery.worker.mjs'],outfile:'beneficiary-discovery.worker.js',format:'iife'});

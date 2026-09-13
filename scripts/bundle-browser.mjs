#!/usr/bin/env node
/**
 * Browser IIFE bundle builder.
 * Bemenet: dist/browser-entry.js (TypeScript már le van fordítva;
 *   ez a belépési pont kizárólag böngésző-biztos modulokat húz be:
 *   fast-xml-parser, nincs WASM, nincs XSD-validáció, nincs `node:*`).
 * Kimenet: dist/browser/nav-invoice-to-html.min.js
 *
 * Globális neve: NavInvoiceToHtml
 * Használat CDN-ről:
 *   <script src="https://cdn.jsdelivr.net/npm/nav-invoicedata-to-html@latest/dist/browser/nav-invoice-to-html.min.js"></script>
 *   <script>
 *     NavInvoiceToHtml.generateInvoiceHtml(xmlString).then(html => { ... });
 *   </script>
 *
 * Bundlerrel (Vite/webpack) inkább az ESM belépési pontot használd:
 *   import { generateInvoiceHtml } from 'nav-invoicedata-to-html/browser';
 */

import { build } from 'esbuild';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));

const banner = `\
/*!
 * nav-invoicedata-to-html v${pkg.version}
 * Hungarian NAV Online Invoice XML → HTML generator
 * https://github.com/kzolti/nav-invoicedata-to-html
 * @license Apache-2.0
 */`;

console.log('[bundle-browser] Building browser IIFE bundle...');

await build({
  entryPoints: [resolve(root, 'dist/browser-entry.js')],
  bundle: true,
  minify: true,
  format: 'iife',
  globalName: 'NavInvoiceToHtml',
  outfile: resolve(root, 'dist/browser/nav-invoice-to-html.min.js'),
  platform: 'browser',
  target: ['es2020', 'chrome90', 'firefox88', 'safari14'],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  banner: { js: banner },
  logLevel: 'info',
});

console.log('[bundle-browser] Done → dist/browser/nav-invoice-to-html.min.js');

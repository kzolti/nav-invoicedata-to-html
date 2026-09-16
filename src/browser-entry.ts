// Browser-only entry point: fast-xml-parser, no WASM, no XSD validation,
// no `node:*` imports. Safe to bundle with Vite / esbuild / webpack.
//
// Usage (bundler):
//   import { generateInvoiceHtml } from 'nav-invoicedata-to-html/browser';
//
// Usage (CDN, IIFE global `NavInvoiceToHtml`):
//   <script src="https://cdn.jsdelivr.net/npm/nav-invoicedata-to-html@latest/dist/browser/nav-invoice-to-html.min.js"></script>
export { xmlParserFxp, XsdSchemaName } from 'nav-osa-core/browser';
export { HtmlGenerator, CssConfig } from './generator/index.js';
export { invoiceStylesCss, THEME_CSS } from './styles/cssInlined.js';
export type { InvoiceData } from 'nav-osa-types';
import { xmlParserFxp, XsdSchemaName } from 'nav-osa-core/browser';
import { HtmlGenerator, CssConfig } from './generator/index.js';
import type { InvoiceData } from 'nav-osa-types';

export interface GenerateInvoiceHtmlOptions {
  locale?: string;
  schemaName?: XsdSchemaName;
  cssConfig?: CssConfig;
  /**
   * Ignored in the browser build (no XSD validation is available).
   * Accepted for API compatibility with the Node.js entry point.
   */
  validate?: boolean;
}

/**
 * Generate an invoice HTML string from a NAV OSA XML string (browser).
 *
 * Uses `xmlParserFxp` (fast-xml-parser, no XSD validation). The input XML
 * is trusted as-is; validate server-side with the Node.js entry point
 * (`nav-invoicedata-to-html`) if validation is required.
 *
 * @param xmlData - Raw NAV OSA XML string (InvoiceData envelope).
 * @param options - Optional locale, schema name, CSS config (`validate` is ignored).
 */
export async function generateInvoiceHtml(xmlData: string, options?: GenerateInvoiceHtmlOptions): Promise<string> {
    const opts = options || {};
    const parsed = await xmlParserFxp<{ InvoiceData: InvoiceData }>(xmlData, opts.schemaName ?? XsdSchemaName.Data);
    const jsonData = parsed.InvoiceData;

    const generator = new HtmlGenerator(opts.locale || 'hu', opts.cssConfig);
    return await generator.generate(jsonData);
}

export interface GenerateInvoiceHtmlFromDataOptions {
  locale?: string;
  cssConfig?: CssConfig;
}

/**
 * Generate an invoice HTML string from an already-parsed `InvoiceData`
 * object (no XML parsing, no validation — useful when the JSON comes
 * from an API response or a previous `xmlParserFxp` call).
 *
 * @param data - Parsed NAV OSA `InvoiceData` object.
 * @param options - Optional locale and CSS config.
 */
export async function generateInvoiceHtmlFromData(data: InvoiceData, options?: GenerateInvoiceHtmlFromDataOptions): Promise<string> {
    const generator = new HtmlGenerator(options?.locale || 'hu', options?.cssConfig);
    return generator.generate(data);
}

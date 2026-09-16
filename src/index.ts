export { xmlParser, xmlParserFxp, XsdSchemaName } from 'nav-osa-core';
export { HtmlGenerator, CssConfig } from './generator/index.js';
export { invoiceStylesCss, THEME_CSS } from './styles/cssInlined.js';
export type { InvoiceData } from 'nav-osa-types';
import { xmlParser, XsdSchemaName } from 'nav-osa-core';
import { HtmlGenerator, CssConfig } from './generator/index.js';
import type { InvoiceData } from 'nav-osa-types';

export interface GenerateInvoiceHtmlOptions {
  locale?: string;
  schemaName?: XsdSchemaName;
  cssConfig?: CssConfig;
  /** Disable XSD validation before parsing. Default: true (enabled). */
  validate?: boolean;
}

/**
 * Generate an invoice HTML string from a NAV OSA XML string (Node.js).
 *
 * Uses `xmlParser` (libxml2-wasm) with optional XSD validation.
 * For browsers, import from `nav-invoicedata-to-html/browser` instead
 * (fast-xml-parser, no WASM, no XSD validation, no `node:*` imports).
 *
 * @param xmlData - Raw NAV OSA XML string (InvoiceData envelope).
 * @param options - Optional locale, schema name, CSS config, validation flag.
 */
export async function generateInvoiceHtml(xmlData: string, options?: GenerateInvoiceHtmlOptions): Promise<string> {
    const opts = options || {};
    const parsed = await xmlParser<{ InvoiceData: InvoiceData }>(xmlData, opts.schemaName ?? XsdSchemaName.Data, {
        validate: opts.validate
    });
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
 * object (no XML parsing, no validation).
 *
 * @param data - Parsed NAV OSA `InvoiceData` object.
 * @param options - Optional locale and CSS config.
 */
export async function generateInvoiceHtmlFromData(data: InvoiceData, options?: GenerateInvoiceHtmlFromDataOptions): Promise<string> {
    const generator = new HtmlGenerator(options?.locale || 'hu', options?.cssConfig);
    return await generator.generate(data);
}

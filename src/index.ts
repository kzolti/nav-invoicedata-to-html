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

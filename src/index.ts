export { parseXml, validateXml, XsdSchemaName } from 'nav-osa-core';
export { HtmlGenerator, CssConfig } from './generator/index.js';
export type { InvoiceData } from 'nav-osa-types';
import { parseXml, validateXml, XsdSchemaName } from 'nav-osa-core';
import { HtmlGenerator, CssConfig } from './generator/index.js';
import type { InvoiceData } from 'nav-osa-types';

export interface GenerateInvoiceHtmlOptions {
  locale?: string;
  schemaName?: XsdSchemaName;
  cssConfig?: CssConfig;
  /** Disable XSD validation before parsing. Default: true (enabled). */
  validate?: boolean;
}

export async function generateInvoiceHtml(xmlData: string, options?: GenerateInvoiceHtmlOptions): Promise<string> {
    const opts = options || {};
    const parsed = await parseXml<{ InvoiceData: InvoiceData }>(xmlData, {
        schemaName: opts.schemaName ?? XsdSchemaName.Data,
        validate: opts.validate
    });
    const jsonData = parsed.InvoiceData;

    const generator = new HtmlGenerator(opts.locale || 'hu', opts.cssConfig);
    return await generator.generate(jsonData);
}

export { parseXml, validateXml } from 'nav-osa-types';
export { HtmlGenerator, CssConfig } from './generator/index.js';
export type { InvoiceData } from 'nav-osa-types';
import { parseXml, validateXml } from 'nav-osa-types';
import { HtmlGenerator, CssConfig } from './generator/index.js';
import type { InvoiceData } from 'nav-osa-types';
import { getXsdPath } from 'nav-osa-types';

export interface GenerateInvoiceHtmlOptions {
  locale?: string;
  xsdPath?: string;
  cssConfig?: CssConfig;
  /** Disable XSD validation before parsing. Default: true (enabled). */
  validate?: boolean;
}

export async function generateInvoiceHtml(xmlData: string, options?: GenerateInvoiceHtmlOptions): Promise<string> {
    const opts = options || {};
    const parsed = await parseXml<{ InvoiceData: InvoiceData }>(xmlData, {
        xsdPath: opts.xsdPath || getXsdPath('data'),
        validate: opts.validate
    });
    const jsonData = parsed.InvoiceData;

    const generator = new HtmlGenerator(opts.locale || 'hu', opts.cssConfig);
    return await generator.generate(jsonData);
}

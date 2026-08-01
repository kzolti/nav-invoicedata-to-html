export { parseXml, validateXml, XsdSchemaName } from 'nav-osa-types';
export { HtmlGenerator, CssConfig } from './generator/index.js';
export type { InvoiceData } from 'nav-osa-types';
import { CssConfig } from './generator/index.js';
export interface GenerateInvoiceHtmlOptions {
    locale?: string;
    xsdPath?: string;
    cssConfig?: CssConfig;
    /** Disable XSD validation before parsing. Default: true (enabled). */
    validate?: boolean;
}
export declare function generateInvoiceHtml(xmlData: string, options?: GenerateInvoiceHtmlOptions): Promise<string>;
//# sourceMappingURL=index.d.ts.map
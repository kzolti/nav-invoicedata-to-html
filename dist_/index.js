export { parseXml, validateXml, XsdSchemaName } from 'nav-osa-types';
export { HtmlGenerator } from './generator/index.js';
import { parseXml, XsdSchemaName } from 'nav-osa-types';
import { HtmlGenerator } from './generator/index.js';
export async function generateInvoiceHtml(xmlData, options) {
    const opts = options || {};
    const parsed = await parseXml(xmlData, {
        xsdPath: opts.xsdPath || XsdSchemaName.Data,
        validate: opts.validate
    });
    const jsonData = parsed.InvoiceData;
    const generator = new HtmlGenerator(opts.locale || 'hu', opts.cssConfig);
    return await generator.generate(jsonData);
}

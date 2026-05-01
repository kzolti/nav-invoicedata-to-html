export { parseXml, validateXml } from './parser/index.js';
export { HtmlGenerator } from './generator/index.js';
export type { InvoiceData } from './osaTypes/dataTypes.js';
import { parseXml, validateXml } from './parser/index.js';
import { HtmlGenerator } from './generator/index.js';
import type { InvoiceData } from './osaTypes/dataTypes.js';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateInvoiceHtml(xmlData: string, locale: string = 'hu', xsdPath?: string): Promise<string> {
    // Ha nincs megadva útvonal, használjuk a csomagban lévő alapértelmezettet
    const finalXsdPath = xsdPath || path.resolve(__dirname, '..', 'xsd', 'data.xsd');

    const isValid = await validateXml(xmlData, finalXsdPath);
    if (!isValid) {
        throw new Error('XML validation failed');
    }

    const jsonData: InvoiceData = await parseXml(xmlData);

    const generator = new HtmlGenerator(locale);
    return await generator.generate(jsonData);
}

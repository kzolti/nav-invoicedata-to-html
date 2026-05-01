import { validateXml, parseXml } from './parser/index.js';
import path from 'path';

import fs from 'fs/promises';

async function main() {
    const xmlPath = path.resolve(__dirname, '../Peldaszamlak_v3.0/Belfoldi devizas szamla.xml');
    const xsdPath = path.resolve(__dirname, '../xsd/data.xsd');

    const xmlContent = await fs.readFile(xmlPath, 'utf-8');

    console.log(`Validating ${xmlPath} against ${xsdPath}...`);
    try {
        const isValid = await validateXml(xmlContent, xsdPath);
        console.log(`Validation result: ${isValid}`);
    } catch (error) {
        console.error('Validation error:', error);
    }

    console.log('Parsing XML...');
    try {
        const result = await parseXml(xmlContent);
        console.log('Parsed InvoiceData keys:', Object.keys(result));
        if (result.invoiceMain) {
            console.log('invoiceMain keys:', Object.keys(result.invoiceMain));
        }
    } catch (error) {
        console.error('Parsing error:', error);
    }
}

main();

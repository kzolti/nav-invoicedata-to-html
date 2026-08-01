import { generateInvoiceHtml } from './index.js';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
    try {
        const examplesDir = path.resolve(__dirname, '../Peldaszamlak_v3.0');
        const outputDir = path.resolve(__dirname, '../output');
        const xsdPath = path.resolve(__dirname, '../xsd/data.xsd');

        // Ensure output directory exists
        try {
            await fs.mkdir(outputDir, { recursive: true });
        } catch (err) {
            // ignore if exists
        }

        const files = await fs.readdir(examplesDir);
        const xmlFiles = files.filter(file => file.endsWith('.xml'));

        console.log(`Found ${xmlFiles.length} XML files in ${examplesDir}`);

        for (const file of xmlFiles) {
            const xmlPath = path.join(examplesDir, file);
            const outputFilename = file.replace('.xml', '.html');
            const outputPath = path.join(outputDir, outputFilename);

            console.log(`Processing ${file}...`);
            try {
                // const { parseXml } = await import('./parser/index.js');
                // const jsonData = await parseXml(xmlPath);
                // const invoiceData = jsonData.InvoiceData || jsonData;
                // console.log(JSON.stringify(invoiceData.invoiceMain.invoice.invoiceHead.supplierInfo, null, 2));

                const xmlContent = await fs.readFile(xmlPath, 'utf-8');
                const html = await generateInvoiceHtml(xmlContent, { locale: 'hu', xsdPath });
                await fs.writeFile(outputPath, html);
                console.log(`Generated: ${outputFilename}`);
            } catch (err: unknown) {
                console.error(`Error processing ${file}:`, err instanceof Error ? err.message : String(err));
            }
        }
        console.log('Batch processing complete.');
    } catch (error) {
        console.error('Error:', error);
    }
}

main();

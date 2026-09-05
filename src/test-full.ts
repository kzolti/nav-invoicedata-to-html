import { generateInvoiceHtml } from './index.js';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Témafelülírás env-ből: IDTOHTML_CSS=compact -> src/styles/invoice-compact.css.
// Alapból (üres) a default beágyazott stílus, ill. az XML-ben választott téma él.
// Nyelv: IDTOHTML_LOCALE=en -> angol számlakép (alapból hu).
const themeId = (process.env.IDTOHTML_CSS ?? '').trim().toLowerCase();
const locale = (process.env.IDTOHTML_LOCALE ?? 'hu').trim().toLowerCase() || 'hu';

async function loadThemeCss(): Promise<string | undefined> {
    if (!themeId || !/^[a-z0-9_-]{1,32}$/.test(themeId)) return undefined;
    // A témafájl delta: a base stílus után fűzve (mint a generátorban).
    try {
        const base = await fs.readFile(path.resolve(__dirname, '../src/styles/invoice-styles.css'), 'utf-8');
        const delta = await fs.readFile(path.resolve(__dirname, `../src/styles/invoice-${themeId}.css`), 'utf-8');
        return `${base}\n${delta}`;
    } catch {
        console.warn(`Theme not found: invoice-${themeId}.css, falling back to default CSS.`);
        return undefined;
    }
}

async function main() {
    try {
        const examplesDir = path.resolve(__dirname, '../Peldaszamlak_v3.0');
        const outputDir = path.resolve(__dirname, '../output');

        // Ensure output directory exists
        try {
            await fs.mkdir(outputDir, { recursive: true });
        } catch (err) {
            // ignore if exists
        }

        const files = await fs.readdir(examplesDir);
        const xmlFiles = files.filter(file => file.endsWith('.xml'));

        console.log(`Found ${xmlFiles.length} XML files in ${examplesDir}`);
        const themeCss = await loadThemeCss();
        if (themeCss) console.log(`Using theme override: ${themeId}`);
        console.log(`Using locale: ${locale}`);

        for (const file of xmlFiles) {
            const xmlPath = path.join(examplesDir, file);
            const base = file.replace('.xml', '');
            const localeSuffix = locale === 'hu' ? '' : `.${locale}`;
            const outputFilename = themeCss ? `${base}.${themeId}${localeSuffix}.html` : `${base}${localeSuffix}.html`;
            const outputPath = path.join(outputDir, outputFilename);

            console.log(`Processing ${file}...`);
            try {
                // const { parseXml } = await import('./parser/index.js');
                // const jsonData = await parseXml(xmlPath);
                // const invoiceData = jsonData.InvoiceData || jsonData;
                // console.log(JSON.stringify(invoiceData.invoiceMain.invoice.invoiceHead.supplierInfo, null, 2));

                const xmlContent = await fs.readFile(xmlPath, 'utf-8');
                const html = await generateInvoiceHtml(xmlContent, {
                    locale,
                    ...(themeCss ? { cssConfig: { inline: themeCss } } : {}),
                });
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

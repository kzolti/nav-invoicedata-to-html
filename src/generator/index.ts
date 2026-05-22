import { I18n } from '../i18n/index.js';
import type { InvoiceData } from '../osaTypes/dataTypes.js';
import { InvoiceDataComponent } from '../components/InvoiceData.js';

export class HtmlGenerator {
    private i18n: I18n;

    constructor(locale: string = 'hu') {
        this.i18n = new I18n(locale);
    }

    public async generate(data: InvoiceData): Promise<string> {
        const html = InvoiceDataComponent({
            data: data,
            t: (key: string) => this.i18n.t(key),
            nf: (val: any, decimals?: number) => this.i18n.nf(val, decimals)
        });

        return this.wrapHtml(html);
    }

    private wrapHtml(body: string): string {
        return `<!DOCTYPE html>
<html lang="${this.i18n.locale}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice</title>
    <link rel="stylesheet" href="invoice-styles.css">
</head>
<body>
    ${body}
</body>
</html>`;
    }
}

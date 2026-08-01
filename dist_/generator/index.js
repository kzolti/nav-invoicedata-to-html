import { I18n } from '../i18n/index.js';
import { InvoiceDataComponent } from '../components/InvoiceData.js';
import { preprocessInvoiceData } from '../preprocess.js';
export class HtmlGenerator {
    i18n;
    cssConfig;
    constructor(locale = 'hu', cssConfig) {
        this.i18n = new I18n(locale);
        this.cssConfig = cssConfig || {};
    }
    async generate(rawData) {
        const data = preprocessInvoiceData(rawData);
        const html = InvoiceDataComponent({
            data: data,
            t: (key) => this.i18n.t(key),
            nf: (val, decimals) => this.i18n.nf(val, decimals)
        });
        return this.wrapHtml(html);
    }
    wrapHtml(body) {
        const cssBlock = this.buildCssBlock();
        return `<!DOCTYPE html>
<html lang="${this.i18n.locale}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice</title>
    ${cssBlock}
</head>
<body>
    ${body}
</body>
</html>`;
    }
    buildCssBlock() {
        if (this.cssConfig.inline) {
            return `<style>\n${this.cssConfig.inline}\n</style>`;
        }
        const href = this.cssConfig.path || 'invoice-styles.css';
        return `<link rel="stylesheet" href="${href}">`;
    }
}

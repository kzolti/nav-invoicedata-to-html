import { I18n } from '../i18n/index.js';
import type { InvoiceData } from 'nav-osa-types';
import { InvoiceDataComponent } from '../components/InvoiceData.js';
import { preprocessInvoiceData } from '../preprocess.js';

export interface CssConfig {
    /** External CSS file path (href link). */
    path?: string;
    /** CSS content to embed inline as `<style>`. */
    inline?: string;
}

export class HtmlGenerator {
    private i18n: I18n;
    private cssConfig: CssConfig;

    constructor(locale: string = 'hu', cssConfig?: CssConfig) {
        this.i18n = new I18n(locale);
        this.cssConfig = cssConfig || {};
    }

    public async generate(rawData: InvoiceData): Promise<string> {
        const data = preprocessInvoiceData(rawData);
        const html = InvoiceDataComponent({
            data: data,
            t: (key: string) => this.i18n.t(key),
            nf: (val: number | string, decimals?: number) => this.i18n.nf(val, decimals)
        });

        return this.wrapHtml(html);
    }

    private wrapHtml(body: string): string {
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

    private buildCssBlock(): string {
        if (this.cssConfig.inline) {
            return `<style>\n${this.cssConfig.inline}\n</style>`;
        }
        const href = this.cssConfig.path || 'invoice-styles.css';
        return `<link rel="stylesheet" href="${href}">`;
    }
}

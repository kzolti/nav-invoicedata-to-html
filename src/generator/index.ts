import { render } from 'svelte/server';
import path from 'path';
import { I18n } from '../i18n/index.js';
import { SvelteCompiler } from './compiler.js';
import type { InvoiceData } from '../osaTypes/dataTypes.js';

export class HtmlGenerator {
    private i18n: I18n;
    private compiler: SvelteCompiler;

    constructor(locale: string = 'hu') {
        this.i18n = new I18n(locale);
        this.compiler = new SvelteCompiler();
        // In production, components should be pre-compiled.
        // We do not call compileAll() here.
    }

    public async generate(data: InvoiceData): Promise<string> {
        const componentPath = this.compiler.getComponentPath('InvoiceData');

        // Dynamic import for ESM
        const module = await import(componentPath);
        const Component = module.default;

        const result = render(Component, {
            props: {
                data: data,
                t: (key: string) => this.i18n.t(key),
                nf: (val: any, decimals?: number) => this.i18n.nf(val, decimals)
            }
        });

        return this.wrapHtml(result.html);
    }

    private wrapHtml(body: string): string {
        return `<!DOCTYPE html>
<html lang="${this.i18n['locale']}">
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

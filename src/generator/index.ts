import { I18n } from '../i18n/index.js';
import type { InvoiceData } from 'nav-osa-types';
import { InvoiceDataComponent } from '../components/InvoiceData.js';
import { resolveCssId, type DataEntry } from '../components/sections.js';
import { preprocessInvoiceData } from '../preprocess.js';
import { invoiceStylesCss, THEME_CSS, PACKAGE_VERSION } from '../styles/cssInlined.js';

export interface CssConfig {
    /** External CSS URL (rendered as `<link rel="stylesheet">`). */
    path?: string;
    /** CSS content to embed inline as `<style>`. */
    inline?: string;
}

/** Csak fájlnév-biztos témaazonosító (második védelmi vonal a sections.ts mellett). */
const THEME_ID_RE = /^[a-z0-9_-]{1,32}$/;

/**
 * XML-ben választott téma delta CSS-e (`invoice-<id>.css` tartalma).
 * Ismeretlen/érvénytelen azonosítóra null (a hívó ilyenkor defaultra esik).
 * A `default` id a base stílusra oldódik (nincs külön delta).
 */
function getThemeCss(id: string): string | null {
    const norm = id.toLowerCase();
    if (!THEME_ID_RE.test(norm)) return null;
    if (norm === 'default') return invoiceStylesCss;
    return THEME_CSS[norm] ?? null;
}

/** HTML-attribútum érték escape (`href="..."` kontextusra). */
function escapeAttr(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Az első számla invoiceDetail.additionalInvoiceData elemeiből olvasott téma-ID. */
function selectXmlThemeId(data: InvoiceData): string | null {
    const main = data.invoiceMain;
    const batch = main?.batchInvoice;
    const batchArr = Array.isArray(batch) ? batch : batch ? [batch] : [];
    const first = main?.invoice ?? batchArr[0]?.invoice;
    return resolveCssId(first?.invoiceHead?.invoiceDetail?.additionalInvoiceData as DataEntry[] | undefined);
}

/** Fallback renderer-lábléc, ha az XML-ben nincs RENDERER_INFO tag. */
function getRendererFallback(): string {
    return PACKAGE_VERSION ? `nav-invoicedata-to-html@${PACKAGE_VERSION}` : 'nav-invoicedata-to-html';
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
            nf: (val: number | string, decimals?: number) => this.i18n.nf(val, decimals),
            locale: this.i18n.locale,
            rendererFallback: getRendererFallback()
        });

        return this.wrapHtml(html, selectXmlThemeId(data));
    }

    private wrapHtml(body: string, xmlThemeId: string | null): string {
        const cssBlock = this.buildCssBlock(xmlThemeId);
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

    private buildCssBlock(xmlThemeId: string | null): string {
        // Precedencia: explicit API-konfig > XML-tag > default.
        if (this.cssConfig.inline) {
            return `<style>\n${this.cssConfig.inline}\n</style>`;
        }
        if (this.cssConfig.path) {
            return `<link rel="stylesheet" href="${escapeAttr(this.cssConfig.path)}">`;
        }
        if (xmlThemeId) {
            // A témafájl delta: a base stílus után fűzve, így csak a
            // felülírandó szabályokat kell tartalmaznia (duplikáció nélkül).
            // A `default` id a base stílusra oldódik.
            const norm = xmlThemeId.toLowerCase();
            if (norm === 'default') {
                return `<style>\n${invoiceStylesCss}\n</style>`;
            }
            const themeCss = getThemeCss(norm);
            if (themeCss) return `<style>\n${invoiceStylesCss}\n${themeCss}\n</style>`;
        }
        return `<style>\n${invoiceStylesCss}\n</style>`;
    }
}

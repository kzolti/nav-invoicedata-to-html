import { I18n } from '../i18n/index.js';
import type { InvoiceData } from 'nav-osa-types';
import { InvoiceDataComponent } from '../components/InvoiceData.js';
import { resolveCssId, type DataEntry } from '../components/sections.js';
import { preprocessInvoiceData } from '../preprocess.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export interface CssConfig {
    /** External CSS file path (href link). */
    path?: string;
    /** CSS content to embed inline as `<style>`. */
    inline?: string;
}

let defaultCssCache: string | null = null;
const themeCssCache = new Map<string, string>();
let packageVersionCache: string | null | undefined;

/** Csak fájlnév-biztos témaazonosító (második védelmi vonal a sections.ts mellett). */
const THEME_ID_RE = /^[a-z0-9_-]{1,32}$/;

/** A csomag styles-könyvtára (dist-ben a generátor melletti gyökér). */
function getStylesDir(): string {
    return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
}

/** A könyvtár saját invoice-styles.css tartalma (a csomagban szállított fájlból). */
function getInvoiceCss(): string {
    if (defaultCssCache != null) return defaultCssCache;
    try {
        defaultCssCache = readFileSync(path.resolve(getStylesDir(), 'invoice-styles.css'), 'utf8');
    } catch {
        defaultCssCache = '';
    }
    return defaultCssCache;
}

/**
 * XML-ben választott téma betöltése (`invoice-<id>.css` delta a base után).
 * Ismeretlen/érvénytelen azonosítóra null (a hívó ilyenkor defaultra esik).
 * Csak a styles-könyvtáron belüli fájl olvasható (path traversal ellen).
 */
function getThemeCss(id: string): string | null {
    const norm = id.toLowerCase();
    if (!THEME_ID_RE.test(norm)) return null;
    const cached = themeCssCache.get(norm);
    if (cached != null) return cached;
    try {
        const fileName = norm === 'default' ? 'invoice-styles.css' : `invoice-${norm}.css`;
        const cssPath = path.resolve(getStylesDir(), fileName);
        if (path.dirname(cssPath) !== getStylesDir()) return null;
        const css = readFileSync(cssPath, 'utf8');
        themeCssCache.set(norm, css);
        return css;
    } catch {
        return null;
    }
}

/** A könyvtár saját verziója a package.json-ból (fallback renderer-lábléchez). */
function getPackageVersion(): string | null {
    if (packageVersionCache !== undefined) return packageVersionCache;
    const candidates = [
        path.resolve(getStylesDir(), '../package.json'),
        path.resolve(getStylesDir(), '../../package.json'),
        path.resolve(process.cwd(), 'package.json'),
    ];
    for (const p of candidates) {
        try {
            const raw = readFileSync(p, 'utf8');
            const parsed = JSON.parse(raw) as { name?: string; version?: string };
            if (parsed.name === 'nav-invoicedata-to-html' && parsed.version) {
                packageVersionCache = parsed.version;
                return packageVersionCache;
            }
        } catch {
            // következő jelölt
        }
    }
    packageVersionCache = null;
    return null;
}

/** Fallback renderer-lábléc, ha az XML-ben nincs RENDERER_INFO tag. */
function getRendererFallback(): string {
    const v = getPackageVersion();
    return v ? `nav-invoicedata-to-html@${v}` : 'nav-invoicedata-to-html';
}
/** Az első számla invoiceDetail.additionalInvoiceData elemeiből olvasott téma-ID. */
function selectXmlThemeId(data: InvoiceData): string | null {
    const main = data.invoiceMain;
    const batch = main?.batchInvoice;
    const batchArr = Array.isArray(batch) ? batch : batch ? [batch] : [];
    const first = main?.invoice ?? batchArr[0]?.invoice;
    return resolveCssId(first?.invoiceHead?.invoiceDetail?.additionalInvoiceData as DataEntry[] | undefined);
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
            return `<link rel="stylesheet" href="${this.cssConfig.path}">`;
        }
        if (xmlThemeId) {
            // A témafájl delta: a base stílus után fűzve, így csak a
            // felülírandó szabályokat kell tartalmaznia (duplikáció nélkül).
            const themeCss = getThemeCss(xmlThemeId);
            if (themeCss) return `<style>\n${getInvoiceCss()}\n${themeCss}\n</style>`;
        }
        return `<style>\n${getInvoiceCss()}\n</style>`;
    }
}

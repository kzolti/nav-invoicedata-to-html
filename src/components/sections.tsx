import type { TFn } from './utils.js';
import { asArray, esc } from './utils.js';

/**
 * A nav-invoicedata-to-html saját névterje az additionalInvoiceData adatokban.
 * Formátum: I00000_IDTOHTMLDATA__<NYELV>__<SZEKCIO>[__KEY]
 * - NYELV: HU | ENG (a generátor locale-ja alapján választjuk ki a bejegyzést)
 * - SZEKCIO: DOCUMENT_NAME | DOCUMENT_DESC | SUPPLIER_BLOCK | CUSTOMER_BLOCK
 * - KEY: opcionális megkülönböztető
 * Kivétel a nyelvfüggetlen CSS-választó: I00000_IDTOHTMLDATA__CSS__<ID>
 * (lásd IDT_CSS_PREFIX / resolveCssId).
 */
export const IDT_PREFIX = 'I00000_IDTOHTMLDATA';

/**
 * Nyelvfüggetlen CSS-választó tag (a stílus nem függ a megjelenítési nyelvtől,
 * a feliratok úgyis az i18n szótárból jönnek):
 * I00000_IDTOHTMLDATA__CSS__<ID>  (pl. I00000_IDTOHTMLDATA__CSS__COMPACT)
 * Az <ID> egy `invoice-<id>.css` delta-fájlnak felel meg a styles-könyvtárban
 * (a base invoice-styles.css után töltődik, csak felülírásokat tartalmaz).
 */
export const IDT_CSS_PREFIX = `${IDT_PREFIX}__CSS__`;

/**
 * Renderer-lánc tag (nyelvfüggetlen, nem jelenik meg az egyéb adatok között):
 * I00000_IDTOHTMLDATA__RENDERER_INFO
 * dataValue példa: "nav-invoicedata-to-html@2.0.4; nav-billing-api@1.0.0"
 * A számla legutolsó soraként, halvány kisbetűs láblécként jelenik meg.
 */
export const IDT_RENDERER_INFO = `${IDT_PREFIX}__RENDERER_INFO`;

/** Csak fájlnév-biztos azonosító fogadható el (path traversal kizárva). */
const CSS_ID_RE = /^[A-Za-z0-9_-]{1,32}$/;

/** Érvényes CSS-azonosítót ad vissza, vagy null-t. */
export function parseCssId(dataName: string): string | null {
    if (!dataName.startsWith(IDT_CSS_PREFIX)) return null;
    const id = dataName.slice(IDT_CSS_PREFIX.length).toLowerCase();
    return CSS_ID_RE.test(id) ? id : null;
}

/**
 * Az első érvényes CSS-választó azonosítója (több tag esetén az első nyer).
 * Locale-független: hu és en alatt ugyanaz a tag él.
 */
export function resolveCssId(items: DataEntry[] | undefined): string | null {
    for (const item of asArray(items)) {
        const id = parseCssId(item.dataName);
        if (id) return id;
    }
    return null;
}

export interface DataEntry {
    dataName: string;
    dataDescription: string;
    dataValue: string;
}

export interface ParsedDataName {
    lang: string;
    section: string;
    key?: string;
}

export function parseDataName(dataName: string): ParsedDataName | null {
    const prefix = `${IDT_PREFIX}__`;
    if (!dataName.startsWith(prefix)) return null;
    const parts = dataName.slice(prefix.length).split('__');
    const lang = parts[0];
    const section = parts[1];
    if (!lang || !section) return null;
    return {
        lang: lang.toUpperCase(),
        section: section.toUpperCase(),
        key: parts.length > 2 ? parts.slice(2).join('__') : undefined,
    };
}

/** A generátor locale-ját a dataName nyelvi tagjére képezi ('hu' -> 'HU', 'en' -> 'ENG'). */
function localeLang(locale: string): string {
    const l = locale.toLowerCase();
    if (l.startsWith('hu')) return 'HU';
    if (l.startsWith('en')) return 'ENG';
    return l.toUpperCase();
}

export interface SectionedData {
    documentName?: DataEntry;
    documentDesc?: DataEntry;
    supplierBlock: DataEntry[];
    customerBlock: DataEntry[];
    other: DataEntry[];
    /** Renderer-lánc (I00000_IDTOHTMLDATA__RENDERER_INFO), nem az egyéb adatok közé tartozik. */
    rendererInfo?: DataEntry;
}

/**
 * A kapott additionalInvoiceData elemeket szekciókra bontja.
 * A saját névtérű, de más nyelvű elemek kimaradnak a kimenetből.
 */
export function splitSections(items: DataEntry[] | undefined, locale: string): SectionedData {
    const result: SectionedData = { supplierBlock: [], customerBlock: [], other: [] };
    const lang = localeLang(locale);

    for (const item of asArray(items)) {
        // CSS-választó tag: nem adat, soha nem jelenítjük meg (hibás
        // azonosítóval sem szivároghat be a "további adatok" közé).
        if (item.dataName.startsWith(IDT_CSS_PREFIX)) continue;
        // Renderer-lánc tag: nem az egyéb adatok közé, hanem a számla
        // legvégére való láblécbe kerül (első nyer).
        if (item.dataName === IDT_RENDERER_INFO) {
            if (!result.rendererInfo) result.rendererInfo = item;
            continue;
        }
        const parsed = parseDataName(item.dataName);
        if (!parsed) {
            result.other.push(item);
            continue;
        }
        if (parsed.lang !== lang) continue;
        switch (parsed.section) {
            case 'DOCUMENT_NAME':
                if (!result.documentName) result.documentName = item;
                break;
            case 'DOCUMENT_DESC':
                if (!result.documentDesc) result.documentDesc = item;
                break;
            case 'SUPPLIER_BLOCK':
                result.supplierBlock.push(item);
                break;
            case 'CUSTOMER_BLOCK':
                result.customerBlock.push(item);
                break;
            default:
                result.other.push(item);
                break;
        }
    }

    return result;
}

/**
 * Az egyéb (nem a könyvtárnak címzett) adatok szekciója a számla végén, az összesítő alatt.
 */
export function ExtraDataSection({ items, t }: { items: DataEntry[]; t: TFn }): string {
    if (items.length === 0) return '';

    return (
        <div class="invoice-extra-data">
            <h3>{t('additionalData')}</h3>
            <ul class="additional-data">
                {items.map(item => (
                    <li>
                        <div class="add-data-left">
                            <strong>{esc(item.dataDescription)}:</strong>
                            <span class="add-data-value">{esc(item.dataValue)}</span>
                        </div>
                    </li>
                )).join('')}
            </ul>
        </div>
    ) as string;
}

/**
 * Renderer-lánc lábléc a számla legutolsó soraként.
 * Mindig az XML-ből jött értéket mutatja, ha van; különben a fallback-et
 * (pl. `nav-invoicedata-to-html@2.0.4` a package.json-ból).
 * Üres értékre nem renderel semmit.
 * A div BEGIN/END kommentblokkban áll, hogy a hívó egy egyszerű
 * regexp-pel ki tudja emelni a HTML-ből (pl. PDF-generálás előtt
 * a Puppeteer-footerbe helyezéshez).
 */
export function RendererInfoSection({ value, fallback }: { value?: string; fallback?: string }): string {
    const text = (value ?? '').trim() || (fallback ?? '').trim();
    if (!text) return '';
    // A kommenteket string-összefűzéssel adjuk hozzá: a JSX-kommentet
    // a renderelő elnyelné, így nem jutna ki a kimeneti HTML-be.
    return `<!-- BEGIN ${IDT_RENDERER_INFO} -->` +
        `<div class="renderer-info">${esc(text)}</div>` +
        `<!-- END ${IDT_RENDERER_INFO} -->`;
}

import type { TFn } from './utils.js';
import { asArray, esc } from './utils.js';

/**
 * A nav-invoicedata-to-html saját névterje az additionalInvoiceData adatokban.
 * Formátum: I00000_IDTOHTMLDATA__<NYELV>__<SZEKCIO>[__KEY]
 * - NYELV: HU | ENG (a generátor locale-ja alapján választjuk ki a bejegyzést).
 *   Ha hiányzik (az első tag nem nyelv, hanem szekció), a bejegyzés ALL:
 *   minden locale alatt megjelenik. Ismeretlen nyelv-tag szintén ALL-nak
 *   számít — adat soha nem vész el csendben, legfeljebb látható helyen
 *   (dedikált szekció vagy „További adatok") jelenik meg.
 * - SZEKCIO: DOCUMENT_NAME | DOCUMENT_DESC | SUPPLIER_BLOCK | CUSTOMER_BLOCK
 * - KEY: opcionális megkülönböztető (első tagja ne legyen HU/ENG)
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
    /** Nyelvi tag (HU/ENG), vagy null = ALL (nyelvfüggetlen, minden locale alatt él). */
    lang: string | null;
    section: string;
    key?: string;
}

/** A generátor által ismert nyelv-tagek. Ismeretlen/missing tag = ALL. */
const KNOWN_LANGS = new Set(['HU', 'ENG']);

export function parseDataName(dataName: string): ParsedDataName | null {
    const prefix = `${IDT_PREFIX}__`;
    if (!dataName.startsWith(prefix)) return null;
    const parts = dataName.slice(prefix.length).split('__');
    const first = parts[0];
    if (!first) return null;
    // Nyelv-tag nélküli forma: az első tag a szekció -> ALL.
    if (!KNOWN_LANGS.has(first.toUpperCase())) {
        return {
            lang: null,
            section: first.toUpperCase(),
            key: parts.length > 1 ? parts.slice(1).join('__') : undefined,
        };
    }
    const section = parts[1];
    if (!section) return null;
    return {
        lang: first.toUpperCase(),
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
 * Nyelvfüggetlen (ALL) elemek minden locale alatt megjelennek; valódi
 * idegen nyelvűek kimaradnak. Ismeretlen kulcs az `other`-be kerül —
 * adat soha nem vész el csendben.
 * Per-számla tömb-szemantika: azonos KEY eltérő értékkel többször is
 * szerepelhet (pl. batch-összevonásnál) — ezért nincs kulcs szerinti
 * szótár, csak tömbök. Az eredmény tömb-referencia + locale szerint
 * memoizálva van, így ugyanazt a számlát elég egyszer felbontani.
 */
const sectionsCache = new WeakMap<object, Map<string, SectionedData>>();

function splitSectionsUncached(items: DataEntry[] | undefined, locale: string): SectionedData {
    const result: SectionedData = { supplierBlock: [], customerBlock: [], other: [] };
    // ALL cím-fallbackok: locale-specifikus nyer, független csak ha nincs olyan.
    let fallbackName: DataEntry | undefined;
    let fallbackDesc: DataEntry | undefined;
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
        if (parsed.lang !== null && parsed.lang !== lang) continue;
        const independent = parsed.lang === null;
        switch (parsed.section) {
            case 'DOCUMENT_NAME':
                if (independent) {
                    if (!fallbackName) fallbackName = item;
                } else if (!result.documentName) {
                    result.documentName = item;
                }
                break;
            case 'DOCUMENT_DESC':
                if (independent) {
                    if (!fallbackDesc) fallbackDesc = item;
                } else if (!result.documentDesc) {
                    result.documentDesc = item;
                }
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

    if (!result.documentName) result.documentName = fallbackName;
    if (!result.documentDesc) result.documentDesc = fallbackDesc;

    return result;
}

/** Memoizált burkoló: azonos tömb + locale esetén ugyanazt adja vissza. */
export function splitSections(items: DataEntry[] | undefined, locale: string): SectionedData {
    if (!items) return splitSectionsUncached(items, locale);
    const arr = asArray(items);
    // asArray nem-tömb bemenetnél másol — azt nem cache-eljük.
    if (arr !== (items as unknown)) return splitSectionsUncached(items, locale);
    let byLocale = sectionsCache.get(arr);
    if (!byLocale) {
        byLocale = new Map<string, SectionedData>();
        sectionsCache.set(arr, byLocale);
    }
    const cached = byLocale.get(locale);
    if (cached) return cached;
    const fresh = splitSectionsUncached(arr, locale);
    byLocale.set(locale, fresh);
    return fresh;
}

/**
 * Szállító/vevő blokk extra sorai (`dataDescription: dataValue`).
 * Közös helper, hogy a két party-szekció ne duplikálja a markupot.
 */
export function renderExtraRows(blocks: DataEntry[] | undefined): string {
    return asArray(blocks).map(block => (
        `<p><strong>${esc(block.dataDescription)}:</strong> ${esc(block.dataValue)}</p>`
    )).join('');
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

import type { TFn } from './utils.js';
import { asArray, esc } from './utils.js';

/**
 * A nav-invoicedata-to-html saját névterje az additionalInvoiceData adatokban.
 * Formátum: I00000_IDTOHTMLDATA__<NYELV>__<SZEKCIO>[__KEY]
 * - NYELV: HU | ENG (a generátor locale-ja alapján választjuk ki a bejegyzést)
 * - SZEKCIO: DOCUMENT_NAME | DOCUMENT_DESC | SUPPLIER_BLOCK | CUSTOMER_BLOCK
 * - KEY: opcionális megkülönböztető
 */
export const IDT_PREFIX = 'I00000_IDTOHTMLDATA';

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
}

/**
 * A kapott additionalInvoiceData elemeket szekciókra bontja.
 * A saját névtérű, de más nyelvű elemek kimaradnak a kimenetből.
 */
export function splitSections(items: DataEntry[] | undefined, locale: string): SectionedData {
    const result: SectionedData = { supplierBlock: [], customerBlock: [], other: [] };
    const lang = localeLang(locale);

    for (const item of asArray(items)) {
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
                        <div class="add-data-name">{esc(item.dataName)}</div>
                    </li>
                )).join('')}
            </ul>
        </div>
    ) as string;
}

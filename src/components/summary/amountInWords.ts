import { toCurrency as huToCurrency } from 'n2words-anycurrency/hu';
import { toCurrency as enGbToCurrency } from 'n2words-anycurrency/en-GB';

/**
 * Kimondott összeg a fizetendő sorhoz, pl. "harminchatezer-négyszáz forint".
 * Ismeretlen pénznem / nem konvertálható érték esetén null (a sor kimarad).
 */
export function amountInWords(
    value: number | string | null | undefined,
    currency: string | undefined,
    locale: string | undefined
): string | null {
    if (value == null || value === '') return null;
    const raw = String(value).trim();
    if (!raw || raw === '-' || raw === '+' || raw === '.') return null;
    const cur = (currency || 'HUF').toUpperCase();
    const isHu = (locale || 'hu').toLowerCase().startsWith('hu');
    try {
        return isHu
            ? huToCurrency(raw, { currency: cur })
            : enGbToCurrency(raw, { currency: cur });
    } catch {
        return null;
    }
}

/** Rövid pénznemjel a számos sorhoz: HUF -> Ft (hu), egyébként az ISO kód. */
export function shortCurrency(code: string | null | undefined, locale: string | undefined): string {
    const cur = (code || 'HUF').toUpperCase();
    if ((locale || 'hu').toLowerCase().startsWith('hu') && cur === 'HUF') return 'Ft';
    return cur;
}

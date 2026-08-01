import type { AddressType, TaxNumberType, DetailedAddressType, SimpleAddressType, Line } from 'nav-osa-types';

import { escapeHtml } from '@kitajs/html';

/** A Line as rendered by the components, optionally augmented with batch metadata */
export type DisplayLine = Line & {
    _annotatedOriginalInvoiceNumber?: string;
    _annotatedDeliveryDate?: string;
};

/** Translation function type */
export type TFn = (key: string) => string;

/** Number format function type */
export type NFn = (val: number | string, decimals?: number) => string;

/** Escape HTML characters in a value */
export const esc = (val: string | number | boolean | null | undefined): string => {
    if (val == null) return '';
    return escapeHtml(String(val));
};

/** Ensure a value is always an array */
export const asArray = <T,>(item: T | T[] | undefined): T[] =>
    Array.isArray(item) ? item : item ? [item] : [];

/** Format a tax number (taxpayerId-vatCode-countyCode) */
export const formatTaxNumber = (tn: TaxNumberType | undefined | null): string => {
    if (!tn || !tn.taxpayerId) return '';
    const parts = [esc(tn.taxpayerId)];
    if (tn.vatCode) parts.push(esc(tn.vatCode));
    if (tn.countyCode) parts.push(esc(tn.countyCode));
    return parts.join('-');
};

function hasDetailedAddress(addr: object): addr is { detailedAddress: DetailedAddressType } {
    return 'detailedAddress' in addr;
}
function hasSimpleAddress(addr: object): addr is { simpleAddress: SimpleAddressType } {
    return 'simpleAddress' in addr;
}
function isDetailedDirect(addr: object): addr is DetailedAddressType {
    return 'streetName' in addr;
}
function isSimpleDirect(addr: object): addr is SimpleAddressType {
    return 'additionalAddressDetail' in addr;
}

/** Get a formatted one-line address string */
export function getAddressLine1(addr: AddressType | SimpleAddressType | null | undefined, t?: TFn): string {
    if (!addr) return '';
    if (hasDetailedAddress(addr) && addr.detailedAddress) {
        return fmtDetailedAddress(addr.detailedAddress, t);
    }
    if (hasSimpleAddress(addr) && addr.simpleAddress) {
        return fmtSimpleAddress(addr.simpleAddress);
    }
    if (isDetailedDirect(addr)) {
        return fmtDetailedAddress(addr, t);
    }
    if (isSimpleDirect(addr)) {
        return fmtSimpleAddress(addr);
    }
    return '';
}

function fmtDetailedAddress(detailed: DetailedAddressType, t?: TFn): string {
    const parts: string[] = [];
    if (detailed.countryCode) parts.push(esc(detailed.countryCode));
    if (detailed.postalCode) parts.push(esc(detailed.postalCode));

    let cityStr = esc(detailed.city) || '';
    if (detailed.region) {
        cityStr += ` (${esc(detailed.region)})`;
    }
    if (cityStr) parts.push(cityStr);

    let streetStr = '';
    if (detailed.streetName) {
        streetStr += esc(detailed.streetName);
        if (detailed.publicPlaceCategory) {
            streetStr += ' ' + esc(detailed.publicPlaceCategory);
        }
        if (detailed.number) {
            streetStr += ' ' + esc(detailed.number);
        }
    }
    if (detailed.lotNumber) {
        const label = t ? t('lotNumber') : 'Helyrajzi szám';
        if (streetStr) {
            streetStr += ` (${label}: ${esc(detailed.lotNumber)})`;
        } else {
            streetStr += `${label}: ${esc(detailed.lotNumber)}`;
        }
    }
    if (streetStr) parts.push(streetStr);

    return parts.join(', ');
}

function fmtSimpleAddress(simple: SimpleAddressType): string {
    const parts: string[] = [];
    if (simple.countryCode) parts.push(esc(simple.countryCode));
    if (simple.postalCode) parts.push(esc(simple.postalCode));

    let cityStr = esc(simple.city) || '';
    if (simple.region) {
        cityStr += ` (${esc(simple.region)})`;
    }
    if (cityStr) parts.push(cityStr);

    if (simple.additionalAddressDetail) {
        parts.push(esc(simple.additionalAddressDetail));
    }
    return parts.join(', ');
}

/** Get floor/door info from a detailed address */
export function getAddressFloor(addr: AddressType | DetailedAddressType | null | undefined, t: TFn): string {
    if (!addr) return '';
    const detailed = hasDetailedAddress(addr) ? addr.detailedAddress : isDetailedDirect(addr) ? addr : undefined;
    if (!detailed) return '';

    const parts: string[] = [];
    if (detailed.building) {
        parts.push(`${t('building')}: ${esc(detailed.building)}`);
    }
    if (detailed.staircase) {
        parts.push(`${t('staircase')}: ${esc(detailed.staircase)}`);
    }
    if (detailed.floor) {
        parts.push(`${t('floor')}: ${esc(detailed.floor)}`);
    }
    if (detailed.door) {
        parts.push(`${t('door')}: ${esc(detailed.door)}`);
    }

    return parts.join(', ');
};

/** Normalize a numeric value to a plain decimal string (no scientific notation). */
export function toDecimalString(val: number | string | null | undefined): string | null {
    if (val == null || val === '') return null;
    let s = String(val).trim();
    if (!s || s === '-' || s === '+' || s === '.') return null;

    let neg = s.startsWith('-');
    if (neg || s.startsWith('+')) s = s.slice(1);

    if (/e/i.test(s)) {
        const n = Number((neg ? '-' : '') + s);
        if (!Number.isFinite(n)) return null;
        s = n.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 });
        if (s.startsWith('-')) {
            neg = true;
            s = s.slice(1);
        } else {
            neg = false;
        }
    }

    if (!/^\d+(\.\d*)?$|^\.\d+$/.test(s)) return null;
    if (s.startsWith('.')) s = '0' + s;
    if (s.endsWith('.')) s = s.slice(0, -1);

    const dot = s.indexOf('.');
    let intPart = dot === -1 ? s : s.slice(0, dot);
    const frac = dot === -1 ? '' : s.slice(dot + 1);
    intPart = intPart.replace(/^0+(?=\d)/, '') || '0';
    const out = frac ? `${intPart}.${frac}` : intPart;
    if (out === '0' || /^0\.0+$/.test(out)) return frac ? `0.${frac}` : '0';
    return neg ? '-' + out : out;
}

/** Count decimal places from the string representation (preserves XML trailing zeros). */
export const countDecimals = (val: number | string | null | undefined): number => {
    if (val == null || val === '') return 0;
    const s = String(val).trim();
    if (!s) return 0;
    if (/e/i.test(s)) {
        const norm = toDecimalString(s);
        if (!norm) return 0;
        const d = norm.indexOf('.');
        return d === -1 ? 0 : norm.length - d - 1;
    }
    const bare = s.startsWith('-') || s.startsWith('+') ? s.slice(1) : s;
    const dot = bare.indexOf('.');
    if (dot === -1) return 0;
    return bare.length - dot - 1;
};

export const getTargetDecimals = (maxDec: number): number => {
    if (maxDec === 0) return 0;
    if (maxDec === 1) return 2;
    return maxDec;
};

/** Strip trailing zeros after decimal point (and the dot if empty). */
export function stripTrailingZeros(s: string): string {
    if (!s.includes('.')) return s;
    return s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
}

function parseParts(s: string): { neg: boolean; intPart: string; frac: string } {
    const neg = s.startsWith('-');
    const abs = neg ? s.slice(1) : s;
    const dot = abs.indexOf('.');
    return {
        neg,
        intPart: (dot === -1 ? abs : abs.slice(0, dot)).replace(/^0+(?=\d)/, '') || '0',
        frac: dot === -1 ? '' : abs.slice(dot + 1),
    };
}

function toScaledBigInt(s: string, scale: number): bigint {
    const { neg, intPart, frac } = parseParts(s);
    let f = frac;
    let digits: bigint;
    if (f.length > scale) {
        const keep = f.slice(0, scale);
        const next = f.charCodeAt(scale) - 48;
        digits = BigInt(intPart + keep.padEnd(scale, '0'));
        if (next >= 5) digits += 1n;
    } else {
        digits = BigInt(intPart + f.padEnd(scale, '0'));
    }
    return neg ? -digits : digits;
}

function fromScaledBigInt(n: bigint, scale: number): string {
    const neg = n < 0n;
    let digits = (neg ? -n : n).toString();
    if (scale === 0) {
        const out = digits.replace(/^0+(?=\d)/, '') || '0';
        return neg && out !== '0' ? '-' + out : out;
    }
    digits = digits.padStart(scale + 1, '0');
    const intPart = digits.slice(0, -scale).replace(/^0+(?=\d)/, '') || '0';
    const frac = digits.slice(-scale);
    const out = stripTrailingZeros(`${intPart}.${frac}`);
    return neg && out !== '0' ? '-' + out : out;
}

/**
 * Multiply a decimal string/number by 100 without binary float error.
 * Used for RateType (0–1, max 4 dp) → percentage display.
 */
export function multiplyBy100(val: number | string): string {
    const s = toDecimalString(val);
    if (s == null) return '0';
    const { neg, intPart, frac } = parseParts(s);
    let f = frac.padEnd(2, '0');
    let i = (intPart + f.slice(0, 2)).replace(/^0+(?=\d)/, '') || '0';
    const rest = f.slice(2);
    let out = rest ? `${i}.${rest}` : i;
    out = stripTrailingZeros(out);
    return neg && out !== '0' ? '-' + out : out;
}

/** Add two decimal values as strings with fixed scale (default MonetaryType = 2). */
export function addDecimal(a: number | string, b: number | string, scale = 2): string {
    const sa = toDecimalString(a) ?? '0';
    const sb = toDecimalString(b) ?? '0';
    return fromScaledBigInt(toScaledBigInt(sa, scale) + toScaledBigInt(sb, scale), scale);
}

export function subtractDecimal(a: string, b: string, scale: number): string {
    const sa = toDecimalString(a) ?? '0';
    const sb = toDecimalString(b) ?? '0';
    return fromScaledBigInt(toScaledBigInt(sa, scale) - toScaledBigInt(sb, scale), scale);
}

export function multiplyDecimal(a: string, b: string, scale: number): string {
    const sa = toDecimalString(a) ?? '0';
    const sb = toDecimalString(b) ?? '0';
    const pa = parseParts(sa);
    const pb = parseParts(sb);
    const prodScale = pa.frac.length + pb.frac.length;
    let prod = BigInt(pa.intPart + pa.frac) * BigInt(pb.intPart + pb.frac);
    if (pa.neg !== pb.neg) prod = -prod;
    if (prodScale === scale) return fromScaledBigInt(prod, scale);
    if (prodScale < scale) return fromScaledBigInt(prod * (10n ** BigInt(scale - prodScale)), scale);
    const div = 10n ** BigInt(prodScale - scale);
    const neg = prod < 0n;
    let abs = neg ? -prod : prod;
    abs = (abs + div / 2n) / div;
    return fromScaledBigInt(neg ? -abs : abs, scale);
}

export function divideDecimal(a: string, b: string, scale: number): string {
    const sa = toDecimalString(a) ?? '0';
    const sb = toDecimalString(b) ?? '0';
    const workScale = scale + 8;
    const na = toScaledBigInt(sa, workScale);
    const nb = toScaledBigInt(sb, workScale);
    if (nb === 0n) return '0';
    const negR = (na < 0n) !== (nb < 0n);
    const aAbs = na < 0n ? -na : na;
    const bAbs = nb < 0n ? -nb : nb;
    // (aAbs/10^ws) / (bAbs/10^ws) = aAbs/bAbs; result with `scale` fraction digits
    const quot = (aAbs * (10n ** BigInt(scale)) + bAbs / 2n) / bAbs;
    return fromScaledBigInt(negR ? -quot : quot, scale);
}

/**
 * Discounted unit price (QuantityType, max 10 fraction digits).
 * discountRatePercent is already in percent (after preprocess ×100).
 */
export function calcDiscountedUnitPrice(
    unitPrice: number | string | null | undefined,
    quantity: number | string | null | undefined,
    discountValue?: number | string | null,
    discountRatePercent?: number | string | null,
    scale = 10
): string {
    const up = toDecimalString(unitPrice) ?? '0';
    if (discountValue != null && discountValue !== '' && quantity != null && quantity !== '') {
        const q = toDecimalString(quantity);
        if (q && q !== '0' && q !== '-0') {
            const dv = toDecimalString(discountValue) ?? '0';
            const perUnit = divideDecimal(dv, q, scale);
            return subtractDecimal(up, perUnit, scale);
        }
    }
    if (discountRatePercent != null && discountRatePercent !== '') {
        const rate = toDecimalString(discountRatePercent) ?? '0';
        const factor = subtractDecimal('100', rate, Math.max(countDecimals(rate), 2));
        return divideDecimal(multiplyDecimal(up, factor, scale + 2), '100', scale);
    }
    return stripTrailingZeros(up);
}

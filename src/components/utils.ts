import type { AddressType } from '../osaTypes/baseTypes.js';

import { escapeHtml } from '@kitajs/html';

/** Translation function type */
export type TFn = (key: string) => string;

/** Number format function type */
export type NFn = (val: any, decimals?: number) => string;

/** Escape HTML characters in a value */
export const esc = (val: any): string => {
    if (val == null) return '';
    return escapeHtml(String(val));
};

/** Ensure a value is always an array */
export const asArray = <T,>(item: T | T[] | undefined): T[] =>
    Array.isArray(item) ? item : item ? [item] : [];

/** Format a tax number (taxpayerId-vatCode-countyCode) */
export const formatTaxNumber = (tn: any): string => {
    if (!tn || !tn.taxpayerId) return '';
    const parts = [esc(tn.taxpayerId)];
    if (tn.vatCode) parts.push(esc(tn.vatCode));
    if (tn.countyCode) parts.push(esc(tn.countyCode));
    return parts.join('-');
};

/** Get a formatted one-line address string */
export const getAddressLine1 = (addr: any, t?: TFn): string => {
    if (!addr) return '';
    
    let detailed = addr.detailedAddress;
    let simple = addr.simpleAddress;
    
    // Support direct simple address (e.g. dieselOilPurchase.purchaseLocation)
    if (!detailed && !simple) {
        if ('additionalAddressDetail' in addr) {
            simple = addr;
        } else if ('streetName' in addr) {
            detailed = addr;
        }
    }

    if (detailed) {
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

    if (simple) {
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

    return '';
};

/** Get floor/door info from a detailed address */
export const getAddressFloor = (addr: any, t: TFn): string => {
    if (!addr) return '';
    let detailed = addr.detailedAddress;
    if (!detailed && 'streetName' in addr) {
        detailed = addr;
    }
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

/** Count decimal places of a numeric value (handles XML trailing zeros) */
export const countDecimals = (val: any): number => {
    if (val == null || val === '') return 0;
    const num = Number(val);
    if (isNaN(num)) return 0;

    let numStr = parseFloat(num.toFixed(10)).toString();

    if (numStr.includes('e')) {
        numStr = num.toString();
    }

    const dotIdx = numStr.indexOf('.');
    if (dotIdx === -1) return 0;

    return numStr.length - dotIdx - 1;
};

/** Map raw decimal count to a display-friendly target (0 → 0, 1 → 2, >4 → 4) */
export const getTargetDecimals = (maxDec: number): number => {
    if (maxDec === 0) return 0;
    if (maxDec === 1) return 2;
    if (maxDec > 4) return 4;
    return maxDec;
};

import type { AddressType, TaxNumberType, DetailedAddressType, SimpleAddressType, Line } from 'nav-osa-types';
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
export declare const esc: (val: string | number | boolean | null | undefined) => string;
/** Ensure a value is always an array */
export declare const asArray: <T>(item: T | T[] | undefined) => T[];
/** Format a tax number (taxpayerId-vatCode-countyCode) */
export declare const formatTaxNumber: (tn: TaxNumberType | undefined | null) => string;
/** Get a formatted one-line address string */
export declare function getAddressLine1(addr: AddressType | SimpleAddressType | null | undefined, t?: TFn): string;
/** Get floor/door info from a detailed address */
export declare function getAddressFloor(addr: AddressType | DetailedAddressType | null | undefined, t: TFn): string;
/** Normalize a numeric value to a plain decimal string (no scientific notation). */
export declare function toDecimalString(val: number | string | null | undefined): string | null;
/** Count decimal places from the string representation (preserves XML trailing zeros). */
export declare const countDecimals: (val: number | string | null | undefined) => number;
export declare const getTargetDecimals: (maxDec: number) => number;
/** Strip trailing zeros after decimal point (and the dot if empty). */
export declare function stripTrailingZeros(s: string): string;
/**
 * Multiply a decimal string/number by 100 without binary float error.
 * Used for RateType (0–1, max 4 dp) → percentage display.
 */
export declare function multiplyBy100(val: number | string): string;
/** Add two decimal values as strings with fixed scale (default MonetaryType = 2). */
export declare function addDecimal(a: number | string, b: number | string, scale?: number): string;
export declare function subtractDecimal(a: string, b: string, scale: number): string;
export declare function multiplyDecimal(a: string, b: string, scale: number): string;
export declare function divideDecimal(a: string, b: string, scale: number): string;
/**
 * Discounted unit price (QuantityType, max 10 fraction digits).
 * discountRatePercent is already in percent (after preprocess ×100).
 */
export declare function calcDiscountedUnitPrice(unitPrice: number | string | null | undefined, quantity: number | string | null | undefined, discountValue?: number | string | null, discountRatePercent?: number | string | null, scale?: number): string;
//# sourceMappingURL=utils.d.ts.map
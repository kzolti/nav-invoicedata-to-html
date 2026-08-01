import type { SupplierInfo } from 'nav-osa-types';
import type { AddressType, TaxNumberType } from 'nav-osa-types';
import type { TFn, NFn } from '../utils.js';
interface Props {
    data: SupplierInfo;
    t: TFn;
    nf: NFn;
    formatTaxNumber: (tn: TaxNumberType) => string;
    getAddressLine1: (addr: AddressType | undefined) => string;
    getAddressFloor: (addr: AddressType | undefined, t: TFn) => string;
}
export declare function SupplierSection({ data, t, formatTaxNumber, getAddressLine1, getAddressFloor }: Props): string;
export {};
//# sourceMappingURL=SupplierSection.d.ts.map
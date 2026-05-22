import type { SupplierInfo } from '../../osaTypes/dataTypes.js';
import type { AddressType } from '../../osaTypes/baseTypes.js';
import type { TFn, NFn } from '../utils.js';
import { esc } from '../utils.js';

interface Props {
    data: SupplierInfo;
    t: TFn;
    nf: NFn;
    formatTaxNumber: (tn: any) => string;
    getAddressLine1: (addr: AddressType | undefined) => string;
    getAddressFloor: (addr: AddressType | undefined, t: TFn) => string;
}

export function SupplierSection({ data, t, formatTaxNumber, getAddressLine1, getAddressFloor }: Props): string {
    const floorInfo = getAddressFloor(data.supplierAddress, t);

    return (
        <div class="party supplier">
            <h3>{t('supplier')}</h3>
            <p><strong>{esc(data.supplierName)}</strong></p>
            <p>{t('taxNumber')}: {formatTaxNumber(data.supplierTaxNumber)}</p>

            {data.communityVatNumber &&
                <p>{t('communityVatNumber')}: {esc(data.communityVatNumber)}</p>}
            {data.groupMemberTaxNumber &&
                <p>{t('groupMemberTaxNumber')}: {formatTaxNumber(data.groupMemberTaxNumber)}</p>}

            <div class="address">
                <p>{getAddressLine1(data.supplierAddress)}</p>
                {floorInfo && <p>{floorInfo}</p>}
            </div>

            {data.supplierBankAccountNumber &&
                <p>{t('bankAccount')}: {esc(data.supplierBankAccountNumber)}</p>}
            {data.individualExemption &&
                <p>{t('individualExemption')}: {String(data.individualExemption)}</p>}
            {data.exciseLicenceNum &&
                <p>{t('exciseLicenceNum')}: {esc(data.exciseLicenceNum)}</p>}
        </div>
    ) as string;
}

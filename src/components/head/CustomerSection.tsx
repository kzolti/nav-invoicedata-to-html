import type { CustomerInfo } from 'nav-osa-types';
import type { AddressType, TaxNumberType } from 'nav-osa-types';
import type { TFn, NFn } from '../utils.js';
import { esc } from '../utils.js';

interface Props {
    data: CustomerInfo | undefined;
    t: TFn;
    nf: NFn;
    formatTaxNumber: (tn: TaxNumberType) => string;
    getAddressLine1: (addr: AddressType | undefined) => string;
    getAddressFloor: (addr: AddressType | undefined, t: TFn) => string;
}

export function CustomerSection({ data, t, formatTaxNumber, getAddressLine1, getAddressFloor }: Props): string {
    if (!data) {
        return (
            <div class="party customer">
                <h3>{t('customer')}</h3>
                <p>{t('noCustomerInfo')}</p>
            </div>
        ) as string;
    }

    const floorInfo = data.customerAddress ? getAddressFloor(data.customerAddress, t) : '';
    const vatData = data.customerVatData;

    return (
        <div class="party customer">
            <h3>{t('customer')}</h3>
            <p><strong>{esc(data.customerName)}</strong></p>

            {vatData?.customerTaxNumber &&
                <p>{t('taxNumber')}: {formatTaxNumber(vatData.customerTaxNumber)}</p>}
            {vatData?.customerTaxNumber?.groupMemberTaxNumber &&
                <p>{t('groupMemberTaxNumber')}: {formatTaxNumber(vatData.customerTaxNumber.groupMemberTaxNumber)}</p>}
            {vatData?.communityVatNumber &&
                <p>{t('communityVatNumber')}: {esc(vatData.communityVatNumber)}</p>}
            {vatData?.thirdStateTaxId &&
                <p>{t('thirdStateTaxId')}: {esc(vatData.thirdStateTaxId)}</p>}

            <p>{t('vatStatus')}: {t(data.customerVatStatus)}</p>

            {data.customerAddress && (
                <div class="address">
                    <p>{getAddressLine1(data.customerAddress)}</p>
                    {floorInfo && <p>{floorInfo}</p>}
                </div>
            )}

            {data.customerBankAccountNumber &&
                <p>{t('bankAccount')}: {esc(data.customerBankAccountNumber)}</p>}
        </div>
    ) as string;
}

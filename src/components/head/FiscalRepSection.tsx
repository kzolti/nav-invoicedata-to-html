import type { FiscalRepresentative } from 'nav-osa-types';
import type { AddressType, TaxNumberType } from 'nav-osa-types';
import type { TFn, NFn } from '../utils.js';
import { esc } from '../utils.js';

interface Props {
    data: FiscalRepresentative;
    t: TFn;
    nf: NFn;
    formatTaxNumber: (tn: TaxNumberType) => string;
    getAddressLine1: (addr: AddressType | undefined) => string;
    getAddressFloor: (addr: AddressType | undefined, t: TFn) => string;
}

export function FiscalRepSection({ data, t, formatTaxNumber, getAddressLine1, getAddressFloor }: Props): string {
    const floorInfo = getAddressFloor(data.fiscalRepresentativeAddress, t);

    return (
        <div class="party fiscal-rep">
            <h3>{t('fiscalRepresentative')}</h3>
            <p><strong>{esc(data.fiscalRepresentativeName)}</strong></p>
            <p>{t('taxNumber')}: {formatTaxNumber(data.fiscalRepresentativeTaxNumber)}</p>

            <div class="address">
                <p>{getAddressLine1(data.fiscalRepresentativeAddress)}</p>
                {floorInfo && <p>{floorInfo}</p>}
            </div>

            {data.fiscalRepresentativeBankAccountNumber &&
                <p>{t('bankAccount')}: {esc(data.fiscalRepresentativeBankAccountNumber)}</p>}
        </div>
    ) as string;
}

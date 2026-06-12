import type { InvoiceHead } from 'nav-osa-types';
import type { TFn, NFn } from './utils.js';
import { formatTaxNumber, getAddressLine1, getAddressFloor } from './utils.js';

import { SupplierSection } from './head/SupplierSection.js';
import { CustomerSection } from './head/CustomerSection.js';
import { FiscalRepSection } from './head/FiscalRepSection.js';
import { InvoiceDetailsSection } from './head/InvoiceDetailsSection.js';

interface Props {
    data: InvoiceHead;
    t: TFn;
    nf: NFn;
}

export function InvoiceHeadComponent({ data, t, nf }: Props): string {
    const ctx = { t, nf, formatTaxNumber, getAddressLine1, getAddressFloor };

    return (
        <div class="invoice-head">
            <div class="parties">
                {SupplierSection({ data: data.supplierInfo, ...ctx })}
                {CustomerSection({ data: data.customerInfo, ...ctx })}
                {data.fiscalRepresentativeInfo &&
                    FiscalRepSection({ data: data.fiscalRepresentativeInfo, ...ctx })}
            </div>
            {InvoiceDetailsSection({ data: data.invoiceDetail, ...ctx })}
        </div>
    ) as string;
}

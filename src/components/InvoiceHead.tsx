import type { InvoiceHead } from 'nav-osa-types';
import type { TFn, NFn } from './utils.js';
import { formatTaxNumber, getAddressLine1, getAddressFloor } from './utils.js';
import { splitSections } from './sections.js';

import { SupplierSection } from './head/SupplierSection.js';
import { CustomerSection } from './head/CustomerSection.js';
import { FiscalRepSection } from './head/FiscalRepSection.js';
import { InvoiceDetailsSection } from './head/InvoiceDetailsSection.js';

interface Props {
    data: InvoiceHead;
    invoiceNumber?: string;
    invoiceIssueDate?: string;
    completenessIndicator?: boolean;
    diffKeys?: Set<string>;
    t: TFn;
    nf: NFn;
    locale: string;
}

export function InvoiceHeadComponent({
    data,
    invoiceNumber,
    invoiceIssueDate,
    completenessIndicator,
    diffKeys,
    t,
    nf,
    locale,
}: Props): string {
    const ctx = { t, nf, formatTaxNumber, getAddressLine1, getAddressFloor };
    const sections = splitSections(data.invoiceDetail?.additionalInvoiceData, locale);

    return (
        <div class="invoice-head">
            <div class="parties">
                {SupplierSection({ data: data.supplierInfo, ...ctx, smallBusinessIndicator: data.invoiceDetail?.smallBusinessIndicator, blocks: sections.supplierBlock })}
                {CustomerSection({ data: data.customerInfo, ...ctx, blocks: sections.customerBlock })}
                {data.fiscalRepresentativeInfo &&
                    FiscalRepSection({ data: data.fiscalRepresentativeInfo, ...ctx })}
            </div>
            {InvoiceDetailsSection({
                data: data.invoiceDetail,
                invoiceNumber,
                invoiceIssueDate,
                completenessIndicator,
                diffKeys,
                locale,
                ...ctx,
            })}
        </div>
    ) as string;
}

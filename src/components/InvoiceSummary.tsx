import type { Invoice } from 'nav-osa-types';
import type { TFn, NFn } from './utils.js';
import { asArray, countDecimals, getTargetDecimals } from './utils.js';

import { VatBreakdownTable } from './summary/VatBreakdownTable.js';
import { NormalTotals } from './summary/NormalTotals.js';
import { SimplifiedSummary } from './summary/SimplifiedSummary.js';
import { GrossTotal } from './summary/GrossTotal.js';
import { ProductFeeSummarySection } from './summary/ProductFeeSummarySection.js';

interface Props {
    invoice: Invoice;
    t: TFn;
    nf: NFn;
}

export function InvoiceSummaryComponent({ invoice, t, nf }: Props): string {
    const data = invoice.invoiceSummary;

    // Pre-compute decimal precisions for the summary tables
    const vatRateLines = asArray(data.summaryNormal?.summaryByVatRate);
    const vatDecs = {
        net: getTargetDecimals(Math.max(0, ...vatRateLines.map(l => countDecimals(l.vatRateNetData.vatRateNetAmount)))),
        vat: getTargetDecimals(Math.max(0, ...vatRateLines.map(l => countDecimals(l.vatRateVatData.vatRateVatAmount)))),
        gross: getTargetDecimals(Math.max(0, ...vatRateLines.map(l => countDecimals(l.vatRateGrossData?.vatRateGrossAmount)))),
    };
    const totalNormalDecs = {
        net: getTargetDecimals(countDecimals(data.summaryNormal?.invoiceNetAmount)),
        vat: getTargetDecimals(countDecimals(data.summaryNormal?.invoiceVatAmount)),
    };
    const summaryGrossDecs = getTargetDecimals(countDecimals(data.summaryGrossData?.invoiceGrossAmount));

    const simplifiedLines = asArray(data.summarySimplified);
    const simplifiedDecs = getTargetDecimals(
        Math.max(0, ...simplifiedLines.map(l => countDecimals(l.vatContentGrossAmount)))
    );

    return (
        <div class="invoice-summary">
            <h3>{t('summary')}</h3>

            {data.summaryNormal && (<>
                {data.summaryNormal.summaryByVatRate &&
                    VatBreakdownTable({ vatRateLines, vatDecs, t, nf })}
                {NormalTotals({ data: data.summaryNormal, decs: totalNormalDecs, t, nf })}
            </>)}

            {data.summarySimplified &&
                SimplifiedSummary({ lines: simplifiedLines, decs: simplifiedDecs, t, nf })}

            {data.summaryGrossData &&
                GrossTotal({ data: data.summaryGrossData, decs: summaryGrossDecs, t, nf })}

            {invoice.productFeeSummary &&
                ProductFeeSummarySection({ items: asArray(invoice.productFeeSummary), t, nf })}
        </div>
    ) as string;
}

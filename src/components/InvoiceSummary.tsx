import type { Invoice } from 'nav-osa-types';
import type { TFn, NFn } from './utils.js';
import { asArray, countDecimals, getTargetDecimals, normalSummaryHasEffect, grossSummaryHasEffect, isZeroAmount } from './utils.js';

import { VatBreakdownTable } from './summary/VatBreakdownTable.js';
import { NormalTotals } from './summary/NormalTotals.js';
import { SimplifiedSummary } from './summary/SimplifiedSummary.js';
import { PayableTotal } from './summary/PayableTotal.js';
import { ProductFeeSummarySection } from './summary/ProductFeeSummarySection.js';

interface Props {
    invoice: Invoice;
    t: TFn;
    nf: NFn;
    locale: string;
}

export function InvoiceSummaryComponent({ invoice, t, nf, locale }: Props): string {
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

    // Csak a számszerű hatással bíró blokkok jelennek meg.
    const normalEffect = normalSummaryHasEffect(data.summaryNormal);
    const simplifiedEffect = simplifiedLines.some(l =>
        !isZeroAmount(l.vatContentGrossAmount) || !isZeroAmount(l.vatContentGrossAmountHUF));
    const grossEffect = grossSummaryHasEffect(data.summaryGrossData);
    const hasProductFee = asArray(invoice.productFeeSummary).length > 0;
    if (!normalEffect && !simplifiedEffect && !grossEffect && !hasProductFee) return '';

    return (
        <div class="invoice-summary">
            <h3>{t('summary')}</h3>

            {invoice.productFeeSummary &&
                ProductFeeSummarySection({ items: asArray(invoice.productFeeSummary), t, nf, locale })}

            {simplifiedEffect && data.summarySimplified &&
                SimplifiedSummary({ lines: simplifiedLines, decs: simplifiedDecs, t, nf })}

            {normalEffect && data.summaryNormal && (<>
                {data.summaryNormal.summaryByVatRate &&
                    VatBreakdownTable({
                        vatRateLines,
                        vatDecs,
                        totals: {
                            data: data.summaryNormal,
                            netDecs: totalNormalDecs.net,
                            vatDecs: totalNormalDecs.vat,
                            gross: data.summaryGrossData?.invoiceGrossAmount,
                            grossHUF: data.summaryGrossData?.invoiceGrossAmountHUF,
                            grossDecs: summaryGrossDecs
                        },
                        t,
                        nf
                    })}
                {!data.summaryNormal.summaryByVatRate &&
                    NormalTotals({ data: data.summaryNormal, decs: totalNormalDecs, t, nf })}
            </>)}

            {grossEffect && data.summaryGrossData &&
                PayableTotal({
                    data: data.summaryGrossData,
                    decs: summaryGrossDecs,
                    currency: invoice.invoiceHead?.invoiceDetail?.currencyCode ?? 'HUF',
                    locale,
                    t,
                    nf
                })}
        </div>
    ) as string;
}

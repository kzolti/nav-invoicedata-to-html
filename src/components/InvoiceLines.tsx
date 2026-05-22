import type { Lines } from '../osaTypes/dataTypes.js';
import type { TFn, NFn } from './utils.js';
import { asArray, countDecimals, getTargetDecimals, esc } from './utils.js';
import { VatRateDisplay } from './VatRateDisplay.js';
import { LineBasicDetails } from './invoice-lines/LineBasicDetails.js';
import { LineExtendedDetails } from './invoice-lines/LineExtendedDetails.js';

interface Props {
    data: Lines;
    t: TFn;
    nf: NFn;
}

// Check if any line has a discount
const hasDiscounts = (lines: any[]): boolean =>
    lines.some(line => line.lineDiscountData != null);

// Check if line has any additional details to show
const hasLineDetails = (line: any): boolean =>
    !!(line.productCodes ||
        line.lineExpressionIndicator === false ||
        line.intermediatedService ||
        line.depositIndicator ||
        line.productFeeClause ||
        line.obligatedForProductFee ||
        line.conventionalLineInfo ||
        line.additionalLineData ||
        line.aggregateInvoiceLineData ||
        line.lineModificationReference ||
        line.advanceData ||
        line.referencesToOtherLines ||
        line.newTransportMean ||
        (line.GPCExcise != null && line.GPCExcise != 0) ||
        line.dieselOilPurchase ||
        line.netaDeclaration ||
        line.lineProductFeeContent);

const getDiscountedUnitPrice = (line: any): number => {
    const unitPrice = line.unitPrice || 0;
    const quantity = line.quantity;
    const discountData = line.lineDiscountData;

    if (discountData) {
        if (discountData.discountValue != null && quantity != null && quantity !== 0) {
            return parseFloat((unitPrice - discountData.discountValue / quantity).toFixed(4));
        }
        if (discountData.discountRate != null) {
            return parseFloat((unitPrice * (1 - discountData.discountRate)).toFixed(4));
        }
    }
    return unitPrice;
};

/** Compute per-column decimal precision based on all line data */
function computeColumnDecimals(lines: any[]) {
    return {
        unitPrice: getTargetDecimals(Math.max(0, ...lines.map(l => countDecimals(l.unitPrice)))),
        discount: getTargetDecimals(Math.max(0, ...lines.map(l => countDecimals(l.lineDiscountData?.discountValue)))),
        discountedUnitPrice: getTargetDecimals(Math.max(0, ...lines.map(l => countDecimals(getDiscountedUnitPrice(l))))),
        netAmount: getTargetDecimals(Math.max(0, ...lines.map(l => countDecimals(l.lineAmountsNormal?.lineNetAmountData?.lineNetAmount)))),
        vatAmount: getTargetDecimals(Math.max(0, ...lines.map(l => countDecimals(l.lineAmountsNormal?.lineVatData?.lineVatAmount)))),
        grossAmount: getTargetDecimals(Math.max(0, ...lines.map(l => {
            if (l.lineAmountsNormal) return countDecimals(l.lineAmountsNormal.lineGrossAmountData?.lineGrossAmountNormal);
            if (l.lineAmountsSimplified) return countDecimals(l.lineAmountsSimplified.lineGrossAmountSimplified);
            return 0;
        }))),
    };
}

export function InvoiceLinesComponent({ data, t, nf }: Props): string {
    const lines = asArray(data.line);
    const hasAnyDiscount = hasDiscounts(lines);
    const colDecs = computeColumnDecimals(lines);
    const totalCols = hasAnyDiscount ? 9 : 7;

    return (
        <div class="invoice-lines">
            <h3>{t('invoiceLines')}</h3>

            {data.mergedItemIndicator && (
                <div class="merged-warning">
                    ⚠️ {t('mergedItemIndicator')} - Az adatszolgáltatás méretcsökkentés miatt összevont soradatokat tartalmaz
                </div>
            )}

            <table class="lines-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>{t('description')}</th>
                        {hasAnyDiscount && (<>
                            <th class="text-right">{t('netPrice')}</th>
                            <th class="text-right">{t('discount')}</th>
                        </>)}
                        <th class="text-right">{t('unitPrice')}</th>
                        <th class="text-right">{t('quantity')}</th>
                        <th class="text-right">{t('netAmount')}</th>
                        <th class="text-right">{t('vatAmount')}</th>
                        <th class="text-right">{t('grossAmount')}</th>
                    </tr>
                </thead>

                {lines.map(line => renderLineGroup(line, hasAnyDiscount, colDecs, totalCols, t, nf)).join('')}
            </table>
        </div>
    ) as string;
}

function renderLineGroup(line: any, hasAnyDiscount: boolean, colDecs: ReturnType<typeof computeColumnDecimals>, totalCols: number, t: TFn, nf: NFn): string {
    return (
        <tbody class="line-group">
            {renderMainRow(line, hasAnyDiscount, colDecs, t, nf)}
            {hasLineDetails(line) && (
                <tr class="details-row">
                    <td colspan={String(totalCols)}>
                        <div class="line-details">
                            {LineBasicDetails({ line, t })}
                            {LineExtendedDetails({ line, t })}
                        </div>
                    </td>
                </tr>
            )}
        </tbody>
    ) as string;
}

function renderMainRow(line: any, hasAnyDiscount: boolean, colDecs: ReturnType<typeof computeColumnDecimals>, t: TFn, nf: NFn): string {
    return (
        <tr class="main-row">
            <td>{line.lineNumber}</td>
            <td>
                <div class="description">
                    <strong>{esc(line.lineDescription)}</strong>
                    {line.lineNatureIndicator && <span class="badge">{t(line.lineNatureIndicator)}</span>}
                </div>
            </td>

            {hasAnyDiscount && (<>
                <td class="text-right" style="white-space: nowrap;">
                    {nf(line.unitPrice, colDecs.unitPrice)}
                    {line.unitPriceHUF && line.unitPriceHUF !== line.unitPrice &&
                        (<><br /><small>{nf(line.unitPriceHUF, colDecs.unitPrice)} HUF</small></>)}
                </td>
                <td class="text-right" style="white-space: nowrap;"
                    title={buildDiscountTitle(line, colDecs, t, nf)}>
                    {renderDiscountCell(line, colDecs, t, nf)}
                </td>
            </>)}

            <td class="text-right" style="white-space: nowrap;">
                {nf(getDiscountedUnitPrice(line), colDecs.discountedUnitPrice)}
            </td>

            <td class="text-right" style="white-space: nowrap;">
                {nf(
                    line.quantity != null ? parseFloat(Number(line.quantity).toFixed(4)) : null,
                    Math.min(countDecimals(line.quantity), 4)
                )}
                {line.unitOfMeasure ? ' ' + t(line.unitOfMeasure) : ''}
                {line.unitOfMeasureOwn && (<><br /><small>({esc(line.unitOfMeasureOwn)})</small></>)}
            </td>

            {renderAmountCells(line, colDecs, t, nf)}
        </tr>
    ) as string;
}

function buildDiscountTitle(line: any, colDecs: ReturnType<typeof computeColumnDecimals>, t: TFn, nf: NFn): string {
    const dd = line.lineDiscountData;
    if (!dd) return '';
    const parts: string[] = [];
    if (dd.discountDescription) parts.push(esc(dd.discountDescription));
    if (dd.discountValue != null) parts.push(`${t('discountValue')}: ${nf(dd.discountValue, colDecs.discount)}`);
    if (dd.discountRate != null) parts.push(`${t('discountRate')}: ${nf(dd.discountRate * 100)}%`);
    return parts.join('\n');
}

function renderDiscountCell(line: any, colDecs: ReturnType<typeof computeColumnDecimals>, t: TFn, nf: NFn): string {
    const dd = line.lineDiscountData;
    if (!dd) return '-';
    if (dd.discountRate) return `${nf(dd.discountRate * 100)}%`;
    if (dd.discountValue) return nf(dd.discountValue, colDecs.discount);
    return '-';
}

function renderAmountCells(line: any, colDecs: ReturnType<typeof computeColumnDecimals>, t: TFn, nf: NFn): string {
    if (line.lineAmountsNormal) {
        const la = line.lineAmountsNormal;
        return (<>
            <td class="text-right" style="white-space: nowrap;">
                {nf(la.lineNetAmountData?.lineNetAmount, colDecs.netAmount) || '-'}
            </td>
            <td class="text-right" style="white-space: nowrap;">
                {la.lineVatData ? (<>
                    {nf(la.lineVatData.lineVatAmount, colDecs.vatAmount) || '-'}
                    <br /><small>{VatRateDisplay({ vatRate: la.lineVatRate, t, nf })}</small>
                </>) : '-'}
            </td>
            <td class="text-right" style="white-space: nowrap;">
                {nf(la.lineGrossAmountData?.lineGrossAmountNormal, colDecs.grossAmount) || '-'}
            </td>
        </>) as string;
    }

    if (line.lineAmountsSimplified) {
        const la = line.lineAmountsSimplified;
        return (<>
            <td class="text-right" colspan="2" style="white-space: nowrap;">
                {t('simplifiedInvoice')}
                <br /><small>{VatRateDisplay({ vatRate: la.lineVatRate, t, nf })}</small>
            </td>
            <td class="text-right" style="white-space: nowrap;">
                {nf(la.lineGrossAmountSimplified, colDecs.grossAmount) || '-'}
            </td>
        </>) as string;
    }

    return <td colspan="3" class="text-right">-</td> as string;
}

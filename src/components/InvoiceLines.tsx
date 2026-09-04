import type { Lines, VatRate } from 'nav-osa-types';
import type { TFn, NFn, DisplayLine } from './utils.js';
import { asArray, countDecimals, getTargetDecimals, esc, calcDiscountedUnitPrice, vatCodeKey } from './utils.js';
import { VatRateDisplay } from './VatRateDisplay.js';
import { LineBasicDetails } from './invoice-lines/LineBasicDetails.js';
import { LineExtendedDetails } from './invoice-lines/LineExtendedDetails.js';

interface Props {
    data: Lines;
    t: TFn;
    nf: NFn;
}

// Check if line has any additional details to show
const lineVatRate = (line: DisplayLine) =>
    line.lineAmountsNormal?.lineVatRate ?? line.lineAmountsSimplified?.lineVatRate;

// Codes (vatExemption / vatOutOfScope) appearing with more than one distinct reason across the invoice
const computeAmbiguousVatCodes = (lines: DisplayLine[]): Set<string> => {
    const reasonsByCode = new Map<string, Set<string>>();
    for (const line of lines) {
        const vatRate = lineVatRate(line);
        if (!vatRate) continue;
        const entries: Array<[string, string | undefined]> = [];
        if (vatRate.vatExemption) entries.push([`ex:${vatRate.vatExemption.case}`, vatRate.vatExemption.reason]);
        if (vatRate.vatOutOfScope) entries.push([`os:${vatRate.vatOutOfScope.case}`, vatRate.vatOutOfScope.reason]);
        for (const [key, reason] of entries) {
            if (!reason) continue;
            let reasons = reasonsByCode.get(key);
            if (!reasons) { reasons = new Set(); reasonsByCode.set(key, reasons); }
            reasons.add(reason);
        }
    }
    const ambiguous = new Set<string>();
    for (const [key, reasons] of reasonsByCode) {
        if (reasons.size > 1) ambiguous.add(key);
    }
    return ambiguous;
};

const hasLineVatReason = (line: DisplayLine, ambiguousVatCodes: Set<string>): boolean => {
    const vatRate: VatRate | undefined = lineVatRate(line);
    return !!(vatRate && ambiguousVatCodes.has(vatCodeKey(vatRate)) &&
        ((vatRate.vatExemption && vatRate.vatExemption.reason) ||
            (vatRate.vatOutOfScope && vatRate.vatOutOfScope.reason)));
};

const hasLineDetails = (line: DisplayLine, ambiguousVatCodes: Set<string>): boolean =>
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
        (line.GPCExcise != null && Number(line.GPCExcise) !== 0) ||
        line.dieselOilPurchase ||
        line.netaDeclaration ||
        line.lineProductFeeContent ||
        line._annotatedOriginalInvoiceNumber ||
        line._annotatedDeliveryDate ||
        hasLineVatReason(line, ambiguousVatCodes));

const getDiscountedUnitPrice = (line: DisplayLine, scale?: number): string => {
    const discountData = line.lineDiscountData;
    if (!discountData) {
        // Keep original XML string (trailing zeros for column alignment)
        return line.unitPrice != null && line.unitPrice !== '' ? String(line.unitPrice) : '';
    }
    return calcDiscountedUnitPrice(
        line.unitPrice,
        line.quantity,
        discountData.discountValue,
        discountData.discountRate,
        scale ?? 10
    );
};

/** Compute per-column decimal precision based on all line data */
function computeColumnDecimals(lines: DisplayLine[]) {
    // A K.n.e. ár is egységár: ugyanarra a skálára kerekítjük, mint a
    // Nettó egységár oszlopot (oszlopszélesség-barát, sorok közt igazított).
    const unitPrice = getTargetDecimals(Math.max(0, ...lines.map(l =>
        Math.max(countDecimals(l.unitPrice), countDecimals(l.unitPriceHUF))
    )));
    return {
        unitPrice,
        discount: getTargetDecimals(Math.max(0, ...lines.map(l => countDecimals(l.lineDiscountData?.discountValue)))),
        discountedUnitPrice: unitPrice,
        quantity: getTargetDecimals(Math.max(0, ...lines.map(l => countDecimals(l.quantity)))),
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
    const colDecs = computeColumnDecimals(lines);
    const hasDiscount = lines.some(line => !!line.lineDiscountData);
    const totalCols = 9 - (hasDiscount ? 0 : 1);
    const ambiguousVatCodes = computeAmbiguousVatCodes(lines);

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
                        <th class="text-right" title={t('quantityTitle')}>{t('quantity')}</th>
                        <th class="text-right" title={t('unitOfMeasureTitle')}>{t('unitOfMeasure')}</th>
                        <th class="text-right">{t('unitPrice')}</th>
                        {hasDiscount && DiscountHeader({ t })}
                        <th class="text-right">{t('netAmount')}</th>
                        <th class="text-right">{t('vatAmount')}</th>
                        <th class="text-right">{t('grossAmount')}</th>
                    </tr>
                </thead>

                {lines.map(line => renderLineGroup(line, colDecs, totalCols, hasDiscount, t, nf, ambiguousVatCodes)).join('')}
            </table>
        </div>
    ) as string;
}

function DiscountHeader({ t }: { t: TFn }): string {
    const lines = t('discount').split('\n');
    return (
        <th class="text-right" title={t('discountTitle')}>
            {lines.map((line, i) => (
                <span class={i > 0 ? 'header-sub' : undefined}>
                    {line}
                    {i < lines.length - 1 && <br />}
                </span>
            ))}
        </th>
    ) as string;
}

function renderLineGroup(line: DisplayLine, colDecs: ReturnType<typeof computeColumnDecimals>, totalCols: number, hasDiscount: boolean, t: TFn, nf: NFn, ambiguousVatCodes: Set<string>): string {
    return (
        <tbody class="line-group">
            {renderMainRow(line, colDecs, hasDiscount, t, nf)}
            {hasLineDetails(line, ambiguousVatCodes) && (
                <tr class="details-row">
                    <td colspan={String(totalCols)}>
                        <div class="line-details">
                            {LineBasicDetails({ line, t })}
                            {LineExtendedDetails({ line, t, ambiguousVatCodes })}
                        </div>
                    </td>
                </tr>
            )}
        </tbody>
    ) as string;
}

function renderMainRow(line: DisplayLine, colDecs: ReturnType<typeof computeColumnDecimals>, hasDiscount: boolean, t: TFn, nf: NFn): string {
    return (
        <tr class="main-row">
            <td>{line.lineNumber}</td>
            <td>
                <div class="description">
                    <strong>{esc(line.lineDescription)}</strong>
                    {line.lineNatureIndicator && <span class="badge">{t(line.lineNatureIndicator)}</span>}
                </div>
            </td>

            <td class="text-right" style="white-space: nowrap;">
                {nf(line.quantity ?? '', colDecs.quantity)}
            </td>

            <td class="text-right" style="white-space: nowrap;">
                {line.unitOfMeasure ? t(line.unitOfMeasure) : '-'}
                {line.unitOfMeasureOwn && (<><br /><small>({esc(line.unitOfMeasureOwn)})</small></>)}
            </td>

            <td class="text-right" style="white-space: nowrap;">
                {nf(line.unitPrice ?? '', colDecs.unitPrice) || '-'}
                {line.unitPriceHUF && line.unitPriceHUF !== line.unitPrice &&
                    (<><br /><small>{nf(line.unitPriceHUF, colDecs.unitPrice)} HUF</small></>)}
            </td>

            {hasDiscount && (
                <td class="text-right" style="white-space: nowrap;"
                    title={buildDiscountTitle(line, colDecs, t, nf)}>
                    {renderDiscountCell(line, colDecs, t, nf)}
                    {line.lineDiscountData && (<>
                        <br /><small>{nf(getDiscountedUnitPrice(line, colDecs.discountedUnitPrice), colDecs.discountedUnitPrice)}</small>
                    </>)}
                </td>
            )}

            {renderAmountCells(line, colDecs, t, nf)}
        </tr>
    ) as string;
}

function buildDiscountTitle(line: DisplayLine, colDecs: ReturnType<typeof computeColumnDecimals>, t: TFn, nf: NFn): string {
    const dd = line.lineDiscountData;
    if (!dd) return '';
    const parts: string[] = [];
    if (dd.discountDescription) parts.push(esc(dd.discountDescription));
    if (dd.discountValue != null) parts.push(`${t('discountValue')}: ${nf(dd.discountValue, colDecs.discount)}`);
    if (dd.discountRate != null) parts.push(`${t('discountRate')}: ${nf(dd.discountRate, countDecimals(dd.discountRate))}%`);
    return parts.join('\n');
}

function renderDiscountCell(line: DisplayLine, colDecs: ReturnType<typeof computeColumnDecimals>, t: TFn, nf: NFn): string {
    const dd = line.lineDiscountData;
    if (!dd) return '-';
    if (dd.discountRate) return `${nf(dd.discountRate, countDecimals(dd.discountRate))}%`;
    if (dd.discountValue) return nf(dd.discountValue, colDecs.discount);
    return '-';
}

function renderAmountCells(line: DisplayLine, colDecs: ReturnType<typeof computeColumnDecimals>, t: TFn, nf: NFn): string {
    if (line.lineAmountsNormal) {
        const la = line.lineAmountsNormal;
        return (<>
            <td class="text-right" style="white-space: nowrap;">
                {nf(la.lineNetAmountData?.lineNetAmount ?? '', colDecs.netAmount) || '-'}
                {la.lineNetAmountData?.lineNetAmountHUF && la.lineNetAmountData.lineNetAmountHUF !== la.lineNetAmountData.lineNetAmount &&
                    (<><br /><small>{nf(la.lineNetAmountData.lineNetAmountHUF, colDecs.netAmount)} HUF</small></>)}
            </td>
            <td class="text-right" style="white-space: nowrap;">
                {la.lineVatData ? (<>
                    {nf(la.lineVatData.lineVatAmount ?? '', colDecs.vatAmount) || '-'}
                    {la.lineVatData.lineVatAmountHUF && la.lineVatData.lineVatAmountHUF !== la.lineVatData.lineVatAmount &&
                        (<><br /><small>{nf(la.lineVatData.lineVatAmountHUF, colDecs.vatAmount)} HUF</small></>)}
                    <br /><small>{VatRateDisplay({ vatRate: la.lineVatRate, t, nf })}</small>
                </>) : '-'}
            </td>
            <td class="text-right" style="white-space: nowrap;">
                {nf(la.lineGrossAmountData?.lineGrossAmountNormal ?? '', colDecs.grossAmount) || '-'}
                {la.lineGrossAmountData?.lineGrossAmountNormalHUF && la.lineGrossAmountData.lineGrossAmountNormalHUF !== la.lineGrossAmountData.lineGrossAmountNormal &&
                    (<><br /><small>{nf(la.lineGrossAmountData.lineGrossAmountNormalHUF, colDecs.grossAmount)} HUF</small></>)}
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
                {la.lineGrossAmountSimplifiedHUF && la.lineGrossAmountSimplifiedHUF !== la.lineGrossAmountSimplified &&
                    (<><br /><small>{nf(la.lineGrossAmountSimplifiedHUF, colDecs.grossAmount)} HUF</small></>)}
            </td>
        </>) as string;
    }

    return <td colspan="3" class="text-right">-</td> as string;
}

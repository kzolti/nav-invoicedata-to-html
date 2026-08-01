import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "@kitajs/html/jsx-runtime";
import { asArray, countDecimals, getTargetDecimals, esc, calcDiscountedUnitPrice } from './utils.js';
import { VatRateDisplay } from './VatRateDisplay.js';
import { LineBasicDetails } from './invoice-lines/LineBasicDetails.js';
import { LineExtendedDetails } from './invoice-lines/LineExtendedDetails.js';
// Check if any line has a discount
const hasDiscounts = (lines) => lines.some(line => line.lineDiscountData != null);
// Check if line has any additional details to show
const hasLineDetails = (line) => !!(line.productCodes ||
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
    line._annotatedDeliveryDate);
const getDiscountedUnitPrice = (line) => {
    const discountData = line.lineDiscountData;
    if (!discountData) {
        // Keep original XML string (trailing zeros for column alignment)
        return line.unitPrice != null && line.unitPrice !== '' ? String(line.unitPrice) : '';
    }
    return calcDiscountedUnitPrice(line.unitPrice, line.quantity, discountData.discountValue, discountData.discountRate);
};
/** Compute per-column decimal precision based on all line data */
function computeColumnDecimals(lines) {
    return {
        unitPrice: getTargetDecimals(Math.max(0, ...lines.map(l => Math.max(countDecimals(l.unitPrice), countDecimals(l.unitPriceHUF))))),
        discount: getTargetDecimals(Math.max(0, ...lines.map(l => countDecimals(l.lineDiscountData?.discountValue)))),
        discountedUnitPrice: getTargetDecimals(Math.max(0, ...lines.map(l => countDecimals(getDiscountedUnitPrice(l))))),
        quantity: getTargetDecimals(Math.max(0, ...lines.map(l => countDecimals(l.quantity)))),
        netAmount: getTargetDecimals(Math.max(0, ...lines.map(l => countDecimals(l.lineAmountsNormal?.lineNetAmountData?.lineNetAmount)))),
        vatAmount: getTargetDecimals(Math.max(0, ...lines.map(l => countDecimals(l.lineAmountsNormal?.lineVatData?.lineVatAmount)))),
        grossAmount: getTargetDecimals(Math.max(0, ...lines.map(l => {
            if (l.lineAmountsNormal)
                return countDecimals(l.lineAmountsNormal.lineGrossAmountData?.lineGrossAmountNormal);
            if (l.lineAmountsSimplified)
                return countDecimals(l.lineAmountsSimplified.lineGrossAmountSimplified);
            return 0;
        }))),
    };
}
export function InvoiceLinesComponent({ data, t, nf }) {
    const lines = asArray(data.line);
    const hasAnyDiscount = hasDiscounts(lines);
    const colDecs = computeColumnDecimals(lines);
    const totalCols = hasAnyDiscount ? 9 : 7;
    return (_jsxs("div", { class: "invoice-lines", children: [_jsx("h3", { children: t('invoiceLines') }), data.mergedItemIndicator && (_jsxs("div", { class: "merged-warning", children: ["\u26A0\uFE0F ", t('mergedItemIndicator'), " - Az adatszolg\u00E1ltat\u00E1s m\u00E9retcs\u00F6kkent\u00E9s miatt \u00F6sszevont soradatokat tartalmaz"] })), _jsxs("table", { class: "lines-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "#" }), _jsx("th", { children: t('description') }), hasAnyDiscount && (_jsxs(_Fragment, { children: [_jsx("th", { class: "text-right", children: t('netPrice') }), _jsx("th", { class: "text-right", children: t('discount') })] })), _jsx("th", { class: "text-right", children: t('unitPrice') }), _jsx("th", { class: "text-right", children: t('quantity') }), _jsx("th", { class: "text-right", children: t('netAmount') }), _jsx("th", { class: "text-right", children: t('vatAmount') }), _jsx("th", { class: "text-right", children: t('grossAmount') })] }) }), lines.map(line => renderLineGroup(line, hasAnyDiscount, colDecs, totalCols, t, nf)).join('')] })] }));
}
function renderLineGroup(line, hasAnyDiscount, colDecs, totalCols, t, nf) {
    return (_jsxs("tbody", { class: "line-group", children: [renderMainRow(line, hasAnyDiscount, colDecs, t, nf), hasLineDetails(line) && (_jsx("tr", { class: "details-row", children: _jsx("td", { colspan: String(totalCols), children: _jsxs("div", { class: "line-details", children: [LineBasicDetails({ line, t }), LineExtendedDetails({ line, t })] }) }) }))] }));
}
function renderMainRow(line, hasAnyDiscount, colDecs, t, nf) {
    return (_jsxs("tr", { class: "main-row", children: [_jsx("td", { children: line.lineNumber }), _jsx("td", { children: _jsxs("div", { class: "description", children: [_jsx("strong", { children: esc(line.lineDescription) }), line.lineNatureIndicator && _jsx("span", { class: "badge", children: t(line.lineNatureIndicator) })] }) }), hasAnyDiscount && (_jsxs(_Fragment, { children: [_jsxs("td", { class: "text-right", style: "white-space: nowrap;", children: [nf(line.unitPrice ?? '', colDecs.unitPrice), line.unitPriceHUF && line.unitPriceHUF !== line.unitPrice &&
                                (_jsxs(_Fragment, { children: [_jsx("br", {}), _jsxs("small", { children: [nf(line.unitPriceHUF, colDecs.unitPrice), " HUF"] })] }))] }), _jsx("td", { class: "text-right", style: "white-space: nowrap;", title: buildDiscountTitle(line, colDecs, t, nf), children: renderDiscountCell(line, colDecs, t, nf) })] })), _jsx("td", { class: "text-right", style: "white-space: nowrap;", children: nf(getDiscountedUnitPrice(line), colDecs.discountedUnitPrice) }), _jsxs("td", { class: "text-right", style: "white-space: nowrap;", children: [nf(line.quantity ?? '', colDecs.quantity), line.unitOfMeasure ? ' ' + t(line.unitOfMeasure) : '', line.unitOfMeasureOwn && (_jsxs(_Fragment, { children: [_jsx("br", {}), _jsxs("small", { children: ["(", esc(line.unitOfMeasureOwn), ")"] })] }))] }), renderAmountCells(line, colDecs, t, nf)] }));
}
function buildDiscountTitle(line, colDecs, t, nf) {
    const dd = line.lineDiscountData;
    if (!dd)
        return '';
    const parts = [];
    if (dd.discountDescription)
        parts.push(esc(dd.discountDescription));
    if (dd.discountValue != null)
        parts.push(`${t('discountValue')}: ${nf(dd.discountValue, colDecs.discount)}`);
    if (dd.discountRate != null)
        parts.push(`${t('discountRate')}: ${nf(dd.discountRate, countDecimals(dd.discountRate))}%`);
    return parts.join('\n');
}
function renderDiscountCell(line, colDecs, t, nf) {
    const dd = line.lineDiscountData;
    if (!dd)
        return '-';
    if (dd.discountRate)
        return `${nf(dd.discountRate, countDecimals(dd.discountRate))}%`;
    if (dd.discountValue)
        return nf(dd.discountValue, colDecs.discount);
    return '-';
}
function renderAmountCells(line, colDecs, t, nf) {
    if (line.lineAmountsNormal) {
        const la = line.lineAmountsNormal;
        return (_jsxs(_Fragment, { children: [_jsx("td", { class: "text-right", style: "white-space: nowrap;", children: nf(la.lineNetAmountData?.lineNetAmount ?? '', colDecs.netAmount) || '-' }), _jsx("td", { class: "text-right", style: "white-space: nowrap;", children: la.lineVatData ? (_jsxs(_Fragment, { children: [nf(la.lineVatData.lineVatAmount ?? '', colDecs.vatAmount) || '-', _jsx("br", {}), _jsx("small", { children: VatRateDisplay({ vatRate: la.lineVatRate, t, nf }) })] })) : '-' }), _jsx("td", { class: "text-right", style: "white-space: nowrap;", children: nf(la.lineGrossAmountData?.lineGrossAmountNormal ?? '', colDecs.grossAmount) || '-' })] }));
    }
    if (line.lineAmountsSimplified) {
        const la = line.lineAmountsSimplified;
        return (_jsxs(_Fragment, { children: [_jsxs("td", { class: "text-right", colspan: "2", style: "white-space: nowrap;", children: [t('simplifiedInvoice'), _jsx("br", {}), _jsx("small", { children: VatRateDisplay({ vatRate: la.lineVatRate, t, nf }) })] }), _jsx("td", { class: "text-right", style: "white-space: nowrap;", children: nf(la.lineGrossAmountSimplified, colDecs.grossAmount) || '-' })] }));
    }
    return _jsx("td", { colspan: "3", class: "text-right", children: "-" });
}

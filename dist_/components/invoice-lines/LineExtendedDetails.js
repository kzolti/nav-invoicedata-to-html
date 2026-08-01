import { jsxs as _jsxs, Fragment as _Fragment, jsx as _jsx } from "@kitajs/html/jsx-runtime";
import { asArray, getAddressLine1, esc } from '../utils.js';
export function LineExtendedDetails({ line, t }) {
    const parts = [];
    // Annotated original invoice number & delivery date from BatchMergedInvoiceComponent
    if (line._annotatedOriginalInvoiceNumber || line._annotatedDeliveryDate) {
        const annItems = [];
        if (line._annotatedOriginalInvoiceNumber) {
            annItems.push(`<strong>${t('originalInvoiceNumber')}:</strong> ${esc(line._annotatedOriginalInvoiceNumber)}`);
        }
        if (line._annotatedDeliveryDate) {
            annItems.push(`<strong>${t('invoiceDeliveryDate')}:</strong> ${line._annotatedDeliveryDate}`);
        }
        if (annItems.length > 0) {
            parts.push(`<div class="detail-section">${annItems.join(' | ')}</div>`);
        }
    }
    // Aggregate invoice line data
    if (line.aggregateInvoiceLineData) {
        const agg = line.aggregateInvoiceLineData;
        parts.push((_jsxs("div", { class: "detail-section", children: [_jsxs("strong", { children: [t('aggregateInvoiceLineData'), ":"] }), agg.lineDeliveryDate && _jsxs("p", { children: [t('deliveryDate'), ": ", agg.lineDeliveryDate] }), agg.lineExchangeRate && _jsxs("p", { children: [t('exchangeRate'), ": ", agg.lineExchangeRate] })] })));
    }
    // Line modification reference
    if (line.lineModificationReference) {
        const ref = line.lineModificationReference;
        parts.push((_jsxs("div", { class: "detail-section", children: [_jsxs("strong", { children: [t('lineModification'), ":"] }), _jsxs("p", { children: [t('lineNumberReference'), ": ", esc(ref.lineNumberReference)] }), _jsxs("p", { children: [t('lineOperation'), ": ", t(ref.lineOperation)] })] })));
    }
    // Advance data
    if (line.advanceData) {
        const adv = line.advanceData;
        parts.push((_jsxs("div", { class: "detail-section", children: [_jsxs("strong", { children: [t('advancePayment'), ":"] }), adv.advanceIndicator && _jsxs("p", { children: [t('advancePayment'), ": ", t('yes')] }), adv.advancePaymentData && (_jsxs(_Fragment, { children: [_jsxs("p", { children: [t('originalInvoice'), ": ", esc(adv.advancePaymentData.advanceOriginalInvoice)] }), _jsxs("p", { children: [t('paymentDate'), ": ", adv.advancePaymentData.advancePaymentDate] }), adv.advancePaymentData.advanceExchangeRate &&
                            _jsxs("p", { children: [t('exchangeRate'), ": ", adv.advancePaymentData.advanceExchangeRate] })] }))] })));
    }
    // References to other lines
    if (line.referencesToOtherLines) {
        parts.push((_jsxs("div", { class: "detail-section", children: [_jsxs("strong", { children: [t('referencesToOtherLines'), ":"] }), ' ', asArray(line.referencesToOtherLines.referenceToOtherLine).map(val => esc(val)).join(', ')] })));
    }
    // Product fee clause
    if (line.productFeeClause) {
        const pfc = line.productFeeClause;
        const items = [];
        if (pfc.productFeeTakeoverData) {
            items.push(_jsx("p", { children: _jsxs("strong", { children: [t('productFeeTakeoverData'), ":"] }) }));
            items.push(_jsxs("p", { children: [t('takeoverReason'), ": ", t(pfc.productFeeTakeoverData.takeoverReason)] }));
            if (pfc.productFeeTakeoverData.takeoverAmount) {
                items.push(_jsxs("p", { children: [t('amount'), ": ", pfc.productFeeTakeoverData.takeoverAmount, " HUF"] }));
            }
        }
        if (pfc.customerDeclaration) {
            items.push(_jsx("p", { children: _jsxs("strong", { children: [t('customerDeclaration'), ":"] }) }));
            items.push(_jsxs("p", { children: [t('productStream'), ": ", t(pfc.customerDeclaration.productStream)] }));
            if (pfc.customerDeclaration.productFeeWeight) {
                items.push(_jsxs("p", { children: [t('weight'), ": ", pfc.customerDeclaration.productFeeWeight, " kg"] }));
            }
        }
        if (items.length > 0) {
            parts.push(_jsx("div", { class: "detail-section", children: items.join('') }));
        }
    }
    // New transport mean
    if (line.newTransportMean) {
        const ntm = line.newTransportMean;
        const items = [];
        items.push(_jsxs("strong", { children: [t('newTransportMean'), ":"] }));
        if (ntm.brand)
            items.push(_jsxs("p", { children: [t('brand'), ": ", esc(ntm.brand)] }));
        if (ntm.serialNum)
            items.push(_jsxs("p", { children: [t('serialNum'), ": ", esc(ntm.serialNum)] }));
        if (ntm.engineNum)
            items.push(_jsxs("p", { children: [t('engineNum'), ": ", esc(ntm.engineNum)] }));
        if (ntm.firstEntryIntoService)
            items.push(_jsxs("p", { children: [t('firstEntryIntoService'), ": ", ntm.firstEntryIntoService] }));
        if (ntm.vehicle) {
            items.push(_jsxs("p", { children: [t('engineCapacity'), ": ", ntm.vehicle.engineCapacity, " cm\u00B3"] }));
            items.push(_jsxs("p", { children: [t('enginePower'), ": ", ntm.vehicle.enginePower, " kW"] }));
            items.push(_jsxs("p", { children: [t('kms'), ": ", ntm.vehicle.kms, " km"] }));
        }
        if (ntm.vessel) {
            items.push(_jsxs("p", { children: [t('length'), ": ", ntm.vessel.length, " m"] }));
            items.push(_jsxs("p", { children: [t('sailedHours'), ": ", ntm.vessel.sailedHours, " h"] }));
        }
        if (ntm.aircraft) {
            items.push(_jsxs("p", { children: [t('takeOffWeight'), ": ", ntm.aircraft.takeOffWeight, " kg"] }));
            if (ntm.aircraft.airCargo) {
                items.push(_jsxs("p", { children: [t('airCargo'), ": ", t('yes')] }));
            }
            items.push(_jsxs("p", { children: [t('operationHours'), ": ", ntm.aircraft.operationHours, " h"] }));
        }
        parts.push(_jsx("div", { class: "detail-section", children: items.join('') }));
    }
    // GPC Excise
    if (line.GPCExcise != null && Number(line.GPCExcise) !== 0) {
        parts.push((_jsxs("div", { class: "detail-section", children: [_jsxs("strong", { children: [t('GPCExcise'), ":"] }), _jsxs("p", { children: [line.GPCExcise, " HUF"] })] })));
    }
    // Diesel oil purchase
    if (line.dieselOilPurchase) {
        const dop = line.dieselOilPurchase;
        parts.push((_jsxs("div", { class: "detail-section", children: [_jsxs("strong", { children: [t('dieselOilPurchase'), ":"] }), _jsxs("p", { children: [t('purchaseLocation'), ": ", getAddressLine1(dop.purchaseLocation)] }), _jsxs("p", { children: [t('purchaseDate'), ": ", dop.purchaseDate] }), _jsxs("p", { children: [t('vehicleRegistrationNumber'), ": ", esc(dop.vehicleRegistrationNumber)] }), dop.dieselOilQuantity != null &&
                    _jsxs("p", { children: [t('dieselOilQuantity'), ": ", dop.dieselOilQuantity, " L"] })] })));
    }
    // NETA declaration
    if (line.netaDeclaration) {
        parts.push(_jsx("div", { class: "detail-section", children: _jsx("span", { class: "badge badge-warning", children: t('netaDeclaration') }) }));
    }
    // Line product fee content
    if (line.lineProductFeeContent) {
        const feeItems = asArray(line.lineProductFeeContent);
        parts.push((_jsxs("div", { class: "detail-section", children: [_jsxs("strong", { children: [t('lineProductFeeContent'), ":"] }), _jsxs("table", { class: "summary-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: t('productFeeCode') }), _jsx("th", { class: "text-right", children: t('productFeeQuantity') }), _jsx("th", { class: "text-right", children: t('productFeeRate') }), _jsx("th", { class: "text-right", children: t('productFeeAmount') })] }) }), _jsx("tbody", { children: feeItems.map((fd) => (_jsxs("tr", { children: [_jsx("td", { children: esc(fd.productFeeCode?.productCodeValue || fd.productFeeCode?.productCodeOwnValue || '-') }), _jsxs("td", { class: "text-right", children: [fd.productFeeQuantity ?? '-', " ", fd.productFeeMeasuringUnit ? t(fd.productFeeMeasuringUnit) : ''] }), _jsxs("td", { class: "text-right", children: [fd.productFeeRate ?? '-', " HUF"] }), _jsxs("td", { class: "text-right", children: [fd.productFeeAmount ?? '-', " HUF"] })] }))).join('') })] })] })));
    }
    return parts.join('');
}

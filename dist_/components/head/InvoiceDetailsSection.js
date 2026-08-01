import { jsx as _jsx, jsxs as _jsxs } from "@kitajs/html/jsx-runtime";
import { asArray, esc, countDecimals } from '../utils.js';
export function InvoiceDetailsSection({ data, t, nf }) {
    return (_jsxs("div", { class: "invoice-details", children: [_jsx("h3", { children: t('invoiceDetails') }), _jsxs("div", { class: "details-grid", children: [_jsxs("div", { class: "detail-item", children: [_jsxs("strong", { children: [t('invoiceCategory'), ":"] }), t(data.invoiceCategory)] }), _jsxs("div", { class: "detail-item", children: [_jsxs("strong", { children: [t('invoiceDeliveryDate'), ":"] }), data.invoiceDeliveryDate] }), data.invoiceDeliveryPeriodStart && (_jsxs("div", { class: "detail-item", children: [_jsxs("strong", { children: [t('deliveryPeriod'), ":"] }), data.invoiceDeliveryPeriodStart, " - ", data.invoiceDeliveryPeriodEnd] })), data.invoiceAccountingDeliveryDate && (_jsxs("div", { class: "detail-item", children: [_jsxs("strong", { children: [t('accountingDeliveryDate'), ":"] }), data.invoiceAccountingDeliveryDate] })), _jsxs("div", { class: "detail-item", children: [_jsxs("strong", { children: [t('currency'), ":"] }), data.currencyCode] }), _jsxs("div", { class: "detail-item", children: [_jsxs("strong", { children: [t('exchangeRate'), ":"] }), nf(data.exchangeRate, countDecimals(data.exchangeRate))] }), data.paymentMethod && (_jsxs("div", { class: "detail-item", children: [_jsxs("strong", { children: [t('paymentMethod'), ":"] }), t(data.paymentMethod)] })), data.paymentDate && (_jsxs("div", { class: "detail-item", children: [_jsxs("strong", { children: [t('paymentDate'), ":"] }), data.paymentDate] })), _jsxs("div", { class: "detail-item", children: [_jsxs("strong", { children: [t('appearance'), ":"] }), t(data.invoiceAppearance)] })] }), _jsxs("div", { class: "indicators", children: [data.smallBusinessIndicator && _jsx("span", { class: "tag", children: t('smallBusiness') }), data.periodicalSettlement && _jsx("span", { class: "tag", children: t('periodicalSettlement') }), data.cashAccountingIndicator && _jsx("span", { class: "tag", children: t('cashAccounting') }), data.selfBillingIndicator && _jsx("span", { class: "tag", children: t('selfBilling') }), data.utilitySettlementIndicator && _jsx("span", { class: "tag", children: t('utilitySettlement') })] }), data.conventionalInvoiceInfo && ConventionalInfo({ info: data.conventionalInvoiceInfo, t }), data.additionalInvoiceData && AdditionalInvoiceData({ items: data.additionalInvoiceData, t })] }));
}
function ConventionalInfo({ info, t }) {
    const entries = [
        { key: 'orderNumbers', values: info.orderNumbers?.orderNumber ?? [] },
        { key: 'deliveryNotes', values: info.deliveryNotes?.deliveryNote ?? [] },
        { key: 'contractNumbers', values: info.contractNumbers?.contractNumber ?? [] },
        { key: 'ekaerIds', values: info.ekaerIds?.ekaerId ?? [] },
        { key: 'shippingDates', values: info.shippingDates?.shippingDate ?? [] },
        { key: 'supplierCompanyCodes', values: info.supplierCompanyCodes?.supplierCompanyCode ?? [] },
        { key: 'customerCompanyCodes', values: info.customerCompanyCodes?.customerCompanyCode ?? [] },
        { key: 'dealerCodes', values: info.dealerCodes?.dealerCode ?? [] },
        { key: 'costCenters', values: info.costCenters?.costCenter ?? [] },
        { key: 'projectNumbers', values: info.projectNumbers?.projectNumber ?? [] },
        { key: 'generalLedgerAccountNumbers', values: info.generalLedgerAccountNumbers?.generalLedgerAccountNumber ?? [] },
        { key: 'glnNumbersSupplier', values: info.glnNumbersSupplier?.glnNumber ?? [] },
        { key: 'glnNumbersCustomer', values: info.glnNumbersCustomer?.glnNumber ?? [] },
        { key: 'materialNumbers', values: info.materialNumbers?.materialNumber ?? [] },
        { key: 'itemNumbers', values: info.itemNumbers?.itemNumber ?? [] },
    ];
    const items = entries
        .filter(e => e.values.length > 0)
        .map(e => (_jsxs("p", { children: [_jsxs("strong", { children: [t(e.key), ":"] }), ' ', e.values.map(val => esc(val)).join(', ')] })));
    if (items.length === 0)
        return '';
    return (_jsx("div", { class: "conventional-info", children: items.join('') }));
}
function AdditionalInvoiceData({ items, t }) {
    const arr = asArray(items);
    if (arr.length === 0)
        return '';
    return (_jsxs("div", { class: "additional-data", children: [_jsx("h4", { children: t('additionalData') }), _jsx("ul", { children: arr.map(item => (_jsxs("li", { children: [_jsxs("div", { class: "add-data-left", children: [_jsxs("strong", { children: [esc(item.dataDescription), ":"] }), _jsx("span", { class: "add-data-value", children: esc(item.dataValue) })] }), _jsx("div", { class: "add-data-name", children: esc(item.dataName) })] }))).join('') })] }));
}

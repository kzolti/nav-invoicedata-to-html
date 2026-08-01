import { jsxs as _jsxs, jsx as _jsx } from "@kitajs/html/jsx-runtime";
import { asArray, esc } from '../utils.js';
export function LineBasicDetails({ line, t }) {
    const parts = [];
    // Product codes
    if (line.productCodes) {
        parts.push((_jsxs("div", { class: "product-codes", children: [_jsxs("strong", { children: [t('productCodes'), ":"] }), _jsx("ul", { children: asArray(line.productCodes.productCode).map((code) => (_jsxs("li", { children: [t(code.productCodeCategory), ": ", esc(code.productCodeValue || code.productCodeOwnValue)] }))).join('') })] })));
    }
    // Indicators
    if (!line.lineExpressionIndicator || line.intermediatedService || line.depositIndicator || line.productFeeClause || line.obligatedForProductFee) {
        const badges = [];
        if (!line.lineExpressionIndicator) {
            badges.push(_jsx("span", { class: "badge badge-warning line-expression-false", children: t('lineExpressionFalse') }));
        }
        if (line.intermediatedService)
            badges.push(_jsx("span", { class: "badge", children: t('intermediatedService') }));
        if (line.depositIndicator)
            badges.push(_jsx("span", { class: "badge", children: t('deposit') }));
        if (line.productFeeClause)
            badges.push(_jsx("span", { class: "badge", children: t('productFee') }));
        if (line.obligatedForProductFee)
            badges.push(_jsx("span", { class: "badge badge-warning", children: t('obligatedForProductFee') }));
        parts.push(_jsx("div", { class: "indicators", children: badges.join('') }));
    }
    // Conventional line info
    if (line.conventionalLineInfo) {
        const ci = line.conventionalLineInfo;
        const items = [];
        if (ci.orderNumbers) {
            items.push(_jsxs("p", { children: [_jsxs("strong", { children: [t('orderNumbers'), ":"] }), " ", asArray(ci.orderNumbers.orderNumber).map(val => esc(val)).join(', ')] }));
        }
        if (ci.deliveryNotes) {
            items.push(_jsxs("p", { children: [_jsxs("strong", { children: [t('deliveryNotes'), ":"] }), " ", asArray(ci.deliveryNotes.deliveryNote).map(val => esc(val)).join(', ')] }));
        }
        if (ci.contractNumbers) {
            items.push(_jsxs("p", { children: [_jsxs("strong", { children: [t('contractNumbers'), ":"] }), " ", asArray(ci.contractNumbers.contractNumber).map(val => esc(val)).join(', ')] }));
        }
        if (items.length > 0) {
            parts.push(_jsx("div", { class: "conventional-info", children: items.join('') }));
        }
    }
    // Additional line data
    if (line.additionalLineData) {
        parts.push((_jsxs("div", { class: "additional-data", children: [_jsxs("strong", { children: [t('additionalData'), ":"] }), _jsx("ul", { children: asArray(line.additionalLineData).map((item) => (_jsxs("li", { children: [_jsxs("div", { class: "add-data-left", children: [_jsxs("strong", { children: [esc(item.dataDescription), ":"] }), _jsx("span", { class: "add-data-value", children: esc(item.dataValue) })] }), _jsx("div", { class: "add-data-name", children: esc(item.dataName) })] }))).join('') })] })));
    }
    return parts.join('');
}

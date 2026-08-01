import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "@kitajs/html/jsx-runtime";
import { VatRateDisplay } from '../VatRateDisplay.js';
export function SimplifiedSummary({ lines, decs, t, nf }) {
    return (_jsxs("div", { class: "simplified-summary", children: [_jsx("h4", { children: t('simplifiedInvoice') }), _jsxs("table", { class: "summary-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: t('vatRate') }), _jsx("th", { class: "text-right", children: t('grossAmount') })] }) }), _jsx("tbody", { children: lines.map(item => (_jsxs("tr", { children: [_jsx("td", { children: VatRateDisplay({ vatRate: item.vatRate, t, nf }) }), _jsxs("td", { class: "text-right", style: "white-space: nowrap;", children: [nf(item.vatContentGrossAmount, decs), item.vatContentGrossAmountHUF &&
                                            item.vatContentGrossAmountHUF !== item.vatContentGrossAmount &&
                                            (_jsxs(_Fragment, { children: [_jsx("br", {}), _jsxs("small", { children: [nf(item.vatContentGrossAmountHUF, decs), " HUF"] })] }))] })] }))).join('') })] })] }));
}

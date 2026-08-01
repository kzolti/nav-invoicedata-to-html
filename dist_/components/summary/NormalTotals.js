import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "@kitajs/html/jsx-runtime";
export function NormalTotals({ data, decs, t, nf }) {
    return (_jsx("table", { class: "totals-table", children: _jsxs("tbody", { children: [_jsxs("tr", { children: [_jsx("td", { children: t('netAmountTotal') }), _jsxs("td", { class: "text-right", style: "white-space: nowrap;", children: [nf(data.invoiceNetAmount, decs.net), data.invoiceNetAmountHUF && data.invoiceNetAmountHUF !== data.invoiceNetAmount &&
                                    (_jsxs(_Fragment, { children: [_jsx("br", {}), _jsxs("small", { children: [nf(data.invoiceNetAmountHUF, decs.net), " HUF"] })] }))] })] }), _jsxs("tr", { children: [_jsx("td", { children: t('vatAmountTotal') }), _jsxs("td", { class: "text-right", style: "white-space: nowrap;", children: [nf(data.invoiceVatAmount, decs.vat), data.invoiceVatAmountHUF && data.invoiceVatAmountHUF !== data.invoiceVatAmount &&
                                    (_jsxs(_Fragment, { children: [_jsx("br", {}), _jsxs("small", { children: [nf(data.invoiceVatAmountHUF, decs.vat), " HUF"] })] }))] })] })] }) }));
}

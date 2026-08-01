import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "@kitajs/html/jsx-runtime";
export function GrossTotal({ data, decs, t, nf }) {
    return (_jsx("table", { class: "totals-table gross-total", children: _jsx("tbody", { children: _jsxs("tr", { class: "total-row", children: [_jsx("td", { children: _jsx("strong", { children: t('grossAmountTotal') }) }), _jsx("td", { class: "text-right", style: "white-space: nowrap;", children: _jsxs("strong", { children: [nf(data.invoiceGrossAmount, decs), data.invoiceGrossAmountHUF && data.invoiceGrossAmountHUF !== data.invoiceGrossAmount &&
                                    (_jsxs(_Fragment, { children: [_jsx("br", {}), _jsxs("small", { children: [nf(data.invoiceGrossAmountHUF, decs), " HUF"] })] }))] }) })] }) }) }));
}

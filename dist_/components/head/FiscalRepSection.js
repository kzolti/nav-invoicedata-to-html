import { jsx as _jsx, jsxs as _jsxs } from "@kitajs/html/jsx-runtime";
import { esc } from '../utils.js';
export function FiscalRepSection({ data, t, formatTaxNumber, getAddressLine1, getAddressFloor }) {
    const floorInfo = getAddressFloor(data.fiscalRepresentativeAddress, t);
    return (_jsxs("div", { class: "party fiscal-rep", children: [_jsx("h3", { children: t('fiscalRepresentative') }), _jsx("p", { children: _jsx("strong", { children: esc(data.fiscalRepresentativeName) }) }), _jsxs("p", { children: [t('taxNumber'), ": ", formatTaxNumber(data.fiscalRepresentativeTaxNumber)] }), _jsxs("div", { class: "address", children: [_jsx("p", { children: getAddressLine1(data.fiscalRepresentativeAddress) }), floorInfo && _jsx("p", { children: floorInfo })] }), data.fiscalRepresentativeBankAccountNumber &&
                _jsxs("p", { children: [t('bankAccount'), ": ", esc(data.fiscalRepresentativeBankAccountNumber)] })] }));
}

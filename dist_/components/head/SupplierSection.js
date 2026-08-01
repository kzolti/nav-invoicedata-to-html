import { jsx as _jsx, jsxs as _jsxs } from "@kitajs/html/jsx-runtime";
import { esc } from '../utils.js';
export function SupplierSection({ data, t, formatTaxNumber, getAddressLine1, getAddressFloor }) {
    const floorInfo = getAddressFloor(data.supplierAddress, t);
    return (_jsxs("div", { class: "party supplier", children: [_jsx("h3", { children: t('supplier') }), _jsx("p", { children: _jsx("strong", { children: esc(data.supplierName) }) }), _jsxs("p", { children: [t('taxNumber'), ": ", formatTaxNumber(data.supplierTaxNumber)] }), data.communityVatNumber &&
                _jsxs("p", { children: [t('communityVatNumber'), ": ", esc(data.communityVatNumber)] }), data.groupMemberTaxNumber &&
                _jsxs("p", { children: [t('groupMemberTaxNumber'), ": ", formatTaxNumber(data.groupMemberTaxNumber)] }), _jsxs("div", { class: "address", children: [_jsx("p", { children: getAddressLine1(data.supplierAddress) }), floorInfo && _jsx("p", { children: floorInfo })] }), data.supplierBankAccountNumber &&
                _jsxs("p", { children: [t('bankAccount'), ": ", esc(data.supplierBankAccountNumber)] }), data.individualExemption &&
                _jsxs("p", { children: [t('individualExemption'), ": ", String(data.individualExemption)] }), data.exciseLicenceNum &&
                _jsxs("p", { children: [t('exciseLicenceNum'), ": ", esc(data.exciseLicenceNum)] })] }));
}

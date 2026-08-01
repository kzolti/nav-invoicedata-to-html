import { jsx as _jsx, jsxs as _jsxs } from "@kitajs/html/jsx-runtime";
import { esc } from '../utils.js';
export function CustomerSection({ data, t, formatTaxNumber, getAddressLine1, getAddressFloor }) {
    if (!data) {
        return (_jsxs("div", { class: "party customer", children: [_jsx("h3", { children: t('customer') }), _jsx("p", { children: t('noCustomerInfo') })] }));
    }
    const floorInfo = data.customerAddress ? getAddressFloor(data.customerAddress, t) : '';
    const vatData = data.customerVatData;
    return (_jsxs("div", { class: "party customer", children: [_jsx("h3", { children: t('customer') }), _jsx("p", { children: _jsx("strong", { children: esc(data.customerName) }) }), vatData?.customerTaxNumber &&
                _jsxs("p", { children: [t('taxNumber'), ": ", formatTaxNumber(vatData.customerTaxNumber)] }), vatData?.customerTaxNumber?.groupMemberTaxNumber &&
                _jsxs("p", { children: [t('groupMemberTaxNumber'), ": ", formatTaxNumber(vatData.customerTaxNumber.groupMemberTaxNumber)] }), vatData?.communityVatNumber &&
                _jsxs("p", { children: [t('communityVatNumber'), ": ", esc(vatData.communityVatNumber)] }), vatData?.thirdStateTaxId &&
                _jsxs("p", { children: [t('thirdStateTaxId'), ": ", esc(vatData.thirdStateTaxId)] }), _jsxs("p", { children: [t('vatStatus'), ": ", t(data.customerVatStatus)] }), data.customerAddress && (_jsxs("div", { class: "address", children: [_jsx("p", { children: getAddressLine1(data.customerAddress) }), floorInfo && _jsx("p", { children: floorInfo })] })), data.customerBankAccountNumber &&
                _jsxs("p", { children: [t('bankAccount'), ": ", esc(data.customerBankAccountNumber)] })] }));
}

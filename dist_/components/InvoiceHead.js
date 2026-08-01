import { jsxs as _jsxs } from "@kitajs/html/jsx-runtime";
import { formatTaxNumber, getAddressLine1, getAddressFloor } from './utils.js';
import { SupplierSection } from './head/SupplierSection.js';
import { CustomerSection } from './head/CustomerSection.js';
import { FiscalRepSection } from './head/FiscalRepSection.js';
import { InvoiceDetailsSection } from './head/InvoiceDetailsSection.js';
export function InvoiceHeadComponent({ data, t, nf }) {
    const ctx = { t, nf, formatTaxNumber, getAddressLine1, getAddressFloor };
    return (_jsxs("div", { class: "invoice-head", children: [_jsxs("div", { class: "parties", children: [SupplierSection({ data: data.supplierInfo, ...ctx }), CustomerSection({ data: data.customerInfo, ...ctx }), data.fiscalRepresentativeInfo &&
                        FiscalRepSection({ data: data.fiscalRepresentativeInfo, ...ctx })] }), InvoiceDetailsSection({ data: data.invoiceDetail, ...ctx })] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "@kitajs/html/jsx-runtime";
import { InvoiceHeadComponent } from './InvoiceHead.js';
import { InvoiceLinesComponent } from './InvoiceLines.js';
import { InvoiceSummaryComponent } from './InvoiceSummary.js';
import { BatchMergedInvoiceComponent, canMergeBatches } from './BatchMergedInvoice.js';
import { asArray, esc } from './utils.js';
export function InvoiceDataComponent({ data, t, nf }) {
    let invoices = [];
    let batchIndices = [];
    if (data.invoiceMain?.batchInvoice) {
        const batch = asArray(data.invoiceMain.batchInvoice);
        // Ha a batchek összevonhatók, egyetlen számlaképet generálunk
        if (canMergeBatches(batch)) {
            return (_jsxs("div", { class: "invoice-container", children: [_jsx("h1", { children: t('invoice') }), _jsxs("div", { class: "invoice-metadata", children: [_jsxs("p", { children: [_jsxs("strong", { children: [t('invoiceNumber'), ":"] }), " ", esc(data.invoiceNumber)] }), _jsxs("p", { children: [_jsxs("strong", { children: [t('invoiceIssueDate'), ":"] }), " ", data.invoiceIssueDate] }), data.completenessIndicator && (_jsx("p", { children: _jsx("strong", { children: t('complete') }) }))] }), BatchMergedInvoiceComponent({ batches: batch, t, nf })] }));
        }
        invoices = batch.map((b) => b.invoice);
        batchIndices = batch.map((b) => b.batchIndex);
    }
    else if (data.invoiceMain?.invoice) {
        invoices = [data.invoiceMain.invoice];
        batchIndices = [];
    }
    return (_jsxs("div", { class: "invoice-container", children: [_jsx("h1", { children: t('invoice') }), _jsxs("div", { class: "invoice-metadata", children: [_jsxs("p", { children: [_jsxs("strong", { children: [t('invoiceNumber'), ":"] }), " ", esc(data.invoiceNumber)] }), _jsxs("p", { children: [_jsxs("strong", { children: [t('invoiceIssueDate'), ":"] }), " ", data.invoiceIssueDate] }), data.completenessIndicator && (_jsx("p", { children: _jsx("strong", { children: t('complete') }) }))] }), invoices.map((invoice, index) => {
                const batchIndex = batchIndices[index];
                return (_jsxs("div", { class: "invoice-section", children: [batchIndices.length > 0 && (_jsx("div", { class: "batch-header", children: _jsxs("h2", { children: [t('batchIndex'), ": ", batchIndex] }) })), invoice.invoiceReference && (_jsxs("div", { class: "invoice-reference", children: [_jsx("h3", { children: t('invoiceReference') }), _jsxs("p", { children: [_jsxs("strong", { children: [t('originalInvoiceNumber'), ":"] }), ' ', esc(invoice.invoiceReference.originalInvoiceNumber)] }), _jsxs("p", { children: [_jsxs("strong", { children: [t('modificationIndex'), ":"] }), ' ', invoice.invoiceReference.modificationIndex] }), _jsxs("p", { children: [_jsxs("strong", { children: [t('modifyWithoutMaster'), ":"] }), ' ', invoice.invoiceReference.modifyWithoutMaster
                                            ? t('yes')
                                            : t('no')] })] })), invoice.invoiceHead && InvoiceHeadComponent({ data: invoice.invoiceHead, t, nf }), invoice.invoiceLines && InvoiceLinesComponent({ data: invoice.invoiceLines, t, nf }), invoice.invoiceSummary && InvoiceSummaryComponent({ invoice, t, nf })] }));
            }).join('')] }));
}

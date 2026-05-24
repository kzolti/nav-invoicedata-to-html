import type { InvoiceData as InvoiceDataType, Invoice } from '../osaTypes/dataTypes.js';
import type { TFn, NFn } from './utils.js';
import { InvoiceHeadComponent } from './InvoiceHead.js';
import { InvoiceLinesComponent } from './InvoiceLines.js';
import { InvoiceSummaryComponent } from './InvoiceSummary.js';
import { BatchMergedInvoiceComponent, canMergeBatches } from './BatchMergedInvoice.js';
import { asArray, esc } from './utils.js';

interface Props {
    data: InvoiceDataType;
    t: TFn;
    nf: NFn;
}

export function InvoiceDataComponent({ data, t, nf }: Props): string {
    let invoices: Invoice[] = [];
    let batchIndices: number[] = [];

    if (data.invoiceMain.batchInvoice) {
        const batch = asArray(data.invoiceMain.batchInvoice);

        // Ha a batchek összevonhatók, egyetlen számlaképet generálunk
        if (canMergeBatches(batch)) {
            return (
                <div class="invoice-container">
                    <h1>{t('invoice')}</h1>
                    <div class="invoice-metadata">
                        <p><strong>{t('invoiceNumber')}:</strong> {esc(data.invoiceNumber)}</p>
                        <p><strong>{t('invoiceIssueDate')}:</strong> {data.invoiceIssueDate}</p>
                        {data.completenessIndicator && (
                            <p>
                                <strong>{t('complete')}</strong>
                            </p>
                        )}
                    </div>

                    {BatchMergedInvoiceComponent({ batches: batch, t, nf })}
                </div>
            ) as string;
        }

        invoices = batch.map((b) => b.invoice);
        batchIndices = batch.map((b) => b.batchIndex);
    } else if (data.invoiceMain.invoice) {
        invoices = [data.invoiceMain.invoice];
        batchIndices = [];
    }

    return (
        <div class="invoice-container">
            <h1>{t('invoice')}</h1>
            <div class="invoice-metadata">
                <p><strong>{t('invoiceNumber')}:</strong> {esc(data.invoiceNumber)}</p>
                <p><strong>{t('invoiceIssueDate')}:</strong> {data.invoiceIssueDate}</p>
                {data.completenessIndicator && (
                    <p>
                        <strong>{t('complete')}</strong>
                    </p>
                )}
            </div>

            {invoices.map((invoice, index) => {
                const batchIndex = batchIndices[index];
                return (
                    <div class="invoice-section">
                        {/* Batch Index for batch invoices */}
                        {batchIndices.length > 0 && (
                            <div class="batch-header">
                                <h2>{t('batchIndex')}: {batchIndex}</h2>
                            </div>
                        )}

                        {/* Invoice Reference (modification data) */}
                        {invoice.invoiceReference && (
                            <div class="invoice-reference">
                                <h3>{t('invoiceReference')}</h3>
                                <p>
                                    <strong>{t('originalInvoiceNumber')}:</strong>{' '}
                                    {esc(invoice.invoiceReference.originalInvoiceNumber)}
                                </p>
                                <p>
                                    <strong>{t('modificationIndex')}:</strong>{' '}
                                    {invoice.invoiceReference.modificationIndex}
                                </p>
                                <p>
                                    <strong>{t('modifyWithoutMaster')}:</strong>{' '}
                                    {invoice.invoiceReference.modifyWithoutMaster
                                        ? t('yes')
                                        : t('no')}
                                </p>
                            </div>
                        )}

                        {invoice.invoiceHead && InvoiceHeadComponent({ data: invoice.invoiceHead, t, nf })}

                        {invoice.invoiceLines && InvoiceLinesComponent({ data: invoice.invoiceLines, t, nf })}

                        {invoice.invoiceSummary && InvoiceSummaryComponent({ invoice, t, nf })}
                    </div>
                );
            }).join('')}
        </div>
    ) as string;
}

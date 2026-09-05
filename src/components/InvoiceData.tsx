import type { InvoiceData as InvoiceDataType, Invoice } from 'nav-osa-types';
import type { TFn, NFn } from './utils.js';
import { InvoiceHeadComponent } from './InvoiceHead.js';
import { InvoiceLinesComponent, ColumnLegend } from './InvoiceLines.js';
import { InvoiceSummaryComponent } from './InvoiceSummary.js';
import { BatchMergedInvoiceComponent, canMergeBatches, canMergeAsCorrection } from './BatchMergedInvoice.js';
import { asArray, esc } from './utils.js';
import { splitSections, ExtraDataSection } from './sections.js';

interface Props {
    data: InvoiceDataType;
    t: TFn;
    nf: NFn;
    locale: string;
}

export function InvoiceDataComponent({ data, t, nf, locale }: Props): string {
    let invoices: Invoice[] = [];
    let batchIndices: number[] = [];

    if (data.invoiceMain?.batchInvoice) {
        const batch = asArray(data.invoiceMain.batchInvoice);

        // Ha a batchek összevonhatók, egyetlen számlaképet generálunk
        const merged = canMergeBatches(batch);
        const correction = !merged && canMergeAsCorrection(batch);
        if (merged || correction) {
            const firstSections = splitSections(batch[0].invoice.invoiceHead?.invoiceDetail?.additionalInvoiceData, locale);
            const title = firstSections.documentName?.dataValue ?? t('invoice');
            return (
                <div class="invoice-container">
                    <h1>{esc(title)}</h1>
                    {firstSections.documentDesc && <p class="document-desc">{esc(firstSections.documentDesc.dataValue)}</p>}

                    {BatchMergedInvoiceComponent({
                        batches: batch,
                        invoiceNumber: data.invoiceNumber,
                        invoiceIssueDate: data.invoiceIssueDate,
                        completenessIndicator: data.completenessIndicator,
                        correctionMode: correction,
                        t,
                        nf,
                        locale,
                    })}
                </div>
            ) as string;
        }

        invoices = batch.map((b) => b.invoice);
        batchIndices = batch.map((b) => b.batchIndex);
    } else if (data.invoiceMain?.invoice) {
        invoices = [data.invoiceMain.invoice];
        batchIndices = [];
    }

    const docSections = splitSections(invoices[0]?.invoiceHead?.invoiceDetail?.additionalInvoiceData, locale);
    const title = docSections.documentName?.dataValue ?? t('invoice');

    return (
        <div class="invoice-container">
            <h1>{esc(title)}</h1>
            {docSections.documentDesc && <p class="document-desc">{esc(docSections.documentDesc.dataValue)}</p>}

            {invoices.map((invoice, index) => {
                const batchIndex = batchIndices[index];
                const sections = splitSections(invoice.invoiceHead?.invoiceDetail?.additionalInvoiceData, locale);
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

                        {invoice.invoiceHead && InvoiceHeadComponent({
                            data: invoice.invoiceHead,
                            invoiceNumber: data.invoiceNumber,
                            invoiceIssueDate: data.invoiceIssueDate,
                            completenessIndicator: data.completenessIndicator,
                            t,
                            nf,
                            locale,
                        })}

                        {invoice.invoiceLines && InvoiceLinesComponent({ data: invoice.invoiceLines, t, nf })}

                        {invoice.invoiceSummary && InvoiceSummaryComponent({ invoice, t, nf, locale })}

                        {ExtraDataSection({ items: sections.other, t })}

                        {invoice.invoiceLines && ColumnLegend({ lines: asArray(invoice.invoiceLines.line), t })}
                    </div>
                );
            }).join('')}
        </div>
    ) as string;
}

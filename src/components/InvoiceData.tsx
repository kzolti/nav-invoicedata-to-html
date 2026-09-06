import type { InvoiceData as InvoiceDataType, Invoice } from 'nav-osa-types';
import type { TFn, NFn } from './utils.js';
import { InvoiceHeadComponent } from './InvoiceHead.js';
import { InvoiceLinesComponent, ColumnLegend } from './InvoiceLines.js';
import { InvoiceSummaryComponent } from './InvoiceSummary.js';
import { BatchMergedInvoiceComponent, canMergeBatches } from './BatchMergedInvoice.js';
import { asArray, esc } from './utils.js';
import { splitSections, ExtraDataSection, RendererInfoSection } from './sections.js';

interface Props {
    data: InvoiceDataType;
    t: TFn;
    nf: NFn;
    locale: string;
    /** Fallback renderer-lábléc, ha az XML-ben nincs RENDERER_INFO tag. */
    rendererFallback?: string;
}

const DETAIL_DIFF_KEYS = [
    'invoiceCategory',
    'invoiceDeliveryDate',
    'deliveryPeriod',
    'accountingDeliveryDate',
    'currency',
    'exchangeRate',
    'paymentMethod',
    'paymentDate',
    'appearance',
];

/** Gyűjtő számláinak összevetése: mely részlet-mezők értéke tér el. */
function detailKeyValue(inv: Invoice, key: string): string {
    const d = inv.invoiceHead?.invoiceDetail;
    switch (key) {
        case 'invoiceCategory': return d?.invoiceCategory ?? '';
        case 'invoiceDeliveryDate': return d?.invoiceDeliveryDate ?? '';
        case 'deliveryPeriod': return `${d?.invoiceDeliveryPeriodStart ?? ''}|${d?.invoiceDeliveryPeriodEnd ?? ''}`;
        case 'accountingDeliveryDate': return d?.invoiceAccountingDeliveryDate ?? '';
        case 'currency': return d?.currencyCode ?? '';
        case 'exchangeRate': return d?.exchangeRate != null ? String(d.exchangeRate) : '';
        case 'paymentMethod': return d?.paymentMethod ?? '';
        case 'paymentDate': return d?.paymentDate ?? '';
        case 'appearance': return d?.invoiceAppearance ?? '';
        default: return '';
    }
}

function computeDetailDiffKeys(invoices: Invoice[]): Set<string> {
    const out = new Set<string>();
    if (invoices.length < 2) return out;
    for (const key of DETAIL_DIFF_KEYS) {
        if (new Set(invoices.map(inv => detailKeyValue(inv, key))).size > 1) out.add(key);
    }
    return out;
}

export function InvoiceDataComponent({ data, t, nf, locale, rendererFallback }: Props): string {
    let invoices: Invoice[] = [];
    let batchIndices: number[] = [];

    if (data.invoiceMain?.batchInvoice) {
        const batch = asArray(data.invoiceMain.batchInvoice);

        // Ha a batchek összevonhatók, egyetlen számlaképet generálunk
        if (canMergeBatches(batch)) {
            const firstSections = splitSections(batch[0].invoice.invoiceHead?.invoiceDetail?.additionalInvoiceData, locale);
            const title = firstSections.documentName?.dataValue ?? t('invoice');
            const mergedRenderer = firstSections.rendererInfo?.dataValue
                ?? batch.map(b => splitSections(b.invoice.invoiceHead?.invoiceDetail?.additionalInvoiceData, locale).rendererInfo?.dataValue).find(v => v?.trim());
            return (
                <div class="invoice-container">
                    <h1 class="document-title">{esc(title)}</h1>
                    {firstSections.documentDesc && <p class="document-desc">{esc(firstSections.documentDesc.dataValue)}</p>}

                    {BatchMergedInvoiceComponent({
                        batches: batch,
                        invoiceNumber: data.invoiceNumber,
                        invoiceIssueDate: data.invoiceIssueDate,
                        completenessIndicator: data.completenessIndicator,
                        t,
                        nf,
                        locale,
                        rendererFallback,
                        rendererValue: mergedRenderer,
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

    // Gyűjtő nézetben a számlák között eltérő részlet-mezők kiemelése.
    const detailDiffKeys = batchIndices.length > 0 ? computeDetailDiffKeys(invoices) : new Set<string>();

    return (
        <div class="invoice-container">
            <h1 class="document-title">{esc(title)}</h1>
            {docSections.documentDesc && <p class="document-desc">{esc(docSections.documentDesc.dataValue)}</p>}

            {detailDiffKeys.size > 0 && <p class="diff-note">{t('diffNote')}</p>}

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
                            diffKeys: detailDiffKeys,
                            t,
                            nf,
                            locale,
                        })}

                        {invoice.invoiceLines && InvoiceLinesComponent({ data: invoice.invoiceLines, t, nf, locale })}

                        {invoice.invoiceSummary && InvoiceSummaryComponent({ invoice, t, nf, locale })}

                        {ExtraDataSection({ items: sections.other, t })}

                        {invoice.invoiceLines && ColumnLegend({ lines: asArray(invoice.invoiceLines.line), t })}

                        {RendererInfoSection({ value: sections.rendererInfo?.dataValue, fallback: rendererFallback })}
                    </div>
                );
            }).join('')}
        </div>
    ) as string;
}

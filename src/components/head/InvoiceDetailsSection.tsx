import type { InvoiceDetail } from 'nav-osa-types';
import type { TFn, NFn } from '../utils.js';
import { esc, countDecimals, formatIsoDate } from '../utils.js';

interface Props {
    data: InvoiceDetail;
    invoiceNumber?: string;
    invoiceIssueDate?: string;
    completenessIndicator?: boolean;
    /** Batch-mezők, amelyek értéke a gyűjtő számlái között eltér (kiemelve). */
    diffKeys?: Set<string>;
    locale: string;
    t: TFn;
    nf: NFn;
}

export function InvoiceDetailsSection({ data, invoiceNumber, invoiceIssueDate, completenessIndicator, diffKeys, locale, t, nf }: Props): string {
    const cls = (key: string): string => (diffKeys?.has(key) ? 'detail-item diff' : 'detail-item');
    return (
        <div class="invoice-details">
            <h3>{t('invoiceDetails')}</h3>

            {/* Details grid */}
            <div class="details-grid">
                {invoiceNumber && (
                    <div class="detail-item">
                        <strong>{t('invoiceNumber')}:</strong>
                        {esc(invoiceNumber)}
                    </div>
                )}
                {invoiceIssueDate && (
                    <div class="detail-item">
                        <strong>{t('invoiceIssueDate')}:</strong>
                        {formatIsoDate(invoiceIssueDate, locale)}
                    </div>
                )}
                <div class={cls('invoiceCategory')}>
                    <strong>{t('invoiceCategory')}:</strong>
                    {t(data.invoiceCategory)}
                </div>
                <div class={cls('invoiceDeliveryDate')}>
                    <strong>{t('invoiceDeliveryDate')}:</strong>
                    {formatIsoDate(data.invoiceDeliveryDate, locale)}
                </div>
                {data.invoiceDeliveryPeriodStart && (
                    <div class={cls('deliveryPeriod')}>
                        <strong>{t('deliveryPeriod')}:</strong>
                        {formatIsoDate(data.invoiceDeliveryPeriodStart, locale)} - {formatIsoDate(data.invoiceDeliveryPeriodEnd, locale)}
                    </div>
                )}
                {data.invoiceAccountingDeliveryDate && (
                    <div class={cls('accountingDeliveryDate')}>
                        <strong>{t('accountingDeliveryDate')}:</strong>
                        {formatIsoDate(data.invoiceAccountingDeliveryDate, locale)}
                    </div>
                )}
                <div class={cls('currency')}>
                    <strong>{t('currency')}:</strong>
                    {data.currencyCode}
                </div>
                {!(data.currencyCode === 'HUF' && Number(data.exchangeRate) === 1) && (
                    <div class={cls('exchangeRate')}>
                        <strong>{t('exchangeRate')}:</strong>
                        {nf(data.exchangeRate, countDecimals(data.exchangeRate))}
                    </div>
                )}
                {data.paymentMethod && (
                    <div class={cls('paymentMethod')}>
                        <strong>{t('paymentMethod')}:</strong>
                        {t(data.paymentMethod)}
                    </div>
                )}
                {data.paymentDate && (
                    <div class={cls('paymentDate')}>
                        <strong>{t('paymentDate')}:</strong>
                        {formatIsoDate(data.paymentDate, locale)}
                    </div>
                )}
                <div class={cls('appearance')}>
                    <strong>{t('appearance')}:</strong>
                    {t(data.invoiceAppearance)}
                </div>
            </div>

            {/* Indicators (csak ha van jelző, az üres doboz felesleges térközt adna) */}
            {(completenessIndicator || data.periodicalSettlement || data.cashAccountingIndicator || data.selfBillingIndicator || data.utilitySettlementIndicator) && (
                <div class="indicators">
                    {completenessIndicator && <span class="tag">{t('complete')}</span>}
                    {data.periodicalSettlement && <span class="tag">{t('periodicalSettlement')}</span>}
                    {data.cashAccountingIndicator && <span class="tag">{t('cashAccounting')}</span>}
                    {data.selfBillingIndicator && <span class="tag">{t('selfBilling')}</span>}
                    {data.utilitySettlementIndicator && <span class="tag">{t('utilitySettlement')}</span>}
                </div>
            )}

            {/* Conventional Info */}
            {data.conventionalInvoiceInfo && ConventionalInfo({ info: data.conventionalInvoiceInfo, t, locale })}
        </div>
    ) as string;
}

function ConventionalInfo({ info, t, locale }: { info: NonNullable<InvoiceDetail['conventionalInvoiceInfo']>; t: TFn; locale: string }): string {
    const entries: Array<{ key: string; values: string[] }> = [
        { key: 'orderNumbers', values: info.orderNumbers?.orderNumber ?? [] },
        { key: 'deliveryNotes', values: info.deliveryNotes?.deliveryNote ?? [] },
        { key: 'contractNumbers', values: info.contractNumbers?.contractNumber ?? [] },
        { key: 'ekaerIds', values: info.ekaerIds?.ekaerId ?? [] },
        { key: 'shippingDates', values: info.shippingDates?.shippingDate ?? [] },
        { key: 'supplierCompanyCodes', values: info.supplierCompanyCodes?.supplierCompanyCode ?? [] },
        { key: 'customerCompanyCodes', values: info.customerCompanyCodes?.customerCompanyCode ?? [] },
        { key: 'dealerCodes', values: info.dealerCodes?.dealerCode ?? [] },
        { key: 'costCenters', values: info.costCenters?.costCenter ?? [] },
        { key: 'projectNumbers', values: info.projectNumbers?.projectNumber ?? [] },
        { key: 'generalLedgerAccountNumbers', values: info.generalLedgerAccountNumbers?.generalLedgerAccountNumber ?? [] },
        { key: 'glnNumbersSupplier', values: info.glnNumbersSupplier?.glnNumber ?? [] },
        { key: 'glnNumbersCustomer', values: info.glnNumbersCustomer?.glnNumber ?? [] },
        { key: 'materialNumbers', values: info.materialNumbers?.materialNumber ?? [] },
        { key: 'itemNumbers', values: info.itemNumbers?.itemNumber ?? [] },
    ];

    const items = entries
        .filter(e => e.values.length > 0)
        .map(e => (
            <p>
                <strong>{t(e.key)}:</strong>{' '}
                {e.values.map(val => esc(e.key === 'shippingDates' ? formatIsoDate(val, locale) : val)).join(', ')}
            </p>
        ));

    if (items.length === 0) return '';

    return (<div class="conventional-info">{items.join('')}</div>) as string;
}

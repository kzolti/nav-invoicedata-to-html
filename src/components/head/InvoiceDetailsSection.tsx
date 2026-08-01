import type { InvoiceDetail, AdditionalData } from 'nav-osa-types';
import type { TFn, NFn } from '../utils.js';
import { asArray, esc, countDecimals } from '../utils.js';

interface Props {
    data: InvoiceDetail;
    t: TFn;
    nf: NFn;
}

export function InvoiceDetailsSection({ data, t, nf }: Props): string {
    return (
        <div class="invoice-details">
            <h3>{t('invoiceDetails')}</h3>

            {/* Details grid */}
            <div class="details-grid">
                <div class="detail-item">
                    <strong>{t('invoiceCategory')}:</strong>
                    {t(data.invoiceCategory)}
                </div>
                <div class="detail-item">
                    <strong>{t('invoiceDeliveryDate')}:</strong>
                    {data.invoiceDeliveryDate}
                </div>
                {data.invoiceDeliveryPeriodStart && (
                    <div class="detail-item">
                        <strong>{t('deliveryPeriod')}:</strong>
                        {data.invoiceDeliveryPeriodStart} - {data.invoiceDeliveryPeriodEnd}
                    </div>
                )}
                {data.invoiceAccountingDeliveryDate && (
                    <div class="detail-item">
                        <strong>{t('accountingDeliveryDate')}:</strong>
                        {data.invoiceAccountingDeliveryDate}
                    </div>
                )}
                <div class="detail-item">
                    <strong>{t('currency')}:</strong>
                    {data.currencyCode}
                </div>
                <div class="detail-item">
                    <strong>{t('exchangeRate')}:</strong>
                    {nf(data.exchangeRate, countDecimals(data.exchangeRate))}
                </div>
                {data.paymentMethod && (
                    <div class="detail-item">
                        <strong>{t('paymentMethod')}:</strong>
                        {t(data.paymentMethod)}
                    </div>
                )}
                {data.paymentDate && (
                    <div class="detail-item">
                        <strong>{t('paymentDate')}:</strong>
                        {data.paymentDate}
                    </div>
                )}
                <div class="detail-item">
                    <strong>{t('appearance')}:</strong>
                    {t(data.invoiceAppearance)}
                </div>
            </div>

            {/* Indicators */}
            <div class="indicators">
                {data.smallBusinessIndicator && <span class="tag">{t('smallBusiness')}</span>}
                {data.periodicalSettlement && <span class="tag">{t('periodicalSettlement')}</span>}
                {data.cashAccountingIndicator && <span class="tag">{t('cashAccounting')}</span>}
                {data.selfBillingIndicator && <span class="tag">{t('selfBilling')}</span>}
                {data.utilitySettlementIndicator && <span class="tag">{t('utilitySettlement')}</span>}
            </div>

            {/* Conventional Info */}
            {data.conventionalInvoiceInfo && ConventionalInfo({ info: data.conventionalInvoiceInfo, t })}

            {/* Additional Data */}
            {data.additionalInvoiceData && AdditionalInvoiceData({ items: data.additionalInvoiceData, t })}
        </div>
    ) as string;
}

function ConventionalInfo({ info, t }: { info: NonNullable<InvoiceDetail['conventionalInvoiceInfo']>; t: TFn }): string {
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
                {e.values.map(val => esc(val)).join(', ')}
            </p>
        ));

    if (items.length === 0) return '';

    return (<div class="conventional-info">{items.join('')}</div>) as string;
}

function AdditionalInvoiceData({ items, t }: { items: AdditionalData[]; t: TFn }): string {
    const arr = asArray(items);
    if (arr.length === 0) return '';

    return (
        <div class="additional-data">
            <h4>{t('additionalData')}</h4>
            <ul>
                {arr.map(item => (
                    <li>
                        <div class="add-data-left">
                            <strong>{esc(item.dataDescription)}:</strong>
                            <span class="add-data-value">{esc(item.dataValue)}</span>
                        </div>
                        <div class="add-data-name">{esc(item.dataName)}</div>
                    </li>
                )).join('')}
            </ul>
        </div>
    ) as string;
}

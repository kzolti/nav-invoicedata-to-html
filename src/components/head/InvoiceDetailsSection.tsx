import type { InvoiceDetail } from '../../osaTypes/dataTypes.js';
import type { TFn, NFn } from '../utils.js';
import { asArray, esc } from '../utils.js';

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
                    {nf(data.exchangeRate)}
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
    const fields: Array<{ key: string; container: any; field: string }> = [
        { key: 'orderNumbers', container: info.orderNumbers, field: 'orderNumber' },
        { key: 'deliveryNotes', container: info.deliveryNotes, field: 'deliveryNote' },
        { key: 'contractNumbers', container: info.contractNumbers, field: 'contractNumber' },
        { key: 'ekaerIds', container: info.ekaerIds, field: 'ekaerId' },
        { key: 'shippingDates', container: info.shippingDates, field: 'shippingDate' },
        { key: 'supplierCompanyCodes', container: info.supplierCompanyCodes, field: 'supplierCompanyCode' },
        { key: 'customerCompanyCodes', container: info.customerCompanyCodes, field: 'customerCompanyCode' },
        { key: 'dealerCodes', container: info.dealerCodes, field: 'dealerCode' },
        { key: 'costCenters', container: info.costCenters, field: 'costCenter' },
        { key: 'projectNumbers', container: info.projectNumbers, field: 'projectNumber' },
        { key: 'generalLedgerAccountNumbers', container: info.generalLedgerAccountNumbers, field: 'generalLedgerAccountNumber' },
        { key: 'glnNumbersSupplier', container: info.glnNumbersSupplier, field: 'glnNumber' },
        { key: 'glnNumbersCustomer', container: info.glnNumbersCustomer, field: 'glnNumber' },
        { key: 'materialNumbers', container: info.materialNumbers, field: 'materialNumber' },
        { key: 'itemNumbers', container: info.itemNumbers, field: 'itemNumber' },
    ];

    const items = fields
        .filter(f => f.container)
        .map(f => (
            <p>
                <strong>{t(f.key)}:</strong>{' '}
                {asArray((f.container as any)[f.field]).map(val => esc(val)).join(', ')}
            </p>
        ));

    if (items.length === 0) return '';

    return (<div class="conventional-info">{items.join('')}</div>) as string;
}

function AdditionalInvoiceData({ items, t }: { items: any[]; t: TFn }): string {
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

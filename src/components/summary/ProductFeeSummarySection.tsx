import type { ProductFeeSummary } from 'nav-osa-types';
import type { TFn, NFn } from '../utils.js';
import { asArray, esc, nfTrimmed } from '../utils.js';
import { amountInWords, shortCurrency } from './amountInWords.js';

interface Props {
    items: ProductFeeSummary[];
    t: TFn;
    nf: NFn;
    locale: string;
}

export function ProductFeeSummarySection({ items, t, nf, locale }: Props): string {
    return (
        <div class="product-fee-summary">
            <h4>{t('productFeeSummary')}</h4>
            {items.map(feeSummary => {
                // A termékdíj összege mindig forintban értendő.
                const words = amountInWords(feeSummary.productChargeSum, 'HUF', locale);
                return (
                <div class="fee-group">
                    <p><strong>{t('operation')}:</strong> {t(feeSummary.productFeeOperation)}</p>
                    <table class="summary-table">
                        <thead>
                            <tr>
                                <th>{t('productFeeCode')}</th>
                                <th class="text-right">{t('productFeeQuantity')}</th>
                                <th>{t('productFeeMeasuringUnit')}</th>
                                <th class="text-right">{t('productFeeRate')}</th>
                                <th class="text-right">{t('productFeeAmount')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {asArray(feeSummary.productFeeData).map(feeData => (
                                <tr>
                                    <td>{esc(feeData.productFeeCode.productCodeValue || feeData.productFeeCode.productCodeOwnValue || '-')}</td>
                                    <td class="text-right" style="white-space: nowrap;">
                                        {nfTrimmed(feeData.productFeeQuantity, nf)}
                                    </td>
                                    <td style="white-space: nowrap;">
                                        {esc(t(feeData.productFeeMeasuringUnit))}
                                    </td>
                                    <td class="text-right" style="white-space: nowrap;">
                                        {nfTrimmed(feeData.productFeeRate, nf)}
                                    </td>
                                    <td class="text-right" style="white-space: nowrap;">
                                        {nfTrimmed(feeData.productFeeAmount, nf)}
                                    </td>
                                </tr>
                            )).join('')}
                        </tbody>
                    </table>
                    <div class="total-block">
                        <p class="total-line">
                            <strong>{t('productChargeSum')}:</strong> {nfTrimmed(feeSummary.productChargeSum, nf)} {shortCurrency('HUF', locale)}
                        </p>
                        {words && <p class="total-words">{words}</p>}
                    </div>
                    {feeSummary.paymentEvidenceDocumentData && (
                        <div class="detail-section">
                            <strong>{t('paymentEvidenceDocument')}:</strong>
                            <p>{t('evidenceDocumentNo')}: {esc(feeSummary.paymentEvidenceDocumentData.evidenceDocumentNo)}</p>
                            <p>{t('evidenceDocumentDate')}: {feeSummary.paymentEvidenceDocumentData.evidenceDocumentDate}</p>
                            <p>{t('obligatedName')}: {esc(feeSummary.paymentEvidenceDocumentData.obligatedName)}</p>
                        </div>
                    )}
                </div>
                );
            }).join('')}
        </div>
    ) as string;
}

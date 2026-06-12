import type { ProductFeeSummary } from 'nav-osa-types';
import type { TFn, NFn } from '../utils.js';
import { asArray, esc } from '../utils.js';

interface Props {
    items: ProductFeeSummary[];
    t: TFn;
    nf: NFn;
}

export function ProductFeeSummarySection({ items, t, nf }: Props): string {
    return (
        <div class="product-fee-summary">
            <h4>{t('productFeeSummary')}</h4>
            {items.map(feeSummary => (
                <div class="fee-group">
                    <p><strong>{t('operation')}:</strong> {t(feeSummary.productFeeOperation)}</p>
                    <table class="summary-table">
                        <thead>
                            <tr>
                                <th>{t('productFeeCode')}</th>
                                <th class="text-right">{t('productFeeQuantity')}</th>
                                <th class="text-right">{t('productFeeAmount')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {asArray(feeSummary.productFeeData).map(feeData => (
                                <tr>
                                    <td>{esc(feeData.productFeeCode.productCodeValue || feeData.productFeeCode.productCodeOwnValue || '-')}</td>
                                    <td class="text-right" style="white-space: nowrap;">
                                        {nf(feeData.productFeeQuantity) || '-'}
                                    </td>
                                    <td class="text-right" style="white-space: nowrap;">
                                        {nf(feeData.productFeeAmount)} HUF
                                    </td>
                                </tr>
                            )).join('')}
                        </tbody>
                    </table>
                    <p class="fee-total">
                        <strong>{t('productChargeSum')}:</strong> {nf(feeSummary.productChargeSum)} HUF
                    </p>
                    {feeSummary.paymentEvidenceDocumentData && (
                        <div class="detail-section">
                            <strong>{t('paymentEvidenceDocument')}:</strong>
                            <p>{t('evidenceDocumentNo')}: {esc(feeSummary.paymentEvidenceDocumentData.evidenceDocumentNo)}</p>
                            <p>{t('evidenceDocumentDate')}: {feeSummary.paymentEvidenceDocumentData.evidenceDocumentDate}</p>
                            <p>{t('obligatedName')}: {esc(feeSummary.paymentEvidenceDocumentData.obligatedName)}</p>
                        </div>
                    )}
                </div>
            )).join('')}
        </div>
    ) as string;
}

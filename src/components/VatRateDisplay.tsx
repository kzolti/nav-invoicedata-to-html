import type { VatRate } from '../osaTypes/dataTypes.js';
import type { TFn, NFn } from './utils.js';

interface Props {
    vatRate: VatRate;
    t: TFn;
    nf: NFn;
}

export function VatRateDisplay({ vatRate, t, nf }: Props): string {
    let label = '';

    if (vatRate.vatPercentage) {
        label = `${nf(vatRate.vatPercentage * 100)}%`;
    } else if (vatRate.vatContent) {
        label = `${nf(vatRate.vatContent * 100)}%`;
    } else if (vatRate.vatExemption) {
        label = `${t('vatExemption') || t('vatExempt')}: ${vatRate.vatExemption.case}`;
    } else if (vatRate.vatOutOfScope) {
        label = `${t('vatOutOfScope')}: ${vatRate.vatOutOfScope.case}`;
    } else if (vatRate.vatDomesticReverseCharge) {
        label = t('vatDomesticReverseCharge');
    } else if (vatRate.marginSchemeIndicator) {
        label = `${t('marginScheme')}: ${t(vatRate.marginSchemeIndicator)}`;
    } else if (vatRate.noVatCharge) {
        label = t('noVatCharge');
    } else {
        label = t('vatExempt');
    }

    const mismatch = vatRate.vatAmountMismatch
        ? `<br /><small class="vat-mismatch-note">⚠️ ${t('vatAmountMismatch')}: ${nf(vatRate.vatAmountMismatch.vatRate * 100)}% (${vatRate.vatAmountMismatch.case})</small>`
        : '';

    return label + mismatch;
}

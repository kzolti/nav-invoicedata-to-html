import type { VatRate } from 'nav-osa-types';
import { countDecimals, type TFn, type NFn } from './utils.js';

interface Props {
    vatRate: VatRate;
    t: TFn;
    nf: NFn;
}

export function VatRateDisplay({ vatRate, t, nf }: Props): string {
    let label = '';

    if (vatRate.vatPercentage) {
        label = `${nf(vatRate.vatPercentage, countDecimals(vatRate.vatPercentage))}%`;
    } else if (vatRate.vatContent) {
        label = `${nf(vatRate.vatContent, countDecimals(vatRate.vatContent))}%`;
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
        ? `<br /><small class="vat-mismatch-note">⚠️ ${t('vatAmountMismatch')}: ${nf(vatRate.vatAmountMismatch.vatRate, countDecimals(vatRate.vatAmountMismatch.vatRate))}% (${vatRate.vatAmountMismatch.case})</small>`
        : '';

    return label + mismatch;
}

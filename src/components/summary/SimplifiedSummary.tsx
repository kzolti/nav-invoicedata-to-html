import type { SummarySimplified } from 'nav-osa-types';
import type { TFn, NFn } from '../utils.js';
import { VatRateDisplay } from '../VatRateDisplay.js';

interface Props {
    lines: SummarySimplified[];
    decs: number;
    t: TFn;
    nf: NFn;
}

export function SimplifiedSummary({ lines, decs, t, nf }: Props): string {
    return (
        <div class="simplified-summary">
            <h4>{t('simplifiedInvoice')}</h4>
            <table class="summary-table">
                <thead>
                    <tr>
                        <th>{t('vatRate')}</th>
                        <th class="text-right">{t('grossAmount')}</th>
                    </tr>
                </thead>
                <tbody>
                    {lines.map(item => (
                        <tr>
                            <td>{VatRateDisplay({ vatRate: item.vatRate, t, nf })}</td>
                            <td class="text-right" style="white-space: nowrap;">
                                {nf(item.vatContentGrossAmount, decs)}
                                {item.vatContentGrossAmountHUF &&
                                    item.vatContentGrossAmountHUF !== item.vatContentGrossAmount &&
                                    (<><br /><small>{nf(item.vatContentGrossAmountHUF, decs)} HUF</small></>)}
                            </td>
                        </tr>
                    )).join('')}
                </tbody>
            </table>
        </div>
    ) as string;
}

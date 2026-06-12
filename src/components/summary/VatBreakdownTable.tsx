import type { SummaryByVatRate } from 'nav-osa-types';
import type { TFn, NFn } from '../utils.js';
import { VatRateDisplay } from '../VatRateDisplay.js';

interface Props {
    vatRateLines: SummaryByVatRate[];
    vatDecs: { net: number; vat: number; gross: number };
    t: TFn;
    nf: NFn;
}

export function VatBreakdownTable({ vatRateLines, vatDecs, t, nf }: Props): string {
    return (
        <div class="vat-breakdown">
            <h4>{t('vatBreakdown')}</h4>
            <table class="summary-table">
                <thead>
                    <tr>
                        <th>{t('vatRate')}</th>
                        <th class="text-right">{t('netAmount')}</th>
                        <th class="text-right">{t('vatAmount')}</th>
                        <th class="text-right">{t('grossAmount')}</th>
                    </tr>
                </thead>
                <tbody>
                    {vatRateLines.map(item => (
                        <tr>
                            <td>{VatRateDisplay({ vatRate: item.vatRate, t, nf })}</td>
                            <td class="text-right" style="white-space: nowrap;">
                                {nf(item.vatRateNetData.vatRateNetAmount, vatDecs.net)}
                                {item.vatRateNetData.vatRateNetAmountHUF &&
                                    item.vatRateNetData.vatRateNetAmountHUF !== item.vatRateNetData.vatRateNetAmount &&
                                    (<><br /><small>{nf(item.vatRateNetData.vatRateNetAmountHUF, vatDecs.net)} HUF</small></>)}
                            </td>
                            <td class="text-right" style="white-space: nowrap;">
                                {nf(item.vatRateVatData.vatRateVatAmount, vatDecs.vat)}
                                {item.vatRateVatData.vatRateVatAmountHUF &&
                                    item.vatRateVatData.vatRateVatAmountHUF !== item.vatRateVatData.vatRateVatAmount &&
                                    (<><br /><small>{nf(item.vatRateVatData.vatRateVatAmountHUF, vatDecs.vat)} HUF</small></>)}
                            </td>
                            <td class="text-right" style="white-space: nowrap;">
                                {item.vatRateGrossData ? (<>
                                    {nf(item.vatRateGrossData.vatRateGrossAmount, vatDecs.gross)}
                                    {item.vatRateGrossData.vatRateGrossAmountHUF &&
                                        item.vatRateGrossData.vatRateGrossAmountHUF !== item.vatRateGrossData.vatRateGrossAmount &&
                                        (<><br /><small>{nf(item.vatRateGrossData.vatRateGrossAmountHUF, vatDecs.gross)} HUF</small></>)}
                                </>) : '-'}
                            </td>
                        </tr>
                    )).join('')}
                </tbody>
            </table>
        </div>
    ) as string;
}

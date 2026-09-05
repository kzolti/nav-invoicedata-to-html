import type { SummaryByVatRate, SummaryNormal } from 'nav-osa-types';
import type { TFn, NFn } from '../utils.js';
import { addDecimal, countDecimals, getTargetDecimals } from '../utils.js';
import { VatRateDisplay, VatRateReasonNote } from '../VatRateDisplay.js';

interface TotalsProps {
    data: SummaryNormal;
    netDecs: number;
    vatDecs: number;
    /** Fizetendő bruttó (summaryGrossData-ból, ha van) — egyébként nettó+áfa. */
    gross?: string | null;
    grossHUF?: string | null;
    grossDecs?: number;
}

interface Props {
    vatRateLines: SummaryByVatRate[];
    vatDecs: { net: number; vat: number; gross: number };
    /** Összesen lábléc-sor a táblázat alján (a külön összesítő tábla helyett). */
    totals?: TotalsProps;
    t: TFn;
    nf: NFn;
}

export function VatBreakdownTable({ vatRateLines, vatDecs, totals, t, nf }: Props): string {
    const gross = totals ? (totals.gross ?? addDecimal(totals.data.invoiceNetAmount, totals.data.invoiceVatAmount)) : null;
    const grossDecs = totals
        ? (totals.grossDecs ?? getTargetDecimals(Math.max(countDecimals(totals.data.invoiceNetAmount), countDecimals(totals.data.invoiceVatAmount))))
        : 0;
    const grossHuf = totals?.grossHUF ?? (
        totals?.data.invoiceNetAmountHUF != null && totals?.data.invoiceVatAmountHUF != null
            ? addDecimal(totals.data.invoiceNetAmountHUF, totals.data.invoiceVatAmountHUF)
            : null
    );
    const showGrossHuf = totals != null && grossHuf != null && grossHuf !== gross;
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
                            <td>{VatRateDisplay({ vatRate: item.vatRate, t, nf })}{VatRateReasonNote({ vatRate: item.vatRate })}</td>
                            <td class="text-right" style="white-space: nowrap;">
                                {nf(item.vatRateNetData.vatRateNetAmount, vatDecs.net)}
                                {item.vatRateNetData.vatRateNetAmountHUF &&
                                    item.vatRateNetData.vatRateNetAmountHUF !== item.vatRateNetData.vatRateNetAmount &&
                                    (<><br /><small class="huf-sub">{nf(item.vatRateNetData.vatRateNetAmountHUF, vatDecs.net)} HUF</small></>)}
                            </td>
                            <td class="text-right" style="white-space: nowrap;">
                                {nf(item.vatRateVatData.vatRateVatAmount, vatDecs.vat)}
                                {item.vatRateVatData.vatRateVatAmountHUF &&
                                    item.vatRateVatData.vatRateVatAmountHUF !== item.vatRateVatData.vatRateVatAmount &&
                                    (<><br /><small class="huf-sub">{nf(item.vatRateVatData.vatRateVatAmountHUF, vatDecs.vat)} HUF</small></>)}
                            </td>
                            <td class="text-right" style="white-space: nowrap;">
                                {item.vatRateGrossData ? (<>
                                    {nf(item.vatRateGrossData.vatRateGrossAmount, vatDecs.gross)}
                                    {item.vatRateGrossData.vatRateGrossAmountHUF &&
                                        item.vatRateGrossData.vatRateGrossAmountHUF !== item.vatRateGrossData.vatRateGrossAmount &&
                                        (<><br /><small class="huf-sub">{nf(item.vatRateGrossData.vatRateGrossAmountHUF, vatDecs.gross)} HUF</small></>)}
                                </>) : '-'}
                            </td>
                        </tr>
                    )).join('')}
                </tbody>
                {totals && (
                    <tfoot>
                        <tr class="summary-total-row">
                            <td>{t('total')}:</td>
                            <td class="text-right" style="white-space: nowrap;">
                                {nf(totals.data.invoiceNetAmount, totals.netDecs)}
                                {totals.data.invoiceNetAmountHUF && totals.data.invoiceNetAmountHUF !== totals.data.invoiceNetAmount &&
                                    (<><br /><small class="huf-sub">{nf(totals.data.invoiceNetAmountHUF, totals.netDecs)} HUF</small></>)}
                            </td>
                            <td class="text-right" style="white-space: nowrap;">
                                {nf(totals.data.invoiceVatAmount, totals.vatDecs)}
                                {totals.data.invoiceVatAmountHUF && totals.data.invoiceVatAmountHUF !== totals.data.invoiceVatAmount &&
                                    (<><br /><small class="huf-sub">{nf(totals.data.invoiceVatAmountHUF, totals.vatDecs)} HUF</small></>)}
                            </td>
                            <td class="text-right" style="white-space: nowrap;">
                                {gross != null && nf(gross, grossDecs)}
                                {showGrossHuf && grossHuf != null &&
                                    (<><br /><small class="huf-sub">{nf(grossHuf, grossDecs)} HUF</small></>)}
                            </td>
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    ) as string;
}

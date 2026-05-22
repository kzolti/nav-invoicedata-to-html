import type { SummaryNormal } from '../../osaTypes/dataTypes.js';
import type { TFn, NFn } from '../utils.js';

interface Props {
    data: SummaryNormal;
    decs: { net: number; vat: number };
    t: TFn;
    nf: NFn;
}

export function NormalTotals({ data, decs, t, nf }: Props): string {
    return (
        <table class="totals-table">
            <tbody>
                <tr>
                    <td>{t('netAmountTotal')}</td>
                    <td class="text-right" style="white-space: nowrap;">
                        {nf(data.invoiceNetAmount, decs.net)}
                        {data.invoiceNetAmountHUF && data.invoiceNetAmountHUF !== data.invoiceNetAmount &&
                            (<><br /><small>{nf(data.invoiceNetAmountHUF, decs.net)} HUF</small></>)}
                    </td>
                </tr>
                <tr>
                    <td>{t('vatAmountTotal')}</td>
                    <td class="text-right" style="white-space: nowrap;">
                        {nf(data.invoiceVatAmount, decs.vat)}
                        {data.invoiceVatAmountHUF && data.invoiceVatAmountHUF !== data.invoiceVatAmount &&
                            (<><br /><small>{nf(data.invoiceVatAmountHUF, decs.vat)} HUF</small></>)}
                    </td>
                </tr>
            </tbody>
        </table>
    ) as string;
}

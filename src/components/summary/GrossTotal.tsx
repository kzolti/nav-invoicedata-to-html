import type { SummaryGrossData } from '../../osaTypes/dataTypes.js';
import type { TFn, NFn } from '../utils.js';

interface Props {
    data: SummaryGrossData;
    decs: number;
    t: TFn;
    nf: NFn;
}

export function GrossTotal({ data, decs, t, nf }: Props): string {
    return (
        <table class="totals-table gross-total">
            <tbody>
                <tr class="total-row">
                    <td><strong>{t('grossAmountTotal')}</strong></td>
                    <td class="text-right" style="white-space: nowrap;">
                        <strong>
                            {nf(data.invoiceGrossAmount, decs)}
                            {data.invoiceGrossAmountHUF && data.invoiceGrossAmountHUF !== data.invoiceGrossAmount &&
                                (<><br /><small>{nf(data.invoiceGrossAmountHUF, decs)} HUF</small></>)}
                        </strong>
                    </td>
                </tr>
            </tbody>
        </table>
    ) as string;
}

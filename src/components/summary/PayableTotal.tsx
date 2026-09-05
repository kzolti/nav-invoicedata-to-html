import type { SummaryGrossData } from 'nav-osa-types';
import type { TFn, NFn } from '../utils.js';
import { amountInWords, shortCurrency } from './amountInWords.js';

interface Props {
    data: SummaryGrossData;
    decs: number;
    currency: string;
    locale: string;
    t: TFn;
    nf: NFn;
}

/** Számla bruttó összesen blokk: számos sor + betűvel kiírt összeg. */
export function PayableTotal({ data, decs, currency, locale, t, nf }: Props): string {
    const words = amountInWords(data.invoiceGrossAmount, currency, locale);
    const showHuf =
        data.invoiceGrossAmountHUF != null &&
        data.invoiceGrossAmountHUF !== '' &&
        data.invoiceGrossAmountHUF !== data.invoiceGrossAmount;
    return (
        <div class="total-block">
            <p class="total-line">
                <strong>{t('payable')}:</strong>
                <span class="total-amount">
                    {nf(data.invoiceGrossAmount, decs)} {shortCurrency(currency, locale)}
                    {showHuf &&
                        (<><br /><small class="huf-sub">{nf(data.invoiceGrossAmountHUF, decs)} HUF</small></>)}
                </span>
            </p>
            {words && <p class="total-words">{words}</p>}
        </div>
    ) as string;
}

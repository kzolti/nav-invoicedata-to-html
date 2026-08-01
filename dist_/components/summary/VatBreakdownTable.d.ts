import type { SummaryByVatRate } from 'nav-osa-types';
import type { TFn, NFn } from '../utils.js';
interface Props {
    vatRateLines: SummaryByVatRate[];
    vatDecs: {
        net: number;
        vat: number;
        gross: number;
    };
    t: TFn;
    nf: NFn;
}
export declare function VatBreakdownTable({ vatRateLines, vatDecs, t, nf }: Props): string;
export {};
//# sourceMappingURL=VatBreakdownTable.d.ts.map
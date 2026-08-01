import type { SummaryNormal } from 'nav-osa-types';
import type { TFn, NFn } from '../utils.js';
interface Props {
    data: SummaryNormal;
    decs: {
        net: number;
        vat: number;
    };
    t: TFn;
    nf: NFn;
}
export declare function NormalTotals({ data, decs, t, nf }: Props): string;
export {};
//# sourceMappingURL=NormalTotals.d.ts.map
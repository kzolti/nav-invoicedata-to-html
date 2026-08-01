import type { SummaryGrossData } from 'nav-osa-types';
import type { TFn, NFn } from '../utils.js';
interface Props {
    data: SummaryGrossData;
    decs: number;
    t: TFn;
    nf: NFn;
}
export declare function GrossTotal({ data, decs, t, nf }: Props): string;
export {};
//# sourceMappingURL=GrossTotal.d.ts.map
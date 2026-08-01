import type { SummarySimplified } from 'nav-osa-types';
import type { TFn, NFn } from '../utils.js';
interface Props {
    lines: SummarySimplified[];
    decs: number;
    t: TFn;
    nf: NFn;
}
export declare function SimplifiedSummary({ lines, decs, t, nf }: Props): string;
export {};
//# sourceMappingURL=SimplifiedSummary.d.ts.map
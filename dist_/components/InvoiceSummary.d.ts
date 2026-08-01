import type { Invoice } from 'nav-osa-types';
import type { TFn, NFn } from './utils.js';
interface Props {
    invoice: Invoice;
    t: TFn;
    nf: NFn;
}
export declare function InvoiceSummaryComponent({ invoice, t, nf }: Props): string;
export {};
//# sourceMappingURL=InvoiceSummary.d.ts.map
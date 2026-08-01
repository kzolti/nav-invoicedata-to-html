import type { BatchInvoice } from 'nav-osa-types';
import type { TFn, NFn, DisplayLine } from './utils.js';
interface Props {
    batches: BatchInvoice[];
    t: TFn;
    nf: NFn;
}
/**
 * Megállapítja, hogy a batchInvoice-ok összevonhatók-e egyetlen számlaképbe.
 * Feltételek: azonos szállító, vevő, pénznem, fizetési mód, fizetési határidő, megjelenési forma.
 */
export declare function canMergeBatches(batches: BatchInvoice[]): boolean;
/**
 * Annotált tétel típus: az eredeti sor kiegészítve a batch-ből származó metaadatokkal
 */
export interface AnnotatedLine {
    line: DisplayLine;
    originalInvoiceNumber: string;
    deliveryDate: string;
    modificationIndex: number;
    batchIndex: number;
}
/**
 * Összevont számlaképet renderel több batchInvoice-ból, ha azok alapvető adatai megegyeznek.
 */
export declare function BatchMergedInvoiceComponent({ batches, t, nf }: Props): string;
export {};
//# sourceMappingURL=BatchMergedInvoice.d.ts.map
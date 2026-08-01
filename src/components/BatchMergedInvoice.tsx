import type { BatchInvoice, Invoice, Lines, Line, SummaryByVatRate, VatRate } from 'nav-osa-types';
import type { TFn, NFn, DisplayLine } from './utils.js';
import { InvoiceHeadComponent } from './InvoiceHead.js';
import { InvoiceLinesComponent } from './InvoiceLines.js';
import { InvoiceSummaryComponent } from './InvoiceSummary.js';
import { asArray, esc, addDecimal } from './utils.js';
import { splitSections, ExtraDataSection } from './sections.js';

interface Props {
    batches: BatchInvoice[];
    t: TFn;
    nf: NFn;
    locale: string;
}

/**
 * Megállapítja, hogy a batchInvoice-ok összevonhatók-e egyetlen számlaképbe.
 * Feltételek: azonos szállító, vevő, pénznem, fizetési mód, fizetési határidő, megjelenési forma.
 */
export function canMergeBatches(batches: BatchInvoice[]): boolean {
    if (batches.length <= 1) return false;

    const first = batches[0].invoice;
    const firstHead = first.invoiceHead;

    for (let i = 1; i < batches.length; i++) {
        const inv = batches[i].invoice;
        const head = inv.invoiceHead;

        // Szállító egyezés
        if (firstHead.supplierInfo.supplierName !== head.supplierInfo.supplierName) return false;
        if (firstHead.supplierInfo.supplierTaxNumber?.taxpayerId !== head.supplierInfo.supplierTaxNumber?.taxpayerId) return false;

        // Vevő egyezés
        const firstCust = firstHead.customerInfo;
        const thisCust = head.customerInfo;
        if (firstCust?.customerName !== thisCust?.customerName) return false;
        if (firstCust?.customerVatData?.customerTaxNumber?.taxpayerId !== thisCust?.customerVatData?.customerTaxNumber?.taxpayerId) return false;

        // Számla részletek egyezés
        const firstDet = firstHead.invoiceDetail;
        const thisDet = head.invoiceDetail;
        if (firstDet.invoiceCategory !== thisDet.invoiceCategory) return false;
        if (firstDet.currencyCode !== thisDet.currencyCode) return false;
        if (firstDet.paymentMethod !== thisDet.paymentMethod) return false;
        if (firstDet.paymentDate !== thisDet.paymentDate) return false;
        if (firstDet.invoiceAppearance !== thisDet.invoiceAppearance) return false;
    }

    return true;
}

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
 * Összegyűjti az összes tételt az összes batch-ből, annotálva az eredeti számla adataival.
 */
function collectAnnotatedLines(batches: BatchInvoice[]): AnnotatedLine[] {
    const result: AnnotatedLine[] = [];

    for (const batch of batches) {
        const inv = batch.invoice;
        const originalInvoiceNumber = inv.invoiceReference?.originalInvoiceNumber || '';
        const deliveryDate = inv.invoiceHead.invoiceDetail.invoiceDeliveryDate || '';
        const modificationIndex = inv.invoiceReference?.modificationIndex || 0;

        if (inv.invoiceLines) {
            const lines = asArray(inv.invoiceLines.line);
            for (const line of lines) {
                const augmentedLine = {
                    ...line,
                    _annotatedOriginalInvoiceNumber: originalInvoiceNumber,
                    _annotatedDeliveryDate: deliveryDate,
                };
                result.push({
                    line: augmentedLine,
                    originalInvoiceNumber,
                    deliveryDate,
                    modificationIndex,
                    batchIndex: batch.batchIndex,
                });
            }
        }
    }

    return result;
}

/**
 * Összevont számlaképet renderel több batchInvoice-ból, ha azok alapvető adatai megegyeznek.
 */
export function BatchMergedInvoiceComponent({ batches, t, nf, locale }: Props): string {
    const firstInvoice = batches[0].invoice;

    // Az egyéb (nem a könyvtárnak címzett) adatok összegyűjtése az összes batch-ből
    const extraItems = batches.flatMap(b => splitSections(b.invoice.invoiceHead?.invoiceDetail?.additionalInvoiceData, locale).other);

    // Felépítjük az annotált tétellistát
    const annotatedLines = collectAnnotatedLines(batches);

    // Az összevont invoice head-ben a teljesítési dátumot felülírjuk
    // A batchek teljesítési dátumai eltérhetnek, ezért "Lásd a tételeknél" jelzés kell
    const deliveryDates = batches.map(b => b.invoice.invoiceHead.invoiceDetail.invoiceDeliveryDate);
    const hasMultipleDeliveryDates = new Set(deliveryDates).size > 1;

    // Összevont Lines objektum az InvoiceLinesComponent számára
    const mergedLines: Lines = {
        mergedItemIndicator: batches.some(b => b.invoice.invoiceLines?.mergedItemIndicator || false),
        line: annotatedLines.map(al => al.line),
    };

    // A line-okhoz csatolt meta-információt a renderelő kell hogy megkapja
    // Ezeket a lineModificationReference-n keresztül már megjelenítjük,
    // de az eredeti bizonylat számot és teljesítési dátumot is meg kell jeleníteni

    // Invoice reference-ek összegyűjtése
    const references = batches
        .filter(b => b.invoice.invoiceReference)
        .map(b => ({
            batchIndex: b.batchIndex,
            ref: b.invoice.invoiceReference!,
            deliveryDate: b.invoice.invoiceHead.invoiceDetail.invoiceDeliveryDate,
        }));

    // Összevont összesítés: a summaryGrossData összeadása
    // Az InvoiceSummaryComponent-et az összevont összesítéssel hívjuk meg
    const mergedInvoice = buildMergedSummaryInvoice(batches);

    return (
        <div class="invoice-section batch-merged">
            {/* Összevont hivatkozás - minden eredeti számla felsorolva */}
            <div class="invoice-reference batch-merged-reference">
                <h3>{t('invoiceReference')}</h3>
                <table class="reference-table">
                    <thead>
                        <tr>
                            <th>{t('originalInvoiceNumber')}</th>
                            <th>{t('modificationIndex')}</th>
                            <th>{t('invoiceDeliveryDate')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {references.map(r => (
                            <tr>
                                <td>{esc(r.ref.originalInvoiceNumber)}</td>
                                <td>{r.ref.modificationIndex}</td>
                                <td>{r.deliveryDate}</td>
                            </tr>
                        )).join('')}
                    </tbody>
                </table>
            </div>

            {/* Fejléc az első batch-ből, de a teljesítési dátum módosítva */}
            {renderMergedHead(firstInvoice, hasMultipleDeliveryDates, t, nf, locale)}

            {/* Összevont tételek a per-line metaadatokkal */}
            {InvoiceLinesComponent({
                data: mergedLines,
                t,
                nf,
            })}

            {/* Összevont összesítés */}
            {InvoiceSummaryComponent({ invoice: mergedInvoice, t, nf })}

            {/* Egyéb adatok az összesítő alatt */}
            {ExtraDataSection({ items: extraItems, t })}
        </div>
    ) as string;
}

/**
 * Az összevont fejlécet rendereli. Ha a teljesítési dátumok eltérnek, "Lásd a tételeknél" szöveget jelenít meg.
 */
function renderMergedHead(invoice: Invoice, hasMultipleDeliveryDates: boolean, t: TFn, nf: NFn, locale: string): string {
    if (!hasMultipleDeliveryDates) {
        return InvoiceHeadComponent({ data: invoice.invoiceHead, t, nf, locale });
    }

    // Clone the invoiceDetail to override the delivery date display
    const modifiedHead = {
        ...invoice.invoiceHead,
        invoiceDetail: {
            ...invoice.invoiceHead.invoiceDetail,
            invoiceDeliveryDate: t('seeLineItems'),
        },
    };

    return InvoiceHeadComponent({ data: modifiedHead, t, nf, locale });
}

/**
 * Összevont összesítő invoice objektumot épít.
 * Az egyes batchek summaryByVatRate-jeit ÁFA-kulcsonként összeadja,
 * és az összesítő mezőket is összegzi.
 */
function buildMergedSummaryInvoice(batches: BatchInvoice[]): Invoice {
    const firstInvoice = batches[0].invoice;
    const summaries = batches.map(b => b.invoice.invoiceSummary);

    // summaryByVatRate összevonás ÁFA-kulcs szerint
    const vatRateMap = new Map<string, SummaryByVatRate>();

    for (const summary of summaries) {
        if (summary.summaryNormal?.summaryByVatRate) {
            for (const vr of asArray(summary.summaryNormal.summaryByVatRate)) {
                const key = getVatRateKey(vr.vatRate);
                const existing = vatRateMap.get(key);
                if (existing) {
                    // Összegzés (MonetaryType: 2 tizedes)
                    existing.vatRateNetData.vatRateNetAmount = addDecimal(existing.vatRateNetData.vatRateNetAmount, vr.vatRateNetData.vatRateNetAmount);
                    existing.vatRateNetData.vatRateNetAmountHUF = addDecimal(existing.vatRateNetData.vatRateNetAmountHUF, vr.vatRateNetData.vatRateNetAmountHUF);
                    existing.vatRateVatData.vatRateVatAmount = addDecimal(existing.vatRateVatData.vatRateVatAmount, vr.vatRateVatData.vatRateVatAmount);
                    existing.vatRateVatData.vatRateVatAmountHUF = addDecimal(existing.vatRateVatData.vatRateVatAmountHUF, vr.vatRateVatData.vatRateVatAmountHUF);
                    if (existing.vatRateGrossData && vr.vatRateGrossData) {
                        existing.vatRateGrossData.vatRateGrossAmount = addDecimal(existing.vatRateGrossData.vatRateGrossAmount, vr.vatRateGrossData.vatRateGrossAmount);
                        existing.vatRateGrossData.vatRateGrossAmountHUF = addDecimal(existing.vatRateGrossData.vatRateGrossAmountHUF, vr.vatRateGrossData.vatRateGrossAmountHUF);
                    }
                } else {
                    // Deep clone
                    vatRateMap.set(key, JSON.parse(JSON.stringify(vr)));
                }
            }
        }
    }

    // Total nettó, ÁFA összegzés
    let totalNet = '0';
    let totalNetHUF = '0';
    let totalVat = '0';
    let totalVatHUF = '0';
    let totalGross = '0';
    let totalGrossHUF = '0';
    let hasGross = false;

    for (const summary of summaries) {
        if (summary.summaryNormal) {
            totalNet = addDecimal(totalNet, summary.summaryNormal.invoiceNetAmount);
            totalNetHUF = addDecimal(totalNetHUF, summary.summaryNormal.invoiceNetAmountHUF);
            totalVat = addDecimal(totalVat, summary.summaryNormal.invoiceVatAmount);
            totalVatHUF = addDecimal(totalVatHUF, summary.summaryNormal.invoiceVatAmountHUF);
        }
        if (summary.summaryGrossData) {
            hasGross = true;
            totalGross = addDecimal(totalGross, summary.summaryGrossData.invoiceGrossAmount);
            totalGrossHUF = addDecimal(totalGrossHUF, summary.summaryGrossData.invoiceGrossAmountHUF);
        }
    }

    return {
        invoiceHead: firstInvoice.invoiceHead,
        invoiceSummary: {
            summaryNormal: {
                summaryByVatRate: Array.from(vatRateMap.values()),
                invoiceNetAmount: totalNet,
                invoiceNetAmountHUF: totalNetHUF,
                invoiceVatAmount: totalVat,
                invoiceVatAmountHUF: totalVatHUF,
            },
            summaryGrossData: hasGross ? {
                invoiceGrossAmount: totalGross,
                invoiceGrossAmountHUF: totalGrossHUF,
            } : undefined,
        },
    };
}

/** ÁFA kulcs egyedi kulcsot generál a Map számára */
function getVatRateKey(vatRate: VatRate): string {
    if (vatRate.vatPercentage != null) return `pct:${vatRate.vatPercentage}`;
    if (vatRate.vatExemption) return `exempt:${vatRate.vatExemption.case}`;
    if (vatRate.vatOutOfScope) return `oos:${vatRate.vatOutOfScope.case}`;
    if (vatRate.vatDomesticReverseCharge != null) return 'drc';
    if (vatRate.marginSchemeIndicator) return `margin:${vatRate.marginSchemeIndicator}`;
    if (vatRate.vatAmountMismatch) return `mismatch:${vatRate.vatAmountMismatch.vatRate}`;
    if (vatRate.noVatCharge != null) return 'nocharge';
    return 'unknown';
}

import type { Lines, Line, VatRate } from 'nav-osa-types';
import type { TFn, NFn, DisplayLine } from './utils.js';
import { asArray, countDecimals, getTargetDecimals, esc, calcDiscountedUnitPrice, vatCodeKey } from './utils.js';
import { VatRateDisplay } from './VatRateDisplay.js';
import { LineBasicDetails } from './invoice-lines/LineBasicDetails.js';
import { LineExtendedDetails } from './invoice-lines/LineExtendedDetails.js';

interface Props {
    data: Lines;
    t: TFn;
    nf: NFn;
}

// Check if line has any additional details to show
const lineVatRate = (line: DisplayLine) =>
    line.lineAmountsNormal?.lineVatRate ?? line.lineAmountsSimplified?.lineVatRate;

// Codes (vatExemption / vatOutOfScope) appearing with more than one distinct reason across the invoice
const computeAmbiguousVatCodes = (lines: DisplayLine[]): Set<string> => {
    const reasonsByCode = new Map<string, Set<string>>();
    for (const line of lines) {
        const vatRate = lineVatRate(line);
        if (!vatRate) continue;
        const entries: Array<[string, string | undefined]> = [];
        if (vatRate.vatExemption) entries.push([`ex:${vatRate.vatExemption.case}`, vatRate.vatExemption.reason]);
        if (vatRate.vatOutOfScope) entries.push([`os:${vatRate.vatOutOfScope.case}`, vatRate.vatOutOfScope.reason]);
        for (const [key, reason] of entries) {
            if (!reason) continue;
            let reasons = reasonsByCode.get(key);
            if (!reasons) { reasons = new Set(); reasonsByCode.set(key, reasons); }
            reasons.add(reason);
        }
    }
    const ambiguous = new Set<string>();
    for (const [key, reasons] of reasonsByCode) {
        if (reasons.size > 1) ambiguous.add(key);
    }
    return ambiguous;
};

const hasLineVatReason = (line: DisplayLine, ambiguousVatCodes: Set<string>): boolean => {
    const vatRate: VatRate | undefined = lineVatRate(line);
    return !!(vatRate && ambiguousVatCodes.has(vatCodeKey(vatRate)) &&
        ((vatRate.vatExemption && vatRate.vatExemption.reason) ||
            (vatRate.vatOutOfScope && vatRate.vatOutOfScope.reason)));
};

const hasLineDetails = (line: DisplayLine, ambiguousVatCodes: Set<string>): boolean =>
    !!(line.productCodes ||
        line.lineExpressionIndicator === false ||
        line.intermediatedService ||
        line.depositIndicator ||
        line.productFeeClause ||
        line.obligatedForProductFee ||
        line.conventionalLineInfo ||
        line.additionalLineData ||
        line.aggregateInvoiceLineData ||
        line.lineModificationReference ||
        line.advanceData ||
        line.referencesToOtherLines ||
        line.newTransportMean ||
        (line.GPCExcise != null && Number(line.GPCExcise) !== 0) ||
        line.dieselOilPurchase ||
        line.netaDeclaration ||
        line.lineProductFeeContent ||
        line._annotatedOriginalInvoiceNumber ||
        line._annotatedDeliveryDate ||
        hasLineVatReason(line, ambiguousVatCodes));

export type LegendEntryId = 'quantity' | 'unit' | 'unitPrice' | 'discountMain' | 'discountSub';

export interface ColumnUsage {
    quantity: boolean;
    unit: boolean;
    unitPrice: boolean;
    discount: boolean;
}

const nonEmpty = (v: unknown): boolean => v != null && v !== '';

/** Melyik rövidített oszlophoz van tényleges tartalom a számlán (jelölés + jelmagyarázat). */
export function analyzeLineColumnUsage(lines: Line[]): ColumnUsage {
    return {
        quantity: lines.some(l => nonEmpty(l.quantity)),
        unit: lines.some(l => !!l.unitOfMeasure || !!l.unitOfMeasureOwn),
        unitPrice: lines.some(l => nonEmpty(l.unitPrice)),
        discount: lines.some(l => !!l.lineDiscountData),
    };
}

/** Jelmagyarázat-sorrend az oszlopok sorrendjében, csak a használtakkal. */
export function legendOrder(usage: ColumnUsage): LegendEntryId[] {
    const order: LegendEntryId[] = [];
    if (usage.quantity) order.push('quantity');
    if (usage.unit) order.push('unit');
    if (usage.unitPrice) order.push('unitPrice');
    if (usage.discount) order.push('discountMain', 'discountSub');
    return order;
}

function legendText(id: LegendEntryId, t: TFn): { abbr: string; full: string } {
    switch (id) {
        case 'quantity': return { abbr: t('quantity'), full: t('quantityTitle') };
        case 'unit': return { abbr: t('unitOfMeasure'), full: t('unitOfMeasureTitle') };
        case 'unitPrice': return { abbr: t('colUnitPrice'), full: t('unitPrice') };
        case 'discountMain': return { abbr: t('discount').split('\n')[0], full: t('discountWord') };
        case 'discountSub': {
            const parts = t('discount').split('\n');
            return { abbr: parts[1] ?? parts[0], full: t('discountedUnitPrice') };
        }
    }
}

const supNum = (order: LegendEntryId[], id: LegendEntryId): string => {
    const i = order.indexOf(id);
    return i >= 0 ? `<sup>${i + 1}</sup>` : '';
};

/** Oszloprövidítések jelmagyarázata a számla aljára (csak a használt oszlopok). */
export function ColumnLegend({ lines, t }: { lines: Line[]; t: TFn }): string {
    if (lines.length === 0) return '';
    const order = legendOrder(analyzeLineColumnUsage(lines));
    if (order.length === 0) return '';
    return (
        <div class="column-legend">
            {order.map(id => {
                const e = legendText(id, t);
                return `<p><sup>${order.indexOf(id) + 1}</sup> ${esc(e.abbr)} – ${esc(e.full)}</p>`;
            }).join('')}
        </div>
    ) as string;
}

const getDiscountedUnitPrice = (line: DisplayLine, scale?: number): string => {
    const discountData = line.lineDiscountData;
    if (!discountData) {
        // Keep original XML string (trailing zeros for column alignment)
        return line.unitPrice != null && line.unitPrice !== '' ? String(line.unitPrice) : '';
    }
    return calcDiscountedUnitPrice(
        line.unitPrice,
        line.quantity,
        discountData.discountValue,
        discountData.discountRate,
        scale ?? 10
    );
};

/** Compute per-column decimal precision based on all line data */
function computeColumnDecimals(lines: DisplayLine[]) {
    // A K.n.e. ár is egységár: ugyanarra a skálára kerekítjük, mint a
    // Nettó egységár oszlopot (oszlopszélesség-barát, sorok közt igazított).
    const unitPrice = getTargetDecimals(Math.max(0, ...lines.map(l =>
        Math.max(countDecimals(l.unitPrice), countDecimals(l.unitPriceHUF))
    )));
    return {
        unitPrice,
        discount: getTargetDecimals(Math.max(0, ...lines.map(l => countDecimals(l.lineDiscountData?.discountValue)))),
        discountedUnitPrice: unitPrice,
        quantity: getTargetDecimals(Math.max(0, ...lines.map(l => countDecimals(l.quantity)))),
        netAmount: getTargetDecimals(Math.max(0, ...lines.map(l => countDecimals(l.lineAmountsNormal?.lineNetAmountData?.lineNetAmount)))),
        vatAmount: getTargetDecimals(Math.max(0, ...lines.map(l => countDecimals(l.lineAmountsNormal?.lineVatData?.lineVatAmount)))),
        grossAmount: getTargetDecimals(Math.max(0, ...lines.map(l => {
            if (l.lineAmountsNormal) return countDecimals(l.lineAmountsNormal.lineGrossAmountData?.lineGrossAmountNormal);
            if (l.lineAmountsSimplified) return countDecimals(l.lineAmountsSimplified.lineGrossAmountSimplified);
            return 0;
        }))),
    };
}

/**
 * Oszlopszélességek abszolút karakterszélesség-skálán: a Megnevezés kivételével
 * minden oszlop a leghosszabb megjelenített cellatartalma (fejléc + sorok,
 * formázás után mérve) alapján kap `<col>` szélességet (min. 4%). A megspórolt
 * hely a Megnevezésben halmozódik (min. 15%), mert ott kell a hely. Mindig
 * fut, a táblázat képe determinisztikus.
 */
function computeColumnWidths(
    lines: DisplayLine[],
    colDecs: ReturnType<typeof computeColumnDecimals>,
    hasDiscount: boolean,
    t: TFn,
    nf: NFn
): string[] {
    // Egy HTML-cellatartalom látható szövegsorai közül a leghosszabb hossza.
    const textMaxLen = (html: string): number => {
        const plain = html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');
        return Math.max(0, ...plain.split('\n').map(s => s.length));
    };
    // Kissorban (<small>, .huf-sub) megjelenő szöveg vizuális hossza.
    // Arány: --font-size-small / --font-size-base = 9/10pt (compact: 7,5/8,5pt).
    const SMALL_LINE_RATIO = 0.9;
    const smallLineLen = (text: string): number =>
        Math.ceil(textMaxLen(text) * SMALL_LINE_RATIO);
    // Deviza-másodösszeg szuffixe (hossza a mérésből származik, nem mágikus szám).
    const HUF_SUFFIX = ' HUF';
    const vatLabelLen = (line: DisplayLine): number => {
        const vatRate = lineVatRate(line);
        if (!vatRate) return 1;
        return smallLineLen(VatRateDisplay({ vatRate, t, nf }));
    };
    const discountCellLen = (line: DisplayLine): number => {
        const dd = line.lineDiscountData;
        if (!dd) return 1;
        const first = dd.discountRate
            ? `${nf(dd.discountRate, countDecimals(dd.discountRate))}%`
            : dd.discountValue
                ? nf(dd.discountValue, colDecs.discount)
                : '-';
        const second = nf(getDiscountedUnitPrice(line, colDecs.discountedUnitPrice), colDecs.discountedUnitPrice);
        // A második sor (kedvezményes egységár) <small>-ban jelenik meg.
        return Math.max(first.length, smallLineLen(second));
    };
    // Nettó / ÁFA / Bruttó cellahosszak (egyszerűsített sornál a colspan=2
    // cella fele-fele arányban a nettó+áfa oszlopokra terhelve).
    // A másodlagos HUF-kissort <small> méretben rendereljük új sorban.
    const amountCellLens = (line: DisplayLine): number[] => {
        const la = line.lineAmountsNormal;
        if (la) {
            const hufLen = (v: string | number | undefined, base: string | number | undefined, decs: number): number =>
                v && v !== base ? smallLineLen(`${nf(v, decs)}${HUF_SUFFIX}`) : 0;
            return [
                Math.max(
                    nf(la.lineNetAmountData?.lineNetAmount ?? '', colDecs.netAmount).length,
                    hufLen(la.lineNetAmountData?.lineNetAmountHUF, la.lineNetAmountData?.lineNetAmount, colDecs.netAmount)
                ),
                Math.max(
                    la.lineVatData ? nf(la.lineVatData.lineVatAmount ?? '', colDecs.vatAmount).length : 1,
                    la.lineVatData ? hufLen(la.lineVatData.lineVatAmountHUF, la.lineVatData.lineVatAmount, colDecs.vatAmount) : 0,
                    vatLabelLen(line)
                ),
                Math.max(
                    nf(la.lineGrossAmountData?.lineGrossAmountNormal ?? '', colDecs.grossAmount).length,
                    hufLen(la.lineGrossAmountData?.lineGrossAmountNormalHUF, la.lineGrossAmountData?.lineGrossAmountNormal, colDecs.grossAmount)
                ),
            ];
        }
        const laS = line.lineAmountsSimplified;
        if (laS) {
            const combined = Math.max(t('simplifiedInvoice').length, vatLabelLen(line));
            return [
                Math.ceil(combined / 2),
                Math.floor(combined / 2),
                Math.max(
                    nf(laS.lineGrossAmountSimplified, colDecs.grossAmount).length,
                    laS.lineGrossAmountSimplifiedHUF && laS.lineGrossAmountSimplifiedHUF !== laS.lineGrossAmountSimplified
                        ? smallLineLen(`${nf(laS.lineGrossAmountSimplifiedHUF, colDecs.grossAmount)}${HUF_SUFFIX}`) : 0
                ),
            ];
        }
        return [1, 1, 1];
    };

    // Oszlopsorrend a thead szerint (kedvezmény nélkül 8, vele 9 oszlop).
    const maxLens: number[] = [
        1, // #
        0, // Megnevezés (helyfoglaló)
        t('quantity').length + 1,
        t('unitOfMeasure').length + 1,
        t('colUnitPrice').length + 1,
        ...(hasDiscount ? [Math.max(...t('discount').split('\n').map(s => s.length + 1), 0)] : []),
        t('colNet').length,
        t('colVat').length,
        t('colGross').length,
    ];

    lines.forEach((line, li) => {
        const cols: number[] = [
            String(line.lineNumber ?? li + 1).length,
            0,
            nf(line.quantity ?? '', colDecs.quantity).length,
            Math.max(
                (line.unitOfMeasure ? t(line.unitOfMeasure) : '-').length,
                line.unitOfMeasureOwn ? smallLineLen(`(${line.unitOfMeasureOwn})`) : 0
            ),
            Math.max(
                nf(line.unitPrice ?? '', colDecs.unitPrice).length,
                line.unitPriceHUF && line.unitPriceHUF !== line.unitPrice
                    ? smallLineLen(`${nf(line.unitPriceHUF, colDecs.unitPrice)}${HUF_SUFFIX}`) : 0
            ),
            ...(hasDiscount ? [discountCellLen(line)] : []),
            ...amountCellLens(line),
        ];
        cols.forEach((len, i) => { maxLens[i] = Math.max(maxLens[i] ?? 0, len); });
    });

    // Oszlopok szélessége A4 nyomtatási környezethez kalibrálva:
    // Alap padding + keret oszloponként: ~1.8% (kb. 5-6px cellapadding mindkét oldalon).
    // Karakterarány: ~0.82% karakterenként (9pt-s tabular-nums számjegyek és
    // kb. 700-740px hasznos A4 nyomtatási szélesség aránya).
    // A Megnevezés (1. index) a megspórolt teljes fennmaradó helyet kapja meg.
    const DESC = 1;
    const COL_BASE = 1.8;
    const CHAR_SCALE = 0.82;

    const minWidths = [
        2.8, // #
        15.0, // Megnevezés floor
        4.5, // M.
        4.5, // M.e.
        6.0, // N.e.ár
        ...(hasDiscount ? [6.8] : []), // Kedv.
        7.2, // Nettó
        6.8, // ÁFA
        7.2, // Bruttó
    ];

    const raw = maxLens.map((len, i) => {
        if (i === DESC) return 0;
        const calc = COL_BASE + len * CHAR_SCALE;
        return Math.max(calc, minWidths[i] ?? 4.0);
    });

    const sumOthers = raw.reduce((a, b) => a + b, 0);
    // Ha a numerikus oszlopok összege meghaladná a 65%-ot, arányosan visszaskálázzuk,
    // hogy a Megnevezésnek mindig jusson legalább 35% hely.
    const maxOthers = 65;
    const scaled = raw.map(p => (sumOthers > maxOthers ? (p * maxOthers) / sumOthers : p));
    const floored = scaled.map(p => Math.floor(p * 10) / 10);
    const used = floored.reduce((a, b) => a + b, 0);
    floored[DESC] = Math.round((100 - used) * 10) / 10;
    return floored.map(w => w.toFixed(1));
}

export function InvoiceLinesComponent({ data, t, nf }: Props): string {
    const lines = asArray(data.line);
    const colDecs = computeColumnDecimals(lines);
    const hasDiscount = lines.some(line => !!line.lineDiscountData);
    const totalCols = 9 - (hasDiscount ? 0 : 1);
    const ambiguousVatCodes = computeAmbiguousVatCodes(lines);
    const colWidths = computeColumnWidths(lines, colDecs, hasDiscount, t, nf);
    const order = legendOrder(analyzeLineColumnUsage(lines));

    return (
        <div class="invoice-lines">
            <h3>{t('invoiceLines')}</h3>

            {data.mergedItemIndicator && (
                <div class="merged-warning">
                    ⚠️ {t('mergedItemIndicator')} - Az adatszolgáltatás méretcsökkentés miatt összevont soradatokat tartalmaz
                </div>
            )}

            <table class="lines-table">
                <colgroup>
                    {colWidths.map(w => (
                        <col style={`width: ${w}%`} />
                    )).join('')}
                </colgroup>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>{t('description')}</th>
                        <th class="text-right">{t('quantity')}{supNum(order, 'quantity')}</th>
                        <th class="text-right">{t('unitOfMeasure')}{supNum(order, 'unit')}</th>
                        <th class="text-right">{t('colUnitPrice')}{supNum(order, 'unitPrice')}</th>
                        {hasDiscount && DiscountHeader({ t, supMain: supNum(order, 'discountMain'), supSub: supNum(order, 'discountSub') })}
                        <th class="text-right">{t('colNet')}</th>
                        <th class="text-right">{t('colVat')}</th>
                        <th class="text-right">{t('colGross')}</th>
                    </tr>
                </thead>

                {lines.map((line, idx) => renderLineGroup(line, idx, colDecs, totalCols, hasDiscount, t, nf, ambiguousVatCodes)).join('')}
            </table>
        </div>
    ) as string;
}

function DiscountHeader({ t, supMain, supSub }: { t: TFn; supMain: string; supSub: string }): string {
    const lines = t('discount').split('\n');
    return (
        <th class="text-right">
            {lines.map((line, i) => (
                <span class={i > 0 ? 'header-sub' : undefined}>
                    {line}
                    {i === 0 ? supMain : ''}
                    {i === lines.length - 1 && i > 0 ? supSub : ''}
                    {i < lines.length - 1 && <br />}
                </span>
            ))}
        </th>
    ) as string;
}

function renderLineGroup(line: DisplayLine, idx: number, colDecs: ReturnType<typeof computeColumnDecimals>, totalCols: number, hasDiscount: boolean, t: TFn, nf: NFn, ambiguousVatCodes: Set<string>): string {
    // Páros/páratlan sáv: a sor és a hozzá tartozó detail-blokk azonos hátteret
    // kap (CSS-ben `.line-group-even` / `.line-group-odd` alapján színezhető).
    const stripeClass = idx % 2 === 1 ? 'line-group-odd' : 'line-group-even';
    // Ha van detail-blokk, a sorszám-cella mindkét sort átfogja (rowspan=2),
    // így a detail-sor egy oszloppal keskenyebb.
    const showDetails = hasLineDetails(line, ambiguousVatCodes);
    return (
        <tbody class={`line-group ${stripeClass}`}>
            {renderMainRow(line, colDecs, hasDiscount, t, nf, showDetails)}
            {showDetails && (
                <tr class="details-row">
                    <td colspan={String(totalCols - 1)}>
                        <div class="line-details">
                            {LineBasicDetails({ line, t })}
                            {LineExtendedDetails({ line, t, nf, ambiguousVatCodes })}
                        </div>
                    </td>
                </tr>
            )}
        </tbody>
    ) as string;
}

function renderMainRow(line: DisplayLine, colDecs: ReturnType<typeof computeColumnDecimals>, hasDiscount: boolean, t: TFn, nf: NFn, showDetails: boolean): string {
    return (
        <tr class="main-row">
            <td rowspan={showDetails ? '2' : undefined}>{line.lineNumber}</td>
            <td>
                <div class="description">
                    <strong>{esc(line.lineDescription)}</strong>
                    {line.lineNatureIndicator && <span class="badge">{t(line.lineNatureIndicator)}</span>}
                </div>
            </td>

            <td class="text-right" style="white-space: nowrap;">
                {nf(line.quantity ?? '', colDecs.quantity)}
            </td>

            <td class="text-right" style="white-space: nowrap;">
                {line.unitOfMeasure ? t(line.unitOfMeasure) : '-'}
                {line.unitOfMeasureOwn && (<><br /><small>({esc(line.unitOfMeasureOwn)})</small></>)}
            </td>

            <td class="text-right" style="white-space: nowrap;">
                {nf(line.unitPrice ?? '', colDecs.unitPrice) || '-'}
                {line.unitPriceHUF && line.unitPriceHUF !== line.unitPrice &&
                    (<><br /><small class="huf-sub">{nf(line.unitPriceHUF, colDecs.unitPrice)} HUF</small></>)}
            </td>

            {hasDiscount && (
                <td class="text-right" style="white-space: nowrap;">
                    {renderDiscountCell(line, colDecs, t, nf)}
                    {line.lineDiscountData && (<>
                        <br /><small>{nf(getDiscountedUnitPrice(line, colDecs.discountedUnitPrice), colDecs.discountedUnitPrice)}</small>
                    </>)}
                </td>
            )}

            {renderAmountCells(line, colDecs, t, nf)}
        </tr>
    ) as string;
}

function renderDiscountCell(line: DisplayLine, colDecs: ReturnType<typeof computeColumnDecimals>, t: TFn, nf: NFn): string {
    const dd = line.lineDiscountData;
    if (!dd) return '-';
    if (dd.discountRate) return `${nf(dd.discountRate, countDecimals(dd.discountRate))}%`;
    if (dd.discountValue) return nf(dd.discountValue, colDecs.discount);
    return '-';
}

function renderAmountCells(line: DisplayLine, colDecs: ReturnType<typeof computeColumnDecimals>, t: TFn, nf: NFn): string {
    if (line.lineAmountsNormal) {
        const la = line.lineAmountsNormal;
        return (<>
            <td class="text-right" style="white-space: nowrap;">
                {nf(la.lineNetAmountData?.lineNetAmount ?? '', colDecs.netAmount) || '-'}
                {la.lineNetAmountData?.lineNetAmountHUF && la.lineNetAmountData.lineNetAmountHUF !== la.lineNetAmountData.lineNetAmount &&
                    (<><br /><small class="huf-sub">{nf(la.lineNetAmountData.lineNetAmountHUF, colDecs.netAmount)} HUF</small></>)}
            </td>
            <td class="text-right" style="white-space: nowrap;">
                {la.lineVatData ? (<>
                    {nf(la.lineVatData.lineVatAmount ?? '', colDecs.vatAmount) || '-'}
                    {la.lineVatData.lineVatAmountHUF && la.lineVatData.lineVatAmountHUF !== la.lineVatData.lineVatAmount &&
                        (<><br /><small class="huf-sub">{nf(la.lineVatData.lineVatAmountHUF, colDecs.vatAmount)} HUF</small></>)}
                    <br /><small>{VatRateDisplay({ vatRate: la.lineVatRate, t, nf })}</small>
                </>) : '-'}
            </td>
            <td class="text-right" style="white-space: nowrap;">
                {nf(la.lineGrossAmountData?.lineGrossAmountNormal ?? '', colDecs.grossAmount) || '-'}
                {la.lineGrossAmountData?.lineGrossAmountNormalHUF && la.lineGrossAmountData.lineGrossAmountNormalHUF !== la.lineGrossAmountData.lineGrossAmountNormal &&
                    (<><br /><small class="huf-sub">{nf(la.lineGrossAmountData.lineGrossAmountNormalHUF, colDecs.grossAmount)} HUF</small></>)}
            </td>
        </>) as string;
    }

    if (line.lineAmountsSimplified) {
        const la = line.lineAmountsSimplified;
        return (<>
            <td class="text-right" colspan="2" style="white-space: nowrap;">
                {t('simplifiedInvoice')}
                <br /><small>{VatRateDisplay({ vatRate: la.lineVatRate, t, nf })}</small>
            </td>
            <td class="text-right" style="white-space: nowrap;">
                {nf(la.lineGrossAmountSimplified, colDecs.grossAmount) || '-'}
                {la.lineGrossAmountSimplifiedHUF && la.lineGrossAmountSimplifiedHUF !== la.lineGrossAmountSimplified &&
                    (<><br /><small class="huf-sub">{nf(la.lineGrossAmountSimplifiedHUF, colDecs.grossAmount)} HUF</small></>)}
            </td>
        </>) as string;
    }

    return <td colspan="3" class="text-right">-</td> as string;
}

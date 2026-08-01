import { multiplyBy100 } from './components/utils.js';
/** ×100 mutator a `vatPercentage`, `vatContent` és `discountRate` mezőkre */
function multiplyPercentages(data) {
    const invoice = data.invoiceMain?.invoice ?? data.invoiceMain?.batchInvoice?.[0]?.invoice;
    if (!invoice)
        return;
    for (const line of invoice.invoiceLines?.line ?? []) {
        // lineAmountsNormal / Simplified
        applyVatRate(line.lineAmountsNormal?.lineVatRate);
        applyVatRate(line.lineAmountsSimplified?.lineVatRate);
        // discountRate
        if (line.lineDiscountData?.discountRate != null) {
            line.lineDiscountData.discountRate = multiplyBy100(line.lineDiscountData.discountRate);
        }
    }
    // Summary
    const normal = invoice.invoiceSummary?.summaryNormal;
    if (normal) {
        for (const b of normal.summaryByVatRate) {
            applyVatRate(b.vatRate);
        }
    }
    for (const s of invoice.invoiceSummary?.summarySimplified ?? []) {
        applyVatRate(s.vatRate);
    }
}
function applyVatRate(vr) {
    if (!vr)
        return;
    if (vr.vatPercentage != null)
        vr.vatPercentage = multiplyBy100(vr.vatPercentage);
    if (vr.vatContent != null)
        vr.vatContent = multiplyBy100(vr.vatContent);
    if (vr.vatAmountMismatch?.vatRate != null) {
        vr.vatAmountMismatch.vatRate = multiplyBy100(vr.vatAmountMismatch.vatRate);
    }
}
/**
 * Egész szám-e (nincs tizedes, vagy a tizedesrész csupa 0)?
 * Pl. "400", "400.00", "1500.000" → true; "400.50" → false
 */
function isWholeNumberString(v) {
    const s = v.trim();
    const bare = s.startsWith('-') || s.startsWith('+') ? s.slice(1) : s;
    const dot = bare.indexOf('.');
    if (dot < 0)
        return /^\d+$/.test(bare);
    if (!/^\d+\.\d+$/.test(bare))
        return false;
    return /^0+$/.test(bare.slice(dot + 1));
}
/** Levágja a felesleges `.00` / `.0` tizedesrészt egész értékekről. */
function stripZeroFraction(v) {
    const s = String(v).trim();
    const neg = s.startsWith('-');
    const bare = neg || s.startsWith('+') ? s.slice(1) : s;
    const dot = bare.indexOf('.');
    if (dot < 0)
        return s;
    if (!/^0+$/.test(bare.slice(dot + 1)))
        return s;
    const out = bare.slice(0, dot);
    return neg ? '-' + out : out;
}
/**
 * Oszlop-trim: ha az oszlop minden értéke egész (tizedesrész üres vagy csupa 0),
 * levágjuk a felesleges `.00`-t. 1 sornál is működik. Nem kerekít.
 */
function trimColumnIfAllWhole(refs) {
    const present = refs.filter(r => r.obj != null && r.obj[r.key] != null && r.obj[r.key] !== '');
    if (present.length === 0)
        return;
    const values = present.map(r => String(r.obj[r.key]));
    if (!values.every(isWholeNumberString))
        return;
    for (const r of present) {
        r.obj[r.key] = stripZeroFraction(String(r.obj[r.key]));
    }
}
function parseNumericColumns(data) {
    const invoice = data.invoiceMain?.invoice ?? data.invoiceMain?.batchInvoice?.[0]?.invoice;
    if (!invoice)
        return;
    const lines = invoice.invoiceLines?.line ?? [];
    // Oszloponkénti gyűjtés
    const cols = {};
    function add(key, ref) {
        (cols[key] ??= []).push(ref);
    }
    for (const line of lines) {
        const lineObj = line;
        if (line.unitPrice != null)
            add('unitPrice', { obj: lineObj, key: 'unitPrice' });
        if (line.unitPriceHUF != null)
            add('unitPriceHUF', { obj: lineObj, key: 'unitPriceHUF' });
        if (line.quantity != null)
            add('quantity', { obj: lineObj, key: 'quantity' });
        if (line.lineAmountsNormal) {
            const la = line.lineAmountsNormal;
            add('lineNetAmount', { obj: la.lineNetAmountData, key: 'lineNetAmount' });
            if (la.lineVatData) {
                add('lineVatAmount', { obj: la.lineVatData, key: 'lineVatAmount' });
            }
            if (la.lineGrossAmountData) {
                add('lineGrossAmountNormal', { obj: la.lineGrossAmountData, key: 'lineGrossAmountNormal' });
            }
            add('vatPercentage', { obj: la.lineVatRate, key: 'vatPercentage' });
            add('vatContent', { obj: la.lineVatRate, key: 'vatContent' });
        }
        if (line.lineAmountsSimplified) {
            const la = line.lineAmountsSimplified;
            add('lineGrossAmountSimplified', { obj: la, key: 'lineGrossAmountSimplified' });
            add('vatPercentage', { obj: la.lineVatRate, key: 'vatPercentage' });
            add('vatContent', { obj: la.lineVatRate, key: 'vatContent' });
        }
        if (line.lineDiscountData) {
            add('discountValue', { obj: line.lineDiscountData, key: 'discountValue' });
            add('discountRate', { obj: line.lineDiscountData, key: 'discountRate' });
        }
    }
    // Trim: ha az oszlop minden eleme egész, levágjuk a `.00`-t
    for (const refs of Object.values(cols)) {
        trimColumnIfAllWhole(refs);
    }
    // Summary columns
    trimSummaryNumeric(data);
}
function trimSummaryNumeric(data) {
    const invoice = data.invoiceMain?.invoice ?? data.invoiceMain?.batchInvoice?.[0]?.invoice;
    if (!invoice)
        return;
    const summary = invoice.invoiceSummary;
    if (!summary)
        return;
    const net = [];
    const vat = [];
    const gross = [];
    const grossSimplified = [];
    if (summary.summaryNormal) {
        const sn = summary.summaryNormal;
        net.push({ obj: sn, key: 'invoiceNetAmount' });
        vat.push({ obj: sn, key: 'invoiceVatAmount' });
        for (const b of sn.summaryByVatRate) {
            net.push({ obj: b.vatRateNetData, key: 'vatRateNetAmount' });
            vat.push({ obj: b.vatRateVatData, key: 'vatRateVatAmount' });
            if (b.vatRateGrossData) {
                gross.push({ obj: b.vatRateGrossData, key: 'vatRateGrossAmount' });
            }
        }
    }
    if (summary.summarySimplified) {
        for (const s of summary.summarySimplified) {
            grossSimplified.push({ obj: s, key: 'vatContentGrossAmount' });
        }
    }
    if (summary.summaryGrossData) {
        gross.push({ obj: summary.summaryGrossData, key: 'invoiceGrossAmount' });
    }
    for (const col of [net, vat, gross, grossSimplified]) {
        trimColumnIfAllWhole(col);
    }
}
/** Main entry: clone, multiply percentages, trim numeric columns */
export function preprocessInvoiceData(raw) {
    const data = structuredClone(raw);
    multiplyPercentages(data);
    parseNumericColumns(data);
    return data;
}

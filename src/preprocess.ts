import type { InvoiceData, VatRate } from 'nav-osa-types';
import { multiplyBy100 } from './components/utils.js';

/** ×100 mutator a `vatPercentage`, `vatContent` és `discountRate` mezőkre */
function multiplyPercentages(data: InvoiceData): void {
  const invoice = data.invoiceMain?.invoice ?? data.invoiceMain?.batchInvoice?.[0]?.invoice;
  if (!invoice) return;

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

function applyVatRate(vr: VatRate | undefined): void {
  if (!vr) return;
  if (vr.vatPercentage != null) vr.vatPercentage = multiplyBy100(vr.vatPercentage);
  if (vr.vatContent != null) vr.vatContent = multiplyBy100(vr.vatContent);
  if (vr.vatAmountMismatch?.vatRate != null) {
    vr.vatAmountMismatch.vatRate = multiplyBy100(vr.vatAmountMismatch.vatRate);
  }
}

/**
 * Egész szám-e (nincs tizedes, vagy a tizedesrész csupa 0)?
 * Pl. "400", "400.00", "1500.000" → true; "400.50" → false
 */
function isWholeNumberString(v: string): boolean {
  const s = v.trim();
  const bare = s.startsWith('-') || s.startsWith('+') ? s.slice(1) : s;
  const dot = bare.indexOf('.');
  if (dot < 0) return /^\d+$/.test(bare);
  if (!/^\d+\.\d+$/.test(bare)) return false;
  return /^0+$/.test(bare.slice(dot + 1));
}

/** Levágja a felesleges `.00` / `.0` tizedesrészt egész értékekről. */
function stripZeroFraction(v: string): string {
  const s = String(v).trim();
  const neg = s.startsWith('-');
  const bare = neg || s.startsWith('+') ? s.slice(1) : s;
  const dot = bare.indexOf('.');
  if (dot < 0) return s;
  if (!/^0+$/.test(bare.slice(dot + 1))) return s;
  const out = bare.slice(0, dot);
  return neg ? '-' + out : out;
}

/**
 * Oszlop-trim: ha az oszlop minden értéke egész (tizedesrész üres vagy csupa 0),
 * levágjuk a felesleges `.00`-t. 1 sornál is működik. Nem kerekít.
 */
function trimColumnIfAllWhole(refs: FieldRef[]): void {
  const present = refs.filter(r => r.obj != null && r.obj[r.key] != null && r.obj[r.key] !== '');
  if (present.length === 0) return;
  const values = present.map(r => String(r.obj[r.key]));
  if (!values.every(isWholeNumberString)) return;
  for (const r of present) {
    r.obj[r.key] = stripZeroFraction(String(r.obj[r.key]));
  }
}

interface FieldRef { obj: Record<string, unknown>; key: string }

function parseNumericColumns(data: InvoiceData): void {
  const invoice = data.invoiceMain?.invoice ?? data.invoiceMain?.batchInvoice?.[0]?.invoice;
  if (!invoice) return;
  const lines = invoice.invoiceLines?.line ?? [];

  // Oszloponkénti gyűjtés
  const cols: Record<string, FieldRef[]> = {};

  function add(key: string, ref: FieldRef): void {
    (cols[key] ??= []).push(ref);
  }

  for (const line of lines) {
    const lineObj = line as unknown as Record<string, unknown>;
    if (line.unitPrice != null) add('unitPrice', { obj: lineObj, key: 'unitPrice' });
    if (line.unitPriceHUF != null) add('unitPriceHUF', { obj: lineObj, key: 'unitPriceHUF' });
    if (line.quantity != null) add('quantity', { obj: lineObj, key: 'quantity' });

    if (line.lineAmountsNormal) {
      const la = line.lineAmountsNormal;
      add('lineNetAmount', { obj: la.lineNetAmountData as unknown as Record<string, unknown>, key: 'lineNetAmount' });
      if (la.lineVatData) {
        add('lineVatAmount', { obj: la.lineVatData as unknown as Record<string, unknown>, key: 'lineVatAmount' });
      }
      if (la.lineGrossAmountData) {
        add('lineGrossAmountNormal', { obj: la.lineGrossAmountData as unknown as Record<string, unknown>, key: 'lineGrossAmountNormal' });
      }
      add('vatPercentage', { obj: la.lineVatRate as unknown as Record<string, unknown>, key: 'vatPercentage' });
      add('vatContent', { obj: la.lineVatRate as unknown as Record<string, unknown>, key: 'vatContent' });
    }
    if (line.lineAmountsSimplified) {
      const la = line.lineAmountsSimplified;
      add('lineGrossAmountSimplified', { obj: la as unknown as Record<string, unknown>, key: 'lineGrossAmountSimplified' });
      add('vatPercentage', { obj: la.lineVatRate as unknown as Record<string, unknown>, key: 'vatPercentage' });
      add('vatContent', { obj: la.lineVatRate as unknown as Record<string, unknown>, key: 'vatContent' });
    }
    if (line.lineDiscountData) {
      add('discountValue', { obj: line.lineDiscountData as unknown as Record<string, unknown>, key: 'discountValue' });
      add('discountRate', { obj: line.lineDiscountData as unknown as Record<string, unknown>, key: 'discountRate' });
    }
  }

  // Trim: ha az oszlop minden eleme egész, levágjuk a `.00`-t
  for (const refs of Object.values(cols)) {
    trimColumnIfAllWhole(refs);
  }

  // Summary columns
  trimSummaryNumeric(data);
}

function trimSummaryNumeric(data: InvoiceData): void {
  const invoice = data.invoiceMain?.invoice ?? data.invoiceMain?.batchInvoice?.[0]?.invoice;
  if (!invoice) return;
  const summary = invoice.invoiceSummary;
  if (!summary) return;

  const net: FieldRef[] = [];
  const vat: FieldRef[] = [];
  const gross: FieldRef[] = [];
  const grossSimplified: FieldRef[] = [];

  if (summary.summaryNormal) {
    const sn = summary.summaryNormal;
    net.push({ obj: sn as unknown as Record<string, unknown>, key: 'invoiceNetAmount' });
    vat.push({ obj: sn as unknown as Record<string, unknown>, key: 'invoiceVatAmount' });
    for (const b of sn.summaryByVatRate) {
      net.push({ obj: b.vatRateNetData as unknown as Record<string, unknown>, key: 'vatRateNetAmount' });
      vat.push({ obj: b.vatRateVatData as unknown as Record<string, unknown>, key: 'vatRateVatAmount' });
      if (b.vatRateGrossData) {
        gross.push({ obj: b.vatRateGrossData as unknown as Record<string, unknown>, key: 'vatRateGrossAmount' });
      }
    }
  }

  if (summary.summarySimplified) {
    for (const s of summary.summarySimplified) {
      grossSimplified.push({ obj: s as unknown as Record<string, unknown>, key: 'vatContentGrossAmount' });
    }
  }

  if (summary.summaryGrossData) {
    gross.push({ obj: summary.summaryGrossData as unknown as Record<string, unknown>, key: 'invoiceGrossAmount' });
  }

  for (const col of [net, vat, gross, grossSimplified]) {
    trimColumnIfAllWhole(col);
  }
}

/** Main entry: clone, multiply percentages, trim numeric columns */
export function preprocessInvoiceData(raw: InvoiceData): InvoiceData {
  const data: InvoiceData = structuredClone(raw);
  multiplyPercentages(data);
  parseNumericColumns(data);
  return data;
}

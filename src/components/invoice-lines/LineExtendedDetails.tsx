import type { TFn, NFn, DisplayLine } from '../utils.js';
import type { ProductFeeData } from 'nav-osa-types';
import { asArray, getAddressLine1, esc, vatCodeKey, nfTrimmed } from '../utils.js';

interface Props {
    line: DisplayLine;
    t: TFn;
    nf: NFn;
    ambiguousVatCodes: Set<string>;
}

/**
 * Termékáram-címke: a PAPER/ELECTRONIC kódokhoz saját kulcs kell, mert a
 * globális PAPER ("Irodai papír") és ELECTRONIC ("Elektronikus")
 * megjelenési formát jelöl, nem termékáramot.
 */
function productStreamLabel(stream: string, t: TFn): string {
    if (stream === 'PAPER') return t('productStreamPaper');
    if (stream === 'ELECTRONIC') return t('productStreamElectronic');
    return t(stream);
}

export function LineExtendedDetails({ line, t, nf, ambiguousVatCodes }: Props): string {
    const parts: string[] = [];

    // VAT exemption / out-of-scope reason, shown only when the same code
    // appears with more than one distinct reason across the invoice
    const vatRate = line.lineAmountsNormal?.lineVatRate ?? line.lineAmountsSimplified?.lineVatRate;
    if (vatRate?.vatExemption?.reason && ambiguousVatCodes.has(vatCodeKey(vatRate))) {
        parts.push(
            (<div class="detail-section">
                <strong>{t('vatExemption') || t('vatExempt')}: {vatRate.vatExemption.case}</strong>
                <p>{esc(vatRate.vatExemption.reason)}</p>
            </div>) as string
        );
    }
    if (vatRate?.vatOutOfScope?.reason && ambiguousVatCodes.has(vatCodeKey(vatRate))) {
        parts.push(
            (<div class="detail-section">
                <strong>{t('vatOutOfScope')}: {vatRate.vatOutOfScope.case}</strong>
                <p>{esc(vatRate.vatOutOfScope.reason)}</p>
            </div>) as string
        );
    }

    // Annotated original invoice number & delivery date from BatchMergedInvoiceComponent
    if (line._annotatedOriginalInvoiceNumber || line._annotatedDeliveryDate) {
        const annItems: string[] = [];
        if (line._annotatedOriginalInvoiceNumber) {
            annItems.push(`<strong>${t('originalInvoiceNumber')}:</strong> ${esc(line._annotatedOriginalInvoiceNumber)}`);
        }
        if (line._annotatedDeliveryDate) {
            annItems.push(`<strong>${t('invoiceDeliveryDate')}:</strong> ${line._annotatedDeliveryDate}`);
        }
        if (annItems.length > 0) {
            parts.push(`<div class="detail-section">${annItems.join(' | ')}</div>`);
        }
    }

    // Aggregate invoice line data
    if (line.aggregateInvoiceLineData) {
        const agg = line.aggregateInvoiceLineData;
        parts.push(
            (<div class="detail-section">
                <strong>{t('aggregateInvoiceLineData')}:</strong>
                {agg.lineDeliveryDate && <p>{t('deliveryDate')}: {agg.lineDeliveryDate}</p>}
                {agg.lineExchangeRate && <p>{t('exchangeRate')}: {agg.lineExchangeRate}</p>}
            </div>) as string
        );
    }

    // Line modification reference
    if (line.lineModificationReference) {
        const ref = line.lineModificationReference;
        parts.push(
            (<div class="detail-section">
                <strong>{t('lineModification')}:</strong>
                <p>{t('lineNumberReference')}: {esc(ref.lineNumberReference)}</p>
                <p>{t('lineOperation')}: {t(ref.lineOperation)}</p>
            </div>) as string
        );
    }

    // Advance data
    if (line.advanceData) {
        const adv = line.advanceData;
        parts.push(
            (<div class="detail-section">
                <strong>{t('advancePayment')}:</strong>
                {adv.advanceIndicator && <p>{t('advancePayment')}: {t('yes')}</p>}
                {adv.advancePaymentData && (<>
                    <p>{t('originalInvoice')}: {esc(adv.advancePaymentData.advanceOriginalInvoice)}</p>
                    <p>{t('paymentDate')}: {adv.advancePaymentData.advancePaymentDate}</p>
                    {adv.advancePaymentData.advanceExchangeRate &&
                        <p>{t('exchangeRate')}: {adv.advancePaymentData.advanceExchangeRate}</p>}
                </>)}
            </div>) as string
        );
    }

    // References to other lines
    if (line.referencesToOtherLines) {
        parts.push(
            (<div class="detail-section">
                <strong>{t('referencesToOtherLines')}:</strong>{' '}
                {asArray(line.referencesToOtherLines.referenceToOtherLine).map(val => esc(val)).join(', ')}
            </div>) as string
        );
    }

    // Product fee clause
    if (line.productFeeClause) {
        const pfc = line.productFeeClause;
        const items: string[] = [];
        if (pfc.productFeeTakeoverData) {
            const reason = pfc.productFeeTakeoverData.takeoverReason;
            const buyerBears = reason !== '01';
            items.push(<p><strong>{t('productFeeTakeoverData')}:</strong></p> as string);
            items.push(<p>{t('feeObligor')}: {buyerBears ? t('feeObligorBuyer') : t('feeObligorSeller')}</p> as string);
            items.push(<p>{t(`takeover_${reason}`)}</p> as string);
            if (pfc.productFeeTakeoverData.takeoverAmount) {
                items.push(<p>{t('amount')}: {nfTrimmed(pfc.productFeeTakeoverData.takeoverAmount, nf)}</p> as string);
            }
        }
        if (pfc.customerDeclaration) {
            items.push(<p><strong>{t('customerDeclaration')}:</strong></p> as string);
            items.push(<p>{t('productStream')}: {productStreamLabel(pfc.customerDeclaration.productStream, t)}</p> as string);
            if (pfc.customerDeclaration.productFeeWeight) {
                items.push(<p>{t('weight')}: {nfTrimmed(pfc.customerDeclaration.productFeeWeight, nf)} kg</p> as string);
            }
        }
        if (items.length > 0) {
            parts.push(<div class="detail-section">{items.join('')}</div> as string);
        }
    }

    // New transport mean
    if (line.newTransportMean) {
        const ntm = line.newTransportMean;
        const items: string[] = [];
        items.push(<strong>{t('newTransportMean')}:</strong> as string);
        if (ntm.brand) items.push(<p>{t('brand')}: {esc(ntm.brand)}</p> as string);
        if (ntm.serialNum) items.push(<p>{t('serialNum')}: {esc(ntm.serialNum)}</p> as string);
        if (ntm.engineNum) items.push(<p>{t('engineNum')}: {esc(ntm.engineNum)}</p> as string);
        if (ntm.firstEntryIntoService) items.push(<p>{t('firstEntryIntoService')}: {ntm.firstEntryIntoService}</p> as string);
        if (ntm.vehicle) {
            items.push(<p>{t('engineCapacity')}: {ntm.vehicle.engineCapacity} cm³</p> as string);
            items.push(<p>{t('enginePower')}: {ntm.vehicle.enginePower} kW</p> as string);
            items.push(<p>{t('kms')}: {ntm.vehicle.kms} km</p> as string);
        }
        if (ntm.vessel) {
            items.push(<p>{t('length')}: {ntm.vessel.length} m</p> as string);
            items.push(<p>{t('sailedHours')}: {ntm.vessel.sailedHours} h</p> as string);
        }
        if (ntm.aircraft) {
            items.push(<p>{t('takeOffWeight')}: {ntm.aircraft.takeOffWeight} kg</p> as string);
            if (ntm.aircraft.airCargo) {
                items.push(<p>{t('airCargo')}: {t('yes')}</p> as string);
            }
            items.push(<p>{t('operationHours')}: {ntm.aircraft.operationHours} h</p> as string);
        }
        parts.push(<div class="detail-section">{items.join('')}</div> as string);
    }

    // GPC Excise
    if (line.GPCExcise != null && Number(line.GPCExcise) !== 0) {
        parts.push(
            (<div class="detail-section">
                <strong>{t('GPCExcise')}:</strong>
                <p>{line.GPCExcise} HUF</p>
            </div>) as string
        );
    }

    // Diesel oil purchase
    if (line.dieselOilPurchase) {
        const dop = line.dieselOilPurchase;
        parts.push(
            (<div class="detail-section">
                <strong>{t('dieselOilPurchase')}:</strong>
                <p>{t('purchaseLocation')}: {getAddressLine1(dop.purchaseLocation)}</p>
                <p>{t('purchaseDate')}: {dop.purchaseDate}</p>
                <p>{t('vehicleRegistrationNumber')}: {esc(dop.vehicleRegistrationNumber)}</p>
                {dop.dieselOilQuantity != null &&
                    <p>{t('dieselOilQuantity')}: {dop.dieselOilQuantity} L</p>}
            </div>) as string
        );
    }

    // NETA declaration
    if (line.netaDeclaration) {
        parts.push(<div class="detail-section"><span class="badge badge-warning">{t('netaDeclaration')}</span></div> as string);
    }

    // Line product fee content
    if (line.lineProductFeeContent) {
        const feeItems = asArray(line.lineProductFeeContent);
        parts.push(
            (<div class="detail-section">
                <strong>{t('lineProductFeeContent')}:</strong>
                <table class="summary-table fee-detail-table">
                    <thead>
                        <tr>
                            <th>{t('productFeeCode')}</th>
                            <th class="text-right">{t('productFeeQuantity')}</th>
                            <th class="text-right">{t('productFeeRate')}</th>
                            <th class="text-right">{t('productFeeAmount')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {feeItems.map((fd: ProductFeeData) => (
                            <tr>
                                <td>{esc(fd.productFeeCode?.productCodeValue || fd.productFeeCode?.productCodeOwnValue || '-')}</td>
                                <td class="text-right">{nfTrimmed(fd.productFeeQuantity, nf)} {fd.productFeeMeasuringUnit ? t(fd.productFeeMeasuringUnit) : ''}</td>
                                <td class="text-right">{nfTrimmed(fd.productFeeRate, nf)}</td>
                                <td class="text-right">{nfTrimmed(fd.productFeeAmount, nf)}</td>
                            </tr>
                        )).join('')}
                    </tbody>
                </table>
            </div>) as string
        );
    }

    return parts.join('');
}

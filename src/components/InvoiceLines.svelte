<script lang="ts">
    import type { Lines } from "../osaTypes/dataTypes.js";
    import LineBasicDetails from "./invoice-lines/LineBasicDetails.svelte";
    import LineExtendedDetails from "./invoice-lines/LineExtendedDetails.svelte";
    import VatRateDisplay from "./VatRateDisplay.svelte";

    export let data: Lines;
    export let t: (key: string) => string;
    export let nf: (val: any, decimals?: number) => string;

    // Helper to ensure array
    const asArray = <T,>(item: T | T[] | undefined): T[] =>
        Array.isArray(item) ? item : item ? [item] : [];

    $: hasAnyDiscount = asArray(data.line).some(
        (line) => line.lineDiscountData != null,
    );

    // Check if line has any additional details to show
    const hasLineDetails = (line: any) => {
        return (
            line.productCodes ||
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
            (line.GPCExcise != null && line.GPCExcise != 0) ||
            line.dieselOilPurchase
        );
    };

    const getDiscountedUnitPrice = (line: any) => {
        const unitPrice = line.unitPrice || 0;
        const quantity = line.quantity;
        const discountData = line.lineDiscountData;

        if (discountData) {
            if (
                discountData.discountValue != null &&
                quantity != null &&
                quantity !== 0
            ) {
                return parseFloat(
                    (unitPrice - discountData.discountValue / quantity).toFixed(
                        4,
                    ),
                );
            }
            if (discountData.discountRate != null) {
                return parseFloat(
                    (unitPrice * (1 - discountData.discountRate)).toFixed(4),
                );
            }
        }

        return unitPrice;
    };

    const countDecimals = (val: any): number => {
        if (val == null || val === "") return 0;
        // Parse to Number to natively drop XML trailing zeros (e.g. "2480.0000000000" -> 2480)
        // Also apply a localized fix for any microscopic precision errors from math
        const num = Number(val);
        if (isNaN(num)) return 0;

        let numStr = parseFloat(num.toFixed(10)).toString();

        if (numStr.includes("e")) {
            numStr = num.toString();
        }

        const dotIdx = numStr.indexOf(".");
        if (dotIdx === -1) return 0;

        return numStr.length - dotIdx - 1;
    };

    const getTargetDecimals = (maxDec: number): number => {
        if (maxDec === 0) return 0;
        if (maxDec === 1) return 2;
        if (maxDec > 4) return 4; // Limit to maximum 4 decimals for sanity
        return maxDec;
    };

    $: lines = asArray(data.line);
    $: colDecs = {
        unitPrice: getTargetDecimals(
            Math.max(0, ...lines.map((l) => countDecimals(l.unitPrice))),
        ),
        discount: getTargetDecimals(
            Math.max(
                0,
                ...lines.map((l) =>
                    countDecimals(l.lineDiscountData?.discountValue),
                ),
            ),
        ),
        discountedUnitPrice: getTargetDecimals(
            Math.max(
                0,
                ...lines.map((l) => countDecimals(getDiscountedUnitPrice(l))),
            ),
        ),
        netAmount: getTargetDecimals(
            Math.max(
                0,
                ...lines.map((l) =>
                    countDecimals(
                        l.lineAmountsNormal?.lineNetAmountData?.lineNetAmount,
                    ),
                ),
            ),
        ),
        vatAmount: getTargetDecimals(
            Math.max(
                0,
                ...lines.map((l) =>
                    countDecimals(
                        l.lineAmountsNormal?.lineVatData?.lineVatAmount,
                    ),
                ),
            ),
        ),
        grossAmount: getTargetDecimals(
            Math.max(
                0,
                ...lines.map((l) => {
                    if (l.lineAmountsNormal)
                        return countDecimals(
                            l.lineAmountsNormal.lineGrossAmountData
                                ?.lineGrossAmountNormal,
                        );
                    if (l.lineAmountsSimplified)
                        return countDecimals(
                            l.lineAmountsSimplified.lineGrossAmountSimplified,
                        );
                    return 0;
                }),
            ),
        ),
    };
</script>

<div class="invoice-lines">
    <h3>{t("invoiceLines")}</h3>
    {#if data.mergedItemIndicator}
        <div class="merged-warning">
            ⚠️ {t("mergedItemIndicator")} - Az adatszolgáltatás méretcsökkentés miatt
            összevont soradatokat tartalmaz
        </div>
    {/if}
    <table class="lines-table">
        <thead>
            <tr>
                <th>#</th>
                <th>{t("description")}</th>
                {#if hasAnyDiscount}
                    <th class="text-right">{t("netPrice")}</th>
                    <th class="text-right">{t("discount")}</th>
                {/if}
                <th class="text-right">{t("unitPrice")}</th>
                <th class="text-right">{t("quantity")}</th>
                <th class="text-right">{t("netAmount")}</th>
                <th class="text-right">{t("vatAmount")}</th>
                <th class="text-right">{t("grossAmount")}</th>
            </tr>
        </thead>
        {#each asArray(data.line) as line}
            <tbody class="line-group">
                <!-- Main Line Info -->
                <tr class="main-row">
                    <td>{line.lineNumber}</td>
                    <td>
                        <div class="description">
                            <strong>{line.lineDescription}</strong>
                            {#if line.lineNatureIndicator}
                                <span class="badge"
                                    >{t(line.lineNatureIndicator)}</span
                                >
                            {/if}
                        </div>
                    </td>

                    {#if hasAnyDiscount}
                        <td class="text-right" style="white-space: nowrap;">
                            {nf(line.unitPrice, colDecs.unitPrice)}
                            {#if line.unitPriceHUF && line.unitPriceHUF !== line.unitPrice}
                                <br /><small
                                    >{nf(line.unitPriceHUF, colDecs.unitPrice)} HUF</small
                                >
                            {/if}
                        </td>
                        <td
                            class="text-right"
                            style="white-space: nowrap;"
                            title="{line.lineDiscountData?.discountDescription
                                ? line.lineDiscountData.discountDescription +
                                  '\n'
                                : ''}{line.lineDiscountData?.discountValue
                                ? t('discountValue') +
                                  ': ' +
                                  nf(
                                      line.lineDiscountData.discountValue,
                                      colDecs.discount,
                                  ) +
                                  '\n'
                                : ''}{line.lineDiscountData?.discountRate
                                ? t('discountRate') +
                                  ': ' +
                                  nf(line.lineDiscountData.discountRate * 100) +
                                  '%'
                                : ''}"
                        >
                            {#if line.lineDiscountData}
                                {#if line.lineDiscountData.discountRate}
                                    {nf(
                                        line.lineDiscountData.discountRate *
                                            100,
                                    )}%
                                {:else if line.lineDiscountData.discountValue}
                                    {nf(
                                        line.lineDiscountData.discountValue,
                                        colDecs.discount,
                                    )}
                                {/if}
                            {:else}
                                -
                            {/if}
                        </td>
                    {/if}

                    <td class="text-right" style="white-space: nowrap;">
                        {nf(
                            getDiscountedUnitPrice(line),
                            colDecs.discountedUnitPrice,
                        )}
                    </td>

                    <td class="text-right" style="white-space: nowrap;">
                        {nf(
                            line.quantity != null
                                ? parseFloat(Number(line.quantity).toFixed(4))
                                : null,
                            Math.min(countDecimals(line.quantity), 4),
                        )}
                        {line.unitOfMeasure ? t(line.unitOfMeasure) : ""}
                        {#if line.unitOfMeasureOwn}
                            <br /><small>({line.unitOfMeasureOwn})</small>
                        {/if}
                    </td>

                    <!-- Amounts (Normal vs Simplified) -->
                    {#if line.lineAmountsNormal}
                        <td class="text-right" style="white-space: nowrap;">
                            {nf(
                                line.lineAmountsNormal.lineNetAmountData
                                    ?.lineNetAmount,
                                colDecs.netAmount,
                            ) || "-"}
                        </td>
                        <td class="text-right" style="white-space: nowrap;">
                            {#if line.lineAmountsNormal.lineVatData}
                                {nf(
                                    line.lineAmountsNormal.lineVatData
                                        .lineVatAmount,
                                    colDecs.vatAmount,
                                ) || "-"}
                                <br /><small>
                                    <VatRateDisplay
                                        vatRate={line.lineAmountsNormal
                                            .lineVatRate}
                                        {t}
                                        {nf}
                                    />
                                </small>
                            {:else}
                                -
                            {/if}
                        </td>
                        <td class="text-right" style="white-space: nowrap;">
                            {nf(
                                line.lineAmountsNormal.lineGrossAmountData
                                    ?.lineGrossAmountNormal,
                                colDecs.grossAmount,
                            ) || "-"}
                        </td>
                    {:else if line.lineAmountsSimplified}
                        <td
                            class="text-right"
                            colspan="2"
                            style="white-space: nowrap;"
                        >
                            {t("simplifiedInvoice")}
                            <br /><small>
                                <VatRateDisplay
                                    vatRate={line.lineAmountsSimplified
                                        .lineVatRate}
                                    {t}
                                    {nf}
                                />
                            </small>
                        </td>
                        <td class="text-right" style="white-space: nowrap;">
                            {nf(
                                line.lineAmountsSimplified
                                    .lineGrossAmountSimplified,
                                colDecs.grossAmount,
                            ) || "-"}
                        </td>
                    {:else}
                        <td colspan="3" class="text-right">-</td>
                    {/if}
                </tr>

                <!-- Details Row -->
                {#if hasLineDetails(line)}
                    <tr class="details-row">
                        <td colspan={hasAnyDiscount ? 9 : 7}>
                            <div class="line-details">
                                <LineBasicDetails {line} {t} />
                                <LineExtendedDetails {line} {t} />
                            </div>
                        </td>
                    </tr>
                {/if}
            </tbody>
        {/each}
    </table>
</div>

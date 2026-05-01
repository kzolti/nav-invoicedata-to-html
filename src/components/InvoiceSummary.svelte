<script lang="ts">
    import type { Invoice } from "../osaTypes/dataTypes.js";
    import VatRateDisplay from "./VatRateDisplay.svelte";

    export let invoice: Invoice;
    export let t: (key: string) => string;
    export let nf: (val: any, decimals?: number) => string;

    // Helper to ensure array
    const asArray = <T,>(item: T | T[] | undefined): T[] =>
        Array.isArray(item) ? item : item ? [item] : [];

    // Extract summary for convenience
    const data = invoice.invoiceSummary;

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
        if (maxDec > 4) return 4; // limit to maximum 4 decimals for sanity
        return maxDec;
    };

    $: vatRateLines = asArray(data.summaryNormal?.summaryByVatRate);
    $: vatDecs = {
        net: getTargetDecimals(
            Math.max(
                0,
                ...vatRateLines.map((l) =>
                    countDecimals(l.vatRateNetData.vatRateNetAmount),
                ),
            ),
        ),
        vat: getTargetDecimals(
            Math.max(
                0,
                ...vatRateLines.map((l) =>
                    countDecimals(l.vatRateVatData.vatRateVatAmount),
                ),
            ),
        ),
        gross: getTargetDecimals(
            Math.max(
                0,
                ...vatRateLines.map((l) =>
                    countDecimals(l.vatRateGrossData?.vatRateGrossAmount),
                ),
            ),
        ),
    };

    $: totalNormalDecs = {
        net: getTargetDecimals(
            countDecimals(data.summaryNormal?.invoiceNetAmount),
        ),
        vat: getTargetDecimals(
            countDecimals(data.summaryNormal?.invoiceVatAmount),
        ),
    };

    $: summaryGrossDecs = getTargetDecimals(
        countDecimals(data.summaryGrossData?.invoiceGrossAmount),
    );

    $: simplifiedLines = asArray(data.summarySimplified);
    $: simplifiedDecs = getTargetDecimals(
        Math.max(
            0,
            ...simplifiedLines.map((l) =>
                countDecimals(l.vatContentGrossAmount),
            ),
        ),
    );
</script>

<div class="invoice-summary">
    <h3>{t("summary")}</h3>

    <!-- Normal Summary (detailed VAT breakdown) -->
    {#if data.summaryNormal}
        <!-- Summary by VAT Rate -->
        {#if data.summaryNormal.summaryByVatRate}
            <div class="vat-breakdown">
                <h4>{t("vatBreakdown")}</h4>
                <table class="summary-table">
                    <thead>
                        <tr>
                            <th>{t("vatRate")}</th>
                            <th class="text-right">{t("netAmount")}</th>
                            <th class="text-right">{t("vatAmount")}</th>
                            <th class="text-right">{t("grossAmount")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each asArray(data.summaryNormal.summaryByVatRate) as vatItem}
                            <tr>
                                <td>
                                    <VatRateDisplay
                                        vatRate={vatItem.vatRate}
                                        {t}
                                        {nf}
                                    />
                                </td>
                                <td
                                    class="text-right"
                                    style="white-space: nowrap;"
                                >
                                    {nf(
                                        vatItem.vatRateNetData.vatRateNetAmount,
                                        vatDecs.net,
                                    )}
                                    {#if vatItem.vatRateNetData.vatRateNetAmountHUF && vatItem.vatRateNetData.vatRateNetAmountHUF !== vatItem.vatRateNetData.vatRateNetAmount}
                                        <br /><small
                                            >{nf(
                                                vatItem.vatRateNetData
                                                    .vatRateNetAmountHUF,
                                                vatDecs.net,
                                            )} HUF</small
                                        >
                                    {/if}
                                </td>
                                <td
                                    class="text-right"
                                    style="white-space: nowrap;"
                                >
                                    {nf(
                                        vatItem.vatRateVatData.vatRateVatAmount,
                                        vatDecs.vat,
                                    )}
                                    {#if vatItem.vatRateVatData.vatRateVatAmountHUF && vatItem.vatRateVatData.vatRateVatAmountHUF !== vatItem.vatRateVatData.vatRateVatAmount}
                                        <br /><small
                                            >{nf(
                                                vatItem.vatRateVatData
                                                    .vatRateVatAmountHUF,
                                                vatDecs.vat,
                                            )} HUF</small
                                        >
                                    {/if}
                                </td>
                                <td
                                    class="text-right"
                                    style="white-space: nowrap;"
                                >
                                    {#if vatItem.vatRateGrossData}
                                        {nf(
                                            vatItem.vatRateGrossData
                                                .vatRateGrossAmount,
                                            vatDecs.gross,
                                        )}
                                        {#if vatItem.vatRateGrossData.vatRateGrossAmountHUF && vatItem.vatRateGrossData.vatRateGrossAmountHUF !== vatItem.vatRateGrossData.vatRateGrossAmount}
                                            <br /><small
                                                >{nf(
                                                    vatItem.vatRateGrossData
                                                        .vatRateGrossAmountHUF,
                                                    vatDecs.gross,
                                                )} HUF</small
                                            >
                                        {/if}
                                    {:else}
                                        -
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}

        <!-- Invoice Totals -->
        <table class="totals-table">
            <tbody>
                <tr>
                    <td>{t("netAmountTotal")}</td>
                    <td class="text-right" style="white-space: nowrap;">
                        {nf(
                            data.summaryNormal.invoiceNetAmount,
                            totalNormalDecs.net,
                        )}
                        {#if data.summaryNormal.invoiceNetAmountHUF && data.summaryNormal.invoiceNetAmountHUF !== data.summaryNormal.invoiceNetAmount}
                            <br /><small
                                >{nf(
                                    data.summaryNormal.invoiceNetAmountHUF,
                                    totalNormalDecs.net,
                                )} HUF</small
                            >
                        {/if}
                    </td>
                </tr>
                <tr>
                    <td>{t("vatAmountTotal")}</td>
                    <td class="text-right" style="white-space: nowrap;">
                        {nf(
                            data.summaryNormal.invoiceVatAmount,
                            totalNormalDecs.vat,
                        )}
                        {#if data.summaryNormal.invoiceVatAmountHUF && data.summaryNormal.invoiceVatAmountHUF !== data.summaryNormal.invoiceVatAmount}
                            <br /><small
                                >{nf(
                                    data.summaryNormal.invoiceVatAmountHUF,
                                    totalNormalDecs.vat,
                                )} HUF</small
                            >
                        {/if}
                    </td>
                </tr>
            </tbody>
        </table>
    {/if}

    <!-- Simplified Summary -->
    {#if data.summarySimplified}
        <div class="simplified-summary">
            <h4>{t("simplifiedInvoice")}</h4>
            <table class="summary-table">
                <thead>
                    <tr>
                        <th>{t("vatRate")}</th>
                        <th class="text-right">{t("grossAmount")}</th>
                    </tr>
                </thead>
                <tbody>
                    {#each asArray(data.summarySimplified) as item}
                        <tr>
                            <td>
                                <VatRateDisplay
                                    vatRate={item.vatRate}
                                    {t}
                                    {nf}
                                />
                            </td>
                            <td class="text-right" style="white-space: nowrap;">
                                {nf(item.vatContentGrossAmount, simplifiedDecs)}
                                {#if item.vatContentGrossAmountHUF && item.vatContentGrossAmountHUF !== item.vatContentGrossAmount}
                                    <br /><small
                                        >{nf(
                                            item.vatContentGrossAmountHUF,
                                            simplifiedDecs,
                                        )} HUF</small
                                    >
                                {/if}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}

    <!-- Gross Total (if available) -->
    {#if data.summaryGrossData}
        <table class="totals-table gross-total">
            <tbody>
                <tr class="total-row">
                    <td><strong>{t("grossAmountTotal")}</strong></td>
                    <td class="text-right" style="white-space: nowrap;">
                        <strong>
                            {nf(
                                data.summaryGrossData.invoiceGrossAmount,
                                summaryGrossDecs,
                            )}
                            {#if data.summaryGrossData.invoiceGrossAmountHUF && data.summaryGrossData.invoiceGrossAmountHUF !== data.summaryGrossData.invoiceGrossAmount}
                                <br /><small
                                    >{nf(
                                        data.summaryGrossData
                                            .invoiceGrossAmountHUF,
                                        summaryGrossDecs,
                                    )} HUF</small
                                >
                            {/if}
                        </strong>
                    </td>
                </tr>
            </tbody>
        </table>
    {/if}

    <!-- Product Fee Summary -->
    {#if invoice.productFeeSummary}
        <div class="product-fee-summary">
            <h4>{t("productFeeSummary")}</h4>
            {#each asArray(invoice.productFeeSummary) as feeSummary}
                <div class="fee-group">
                    <p>
                        <strong>{t("operation")}:</strong>
                        {t(feeSummary.productFeeOperation)}
                    </p>
                    <table class="summary-table">
                        <thead>
                            <tr>
                                <th>{t("productFeeCode")}</th>
                                <th class="text-right"
                                    >{t("productFeeQuantity")}</th
                                >
                                <th class="text-right"
                                    >{t("productFeeAmount")}</th
                                >
                            </tr>
                        </thead>
                        <tbody>
                            {#each asArray(feeSummary.productFeeData) as feeData}
                                <tr>
                                    <td
                                        >{feeData.productFeeCode
                                            .productCodeValue || "-"}</td
                                    >
                                    <td
                                        class="text-right"
                                        style="white-space: nowrap;"
                                        >{nf(feeData.productFeeQuantity) ||
                                            "-"}</td
                                    >
                                    <td
                                        class="text-right"
                                        style="white-space: nowrap;"
                                        >{nf(feeData.productFeeAmount)} HUF</td
                                    >
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                    <p class="fee-total">
                        <strong>{t("productChargeSum")}:</strong>
                        {nf(feeSummary.productChargeSum)} HUF
                    </p>
                </div>
            {/each}
        </div>
    {/if}
</div>

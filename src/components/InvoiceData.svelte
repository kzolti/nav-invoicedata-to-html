<script lang="ts">
    import type { InvoiceData, Invoice } from "../osaTypes/dataTypes.js";
    import InvoiceHead from "./InvoiceHead.svelte";
    import InvoiceLines from "./InvoiceLines.svelte";
    import InvoiceSummary from "./InvoiceSummary.svelte";
    export let data: InvoiceData;
    export let t: (key: string) => string; // Translation function
    export let nf: (val: any, decimals?: number) => string; // Number format function

    let invoices: Invoice[] = [];
    let batchIndices: number[] = [];

    $: {
        if (data.invoiceMain.batchInvoice) {
            const batch = Array.isArray(data.invoiceMain.batchInvoice)
                ? data.invoiceMain.batchInvoice
                : [data.invoiceMain.batchInvoice];
            invoices = batch.map((b) => b.invoice);
            batchIndices = batch.map((b) => b.batchIndex);
        } else if (data.invoiceMain.invoice) {
            invoices = [data.invoiceMain.invoice];
            batchIndices = [];
        }
    }
</script>

<div class="invoice-container">
    <h1>{t("invoice")}</h1>
    <div class="invoice-metadata">
        <p><strong>{t("invoiceNumber")}:</strong> {data.invoiceNumber}</p>
        <p><strong>{t("invoiceIssueDate")}:</strong> {data.invoiceIssueDate}</p>
        {#if data.completenessIndicator}
            <p>
                <strong>{t("complete")}</strong>
            </p>
        {/if}
    </div>

    {#each invoices as invoice, index}
        <div class="invoice-section">
            <!-- Batch Index for batch invoices -->
            {#if batchIndices.length > 0}
                <div class="batch-header">
                    <h2>{t("batchIndex")}: {batchIndices[index]}</h2>
                </div>
            {/if}

            <!-- Invoice Reference (modification data) -->
            {#if invoice.invoiceReference}
                <div class="invoice-reference">
                    <h3>{t("invoiceReference")}</h3>
                    <p>
                        <strong>{t("originalInvoiceNumber")}:</strong>
                        {invoice.invoiceReference.originalInvoiceNumber}
                    </p>
                    <p>
                        <strong>{t("modificationIndex")}:</strong>
                        {invoice.invoiceReference.modificationIndex}
                    </p>
                    <p>
                        <strong>{t("modifyWithoutMaster")}:</strong>
                        {invoice.invoiceReference.modifyWithoutMaster
                            ? t("yes")
                            : t("no")}
                    </p>
                </div>
            {/if}

            {#if invoice.invoiceHead}
                <InvoiceHead data={invoice.invoiceHead} {t} {nf} />
            {/if}

            {#if invoice.invoiceLines}
                <InvoiceLines data={invoice.invoiceLines} {t} {nf} />
            {/if}

            {#if invoice.invoiceSummary}
                <InvoiceSummary {invoice} {t} {nf} />
            {/if}
        </div>
    {/each}
</div>

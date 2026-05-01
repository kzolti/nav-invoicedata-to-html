<script lang="ts">
    export let line: any;
    export let t: (key: string) => string;

    const asArray = <T,>(item: T | T[] | undefined): T[] =>
        Array.isArray(item) ? item : item ? [item] : [];
</script>

{#if line.productCodes}
    <div class="product-codes">
        <strong>{t("productCodes")}:</strong>
        <ul>
            {#each asArray(line.productCodes.productCode) as code}
                <li>
                    {t(code.productCodeCategory)}:
                    {code.productCodeValue || code.productCodeOwnValue}
                </li>
            {/each}
        </ul>
    </div>
{/if}

{#if !line.lineExpressionIndicator || line.intermediatedService || line.depositIndicator || line.productFeeClause || line.obligatedForProductFee}
    <div class="indicators">
        {#if !line.lineExpressionIndicator}
            <span class="badge badge-warning line-expression-false"
                >{t("lineExpressionFalse")}</span
            >
        {/if}

        {#if line.intermediatedService}
            <span class="badge">{t("intermediatedService")}</span>
        {/if}
        {#if line.depositIndicator}
            <span class="badge">{t("deposit")}</span>
        {/if}
        {#if line.productFeeClause}
            <span class="badge">{t("productFee")}</span>
        {/if}
        {#if line.obligatedForProductFee}
            <span class="badge badge-warning"
                >{t("obligatedForProductFee")}</span
            >
        {/if}
    </div>
{/if}

{#if line.conventionalLineInfo}
    <div class="conventional-info">
        {#if line.conventionalLineInfo.orderNumbers}
            <p>
                <strong>{t("orderNumbers")}:</strong>
                {asArray(
                    line.conventionalLineInfo.orderNumbers.orderNumber,
                ).join(", ")}
            </p>
        {/if}
        {#if line.conventionalLineInfo.deliveryNotes}
            <p>
                <strong>{t("deliveryNotes")}:</strong>
                {asArray(
                    line.conventionalLineInfo.deliveryNotes.deliveryNote,
                ).join(", ")}
            </p>
        {/if}
        {#if line.conventionalLineInfo.contractNumbers}
            <p>
                <strong>{t("contractNumbers")}:</strong>
                {asArray(
                    line.conventionalLineInfo.contractNumbers.contractNumber,
                ).join(", ")}
            </p>
        {/if}
    </div>
{/if}

{#if line.additionalLineData}
    <div class="additional-data">
        <strong>{t("additionalData")}:</strong>
        <ul>
            {#each asArray(line.additionalLineData) as item}
                <li>
                    <div class="add-data-left">
                        <strong>{item.dataDescription}:</strong>
                        <span class="add-data-value">{item.dataValue}</span>
                    </div>
                    <div class="add-data-name">{item.dataName}</div>
                </li>
            {/each}
        </ul>
    </div>
{/if}

<style>
    .product-codes,
    .indicators,
    .conventional-info,
    .additional-data {
        margin: 10px 0;
        padding: 8px;
        background: #f5f5f5;
        border-radius: 4px;
    }

    .product-codes ul,
    .additional-data ul {
        margin: 5px 0;
        padding-left: 20px;
    }

    .indicators {
        display: flex;
        gap: 5px;
        flex-wrap: wrap;
    }

    .badge {
        background: #007bff;
        color: white;
        padding: 3px 8px;
        border-radius: 3px;
        font-size: 0.85em;
    }
    .badge-warning {
        background: #ffc107;
        color: #000;
    }
</style>

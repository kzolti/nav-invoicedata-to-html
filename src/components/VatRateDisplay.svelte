<script lang="ts">
    import type { VatRate } from "../osaTypes/dataTypes.js";

    export let vatRate: VatRate;
    export let t: (key: string) => string;
    export let nf: (val: any, decimals?: number) => string;
</script>

{#if vatRate.vatPercentage}
    {nf(vatRate.vatPercentage * 100)}%
{:else if vatRate.vatContent}
    {nf(vatRate.vatContent * 100)}%
{:else if vatRate.vatExemption}
    {t("vatExemption") || t("vatExempt")}: {vatRate.vatExemption.case}
{:else if vatRate.vatOutOfScope}
    {t("vatOutOfScope")}: {vatRate.vatOutOfScope.case}
{:else if vatRate.vatDomesticReverseCharge}
    {t("vatDomesticReverseCharge")}
{:else if vatRate.marginSchemeIndicator}
    {t("marginScheme")}: {t(vatRate.marginSchemeIndicator)}
{:else if vatRate.noVatCharge}
    {t("noVatCharge")}
{:else}
    {t("vatExempt")}
{/if}

{#if vatRate.vatAmountMismatch}
    <br /><small class="vat-mismatch-note">
        ⚠️ {t("vatAmountMismatch")}: {nf(
            vatRate.vatAmountMismatch.vatRate * 100,
        )}% ({vatRate.vatAmountMismatch.case})
    </small>
{/if}

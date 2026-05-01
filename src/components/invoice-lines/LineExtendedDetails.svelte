<script lang="ts">
    export let line: any;
    export let t: (key: string) => string;

    const asArray = <T,>(item: T | T[] | undefined): T[] =>
        Array.isArray(item) ? item : item ? [item] : [];
</script>

{#if line.aggregateInvoiceLineData}
    <div class="detail-section">
        <strong>{t("aggregateInvoiceLineData")}:</strong>
        {#if line.aggregateInvoiceLineData.lineDeliveryDate}
            <p>
                {t("deliveryDate")}: {line.aggregateInvoiceLineData
                    .lineDeliveryDate}
            </p>
        {/if}
        {#if line.aggregateInvoiceLineData.lineExchangeRate}
            <p>
                {t("exchangeRate")}: {line.aggregateInvoiceLineData
                    .lineExchangeRate}
            </p>
        {/if}
    </div>
{/if}

{#if line.lineModificationReference}
    <div class="detail-section">
        <strong>{t("lineModification")}:</strong>
        <p>
            {t("lineNumberReference")}: {line.lineModificationReference
                .lineNumberReference}
        </p>
        <p>
            {t("lineOperation")}: {t(
                line.lineModificationReference.lineOperation,
            )}
        </p>
    </div>
{/if}

{#if line.advanceData}
    <div class="detail-section">
        <strong>{t("advancePayment")}:</strong>
        {#if line.advanceData.advanceIndicator}
            <p>{t("advancePayment")}: {t("yes")}</p>
        {/if}
        {#if line.advanceData.advancePaymentData}
            <p>
                {t("originalInvoice")}: {line.advanceData.advancePaymentData
                    .advanceOriginalInvoice}
            </p>
            <p>
                {t("paymentDate")}: {line.advanceData.advancePaymentData
                    .advancePaymentDate}
            </p>
            {#if line.advanceData.advancePaymentData.advanceExchangeRate}
                <p>
                    {t("exchangeRate")}: {line.advanceData.advancePaymentData
                        .advanceExchangeRate}
                </p>
            {/if}
        {/if}
    </div>
{/if}

{#if line.referencesToOtherLines}
    <div class="detail-section">
        <strong>{t("referencesToOtherLines")}:</strong>
        {asArray(line.referencesToOtherLines.referenceToOtherLine).join(", ")}
    </div>
{/if}

{#if line.productFeeClause}
    <div class="detail-section">
        {#if line.productFeeClause.productFeeTakeoverData}
            <p><strong>{t("productFeeTakeoverData")}:</strong></p>
            <p>
                {t("takeoverReason")}: {t(
                    line.productFeeClause.productFeeTakeoverData.takeoverReason,
                )}
            </p>
            {#if line.productFeeClause.productFeeTakeoverData.takeoverAmount}
                <p>
                    {t("amount")}: {line.productFeeClause.productFeeTakeoverData
                        .takeoverAmount} HUF
                </p>
            {/if}
        {/if}
        {#if line.productFeeClause.customerDeclaration}
            <p><strong>{t("customerDeclaration")}:</strong></p>
            <p>
                {t("productStream")}: {t(
                    line.productFeeClause.customerDeclaration.productStream,
                )}
            </p>
            {#if line.productFeeClause.customerDeclaration.productFeeWeight}
                <p>
                    {t("weight")}: {line.productFeeClause.customerDeclaration
                        .productFeeWeight} kg
                </p>
            {/if}
        {/if}
    </div>
{/if}

{#if line.newTransportMean}
    <div class="detail-section">
        <strong>{t("newTransportMean")}:</strong>
        {#if line.newTransportMean.vehicle}
            <p>
                {t("engineCapacity")}: {line.newTransportMean.vehicle
                    .engineCapacity} cm³
            </p>
            <p>
                {t("enginePower")}: {line.newTransportMean.vehicle.enginePower} kW
            </p>
            <p>{t("kms")}: {line.newTransportMean.vehicle.kms} km</p>
        {/if}
        {#if line.newTransportMean.vessel}
            <p>{t("length")}: {line.newTransportMean.vessel.length} m</p>
            <p>
                {t("sailedHours")}: {line.newTransportMean.vessel.sailedHours} h
            </p>
        {/if}
        {#if line.newTransportMean.aircraft}
            <p>
                {t("takeOffWeight")}: {line.newTransportMean.aircraft
                    .takeOffWeight} kg
            </p>
            <p>
                {t("airCraftOperation")}: {t(
                    line.newTransportMean.aircraft.airCraftOperation,
                )}
            </p>
        {/if}
    </div>
{/if}

{#if line.GPCExcise != null && line.GPCExcise != 0}
    <div class="detail-section">
        <strong>{t("GPCExcise")}:</strong>
        <p>{line.GPCExcise} HUF</p>
    </div>
{/if}

{#if line.dieselOilPurchase}
    <div class="detail-section">
        <strong>{t("dieselOilPurchase")}:</strong>
        <p>
            {t("purchaseLocation")}: {line.dieselOilPurchase.purchaseLocation}
        </p>
        <p>{t("purchaseDate")}: {line.dieselOilPurchase.purchaseDate}</p>
        <p>
            {t("vehicleRegistrationNumber")}: {line.dieselOilPurchase
                .vehicleRegistrationNumber}
        </p>
        <p>
            {t("dieselOilQuantity")}: {line.dieselOilPurchase.dieselOilQuantity}
            L
        </p>
    </div>
{/if}

<style>
    .detail-section {
        background: #f9f9f9;
        padding: 10px;
        margin: 5px 0;
        border-left: 3px solid #007bff;
    }

    .detail-section p {
        margin: 3px 0;
    }
</style>

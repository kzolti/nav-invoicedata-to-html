<script lang="ts">
    import type { InvoiceHead } from "../osaTypes/dataTypes.js";
    import type { AddressType } from "../osaTypes/baseTypes.js";

    export let data: InvoiceHead;
    export let t: (key: string) => string;
    export let nf: (val: any, decimals?: number) => string;

    // Helper to ensure array
    const asArray = <T,>(item: T | T[] | undefined): T[] =>
        Array.isArray(item) ? item : item ? [item] : [];

    // Helper to get a formatted one-liner from either address variant
    const getAddressLine1 = (addr: AddressType | undefined): string => {
        if (!addr) return "";
        if (addr.detailedAddress) {
            const a = addr.detailedAddress;
            return `${a.postalCode} ${a.city}, ${a.streetName} ${a.publicPlaceCategory}${a.number ? " " + a.number : ""}`;
        }
        if (addr.simpleAddress) {
            const a = addr.simpleAddress;
            return `${a.postalCode} ${a.city}, ${a.additionalAddressDetail}`;
        }
        return "";
    };

    const getAddressFloor = (addr: AddressType | undefined): string => {
        if (!addr?.detailedAddress?.floor) return "";
        const a = addr.detailedAddress;
        return `${t("floor")}: ${a.floor}, ${t("door")}: ${a.door ?? ""}`;
    };

    const formatTaxNumber = (tn: any): string => {
        if (!tn || !tn.taxpayerId) return "";
        const parts = [tn.taxpayerId];
        if (tn.vatCode) parts.push(tn.vatCode);
        if (tn.countyCode) parts.push(tn.countyCode);
        return parts.join("-");
    };
</script>

<div class="invoice-head">
    <div class="parties">
        <!-- Supplier -->
        <div class="party supplier">
            <h3>{t("supplier")}</h3>
            <p><strong>{data.supplierInfo.supplierName}</strong></p>
            <p>
                {t("taxNumber")}: {formatTaxNumber(data.supplierInfo.supplierTaxNumber)}
            </p>
            {#if data.supplierInfo.communityVatNumber}
                <p>
                    {t("communityVatNumber")}: {data.supplierInfo
                        .communityVatNumber}
                </p>
            {/if}
            {#if data.supplierInfo.groupMemberTaxNumber}
                <p>
                    {t("groupMemberTaxNumber")}: {formatTaxNumber(data.supplierInfo.groupMemberTaxNumber)}
                </p>
            {/if}

            <div class="address">
                <p>{getAddressLine1(data.supplierInfo.supplierAddress)}</p>
                {#if getAddressFloor(data.supplierInfo.supplierAddress)}
                    <p>{getAddressFloor(data.supplierInfo.supplierAddress)}</p>
                {/if}
            </div>

            {#if data.supplierInfo.supplierBankAccountNumber}
                <p>
                    {t("bankAccount")}: {data.supplierInfo
                        .supplierBankAccountNumber}
                </p>
            {/if}
            {#if data.supplierInfo.individualExemption}
                <p>
                    {t("individualExemption")}: {data.supplierInfo
                        .individualExemption}
                </p>
            {/if}
            {#if data.supplierInfo.exciseLicenceNum}
                <p>
                    {t("exciseLicenceNum")}: {data.supplierInfo
                        .exciseLicenceNum}
                </p>
            {/if}
        </div>

        <!-- Customer -->
        <div class="party customer">
            <h3>{t("customer")}</h3>
            {#if data.customerInfo}
                <p><strong>{data.customerInfo.customerName}</strong></p>
                {#if data.customerInfo.customerVatData && data.customerInfo.customerVatData.customerTaxNumber}
                    <p>
                        {t("taxNumber")}: {formatTaxNumber(data.customerInfo.customerVatData.customerTaxNumber)}
                    </p>
                {/if}
                {#if data.customerInfo.customerVatData && data.customerInfo.customerVatData.communityVatNumber}
                    <p>
                        {t("communityVatNumber")}: {data.customerInfo
                            .customerVatData.communityVatNumber}
                    </p>
                {/if}
                {#if data.customerInfo.customerVatData && data.customerInfo.customerVatData.thirdStateTaxId}
                    <p>
                        {t("thirdStateTaxId")}: {data.customerInfo
                            .customerVatData.thirdStateTaxId}
                    </p>
                {/if}
                <p>
                    {t("vatStatus")}: {t(data.customerInfo.customerVatStatus)}
                </p>

                {#if data.customerInfo.customerAddress}
                    <div class="address">
                        <p>
                            {getAddressLine1(data.customerInfo.customerAddress)}
                        </p>
                        {#if getAddressFloor(data.customerInfo.customerAddress)}
                            <p>
                                {getAddressFloor(
                                    data.customerInfo.customerAddress,
                                )}
                            </p>
                        {/if}
                    </div>
                {/if}
                {#if data.customerInfo.customerBankAccountNumber}
                    <p>
                        {t("bankAccount")}: {data.customerInfo
                            .customerBankAccountNumber}
                    </p>
                {/if}
            {:else}
                <p>{t("noCustomerInfo")}</p>
            {/if}
        </div>

        <!-- Fiscal Representative -->
        {#if data.fiscalRepresentativeInfo}
            <div class="party fiscal-rep">
                <h3>{t("fiscalRepresentative")}</h3>
                <p>
                    <strong
                        >{data.fiscalRepresentativeInfo
                            .fiscalRepresentativeName}</strong
                    >
                </p>
                <p>
                    {t("taxNumber")}: {formatTaxNumber(data.fiscalRepresentativeInfo.fiscalRepresentativeTaxNumber)}
                </p>
                <div class="address">
                    <p>
                        {getAddressLine1(
                            data.fiscalRepresentativeInfo
                                .fiscalRepresentativeAddress,
                        )}
                    </p>
                    {#if getAddressFloor(data.fiscalRepresentativeInfo.fiscalRepresentativeAddress)}
                        <p>
                            {getAddressFloor(
                                data.fiscalRepresentativeInfo
                                    .fiscalRepresentativeAddress,
                            )}
                        </p>
                    {/if}
                </div>
                {#if data.fiscalRepresentativeInfo.fiscalRepresentativeBankAccountNumber}
                    <p>
                        {t("bankAccount")}: {data.fiscalRepresentativeInfo
                            .fiscalRepresentativeBankAccountNumber}
                    </p>
                {/if}
            </div>
        {/if}
    </div>

    <!-- Invoice Details -->
    <div class="invoice-details">
        <h3>{t("invoiceDetails")}</h3>
        <div class="details-grid">
            <div class="detail-item">
                <strong>{t("invoiceCategory")}:</strong>
                {t(data.invoiceDetail.invoiceCategory)}
            </div>
            <div class="detail-item">
                <strong>{t("invoiceDeliveryDate")}:</strong>
                {data.invoiceDetail.invoiceDeliveryDate}
            </div>
            {#if data.invoiceDetail.invoiceDeliveryPeriodStart}
                <div class="detail-item">
                    <strong>{t("deliveryPeriod")}:</strong>
                    {data.invoiceDetail.invoiceDeliveryPeriodStart} - {data
                        .invoiceDetail.invoiceDeliveryPeriodEnd}
                </div>
            {/if}
            {#if data.invoiceDetail.invoiceAccountingDeliveryDate}
                <div class="detail-item">
                    <strong>{t("accountingDeliveryDate")}:</strong>
                    {data.invoiceDetail.invoiceAccountingDeliveryDate}
                </div>
            {/if}

            <div class="detail-item">
                <strong>{t("currency")}:</strong>
                {data.invoiceDetail.currencyCode}
            </div>
            <div class="detail-item">
                <strong>{t("exchangeRate")}:</strong>
                {nf(data.invoiceDetail.exchangeRate)}
            </div>

            {#if data.invoiceDetail.paymentMethod}
                <div class="detail-item">
                    <strong>{t("paymentMethod")}:</strong>
                    {t(data.invoiceDetail.paymentMethod)}
                </div>
            {/if}
            {#if data.invoiceDetail.paymentDate}
                <div class="detail-item">
                    <strong>{t("paymentDate")}:</strong>
                    {data.invoiceDetail.paymentDate}
                </div>
            {/if}

            <div class="detail-item">
                <strong>{t("appearance")}:</strong>
                {t(data.invoiceDetail.invoiceAppearance)}
            </div>
        </div>

        <!-- Indicators -->
        <div class="indicators">
            {#if data.invoiceDetail.smallBusinessIndicator}
                <span class="tag">{t("smallBusiness")}</span>
            {/if}
            {#if data.invoiceDetail.periodicalSettlement}
                <span class="tag">{t("periodicalSettlement")}</span>
            {/if}
            {#if data.invoiceDetail.cashAccountingIndicator}
                <span class="tag">{t("cashAccounting")}</span>
            {/if}
            {#if data.invoiceDetail.selfBillingIndicator}
                <span class="tag">{t("selfBilling")}</span>
            {/if}
            {#if data.invoiceDetail.utilitySettlementIndicator}
                <span class="tag">{t("utilitySettlement")}</span>
            {/if}
        </div>

        <!-- Conventional Info (Orders, Contracts, etc.) -->
        {#if data.invoiceDetail.conventionalInvoiceInfo}
            <div class="conventional-info">
                {#if data.invoiceDetail.conventionalInvoiceInfo.orderNumbers}
                    <p>
                        <strong>{t("orderNumbers")}:</strong>
                        {asArray(
                            data.invoiceDetail.conventionalInvoiceInfo
                                .orderNumbers.orderNumber,
                        ).join(", ")}
                    </p>
                {/if}
                {#if data.invoiceDetail.conventionalInvoiceInfo.deliveryNotes}
                    <p>
                        <strong>{t("deliveryNotes")}:</strong>
                        {asArray(
                            data.invoiceDetail.conventionalInvoiceInfo
                                .deliveryNotes.deliveryNote,
                        ).join(", ")}
                    </p>
                {/if}
                {#if data.invoiceDetail.conventionalInvoiceInfo.contractNumbers}
                    <p>
                        <strong>{t("contractNumbers")}:</strong>
                        {asArray(
                            data.invoiceDetail.conventionalInvoiceInfo
                                .contractNumbers.contractNumber,
                        ).join(", ")}
                    </p>
                {/if}
                {#if data.invoiceDetail.conventionalInvoiceInfo.ekaerIds}
                    <p>
                        <strong>{t("ekaerIds")}:</strong>
                        {asArray(
                            data.invoiceDetail.conventionalInvoiceInfo.ekaerIds
                                .ekaerId,
                        ).join(", ")}
                    </p>
                {/if}
                {#if data.invoiceDetail.conventionalInvoiceInfo.shippingDates}
                    <p>
                        <strong>{t("shippingDates")}:</strong>
                        {asArray(
                            data.invoiceDetail.conventionalInvoiceInfo
                                .shippingDates.shippingDate,
                        ).join(", ")}
                    </p>
                {/if}
                {#if data.invoiceDetail.conventionalInvoiceInfo.supplierCompanyCodes}
                    <p>
                        <strong>{t("supplierCompanyCodes")}:</strong>
                        {asArray(
                            data.invoiceDetail.conventionalInvoiceInfo
                                .supplierCompanyCodes.supplierCompanyCode,
                        ).join(", ")}
                    </p>
                {/if}
                {#if data.invoiceDetail.conventionalInvoiceInfo.customerCompanyCodes}
                    <p>
                        <strong>{t("customerCompanyCodes")}:</strong>
                        {asArray(
                            data.invoiceDetail.conventionalInvoiceInfo
                                .customerCompanyCodes.customerCompanyCode,
                        ).join(", ")}
                    </p>
                {/if}
                {#if data.invoiceDetail.conventionalInvoiceInfo.dealerCodes}
                    <p>
                        <strong>{t("dealerCodes")}:</strong>
                        {asArray(
                            data.invoiceDetail.conventionalInvoiceInfo
                                .dealerCodes.dealerCode,
                        ).join(", ")}
                    </p>
                {/if}
                {#if data.invoiceDetail.conventionalInvoiceInfo.costCenters}
                    <p>
                        <strong>{t("costCenters")}:</strong>
                        {asArray(
                            data.invoiceDetail.conventionalInvoiceInfo
                                .costCenters.costCenter,
                        ).join(", ")}
                    </p>
                {/if}
                {#if data.invoiceDetail.conventionalInvoiceInfo.projectNumbers}
                    <p>
                        <strong>{t("projectNumbers")}:</strong>
                        {asArray(
                            data.invoiceDetail.conventionalInvoiceInfo
                                .projectNumbers.projectNumber,
                        ).join(", ")}
                    </p>
                {/if}
                {#if data.invoiceDetail.conventionalInvoiceInfo.generalLedgerAccountNumbers}
                    <p>
                        <strong>{t("generalLedgerAccountNumbers")}:</strong>
                        {asArray(
                            data.invoiceDetail.conventionalInvoiceInfo
                                .generalLedgerAccountNumbers
                                .generalLedgerAccountNumber,
                        ).join(", ")}
                    </p>
                {/if}
                {#if data.invoiceDetail.conventionalInvoiceInfo.glnNumbersSupplier}
                    <p>
                        <strong>{t("glnNumbersSupplier")}:</strong>
                        {asArray(
                            data.invoiceDetail.conventionalInvoiceInfo
                                .glnNumbersSupplier.glnNumber,
                        ).join(", ")}
                    </p>
                {/if}
                {#if data.invoiceDetail.conventionalInvoiceInfo.glnNumbersCustomer}
                    <p>
                        <strong>{t("glnNumbersCustomer")}:</strong>
                        {asArray(
                            data.invoiceDetail.conventionalInvoiceInfo
                                .glnNumbersCustomer.glnNumber,
                        ).join(", ")}
                    </p>
                {/if}
                {#if data.invoiceDetail.conventionalInvoiceInfo.materialNumbers}
                    <p>
                        <strong>{t("materialNumbers")}:</strong>
                        {asArray(
                            data.invoiceDetail.conventionalInvoiceInfo
                                .materialNumbers.materialNumber,
                        ).join(", ")}
                    </p>
                {/if}
                {#if data.invoiceDetail.conventionalInvoiceInfo.itemNumbers}
                    <p>
                        <strong>{t("itemNumbers")}:</strong>
                        {asArray(
                            data.invoiceDetail.conventionalInvoiceInfo
                                .itemNumbers.itemNumber,
                        ).join(", ")}
                    </p>
                {/if}
            </div>
        {/if}

        <!-- Additional Data -->
        {#if data.invoiceDetail.additionalInvoiceData}
            <div class="additional-data">
                <h4>{t("additionalData")}</h4>
                <ul>
                    {#each Array.isArray(data.invoiceDetail.additionalInvoiceData) ? data.invoiceDetail.additionalInvoiceData : [data.invoiceDetail.additionalInvoiceData] as item}
                        <li>
                            <div class="add-data-left">
                                <strong>{item.dataDescription}:</strong>
                                <span class="add-data-value"
                                    >{item.dataValue}</span
                                >
                            </div>
                            <div class="add-data-name">{item.dataName}</div>
                        </li>
                    {/each}
                </ul>
            </div>
        {/if}
    </div>
</div>

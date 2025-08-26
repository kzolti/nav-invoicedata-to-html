/**
 * Interface definitions for the Hungarian Online Invoice System (Magyar Online Számla Rendszer)
 * Based on the XML schema version 3.0 from 2020/11/23
 */
import { InvoiceCategoryType } from "./baseTypes";
import { AddressType, SimpleAddressType } from "./invoiceBaseTypes";

/**
 * XML root element, számla vagy módosítás adatait leíró típus, amelyet BASE64 kódoltan tartalmaz az invoiceApi sémaleíró invoiceData elementje
 * XML root element, invoice or modification data type in BASE64 encoding, equivalent with the invoiceApi schema definition's invoiceData element
 */
interface InvoiceData {
    invoiceNumber: string;
    invoiceIssueDate: string;
    completenessIndicator: boolean;
    invoiceMain: InvoiceMain;
}

/**
 * Számlaadatok leírására szolgáló közös típus
 * A common type to describe invoice information
 */
interface InvoiceMain {
    invoice?: Invoice;
    batchInvoice?: BatchInvoice[];
}

/**
 * Kötegelt módosító okirat adatai
 * Data of a batch of modification documents
 */
interface BatchInvoice {
    batchIndex: number;
    invoice: Invoice;
}

/**
 * Egy számla vagy módosító okirat adatai
 * Data of a single invoice or modification document
 */
interface Invoice {
    invoiceReference?: InvoiceReference;
    invoiceHead: InvoiceHead;
    invoiceLines?: Lines;
    productFeeSummary?: ProductFeeSummary[];
    invoiceSummary: Summary;
}

/**
 * A módosítás vagy érvénytelenítés hivatkozási adatai
 * Modification or cancellation reference data
 */
interface InvoiceReference {
    /**
     * Az eredeti számla sorszáma, melyre a módosítás vonatkozik  - ÁFA tv. 170. § (1) c)
     * Sequence number of the original invoice, on which the modification occurs - section 170 (1) c) of the VAT law
     */
    originalInvoiceNumber: string;
    /**
     * Annak jelzése, hogy a módosítás olyan alapszámlára hivatkozik, amelyről nem történt és nem is fog történni adatszolgáltatás
     * Indicates whether the modification references to an original invoice which is not and will not be exchanged
     */
    modifyWithoutMaster: boolean;
    /**
     * A számlára vonatkozó módosító okirat egyedi sorszáma
     * The unique sequence number referring to the original invoice
     */
    modificationIndex: number;
}

/**
 * Számla fejléc adatai
 * Data in header of invoice
 */
interface InvoiceHead {
    /**
     * Számla kibocsátó (eladó) adatai
     * Data related to the issuer of the invoice (supplier)
     */
    supplierInfo: SupplierInfo;
    /**
     * Vevő adatai
     * Data related to the customer
     */
    customerInfo?: CustomerInfo;
    /**
     * Pénzügyi képviselő adatai
     * Data related to the fiscal representative
     */
    fiscalRepresentativeInfo?: FiscalRepresentative;
    /**
     * Számla részletező adatok
     * Invoice detail data
     */
    invoiceDetail: InvoiceDetail;
}

/**
 * A szállító (eladó) adatai
 * Invoice supplier (seller) data
 */
interface SupplierInfo {
    /**
     * Belföldi adószám vagy csoportazonosító szám
     * Tax number or group identification number
     */
    supplierTaxNumber: string;
    /**
     * Csoport tag adószáma, ha a termékbeszerzés vagy szolgáltatás nyújtása csoportazonosító szám alatt történt
     * Tax number of group member, when the supply of goods or services is done under group identification number
     */
    groupMemberTaxNumber?: string;
    /**
     * Közösségi adószám
     * Community tax number
     */
    communityVatNumber?: string;
    /**
     * Az eladó (szállító) neve
     * Name of the seller (supplier)
     */
    supplierName: string;
    /**
     * Az eladó (szállító) címe
     * Address of the seller (supplier)
     */
    supplierAddress: Address;
    /**
     * Az eladó (szállító) bankszámlaszáma
     * Bank account number of the seller (supplier)
     */
    supplierBankAccountNumber?: string;
    /**
     * Értéke true, amennyiben az eladó (szállító) alanyi ÁFA mentes
     * Value is true if the seller (supplier) is individually exempted from VAT
     */
    individualExemption?: boolean;
    /**
     * Az eladó adóraktári engedélyének vagy jövedéki engedélyének száma (2016. évi LXVIII. tv.)
     * Number of supplier’s tax warehouse license or excise license (Act LXVIII of 2016)
     */
    exciseLicenceNum?: string;
}

/**
 * A vevő adatai
 * Customer data
 */
interface CustomerInfo {
    /**
     * Vevő ÁFA szerinti státusza
     * Customers status by VAT
     */
    customerVatStatus: CustomerVatStatusType;
    /**
     * A vevő ÁFA alanyisági adatai
     * VAT subjectivity data of the customer
     */
    customerVatData?: CustomerVatData;
    /**
     * A vevő neve
     * Name of the customer
     */
    customerName?: string;
    /**
     * A vevő címe
     * Address of the customer
     */
    customerAddress?: Address;
    /**
     * Vevő bankszámlaszáma
     * Bank account number of the customer
     */
    customerBankAccountNumber?: string;
}

/**
 * Vevő ÁFA szerinti státusz típusa
 * Customers status type by VAT
 */
type CustomerVatStatusType = 'DOMESTIC' | 'OTHER' | 'PRIVATE_PERSON';

/**
 * A vevő ÁFA alanyisági adatai
 * VAT subjectivity data of the customer
 */
interface CustomerVatData {
    customerTaxNumber?: CustomerTaxNumber;
    communityVatNumber?: string;
    thirdStateTaxId?: string;
}

/**
 * Adószám, amely alatt a számlán szereplő termékbeszerzés vagy szolgáltatás igénybevétele történt. Lehet csoportazonosító szám is
 * Tax number or group identification number, under which the purchase of goods or services is done
 */
interface CustomerTaxNumber {
    /**
     * Csoport tag adószáma, ha a termékbeszerzés vagy szolgáltatás igénybevétele csoportazonosító szám alatt történt
     * Tax number of group member, when the purchase of goods or services is done under group identification number
     */
    groupMemberTaxNumber?: string;
}

/**
 * A pénzügyi képviselő adatai
 * Fiscal representative data
 */
interface FiscalRepresentative {
    /**
     * A pénzügyi képviselő adószáma
     * Tax number of the fiscal representative
     */
    fiscalRepresentativeTaxNumber: string;
    /**
     * A pénzügyi képviselő neve
     * Name of the fiscal representative
     */
    fiscalRepresentativeName: string;
    /**
     * Pénzügyi képviselő címe
     * Address of the fiscal representative
     */
    fiscalRepresentativeAddress: Address;
    /**
     * Pénzügyi képviselő által a számla kibocsátó (eladó) számára megnyitott bankszámla bankszámlaszáma
     * Bank account number opened by the fiscal representative for the issuer of the invoice (supplier)
     */
    fiscalRepresentativeBankAccountNumber?: string;
}

type Address = AddressType;

/**
 * Számla részletező adatok
 * Invoice detail data
 */
interface InvoiceDetail {
    /**
     * A számla típusa, módosító okirat esetén az eredeti számla típusa
     * Type of invoice. In case of modification document the type of original invoice
     */
    invoiceCategory: InvoiceCategoryType;
    /**
     * Teljesítés dátuma (ha nem szerepel a számlán, akkor azonos a számla keltével) - ÁFA tv. 169. § g)
     * Delivery date (if this field does not exist on the invoice, the date of the invoice should be considered as such) - section 169 (g) of the VAT law
     */
    invoiceDeliveryDate: string;
    /**
     * Amennyiben a számla egy időszakra vonatkozik, akkor az időszak első napja
     * The first day of the delivery, if the invoice delivery is a period
     */
    invoiceDeliveryPeriodStart?: string;
    /**
     * Amennyiben a számla egy időszakra vonatkozik, akkor az időszak utolsó napja
     * The last day of the delivery, if the invoice delivery is a period
     */
    invoiceDeliveryPeriodEnd?: string;
    /**
     * Számviteli teljesítés dátuma. Időszak esetén az időszak utolsó napja
     * Date of accounting accomplishment. In the event of a period, the last day of the period
     */
    invoiceAccountingDeliveryDate?: string;
    /**
     * Annak jelzése, ha a felek a termékértékesítés, szolgáltatás nyújtás során időszakonkénti elszámolásban vagy fizetésben állapodnak meg, vagy a termékértékesítés, szolgáltatás nyújtás ellenértékét meghatározott időpontra állapítják meg.
     * Indicates where by agreement of the parties it gives rise to successive statements of account or successive payments relating to the supply of goods, or the supply of services, or if the consideration agreed upon for such goods and/or services applies to specific periods.
     */
    periodicalSettlement?: boolean;
    /**
     * Kisadózó jelzése
     * Marking of low tax-bracket enterprise
     */
    smallBusinessIndicator?: boolean;
    /**
     * A számla pénzneme az ISO 4217 szabvány szerint
     * ISO 4217 currency code on the invoice
     */
    currencyCode: string;
    /**
     * HUF-tól különböző pénznem esetén az alkalmazott árfolyam: egy egység értéke HUF-ban
     * In case any currency is used other than HUF, the applied exchange rate should be mentioned: 1 unit of the foreign currency expressed in HUF
     */
    exchangeRate: number;
    /**
     * Közmű elszámoló számla jelölése (2013.évi CLXXXVIII törvény szerinti elszámoló számla)
     * Marking the fact of utility settlement invoice (invoice according to Act CLXXXVIII of 2013)
     */
    utilitySettlementIndicator?: boolean;
    /**
     * Önszámlázás jelölése (önszámlázás esetén true)
     * Marking the fact of self-billing (in the case of self-billing the value is true)
     */
    selfBillingIndicator?: boolean;
    /**
     * Fizetés módja
     * Method of payment
     */
    paymentMethod?: string;
    /**
     * Fizetési határidő
     * Deadline for payment
     */
    paymentDate?: string;
    /**
     * Pénzforgalmi elszámolás jelölése, ha az szerepel a számlán - ÁFA tv. 169. § h). Értéke true pénzforgalmi elszámolás esetén
     * Marking the fact of cash accounting if this is indicated on the invoice - section 169 (h) of the VAT law. The value is true in case of cash accounting
     */
    cashAccountingIndicator?: boolean;
    /**
     * A számla vagy módosító okirat megjelenési formája
     * Form of appearance of the invoice or modification document
     */
    invoiceAppearance: string;
    /**
     * A számlafeldolgozást segítő, egyezményesen nevesített egyéb adatok
     * Other conventionally named data to assist in invoice processing
     */
    conventionalInvoiceInfo?: ConventionalInvoiceInfo;
    /**
     * A számlára vonatkozó egyéb adat
     * Other data in relation to the invoice
     */
    additionalInvoiceData?: AdditionalData[];
}

/**
 * A számlafeldolgozást segítő, egyezményesen nevesített egyéb adatok
 * Other conventionally named data to assist in invoice processing
 */
interface ConventionalInvoiceInfo {
    /**
     * Megrendelésszám(ok)
     * Order numbers
     */
    orderNumbers?: OrderNumbers;
    /**
     * Szállítólevél szám(ok)
     * Delivery notes
     */
    deliveryNotes?: DeliveryNotes;
    /**
     * Szállítási dátum(ok)
     * Shipping dates
     */
    shippingDates?: ShippingDates;
    /**
     * Szerződésszám(ok)
     * Contract numbers
     */
    contractNumbers?: ContractNumbers;
    /**
     * Az eladó vállalati kódja(i)
     * Company codes of the supplier
     */
    supplierCompanyCodes?: SupplierCompanyCodes;
    /**
     * A vevő vállalati kódja(i)
     * Company codes of the customer
     */
    customerCompanyCodes?: CustomerCompanyCodes;
    /**
     * Beszállító kód(ok)
     * Dealer codes
     */
    dealerCodes?: DealerCodes;
    /**
     * Költséghely(ek)
     * Cost centers
     */
    costCenters?: CostCenters;
    /**
     * Projektszám(ok)
     * Project numbers
     */
    projectNumbers?: ProjectNumbers;
    /**
     * Főkönyvi számlaszám(ok)
     * General ledger account numbers
     */
    generalLedgerAccountNumbers?: GeneralLedgerAccountNumbers;
    /**
     * Kiállítói globális helyazonosító szám(ok)
     * Supplier's global location numbers
     */
    glnNumbersSupplier?: GlnNumbers;
    /**
     * Vevői globális helyazonosító szám(ok)
     * Customer's global location numbers
     */
    glnNumbersCustomer?: GlnNumbers;
    /**
     * Anyagszám(ok)
     * Material numbers
     */
    materialNumbers?: MaterialNumbers;
    /**
     * Cikkszám(ok)
     * Item number(s)
     */
    itemNumbers?: ItemNumbers;
    /**
     * EKÁER azonosító(k)
     * EKAER ID-s
     */
    ekaerIds?: EkaerIds;
}

interface OrderNumbers {
    orderNumber: string[];
}

interface DeliveryNotes {
    deliveryNote: string[];
}

interface ShippingDates {
    shippingDate: string[];
}

interface ContractNumbers {
    contractNumber: string[];
}

interface SupplierCompanyCodes {
    supplierCompanyCode: string[];
}

interface CustomerCompanyCodes {
    customerCompanyCode: string[];
}

interface DealerCodes {
    dealerCode: string[];
}

interface CostCenters {
    costCenter: string[];
}

interface ProjectNumbers {
    projectNumber: string[];
}

interface GeneralLedgerAccountNumbers {
    generalLedgerAccountNumber: string[];
}

interface GlnNumbers {
    glnNumber: string[];
}

interface MaterialNumbers {
    materialNumber: string[];
}

interface ItemNumbers {
    itemNumber: string[];
}

interface EkaerIds {
    ekaerId: string[];
}

/**
 * További adat leírására szolgáló típus
 * Type for additional data description
 */
interface AdditionalData {
    /**
     * Az adatmező egyedi azonosítója
     * Unique identification of the data field
     */
    dataName: string;
    /**
     * Az adatmező tartalmának szöveges leírása
     * Description of content of the data field
     */
    dataDescription: string;
    /**
     * Az adat értéke
     * Value of the data
     */
    dataValue: string;
}

/**
 * Termék/szolgáltatás tételek
 * Product / service items
 */
interface Lines {
    /**
     * Jelöli, ha az adatszolgáltatás méretcsökkentés miatt összevont soradatokat tartalmaz
     * Indicates whether the data exchange contains merged line data due to size reduction
     */
    mergedItemIndicator: boolean;
    line: Line[];
}

/**
 * A számla tételek (termék vagy szolgáltatás) adatait tartalmazó típus
 * Field type including data of invoice items (product or service)
 */
interface Line {
    /**
     * A tétel sorszáma
     * Sequential number of the item
     */
    lineNumber: number;
    /**
     * Módosításról történő adatszolgáltatás esetén a tételsor módosítás jellegének jelölése
     * Marking the goal of modification of the line (in the case of data supply about changes/updates only)
     */
    lineModificationReference?: LineModificationReference;
    /**
     * Hivatkozások kapcsolódó tételekre, ha ez az ÁFA törvény alapján szükséges
     * References to connected items if it is necessary according to VAT law
     */
    referencesToOtherLines?: ReferencesToOtherLines;
    /**
     * Előleghez kapcsolódó adatok
     * Advance related data
     */
    advanceData?: AdvanceData;
    /**
     * Termékkódok
     * Product codes
     */
    productCodes?: ProductCodes;
    /**
     * Értéke true, ha a tétel mennyiségi egysége természetes mértékegységben kifejezhető
     * The value is true if the unit of measure of the invoice item is expressible in natural unit
     */
    lineExpressionIndicator: boolean;
    /**
     * Adott tételsor termékértékesítés vagy szolgáltatás nyújtás jellegének jelzése
     * Indication of the nature of the supply of goods or services on a given line
     */
    lineNatureIndicator?: 'PRODUCT' | 'SERVICE' | 'OTHER';
    /**
     * A termék vagy szolgáltatás megnevezése
     * Name / description of the product or service
     */
    lineDescription?: string;
    /**
     * Mennyiség
     * Quantity
     */
    quantity?: number;
    /**
     * A számlán szereplő mennyiségi egység kanonikus kifejezése az interfész specifikáció szerint
     * Canonical representation of the unit of measure of the invoice, according to the interface specification
     */
    unitOfMeasure?: UnitOfMeasureType;
    /**
     * A számlán szereplő mennyiségi egység literális kifejezése
     * Literal unit of measure of the invoice
     */
    unitOfMeasureOwn?: string;
    /**
     * Egységár a számla pénznemében. Egyszerűsített számla esetén bruttó, egyéb esetben nettó egységár
     * Unit price expressed in the currency of the invoice In the event of simplified invoices gross unit price, in other cases net unit price
     */
    unitPrice?: number;
    /**
     * Egységár forintban
     * Unit price expressed in HUF
     */
    unitPriceHUF?: number;
    /**
     * A tételhez tartozó árengedmény adatok
     * Discount data in relation to the item
     */
    lineDiscountData?: DiscountData;
    /**
     * Normál (nem egyszerűsített) számla esetén (beleértve a gyűjtőszámlát) kitöltendő tétel érték adatok.
     * Item value data to be completed in case of normal (not simplified, but including aggregated) invoice
     */
    lineAmountsNormal?: LineAmountsNormal;
    /**
     * Egyszerűsített számla esetén kitöltendő tétel érték adatok
     * Item value data to be completed in case of simplified invoice
     */
    lineAmountsSimplified?: LineAmountsSimplified;
    /**
     * Értéke true ha a tétel közvetített szolgáltatás - Számviteli tv. 3.§ (4) 1
     * The value is true if the item is an intermediated service - paragraph (4) 1 of the Article 3 of Accounting Act
     */
    intermediatedService?: boolean;
    /**
     * Gyűjtő számla adatok
     * Aggregate invoice data
     */
    aggregateInvoiceLineData?: AggregateInvoiceLineData;
    /**
     * Új közlekedési eszköz értékesítés ÁFA tv. 89 § ill. 169 § o)
     * Supply of new means of transport - section 89 § and 169 (o) of the VAT law
     */
    newTransportMean?: NewTransportMean;
    /**
     * Értéke true, ha a tétel betétdíj jellegű
     * The value is true if the item is bottle/container deposit
     */
    depositIndicator?: boolean;
    /**
     * Értéke true ha a tételt termékdíj fizetési kötelezettség terheli
     * The value is true if the item is liable to product fee
     */
    obligatedForProductFee?: boolean;
    /**
     * Földgáz, villamos energia, szén jövedéki adója forintban - Jöt. 118. § (2)
     * Excise duty on natural gas, electricity and coal in Hungarian forints – paragraph (2), Section 118 of the Act on Excise Duties
     */
    GPCExcise?: number;
    /**
     * Gázolaj adózottan történő beszerzésének adatai – 45/2016 (XI. 29.) NGM rendelet 75. § (1) a)
     * Data of gas oil acquisition after taxation – point a), paragraph (1) of Section 75 of the NGM Decree No. 45/2016. (XI. 29.)
     */
    dieselOilPurchase?: DieselOilPurchase;
    /**
     * Értéke true, ha a Neta tv-ben meghatározott adókötelezettség az adó alanyát terheli. 2011. évi CIII. tv. 3.§(2)
     * Value is true, if the taxable person is liable for tax obligation determined in the Act on Public Health Product Tax (Neta tv.). Paragraph (2), Section 3 of the Act CIII of 2011
     */
    netaDeclaration?: boolean;
    /**
     * A környezetvédelmi termékdíjról szóló 2011. évi LXXXV. tv. szerinti, tételre vonatkozó záradékok
     * Clauses according to the Act LXXXV of 2011 on Environmental Protection Product Fee (related to the item)
     */
    productFeeClause?: ProductFeeClause;
    /**
     * A tétel termékdíj tartalmára vonatkozó adatok
     * Data on the content of the line's product charge
     */
    lineProductFeeContent?: ProductFeeData[];
    /**
     * A számlafeldolgozást segítő, egyezményesen nevesített egyéb adatok
     * Other conventionally named data to assist in invoice processing
     */
    conventionalLineInfo?: ConventionalInvoiceInfo;
    /**
     * A termék/szolgáltatás tételhez kapcsolódó, további adat
     * Other data in relation to the product / service item
     */
    additionalLineData?: AdditionalData[];
}

/**
 * Mennyiség egység típus
 * Unit of measure type
 */
type UnitOfMeasureType = 'PIECE' | 'KILOGRAM' | 'TON' | 'KWH' | 'DAY' | 'HOUR' | 'MINUTE' | 'MONTH' | 'LITER' | 'KILOMETER' | 'CUBIC_METER' | 'METER' | 'LINEAR_METER' | 'CARTON' | 'PACK' | 'OWN';

/**
 * Módosításról történő adatszolgáltatás esetén a tételsor módosítás jellegének jelölése
 * Marking the goal of modification of the line (in the case of data supply about changes/updates only)
 */
interface LineModificationReference {
    /**
     * Az eredeti számla módosítással érintett tételének sorszáma (lineNumber). Új tétel létrehozása esetén az új tétel sorszáma, a meglévő tételsorok számozásának folytatásaként
     * Line number of the original invoice, which the modification occurs with. In case of create operation the tag shall contain the new line number, as a sequential increment of the the existing lines set
     */
    lineNumberReference: number;
    /**
     * A számlatétel módosításának jellege
     * Line modification type
     */
    lineOperation: 'CREATE' | 'MODIFY';
}

/**
 * Hivatkozások kapcsolódó tételekre, ha ez az ÁFA törvény alapján szükséges
 * References to connected items if it is necessary according to VAT law
 */
interface ReferencesToOtherLines {
    /**
     * Hivatkozások kapcsolódó tételekre, ha ez az ÁFA törvény alapján szükséges
     * References to connected items if it is necessary according to VAT law
     */
    referenceToOtherLine: number[];
}

/**
 * Előleghez kapcsolódó adatok
 * Advance related data
 */
interface AdvanceData {
    /**
     * Értéke true, ha a számla tétel előleg jellegű
     * The value is true if the invoice item is a kind of advance charge
     */
    advanceIndicator: boolean;
    /**
     * Előleg fizetéshez kapcsolódó adatok
     * Advance payment related data
     */
    advancePaymentData?: AdvancePaymentData;
}

/**
 * Előlegfizetéshez kapcsolódó adatok
 * Advance payment related data
 */
interface AdvancePaymentData {
    /**
     * Az előlegszámlának a sorszáma, amelyben az előlegfizetés történt
     * Invoice number containing the advance payment
     */
    advanceOriginalInvoice: string;
    /**
     * Az előleg fizetésének dátuma
     * Payment date of the advance
     */
    advancePaymentDate: string;
    /**
     * Az előlegfizetés során alkalmazott árfolyam
     * Applied exchange rate of the advance
     */
    advanceExchangeRate: number;
}

/**
 * Termékkódok
 * Product codes
 */
interface ProductCodes {
    productCode: ProductCode[];
}

/**
 * Különböző termék- vagy szolgáltatáskódokat tartalmazó típus
 * Field type including the different product and service codes
 */
interface ProductCode {
    /**
     * A termékkód fajtájának (pl. VTSZ, CsK, stb.) jelölése
     * The kind of product code (f. ex. VTSZ, CsK, etc.)
     */
    productCodeCategory: ProductCodeCategoryType;
    /**
     * A termékkód értéke nem saját termékkód esetén
     * The value of (not own) product code
     */
    productCodeValue?: string;
    /**
     * Saját termékkód értéke
     * Own product code value
     */
    productCodeOwnValue?: string;
}

/**
 * A termékkód fajtájának jelölésére szolgáló típus
 * The type used to mark the kind of product code
 */
type ProductCodeCategoryType = 'VTSZ' | 'SZJ' | 'KN' | 'AHK' | 'CSK' | 'KT' | 'EJ' | 'TESZOR' | 'OWN' | 'OTHER';

/**
 * Árengedmény adatok
 * Discount data
 */
interface DiscountData {
    /**
     * Az árengedmény leírása
     * Description of the discount
     */
    discountDescription?: string;
    /**
     * Tételhez tartozó árengedmény összege a számla pénznemében, ha az egységár nem tartalmazza
     * Total amount of discount per item expressed in the currency of the invoice if not included in the unit price
     */
    discountValue?: number;
    /**
     * Tételhez tartozó árengedmény aránya, ha az egységár nem tartalmazza
     * Rate of discount per item expressed in the currency of the invoice if not included in the unit price
     */
    discountRate?: number;
}

/**
 * Normál vagy gyűjtő számla esetén kitöltendő tétel érték adatok
 * Item value data to be completed in case of normal or aggregate invoice
 */
interface LineAmountsNormal {
    /**
     * Tétel nettó adatok
     * Line net data
     */
    lineNetAmountData: LineNetAmountData;
    /**
     * Adómérték vagy adómentesség jelölése
     * Tax rate or tax exemption marking
     */
    lineVatRate: VatRate;
    /**
     * Tétel ÁFA adatok
     * Line VAT data
     */
    lineVatData?: LineVatData;
    /**
     * Tétel bruttó adatok
     * Line gross data
     */
    lineGrossAmountData?: LineGrossAmountData;
}

/**
 * Tétel nettó adatok
 * Line net data
 */
interface LineNetAmountData {
    /**
     * Tétel nettó összege a számla pénznemében. ÁFA tartalmú különbözeti adózás esetén az ellenérték áfa összegével csökkentett értéke a számla pénznemében.
     * Net amount of the item expressed in the currency of the invoice. In case of margin scheme taxation containing VAT, the amount of consideration reduced with the amount of VAT, expressed in the currency of the invoice.
     */
    lineNetAmount: number;
    /**
     * Tétel nettó összege forintban. ÁFA tartalmú különbözeti adózás esetén az ellenérték áfa összegével csökkentett értéke forintban.
     * Net amount of the item expressed in HUF. Net amount of the item expressed in the currency of the invoice. In case of margin scheme taxation containing VAT, the amount of consideration reduced with the amount of VAT, expressed in HUF.
     */
    lineNetAmountHUF: number;
}

/**
 * Az adómérték vagy az adómentes értékesítés jelölése
 * Marking tax rate or tax exempt supply
 */
interface VatRate {
    vatPercentage?: number;
    vatContent?: number;
    vatExemption?: DetailedReason;
    vatOutOfScope?: DetailedReason;
    vatDomesticReverseCharge?: boolean;
    marginSchemeIndicator?: MarginSchemeType;
    vatAmountMismatch?: VatAmountMismatch;
    noVatCharge?: boolean;
}

/**
 * Különbözet szerinti szabályozás típus
 * Field type for inputting margin-scheme taxation
 */
type MarginSchemeType = 'TRAVEL_AGENCY' | 'SECOND_HAND' | 'ARTWORK' | 'ANTIQUES';

/**
 * Mentesség, kivétel részletes indokolása
 * Detailed justification of exemption
 */
interface DetailedReason {
    /**
     * Az eset leírása kóddal
     * Case notation with code
     */
    case: string;
    /**
     * Az eset leírása szöveggel
     * Case notation with text
     */
    reason: string;
}

/**
 * Adóalap és felszámított adó eltérésének adatai
 * Data of mismatching tax base and levied tax
 */
interface VatAmountMismatch {
    /**
     * Adómérték, adótartalom
     * VAT rate, VAT content
     */
    vatRate: number;
    /**
     * Az eset leírása kóddal
     * Case notation with code
     */
    case: string;
}

/**
 * Tétel ÁFA adatok
 * Line VAT data
 */
interface LineVatData {
    /**
     * Tétel ÁFA összege a számla pénznemében
     * VAT amount of the item expressed in the currency of the invoice
     */
    lineVatAmount: number;
    /**
     * Tétel ÁFA összege forintban
     * VAT amount of the item expressed in HUF
     */
    lineVatAmountHUF: number;
}

/**
 * Tétel bruttó adatok
 * Line gross data
 */
interface LineGrossAmountData {
    /**
     * Tétel bruttó értéke a számla pénznemében. ÁFA tartalmú különbözeti adózás esetén az ellenérték.
     * Gross amount of the item expressed in the currency of the invoice. In case of margin scheme taxation containing VAT, the amount of consideration expressed in the currency of the invoice.
     */
    lineGrossAmountNormal: number;
    /**
     * Tétel bruttó értéke forintban
     * Gross amount of the item expressed in HUF
     */
    lineGrossAmountNormalHUF: number;
}

/**
 * Egyszerűsített számla esetén kitöltendő tétel érték adatok
 * Item value data to be completed in case of simplified invoice
 */
interface LineAmountsSimplified {
    /**
     * Adómérték vagy adómentesség jelölése
     * Tax rate or tax exemption marking
     */
    lineVatRate: VatRate;
    /**
     * Tétel bruttó értéke a számla pénznemében
     * Gross amount of the item expressed in the currency of the invoice
     */
    lineGrossAmountSimplified: number;
    /**
     * Tétel bruttó értéke forintban
     * Gross amount of the item expressed in HUF
     */
    lineGrossAmountSimplifiedHUF: number;
}

/**
 * Gyűjtő számla adatok
 * Aggregate invoice data
 */
interface AggregateInvoiceLineData {
    /**
     * A tételhez tartozó árfolyam, 1 (egy) egységre vonatkoztatva. Csak külföldi pénznemben kiállított gyűjtő számla esetén kitöltendő
     * The exchange rate applied to the item, pertaining to 1 (one) unit. This should be filled in only if an aggregate invoice in foreign currency is issued
     */
    lineExchangeRate?: number;
    /**
     * Gyűjtőszámla esetén az adott tétel teljesítési dátuma
     * Delivery date of the given item in the case of an aggregate invoice
     */
    lineDeliveryDate: string;
}

/**
 * Új közlekedési eszköz értékesítés ÁFA tv. 89 § ill. 169 § o)
 * Supply of new means of transport - section 89 § and 169 (o) of the VAT law
 */
interface NewTransportMean {
    brand?: string;
    serialNum?: string;
    engineNum?: string;
    firstEntryIntoService?: string;
    vehicle?: Vehicle;
    vessel?: Vessel;
    aircraft?: Aircraft;
}

/**
 * Szárazföldi közlekedési eszköz további adatai
 * Other data in relation to motorised land vehicle
 */
interface Vehicle {
    /**
     * Hengerűrtartalom köbcentiméterben
     * Engine capacity in cubic centimetre
     */
    engineCapacity: number;
    /**
     * Teljesítmény kW-ban
     * Engine power in kW
     */
    enginePower: number;
    /**
     * Futott kilométerek száma
     * Travelled distance in km
     */
    kms: number;
}

/**
 * Vízi jármű adatai
 * Data of vessel
 */
interface Vessel {
    /**
     * Hajó hossza méterben
     * Length of hull in metre
     */
    length: number;
    /**
     * Értéke true, ha a jármű az ÁFA tv. 259.§ 25. b) szerinti kivétel alá tartozik
     * The value is true if the means of transport is exempt from VAT as per section 259 [25] (b)
     */
    activityReferred: boolean;
    /**
     * Hajózott órák száma
     * Number of sailed hours
     */
    sailedHours: number;
}

/**
 * Légi közlekedési eszköz
 * Aircraft
 */
interface Aircraft {
    /**
     * Felszállási tömeg kilogrammban
     * Take-off weight in kilogram
     */
    takeOffWeight: number;
    /**
     * Értéke true ha a jármű az ÁFA tv. 259.§ 25. c) szerinti kivétel alá tartozik
     * The value is true if the means of transport is exempt from VAT as per section 259 [25] (c)
     */
    airCargo: boolean;
    /**
     * Repült órák száma
     * Number of aviated hours
     */
    operationHours: number;
}

/**
 * Gázolaj adózottan történő beszerzésének adatai – 45/2016 (XI. 29.) NGM rendelet 75. § (1) a)
 * Data of gas oil acquisition after taxation – point a), paragraph (1) of Section 75 of the NGM Decree No. 45/2016. (XI. 29.)
 */
interface DieselOilPurchase {
    /**
     * Gázolaj beszerzés helye
     * Place of purchase of the gas oil
     */
    purchaseLocation: SimpleAddress;
    /**
     * Gázolaj beszerzés dátuma
     * Date of purchase of gas oil
     */
    purchaseDate: string;
    /**
     * Kereskedelmi jármű forgalmi rendszáma (csak betűk és számok)
     * Registration number of vehicle (letters and numbers only)
     */
    vehicleRegistrationNumber: string;
    /**
     * Gépi bérmunka-szolgáltatás során felhasznált gázolaj mennyisége literben – Jöt. 117. § (2)
     * Fordítandó helyett: Quantity of diesel oil used for contract work and machinery hire service in liter – Act LXVIII of 2016 on Excise Tax section 117 (2)
     */
    dieselOilQuantity?: number;
}

type SimpleAddress = SimpleAddressType;

/**
 * A környezetvédelmi termékdíjról szóló 2011. évi LXXXV. tv. szerinti, tételre vonatkozó záradékok
 * Clauses according to the Act LXXXV of 2011 on Environmental Protection Product Fee (related to the item)
 */
interface ProductFeeClause {
    productFeeTakeoverData?: ProductFeeTakeoverData;
    customerDeclaration?: CustomerDeclaration;
}

/**
 * A környezetvédelmi termékdíj kötelezettség átvállalásával kapcsolatos adatok
 * Data in connection with takeover of environmental protection product fee
 */
interface ProductFeeTakeoverData {
    /**
     * Az átvállalás iránya és jogszabályi alapja
     * Direction and legal base of takeover
     */
    takeoverReason: TakeoverType;
    /**
     * Az átvállalt termékdíj összege forintban, ha a vevő vállalja át az eladó termékdíj-kötelezettségét
     * Amount in Hungarian forints of the product fee taken over if the purchaser takes over the supplier’s product fee liability
     */
    takeoverAmount?: number;
}

/**
 * Az átvállalás adatait tartalmazó típus
 * Field type for data of takeover
 */
type TakeoverType = '01' | '02_aa' | '02_ab' | '02_b' | '02_c' | '02_d' | '02_ea' | '02_eb' | '02_fa' | '02_fb' | '02_ga' | '02_gb';

/**
 * Ha az eladó a vevő nyilatkozata alapján mentesül a termékdíj megfizetése alól, akkor az érintett termékáram
 * Should the supplier, based on statement given by the purchaser, be exempted from paying product fee, then the product stream affected
 */
interface CustomerDeclaration {
    /**
     * Termékáram
     * Product stream
     */
    productStream: ProductStreamType;
    /**
     * Termékdíj köteles termék tömege kilogrammban
     * Weight of product fee obliged product in kilogram
     */
    productFeeWeight?: number;
}

/**
 * Termékáram típus
 * Product stream
 */
type ProductStreamType = 'BATTERY' | 'PACKAGING' | 'OTHER_PETROL' | 'ELECTRONIC' | 'TIRE' | 'COMMERCIAL' | 'PLASTIC' | 'OTHER_CHEMICAL' | 'PAPER';

/**
 * Termékdíj adatok
 * Product charges data
 */
interface ProductFeeData {
    /**
     * Termékdíj kód (Kt vagy Csk)
     * Product charges code (Kt or Csk code)
     */
    productFeeCode: ProductCode;
    /**
     * A termékdíjjal érintett termék mennyisége
     * Quantity of product, according to product charge
     */
    productFeeQuantity: number;
    /**
     * A díjtétel egysége (kg vagy darab)
     * Unit of the rate (kg or piece)
     */
    productFeeMeasuringUnit: 'DARAB' | 'KG';
    /**
     * A termékdíj díjtétele (HUF/egység)
     * Product fee rate (HUF/unit)
     */
    productFeeRate: number;
    /**
     * Termékdíj összege forintban
     * Amount in Hungarian forints of the product fee
     */
    productFeeAmount: number;
}

/**
 * Számla összesítés adatai
 * Data of calculation of invoice totals
 */
interface Summary {
    summaryNormal?: SummaryNormal;
    summarySimplified?: SummarySimplified[];
    summaryGrossData?: SummaryGrossData;
}

/**
 * Számla összesítés (nem egyszerűsített számla esetén)
 * Calculation of invoice totals (not simplified invoice)
 */
interface SummaryNormal {
    /**
     * Összesítés ÁFA-mérték szerint
     * Calculation of invoice totals per VAT rates
     */
    summaryByVatRate: SummaryByVatRate[];
    /**
     * A számla nettó összege a számla pénznemében
     * Net amount of the invoice expressed in the currency of the invoice
     */
    invoiceNetAmount: number;
    /**
     * A számla nettó összege forintban
     * Net amount of the invoice expressed in HUF
     */
    invoiceNetAmountHUF: number;
    /**
     * A számla ÁFA összege a számla pénznemében
     * VAT amount of the invoice expressed in the currency of the invoice
     */
    invoiceVatAmount: number;
    /**
     * A számla ÁFA összege forintban
     * VAT amount of the invoice expressed in HUF
     */
    invoiceVatAmountHUF: number;
}

/**
 * ÁFA mértékek szerinti összesítés
 * Summary according to VAT rates
 */
interface SummaryByVatRate {
    /**
     * Adómérték vagy adómentesség jelölése
     * Marking the tax rate or the fact of tax exemption
     */
    vatRate: VatRate;
    /**
     * Adott adómértékhez tartozó nettó adatok
     * Net data of given tax rate
     */
    vatRateNetData: VatRateNetData;
    /**
     * Adott adómértékhez tartozó ÁFA adatok
     * VAT data of given tax rate
     */
    vatRateVatData: VatRateVatData;
    /**
     * Adott adómértékhez tartozó bruttó adatok
     * Gross data of given tax rate
     */
    vatRateGrossData?: VatRateGrossData;
}

/**
 * Adott adómértékhez tartozó nettó adatok
 * Net data of given tax rate
 */
interface VatRateNetData {
    /**
     * Az adott adómértékhez tartozó értékesítés vagy szolgáltatásnyújtás nettó összege a számla pénznemében
     * Net amount of sales or service delivery under a given tax rate expressed in the currency of the invoice
     */
    vatRateNetAmount: number;
    /**
     * Az adott adómértékhez tartozó értékesítés vagy szolgáltatásnyújtás nettó összege forintban
     * Net amount of sales or service delivery under a given tax rate expressed in HUF
     */
    vatRateNetAmountHUF: number;
}

/**
 * Adott adómértékhez tartozó ÁFA adatok
 * VAT data of given tax rate
 */
interface VatRateVatData {
    /**
     * Az adott adómértékhez tartozó értékesítés vagy szolgáltatásnyújtás ÁFA összege a számla pénznemében
     * VAT amount of sales or service delivery under a given tax rate expressed in the currency of the invoice
     */
    vatRateVatAmount: number;
    /**
     * Az adott adómértékhez tartozó értékesítés vagy szolgáltatásnyújtás ÁFA összege forintban
     * VAT amount of sales or service delivery under a given tax rate expressed in HUF
     */
    vatRateVatAmountHUF: number;
}

/**
 * Adott adómértékhez tartozó bruttó adatok
 * Gross data of given tax rate
 */
interface VatRateGrossData {
    /**
     * Az adott adómértékhez tartozó értékesítés vagy szolgáltatásnyújtás bruttó összege a számla pénznemében
     * Gross amount of sales or service delivery under a given tax rate expressed in the currency of the invoice
     */
    vatRateGrossAmount: number;
    /**
     * Az adott adómértékhez tartozó értékesítés vagy szolgáltatásnyújtás bruttó összege forintban
     * Gross amount of sales or service delivery under a given tax rate expressed in HUF
     */
    vatRateGrossAmountHUF: number;
}

/**
 * Egyszerűsített számla összesítés
 * Calculation of simplified invoice totals
 */
interface SummarySimplified {
    /**
     * Adómérték vagy adómentesség jelölése
     * Marking the tax rate or the fact of tax exemption
     */
    vatRate: VatRate;
    /**
     * Az adott adótartalomhoz tartozó értékesítés vagy szolgáltatásnyújtás bruttó összege a számla pénznemében
     * The gross amount of the sale or service for the given tax amount in the currency of the invoice
     */
    vatContentGrossAmount: number;
    /**
     * Az adott adótartalomhoz tartozó értékesítés vagy szolgáltatásnyújtás bruttó összege forintban
     * The gross amount of the sale or service for the given tax amount in HUF
     */
    vatContentGrossAmountHUF: number;
}

/**
 * A számla összesítő bruttó adatai
 * Gross data of the invoice summary
 */
interface SummaryGrossData {
    /**
     * A számla bruttó összege a számla pénznemében
     * Gross amount of the invoice expressed in the currency of the invoice
     */
    invoiceGrossAmount: number;
    /**
     * A számla bruttó összege forintban
     * Gross amount of the invoice expressed in HUF
     */
    invoiceGrossAmountHUF: number;
}

/**
 * Termékdíj összegzés adatok
 * Summary of product charges
 */
interface ProductFeeSummary {
    /**
     * Annak jelzése, hogy a termékdíj összesítés visszaigénylésre (REFUND) vagy raktárba történő beszállításra (DEPOSIT) vonatkozik
     * Indicating whether the the product fee summary concerns refund or deposit
     */
    productFeeOperation: 'REFUND' | 'DEPOSIT';
    /**
     * Termékdíj adatok
     * Product charges data
     */
    productFeeData: ProductFeeData[];
    /**
     * Termékdíj összesen
     * Aggregate product charges
     */
    productChargeSum: number;
    /**
     * A termékdíj bevallását igazoló dokumentum adatai a 2011. évi LXXXV. tv. 13. § (3) szerint és a 25. § (3) szerint
     * Data of the document verifying the declaration submitted on the product fee according to the Paragraph (3), Section 13 and the Paragraph (3) Section 25 of the Act LXXXV of 2011
     */
    paymentEvidenceDocumentData?: PaymentEvidenceDocumentData;
}

/**
 * A termékdíj bevallását igazoló dokumentum adatai a 2011. évi LXXXV. tv. 13. § (3) szerint és a 25. § (3) szerint
 * Data of the document verifying the declaration submitted on the product fee according to the Paragraph (3), Section 13 and the Paragraph (3) Section 25 of the Act LXXXV of 2011
 */
interface PaymentEvidenceDocumentData {
    /**
     * Számla sorszáma vagy egyéb okirat azonosító száma
     * Sequential number of the invoice, or other document considered as such
     */
    evidenceDocumentNo: string;
    /**
     * Számla kelte
     * Date of issue of the invoice
     */
    evidenceDocumentDate: string;
    /**
     * Kötelezett neve
     * Name of obligator
     */
    obligatedName: string;
    /**
     * Kötelezett címe
     * Address of obligator
     */
    obligatedAddress: Address;
    /**
     * A kötelezett adószáma
     * Tax number of obligated
     */
    obligatedTaxNumber: string;
}

export { InvoiceData, InvoiceMain, BatchInvoice, Invoice, InvoiceReference, InvoiceHead, SupplierInfo, CustomerInfo, CustomerVatStatusType, CustomerVatData, CustomerTaxNumber, FiscalRepresentative, Address, InvoiceDetail, ConventionalInvoiceInfo, OrderNumbers, DeliveryNotes, ShippingDates, ContractNumbers, SupplierCompanyCodes, CustomerCompanyCodes, DealerCodes, CostCenters, ProjectNumbers, GeneralLedgerAccountNumbers, GlnNumbers, MaterialNumbers, ItemNumbers, EkaerIds, AdditionalData, Lines, Line, UnitOfMeasureType, LineModificationReference, ReferencesToOtherLines, AdvanceData, AdvancePaymentData, ProductCodes, ProductCode, ProductCodeCategoryType, DiscountData, LineAmountsNormal, LineNetAmountData, VatRate, MarginSchemeType, DetailedReason, VatAmountMismatch, LineVatData, LineGrossAmountData, LineAmountsSimplified, AggregateInvoiceLineData, NewTransportMean, Vehicle, Vessel, Aircraft, DieselOilPurchase, SimpleAddress, ProductFeeClause, ProductFeeTakeoverData, TakeoverType, CustomerDeclaration, ProductStreamType, ProductFeeData, Summary, SummaryNormal, SummaryByVatRate, VatRateNetData, VatRateVatData, VatRateGrossData, SummarySimplified, SummaryGrossData, ProductFeeSummary, PaymentEvidenceDocumentData };

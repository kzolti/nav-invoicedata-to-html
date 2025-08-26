const translations = {
  invoice: "Számla",
  batchInvoice: "Kötegelt módosító okirat adatai",
  batchIndex: "A módosító okirat sorszáma a kötegen belül",
  header: "Fejléc",
  supplier: "Eladó",
  customer: "Vevő",
  general: "Általános adatok",
  items: "Tételek",
  summary: "Összesítő",
  vatSummary: "ÁFA összesítő",
  explanations: "Rövidítések magyarázata",
  fiscalRepresentative: "Pénzügyi képviselő",
  conventionalInfo: "Egyezményes információk",
  additionalData: "További adatok",
  aggregateInvoiceLineData: "Gyűjtő számla adatok",
  InvoiceCategoryType_NORMAL: "Normál Számla",
  InvoiceCategoryType_SIMPLIFIED: "Egyszerűsített Számla",
  InvoiceCategoryType_AGGREGATE: "Gyűjtő Számla",
  invoiceDetail: "Számla részletező adatok",

  // InvoiceReference
  referencesToOtherLines: "Hivatkozások kapcsolódó tételekre, ha ez az ÁFA törvény alapján szükséges",

  invoiceReference: "Számla hivatkozás",
  originalInvoiceNumber: "Az eredeti számla sorszáma, melyre a módosítás vonatkozik  - ÁFA tv. 170. § (1) c)",
  modifyWithoutMaster:
    "Annak jelzése, hogy a módosítás olyan alapszámlára hivatkozik, amelyről nem történt és nem is fog történni adatszolgáltatás",
  modificationIndex: " A számlára vonatkozó módosító okirat egyedi sorszáma",

  // Számla fej adatok
  invoiceNumber: "Számlaszám",
  invoiceIssueDate: "Kibocsátás dátuma",
  invoiceDeliveryDate: "Teljesítés dátuma",
  invoiceDeliveryPeriod: "Szállítási időszak",
  invoiceAccountingDeliveryDate: "Számviteli kézbesítés dátuma",
  paymentDate: "Fizetési határidő",
  paymentMethod: "Fizetési mód",
  currencyCode: "Pénznem",
  exchangeRate: "Árfolyam",
  invoiceCategory: "Számla típusa",
  invoiceAppearance: "Számla megjelenése",
  deliveryDate: "Szállítási dátum",

  // Adózási adatok
  taxNumber: "Adószám",
  groupMemberTaxNumber: "Csoporttag adószáma",
  communityVatNumber: "Közösségi adószám",
  thirdStateTaxId: "Harmadik ország adóazonosítója",
  customerVatStatus: "Vevő ÁFA státusza",
  individualExemption: "Egyéni mentesség",
  exciseLicenceNum: "Jövedéki engedély szám",

  // ÁFA
  vatPercentage: "Az alkalmazott adó mértéke - ÁFA tv. 169. § j)",
  vatContent: "ÁFA tartalom", // egyszerűsített számla esetén",
  vatExemption: "Az adómentesség jelölése - ÁFA tv. 169. § m)",
  vatOutOfScope: "Az ÁFA törvény hatályán kívüli",
  vatDomesticReverseCharge: "A belföldi fordított adózás jelölése - ÁFA tv. 142. §",
  vatDomesticReverseCharge_TRUE: "Belföldi fordított adózás",
  marginSchemeIndicator: "Különbözet szerinti szabályozás jelölése - ÁFA tv. 169. § p) q)",
  // Margin scheme típusok
  MarginSchemeType_TRAVEL_AGENCY: "Utazási irodák",
  MarginSchemeType_SECOND_HAND: "Használt cikkek",
  MarginSchemeType_ARTWORK: "Műalkotás",
  MarginSchemeType_ANTIQUES: "Gyűjteménydarabok és régiségek",
  vatAmountMismatch: "Adóalap és felszámított adó eltérésének esetei",
  noVatCharge: "Nincs felszámított áfa a 17. § alapján",

  // Jelzők
  yes: "Igen",
  periodicalSettlement: "Periodikus elszámolás",
  smallBusinessIndicator: "Kisvállalkozási jelző",
  utilitySettlementIndicator: "Közüzemi elszámolás",
  selfBillingIndicator: "Önszámlázás",
  cashAccountingIndicator: "Készpénzforgalmi elszámolás",

  // Tétel adatok
  description: "Megnevezés",
  quantity: "Mennyiség",
  unitOfMeasure: "Egység",
  unitPrice: "Egységár",
  net: "Nettó",
  vatRate: "ÁFA Kulcs",
  vat: "ÁFA",
  gross: "Bruttó",

  lineModification: "Számlatétel Módosítás",
  lineModificationReference_lineNumberReference:
    "Az eredeti számla módosítással érintett tételének sorszáma (lineNumber). Új tétel létrehozása esetén az új tétel sorszáma, a meglévő tételsorok számozásának folytatásaként",
  LineModificationReference:
    "Az eredeti számla módosítással érintett tételének sorszáma (lineNumber). Új tétel létrehozása esetén az új tétel sorszáma, a meglévő tételsorok számozásának folytatásaként",
  line_modification_type: "A számlatétel módosításának jellege",

  productCode: "Termékkód",
  modificationReference: "Módosítási referencia",
  originalInvoice: "Eredeti számla",
  advancePayment: "Előlegfizetés",

  // Termékdíj
  productFeeSummary: "Termékdíj összesítő",
  productFee: "Termékdíj",
  productFeeOperation: "Termékdíj művelet",
  productFeeCode: "Termékdíj kód",
  productFeeQuantity: "Termékdíj mennyiség",
  productFeeMeasuringUnit: "Termékdíj mértékegység",
  productFeeRate: "Termékdíj kulcs",
  productFeeAmount: "Termékdíj összeg",
  productChargeSum: "Termékdíj összesen",
  productFeeTakeoverData: "A környezetvédelmi termékdíj kötelezettség átvállalásával kapcsolatos adatok",
  customerDeclaration:
    "Ha az eladó a vevő nyilatkozata alapján mentesül a termékdíj megfizetése alól, akkor az érintett termékáram",
  TakeoverType_01:
    "A 2011. évi LXXXV. tv. 14. § (4) bekezdés szerint az eladó (első belföldi forgalomba hozó) vállalja át a vevő termékdíj-kötelezettségét",
  TakeoverType_02_aa:
    "A 2011. évi LXXXV. tv. 14. § (5) aa) alpontja szerint a vevő szerződés alapján átvállalja az eladó termékdíj-kötelezettségét",
  TakeoverType_02_ab:
    "A 2011. évi LXXXV. tv. 14. § (5) ab) alpontja szerint a vevő szerződés alapján átvállalja az eladó termékdíj-kötelezettségét",
  TakeoverType_02_b:
    "A 2011. évi LXXXV. tv. 14. § (5) b) alpontja szerint a vevő szerződés alapján átvállalja az eladó termékdíj-kötelezettségét",

  // Konvencionális adatok
  orderNumbers: "Megrendelésszámok",
  ekaerIds: "EKAER azonosítók",
  deliveryNotes: "Szállítólevelek",
  shippingDates: "Szállítási dátumok",
  contractNumbers: "Szerződésszámok",

  // Összesítők
  netTotal: "Nettó összesen",
  vatTotal: "ÁFA összesen",
  grossTotal: "Bruttó összesen",

  // Egyéb
  name: "Név",
  address: "Cím",
  bankAccount: "Bankszámlaszám",
  building: "Épület",
  staircase: "Lépcsőház",
  floor: "Emelet",
  door: "Ajtó",
  lotNumber: "Helyrajzi szám",
  simplified: "Egyszerűsített",

  // Mértékegységek (Mennyiség egység típus)
  PIECE: "darab",
  KILOGRAM: "kg",
  TON: "tonna",
  KWH: "kWh",
  DAY: "nap",
  HOUR: "óra",
  MINUTE: "perc",
  MONTH: "hónap",
  LITER: "liter",
  KILOMETER: "km",
  CUBIC_METER: "m³",
  METER: "m",
  LINEAR_METER: "fm",
  CARTON: "karton",
  PACK: "csomag",
  OWN: "Saját mennyiségi egység megnevezés",
  DARAB: "darab",
  KG: "kg",

  // Fizetési módok
  PaymentMethodType_CASH: "Készpénz",
  PaymentMethodType_TRANSFER: "Átutalás",
  PaymentMethodType_CARD: "Bankkártya",
  PaymentMethodType_VOUCHER: "Utalvány",
  PaymentMethodType_OTHER: "Egyéb",

  LineNatureIndicatorType_PRODUCT: "Termékértékesítés",
  LineNatureIndicatorType_SERVICE: "Szolgáltatás nyújtás",
  LineNatureIndicatorType_OTHER: "Egyéb, nem besorolható",

  CustomerVatStatusType_DOMESTIC: "Belföldi ÁFA alany",
  CustomerVatStatusType_OTHER:
    "Egyéb (belföldi nem ÁFA alany, nem természetes személy, külföldi ÁFA alany és külföldi nem ÁFA alany, nem természetes személy)",
  CustomerVatStatusType_PRIVATE_PERSON: "Nem ÁFA alany (belföldi vagy külföldi) természetes személy",
  ProductCodeCategoryType_VTSZ: "Vámtarifa szám VTSZ",
  ProductCodeCategoryType_SZJ: "Szolgáltatás jegyzék szám SZJ",
  ProductCodeCategoryType_KN: "KN kód (Kombinált Nómenklatúra, 2658/87/EGK rendelet I. melléklete)",
  ProductCodeCategoryType_AHK:
    "A Jövedéki törvény (2016. évi LXVIII. tv) szerinti e-TKO adminisztratív hivatkozási kódja AHK",
  ProductCodeCategoryType_CSK:
    "A termék 343/2011. (XII. 29) Korm. rendelet 1. sz. melléklet A) cím szerinti csomagolószer-katalógus kódja (CsK kód)",
  ProductCodeCategoryType_KT:
    "A termék 343/2011. (XII. 29) Korm. rendelet 1. sz. melléklet B) cím szerinti környezetvédelmi termékkódja (Kt kód)",
  ProductCodeCategoryType_EJ: "Építményjegyzék szám",
  ProductCodeCategoryType_TESZOR:
    "A Termékek és Szolgáltatások Osztályozási Rendszere (TESZOR) szerinti termékkód - 451/2008/EK rendelet",
  ProductCodeCategoryType_OWN: "A vállalkozás által képzett termékkód",
  ProductCodeCategoryType_OTHER: "Egyéb termékkód",

  // missing:
  PAPER: "Papír alapú",
  PRODUCT: "Termék",
  SERVICE: "Szolgáltatás",
  SECOND_HAND: "Használt áru",
  OTHER: "Egyéb",
  unit: "egység",
  rate: "aránya",
  amount: "összege",
  DEPOSIT: "Raktárba beszállítás",
};

module.exports = { translations };

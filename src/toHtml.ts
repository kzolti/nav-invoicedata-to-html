import { XMLParser } from "fast-xml-parser";
import translations from "./hndlbrs/translations";
import templates from "./hndlbrs/gen/invoiceTemplate_fixed";
import * as fs from "fs";
import * as path from "path";

const missingFile = path.join(__dirname, "..", "translations.missing.json");

let missing:any = {};
let saveTimer: null | NodeJS.Timeout = null;

// betöltjük, ha létezik
try {
  const data = fs.readFileSync(missingFile, "utf8");
  missing = JSON.parse(data);
} catch {
  missing = {};
}

async function scheduleSaveMissing() {
  if (saveTimer) return; // már be van ütemezve
  saveTimer = setTimeout(async () => {
    saveTimer = null;
    await  fs.writeFileSync(missingFile, JSON.stringify(missing, null, 2), "utf8");
  }, 100); // 100 ms késleltetés
}

// XML -> JS objektum
function parseXml(xmlString: string) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    parseTagValue: false /* nem alakit át number-ra  vagy más json-type ra*/,
    parseAttributeValue: false,
    trimValues: true,
    ignoreDeclaration: true,
    removeNSPrefix: true,
    processEntities: true,
    isArray: (name) => {
      // Explicit tömbként kezelt elemek
      const alwaysArray = [
        "ekaerId",
        "orderNumber",
        "additionalLineData",
        "line",
        "productFeeData",
        "deliveryNote",
        "shippingDate",
        "contractNumber",
        "batchInvoice",
        "productFeeSummary",
        "additionalInvoiceData",
        "productCode",
        "referenceToOtherLine",
        "summaryByVatRate",
        "summarySimplified",
        "supplierCompanyCode",
        "customerCompanyCode",
        "dealerCode",
        "costCenter",
        "projectNumber",
        "generalLedgerAccountNumber",
        "glnNumber",
        "materialNumber",
        "itemNumber",
        "lineProductFeeContent",
      ];
      return alwaysArray.includes(name);
    },
  });
  return parser.parse(xmlString);
}

/**
 * Converts XML data to HTML format, taking into account the specified language translations.
 * @param {string} xml - XML string
 * @param {string} lang - Language code for translation, e.g., 'en', 'hu'
 * @returns {string} HTML output
 */
function toHtml(xml:string, lang:string) {
  lang = lang.toLowerCase();
  const jsObj = parseXml(xml);
  return templates["invoiceTemplate.hbs"](jsObj, {
    helpers: {
      t: (key:string) => {
        if (translations[lang] && translations[lang][key]) {
          return translations[lang][key];
        } else {
          if (!missing[lang]) missing[lang] = {};
          if (!missing[lang][key]) {
            missing[lang][key] = "";
            scheduleSaveMissing();
          }
          return key;
        }
      },
      formatNumber: (value:number|string) => {
        if (value === undefined || value === null) return "";
        return new Intl.NumberFormat(lang, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 4,
        }).format(Number(value));
      },
      formatCurrency: (value:number|string, currencyCode:string) => {
        if (value === undefined || value === null) return "";
        return new Intl.NumberFormat(lang, {
          style: "currency",
          currency: currencyCode,
          minimumFractionDigits: currencyCode === "HUF" ? 0 : 2,
          maximumFractionDigits: 4,
        }).format(Number(value));
      },
      formatDate: (dateString:string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString(lang);
      },
    },
  });
}

/**
 * Converts XML data to HTML format, taking into account the specified language translations.
 * @module toHtml
 * @param {string} xml - XML string
 * @param {string} lang - Language code for translation
 * @returns {string} HTML output
 */
export default toHtml;

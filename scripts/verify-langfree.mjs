#!/usr/bin/env node
/**
 * Regressziós teszt: nyelv-tag nélküli kulcs = ALL (minden locale alatt él),
 * adat soha nem vész el csendben.
 *
 * Futtatás (dist megépítése után): node scripts/verify-langfree.mjs
 * Kilépési kód: 0 = minden PASS, 1 = hiba van.
 */
import { splitSections, parseDataName } from '../dist/components/sections.js';

let failures = 0;

function check(name, actual, expected) {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a === e) {
        console.log(`PASS ${name}`);
    } else {
        failures++;
        console.error(`FAIL ${name}\n  expected: ${e}\n  actual:   ${a}`);
    }
}

const entry = (dataName, dataValue = 'v', dataDescription = 'd') => ({ dataName, dataDescription, dataValue });

// --- parseDataName ---
check('lang-less block parses as ALL',
    parseDataName('I00000_IDTOHTMLDATA__SUPPLIER_BLOCK__IBAN'),
    { lang: null, section: 'SUPPLIER_BLOCK', key: 'IBAN' });
check('localized block keeps lang',
    parseDataName('I00000_IDTOHTMLDATA__HU__SUPPLIER_BLOCK__IBAN'),
    { lang: 'HU', section: 'SUPPLIER_BLOCK', key: 'IBAN' });
check('lone DOCUMENT_NAME parses as ALL title',
    parseDataName('I00000_IDTOHTMLDATA__DOCUMENT_NAME'),
    { lang: null, section: 'DOCUMENT_NAME', key: undefined });
check('non-namespaced key returns null',
    parseDataName('SOME_OTHER_KEY'), null);

// --- splitSections: ALL látható mindkét locale alatt ---
const blocks = [
    entry('I00000_IDTOHTMLDATA__SUPPLIER_BLOCK__IBAN', 'HU12'),
    entry('I00000_IDTOHTMLDATA__HU__SUPPLIER_BLOCK__BANK', 'OTP'),
    entry('I00000_IDTOHTMLDATA__ENG__SUPPLIER_BLOCK__BANK', 'OTP Bank'),
];
check('hu supplierBlock (ALL + HU, ENG kiesik)',
    splitSections(blocks, 'hu').supplierBlock.map(e => e.dataValue), ['HU12', 'OTP']);
check('en supplierBlock (ALL + ENG, HU kiesik)',
    splitSections(blocks, 'en').supplierBlock.map(e => e.dataValue), ['HU12', 'OTP Bank']);

// --- cím-precedencia: specifikus nyer, ALL a fallback ---
const titles = [
    entry('I00000_IDTOHTMLDATA__DOCUMENT_NAME', 'Proforma (ALL)'),
    entry('I00000_IDTOHTMLDATA__HU__DOCUMENT_NAME', 'Proforma számla'),
];
check('hu title prefers HU over ALL',
    splitSections(titles, 'hu').documentName?.dataValue, 'Proforma számla');
check('en title falls back to ALL',
    splitSections(titles, 'en').documentName?.dataValue, 'Proforma (ALL)');

// --- adatvesztés tilalma ---
const unknownLang = [entry('I00000_IDTOHTMLDATA__FOO__BAR', 'x')];
check('unknown section lands in other (hu)', splitSections(unknownLang, 'hu').other.length, 1);
check('unknown section lands in other (en)', splitSections(unknownLang, 'en').other.length, 1);
const unknownNs = [entry('JUST_A_KEY', 'y')];
check('non-namespaced key lands in other', splitSections(unknownNs, 'hu').other.length, 1);

// --- lokalizált szemantika megmarad ---
const localized = [entry('I00000_IDTOHTMLDATA__HU__FOO', 'z')];
check('HU unknown-section visible under hu', splitSections(localized, 'hu').other.length, 1);
check('HU unknown-section hidden under en', splitSections(localized, 'en').other.length, 0);

// --- CSS / RENDERER_INFO változatlan ---
const special = [
    entry('I00000_IDTOHTMLDATA__CSS__COMPACT', 'compact'),
    { dataName: 'I00000_IDTOHTMLDATA__RENDERER_INFO', dataDescription: 'r', dataValue: 'lib@1' },
];
const sh = splitSections(special, 'hu');
check('CSS tag never leaks into other', sh.other.length, 0);
check('RENDERER_INFO routed to footer', sh.rendererInfo?.dataValue, 'lib@1');

if (failures > 0) {
    console.error(`\n${failures} check(s) FAILED`);
    process.exit(1);
}
console.log('\nAll langfree checks passed.');

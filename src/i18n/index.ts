import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { toDecimalString } from '../components/utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class I18n {
    private translations: Record<string, string> = {};
    public readonly locale: string;
    private readonly groupSep: string;
    private readonly decimalSep: string;

    constructor(locale: string = 'hu') {
        this.locale = locale;
        this.loadTranslations();
        const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
        this.groupSep = parts.find(p => p.type === 'group')?.value ?? ' ';
        this.decimalSep = parts.find(p => p.type === 'decimal')?.value ?? ',';
    }

    private loadTranslations() {
        // Translation files are next to this file in both src/ and dist/
        const filePath = path.resolve(__dirname, `./${this.locale}.json`);
        if (fs.existsSync(filePath)) {
            this.translations = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } else {
            console.warn(`Translation file not found: ${filePath}`);
        }
    }

    public t(key: string): string {
        return this.translations[key] || key;
    }

    /**
     * Format a numeric value without binary float conversion.
     * `decimals` is the minimum fraction digits (column padding);
     * source fraction digits are never truncated.
     */
    public nf(value: number | string | undefined, decimals: number = 2): string {
        if (value === undefined || value === null || value === '') return '-';
        const raw = toDecimalString(value);
        if (raw == null) return '-';

        const neg = raw.startsWith('-');
        const abs = neg ? raw.slice(1) : raw;
        const dot = abs.indexOf('.');
        let intPart = dot === -1 ? abs : abs.slice(0, dot);
        let frac = dot === -1 ? '' : abs.slice(dot + 1);

        const minDec = Math.max(0, decimals);
        const showDec = Math.max(minDec, frac.length);
        if (showDec > 0) {
            frac = frac.padEnd(showDec, '0');
        } else {
            frac = '';
        }

        intPart = intPart.replace(/^0+(?=\d)/, '') || '0';
        const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, this.groupSep);
        const body = frac ? `${grouped}${this.decimalSep}${frac}` : grouped;
        return neg ? `-${body}` : body;
    }
}

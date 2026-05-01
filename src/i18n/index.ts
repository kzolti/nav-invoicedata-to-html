import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class I18n {
    private translations: Record<string, string> = {};
    private locale: string;

    constructor(locale: string = 'hu') {
        this.locale = locale;
        this.loadTranslations();
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

    public nf(value: number | string | undefined, decimals: number = 2): string {
        if (value === undefined || value === null || value === '') return '-';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return '-';

        return new Intl.NumberFormat(this.locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
    }
}

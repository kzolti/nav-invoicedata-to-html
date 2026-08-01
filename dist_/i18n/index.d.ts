export declare class I18n {
    private translations;
    readonly locale: string;
    private readonly groupSep;
    private readonly decimalSep;
    constructor(locale?: string);
    private loadTranslations;
    t(key: string): string;
    /**
     * Format a numeric value without binary float conversion.
     * `decimals` is the minimum fraction digits (column padding);
     * source fraction digits are never truncated.
     */
    nf(value: number | string | undefined, decimals?: number): string;
}
//# sourceMappingURL=index.d.ts.map
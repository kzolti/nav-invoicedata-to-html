import type { InvoiceData } from 'nav-osa-types';
export interface CssConfig {
    /** External CSS file path (href link). */
    path?: string;
    /** CSS content to embed inline as `<style>`. */
    inline?: string;
}
export declare class HtmlGenerator {
    private i18n;
    private cssConfig;
    constructor(locale?: string, cssConfig?: CssConfig);
    generate(rawData: InvoiceData): Promise<string>;
    private wrapHtml;
    private buildCssBlock;
}
//# sourceMappingURL=index.d.ts.map
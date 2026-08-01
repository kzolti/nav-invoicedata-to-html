import type { TFn, DisplayLine } from '../utils.js';
import type { ProductCode, AdditionalData } from 'nav-osa-types';
import { asArray, esc } from '../utils.js';

interface Props {
    line: DisplayLine;
    t: TFn;
}

export function LineBasicDetails({ line, t }: Props): string {
    const parts: string[] = [];

    // Product codes
    if (line.productCodes) {
        parts.push(
            (<div class="product-codes">
                <strong>{t('productCodes')}:</strong>
                <ul>
                    {asArray(line.productCodes.productCode).map((code: ProductCode) => (
                        <li>{t(code.productCodeCategory)}: {esc(code.productCodeValue || code.productCodeOwnValue)}</li>
                    )).join('')}
                </ul>
            </div>) as string
        );
    }

    // Indicators
    if (!line.lineExpressionIndicator || line.intermediatedService || line.depositIndicator || line.productFeeClause || line.obligatedForProductFee) {
        const badges: string[] = [];
        if (!line.lineExpressionIndicator) {
            badges.push(<span class="badge badge-warning line-expression-false">{t('lineExpressionFalse')}</span> as string);
        }
        if (line.intermediatedService) badges.push(<span class="badge">{t('intermediatedService')}</span> as string);
        if (line.depositIndicator) badges.push(<span class="badge">{t('deposit')}</span> as string);
        if (line.productFeeClause) badges.push(<span class="badge">{t('productFee')}</span> as string);
        if (line.obligatedForProductFee) badges.push(<span class="badge badge-warning">{t('obligatedForProductFee')}</span> as string);

        parts.push(<div class="indicators">{badges.join('')}</div> as string);
    }

    // Conventional line info
    if (line.conventionalLineInfo) {
        const ci = line.conventionalLineInfo;
        const items: string[] = [];
        if (ci.orderNumbers) {
            items.push(<p><strong>{t('orderNumbers')}:</strong> {asArray(ci.orderNumbers.orderNumber).map(val => esc(val)).join(', ')}</p> as string);
        }
        if (ci.deliveryNotes) {
            items.push(<p><strong>{t('deliveryNotes')}:</strong> {asArray(ci.deliveryNotes.deliveryNote).map(val => esc(val)).join(', ')}</p> as string);
        }
        if (ci.contractNumbers) {
            items.push(<p><strong>{t('contractNumbers')}:</strong> {asArray(ci.contractNumbers.contractNumber).map(val => esc(val)).join(', ')}</p> as string);
        }
        if (items.length > 0) {
            parts.push(<div class="conventional-info">{items.join('')}</div> as string);
        }
    }

    // Additional line data
    if (line.additionalLineData) {
        parts.push(
            (<div class="additional-data">
                <strong>{t('additionalData')}:</strong>
                <ul>
                    {asArray(line.additionalLineData).map((item: AdditionalData) => (
                        <li>
                            <div class="add-data-left">
                                <strong>{esc(item.dataDescription)}:</strong>
                                <span class="add-data-value">{esc(item.dataValue)}</span>
                            </div>
                            <div class="add-data-name">{esc(item.dataName)}</div>
                        </li>
                    )).join('')}
                </ul>
            </div>) as string
        );
    }

    return parts.join('');
}

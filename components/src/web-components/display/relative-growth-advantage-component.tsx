import { customElement, property } from 'lit/decorators.js';

import { RelativeGrowthAdvantage, type View } from '../../preact/relativeGrowthAdvantage/relative-growth-advantage';
import type { LapisFilter } from '../../types';
import { PreactLitAdapter } from '../PreactLitAdapter';

@customElement('gs-relative-growth-advantage')
export class RelativeGrowthAdvantageComponent extends PreactLitAdapter {
    @property({ type: Object })
    numerator: LapisFilter = {};

    @property({ type: Object })
    denominator: LapisFilter = {};

    @property({ type: Number })
    generationTime: number = 7;

    @property({ type: Array })
    views: View[] = ['line'];

    override render() {
        return (
            <RelativeGrowthAdvantage
                numerator={this.numerator}
                denominator={this.denominator}
                generationTime={this.generationTime}
                views={this.views}
            />
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-relative-growth-advantage': RelativeGrowthAdvantageComponent;
    }
}

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

    /**
     * The size of the component.
     *
     * If not set, the component will take the full width of its container with height 700px.
     *
     * The width and height should be a string with a unit in css style, e.g. '100%', '500px' or '50vh'.
     * If the unit is %, the size will be relative to the container of the component.
     */
    @property({ type: Object })
    size: { width?: string; height?: string } | undefined = undefined;

    override render() {
        return (
            <RelativeGrowthAdvantage
                numerator={this.numerator}
                denominator={this.denominator}
                generationTime={this.generationTime}
                views={this.views}
                size={this.size}
            />
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-relative-growth-advantage': RelativeGrowthAdvantageComponent;
    }
}

import { customElement, property } from 'lit/decorators.js';

import { MutationsOverTime, type MutationsOverTimeProps } from '../../preact/mutationsOverTime/mutations-over-time';
import type { Equals, Expect } from '../../utils/typeAssertions';
import { PreactLitAdapterWithGridJsStyles } from '../PreactLitAdapterWithGridJsStyles';

/**
 * ## Context
 *
 * This component displays mutations (substitutions and deletions) over time for a dataset selected by a LAPIS filter.
 * The shown date range is determined by the date field in the LAPIS filter.
 * If the date field is not set, the date range is determined by all available dates in the dataset.
 *
 * ## Views
 *
 * ### Grid View
 *
 * The grid view shows the proportion for each mutation over date ranges.
 *
 */
@customElement('gs-mutations-over-time')
export class MutationsOverTimeComponent extends PreactLitAdapterWithGridJsStyles {
    /**
     * Required.
     *
     * LAPIS filter to select the displayed data.
     */
    @property({ type: Object })
    lapisFilter: Record<string, string | number | null | boolean> = {};

    /**
     * The type of the sequence for which the mutations should be shown.
     */
    @property({ type: String })
    sequenceType: 'nucleotide' | 'amino acid' = 'nucleotide';

    /**
     * A list of tabs with views that this component should provide.
     */
    @property({ type: Array })
    views: 'grid'[] = ['grid'];

    /**
     * The width of the component.
     *
     * Visit https://genspectrum.github.io/dashboard-components/?path=/docs/components-size-of-components--docs for more information.
     */
    @property({ type: String })
    width: string = '100%';

    /**
     * The height of the component.
     *
     * Visit https://genspectrum.github.io/dashboard-components/?path=/docs/components-size-of-components--docs for more information.
     */
    @property({ type: String })
    height: string = '700px';

    /**
     * The granularity of the time axis.
     */
    @property({ type: String })
    granularity: 'day' | 'week' | 'month' | 'year' = 'week';

    /**
     * Required.
     *
     * The LAPIS field that the data should be aggregated by.
     * The values will be used for the columns of the grid.
     * Must be a field of type `date` in LAPIS.
     */
    @property({ type: String })
    lapisDateField: string = 'date';

    override render() {
        return (
            <MutationsOverTime
                lapisFilter={this.lapisFilter}
                sequenceType={this.sequenceType}
                views={this.views}
                width={this.width}
                height={this.height}
                granularity={this.granularity}
                lapisDateField={this.lapisDateField}
            />
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-mutations-over-time-component': MutationsOverTimeComponent;
    }
}

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
type LapisFilterMatches = Expect<
    Equals<typeof MutationsOverTimeComponent.prototype.lapisFilter, MutationsOverTimeProps['lapisFilter']>
>;
type SequenceTypeMatches = Expect<
    Equals<typeof MutationsOverTimeComponent.prototype.sequenceType, MutationsOverTimeProps['sequenceType']>
>;
type ViewsMatches = Expect<Equals<typeof MutationsOverTimeComponent.prototype.views, MutationsOverTimeProps['views']>>;
type GranularityMatches = Expect<
    Equals<typeof MutationsOverTimeComponent.prototype.granularity, MutationsOverTimeProps['granularity']>
>;
/* eslint-enable @typescript-eslint/no-unused-vars, no-unused-vars */

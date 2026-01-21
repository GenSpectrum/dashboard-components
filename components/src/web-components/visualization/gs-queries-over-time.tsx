import { customElement, property } from 'lit/decorators.js';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

import { QueriesOverTime } from '../../preact/queriesOverTime/queries-over-time';
import { PreactLitAdapterWithGridJsStyles } from '../PreactLitAdapterWithGridJsStyles';

/**
 * ## Context
 *
 * This component displays arbitrary LAPIS queries over time for a dataset.
 * Each query consists of a displayLabel (optional), countQuery (string for counting matches),
 * and coverageQuery (string for determining the coverage/denominator).
 * The shown date range is determined by the available dates in the dataset.
 *
 * ## Views
 *
 * ### Grid View
 *
 * The grid view shows the proportion for each query over date ranges.
 * Proportions are calculated as count/coverage for each time period.
 *
 * Users can filter the displayed rows by mean proportion via a slider in the toolbar.
 * The mean proportion of each row is calculated over the whole data range that the component displays.
 *
 * @fires {CustomEvent<undefined>} gs-component-finished-loading
 * Fired when the component has finished loading the required data from LAPIS.
 */
@customElement('gs-queries-over-time')
export class QueriesOverTimeComponent extends PreactLitAdapterWithGridJsStyles {
    /**
     * LAPIS filter to apply to all queries. This is used to determine the date range and total counts.
     */
    @property({ type: Object })
    lapisFilter: Record<string, string | string[] | number | null | boolean | undefined> = {};

    /**
     * Required.
     *
     * Array of queries to display. Each query has:
     * - displayLabel: string (optional) - The name to show in the grid. If not provided, the query strings will be used.
     * - countQuery: string - Query string to count matches
     * - coverageQuery: string - Query string to determine coverage/denominator
     */
    @property({ type: Array })
    queries: {
        displayLabel?: string;
        countQuery: string;
        coverageQuery: string;
    }[] = [];

    /**
     * A list of tabs with views that this component should provide.
     */
    @property({ type: Array })
    views: 'grid'[] = ['grid'];

    /**
     * The width of the component.
     *
     * Visit https://genspectrum.github.io/dashboard-components/?path=/docs/concepts-size-of-components--docs for more information.
     */
    @property({ type: String })
    width: string = '100%';

    /**
     * The height of the component.
     *
     * Visit https://genspectrum.github.io/dashboard-components/?path=/docs/concepts-size-of-components--docs for more information.
     */
    @property({ type: String })
    height: string | undefined = undefined;

    /**
     * The granularity of the time axis.
     */
    @property({ type: String })
    granularity: 'day' | 'week' | 'month' | 'year' = 'week';

    /**
     * Required.
     *
     * The LAPIS field that the data should be aggregated by.
     * Must be a field of type `date` in LAPIS.
     */
    @property({ type: String })
    lapisDateField: string = 'date';

    /**
     * The initial proportion interval for the grid view.
     * The values must be between 0 and 1, inclusive.
     */
    @property({ type: Object })
    initialMeanProportionInterval: { min: number; max: number } = { min: 0.05, max: 1 };

    /**
     * If true, date ranges with no data will be hidden initially; if false, not.
     * Can be switched with a button in the toolbar.
     */
    @property({ type: Boolean })
    hideGaps: boolean = false;

    /**
     * The number of rows per page, which can be selected by the user.
     */
    @property({ type: Array })
    pageSizes: number[] | number = [10, 20, 30, 40, 50];

    /**
     * Custom columns to add to the grid.
     * Each column has a header and a map of query displayLabels to values.
     */
    @property({ type: Array })
    customColumns?: { header: string; values: Record<string, string | number> }[] = undefined;

    override render() {
        return (
            <QueriesOverTime
                lapisFilter={this.lapisFilter}
                queries={this.queries}
                views={this.views}
                width={this.width}
                height={this.height}
                granularity={this.granularity}
                lapisDateField={this.lapisDateField}
                initialMeanProportionInterval={this.initialMeanProportionInterval}
                hideGaps={this.hideGaps}
                pageSizes={this.pageSizes}
                customColumns={this.customColumns}
            />
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-queries-over-time': QueriesOverTimeComponent;
    }
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'gs-queries-over-time': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}

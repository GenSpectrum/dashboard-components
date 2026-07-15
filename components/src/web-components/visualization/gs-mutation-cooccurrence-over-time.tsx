import { customElement, property } from 'lit/decorators.js';

import { MutationCooccurrenceOverTime } from '../../preact/mutationCooccurrence/mutation-cooccurrence-over-time';
import { PreactLitAdapterWithGridJsStyles } from '../PreactLitAdapterWithGridJsStyles';

/**
 * ## Context
 *
 * This component displays the frequency of mutation co-occurrence patterns over time.
 * Each row represents a unique combination of alleles observed at the specified positions.
 * The left columns show the allele at each position, and the right columns show the
 * proportion of sequences with that pattern in each time period.
 *
 * ## Positions syntax
 *
 * Positions use the LAPIS field name syntax:
 * - `[501]` — position 501 on the main/only segment
 * - `S[501]` — position 501 on the named nucleotide segment `S`
 * - `ORF1a[501]` — position 501 on the amino acid gene `ORF1a`
 *
 * ## Views
 *
 * ### Grid View
 *
 * The grid view shows each unique co-occurrence pattern as a row, with time periods as
 * columns. Each cell is colored by the proportion of sequences with that pattern in the
 * given time period.
 *
 * @fires {CustomEvent<undefined>} gs-component-finished-loading
 * Fired when the component has finished loading the required data from LAPIS.
 */
@customElement('gs-mutation-cooccurrence-over-time')
export class MutationCooccurrenceOverTimeComponent extends PreactLitAdapterWithGridJsStyles {
    /**
     * Required.
     *
     * LAPIS filter to select the displayed data.
     */
    @property({ type: Object })
    lapisFilter: Record<string, string | string[] | number | null | boolean | undefined> & {
        nucleotideMutations?: string[];
        aminoAcidMutations?: string[];
        nucleotideInsertions?: string[];
        aminoAcidInsertions?: string[];
    } = {};

    /**
     * Required.
     *
     * The positions to compute co-occurrence for, using LAPIS field name syntax.
     * Example: `["[123]", "[124]", "ORF1a[501]"]`
     */
    @property({ type: Array })
    positions: string[] = [];

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
    initialMeanProportionInterval: { min: number; max: number } = { min: 0, max: 1 };

    /**
     * If true, date ranges with no data will be hidden initially.
     * Can be toggled with the button in the toolbar.
     */
    @property({ type: Boolean })
    hideGaps: boolean | undefined = false;

    /**
     * The number of rows per page, which can be selected by the user.
     */
    @property({ type: Array })
    pageSizes: number[] | number = [10, 20, 30, 40, 50];

    override render() {
        return (
            <MutationCooccurrenceOverTime
                lapisFilter={this.lapisFilter}
                positions={this.positions}
                views={this.views}
                width={this.width}
                height={this.height}
                granularity={this.granularity}
                lapisDateField={this.lapisDateField}
                initialMeanProportionInterval={this.initialMeanProportionInterval}
                hideGaps={this.hideGaps}
                pageSizes={this.pageSizes}
            />
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-mutation-cooccurrence-over-time': MutationCooccurrenceOverTimeComponent;
    }
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace React.JSX {
        interface IntrinsicElements {
            'gs-mutation-cooccurrence-over-time': MutationCooccurrenceOverTimeComponent;
        }
    }
}

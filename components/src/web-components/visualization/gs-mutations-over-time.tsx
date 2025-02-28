import { consume } from '@lit/context';
import { customElement, property } from 'lit/decorators.js';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

import { MutationAnnotationsContextProvider } from '../../preact/MutationAnnotationsContext';
import { MutationsOverTime, type MutationsOverTimeProps } from '../../preact/mutationsOverTime/mutations-over-time';
import type { Equals, Expect } from '../../utils/typeAssertions';
import { PreactLitAdapterWithGridJsStyles } from '../PreactLitAdapterWithGridJsStyles';
import { type MutationAnnotations, mutationAnnotationsContext } from '../mutation-annotations-context';

/**
 * ## Context
 *
 * This component displays mutations (substitutions and deletions) over time for a dataset selected by a LAPIS filter.
 * The shown date range is determined by the date field in the LAPIS filter.
 * If the date field is not set, the date range is determined by all available dates in the dataset.
 *
 * This component supports mutations annotations.
 * Visit https://genspectrum.github.io/dashboard-components/?path=/docs/concepts-mutation-annotations--docs for more information.
 *
 * ## Views
 *
 * ### Grid View
 *
 * The grid view shows the proportion for each mutation over date ranges.
 *
 * The grid limits the number of rows and columns for browser performance reasons as
 * too much data might make the browser unresponsive.
 *
 * The number of columns is limited to 200.
 * If this number are exceeded, an error message will be shown.
 * It is your responsibility to make sure that this does not happen.
 * Depending on the selected date range in the `lapisFilter`, you can adapt the granularity accordingly
 * (e.g. use months instead of days).
 *
 * The number of rows is limited to 100.
 * If there are more, the component will only show 100 mutations and notify the user.
 *
 * Users can filter the displayed rows by mean proportion via a slider in the toolbar.
 * The mean proportion of each row is calculated by LAPIS over the whole data range that the component displays.
 * The initial mean proportion can be set via `initialMeanProportionInterval`.
 */
@customElement('gs-mutations-over-time')
export class MutationsOverTimeComponent extends PreactLitAdapterWithGridJsStyles {
    /**
     * LAPIS filter to select the displayed data. If not provided, all data is displayed.
     */
    @property({ type: Object })
    lapisFilter: Record<string, string | string[] | number | null | boolean | undefined> & {
        nucleotideMutations?: string[];
        aminoAcidMutations?: string[];
        nucleotideInsertions?: string[];
        aminoAcidInsertions?: string[];
    } = {};

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
     * The values will be used for the columns of the grid.
     * Must be a field of type `date` in LAPIS.
     */
    @property({ type: String })
    lapisDateField: string = 'date';

    /**
     * If provided, only the given mutations will be displayed.
     * The mutations must be provided in the exact format as they would be displayed by the component.
     */
    @property({ type: Array })
    displayMutations: string[] | undefined = undefined;

    /**
     * The initial proportion interval for the grid view.
     * The values must be between 0 and 1, inclusive.
     */
    @property({ type: Object })
    initialMeanProportionInterval: { min: number; max: number } = { min: 0.05, max: 0.9 };

    /**
     * @internal
     */
    @consume({ context: mutationAnnotationsContext, subscribe: true })
    mutationAnnotations: MutationAnnotations = [];

    override render() {
        return (
            <MutationAnnotationsContextProvider value={this.mutationAnnotations}>
                <MutationsOverTime
                    lapisFilter={this.lapisFilter}
                    sequenceType={this.sequenceType}
                    views={this.views}
                    width={this.width}
                    height={this.height}
                    granularity={this.granularity}
                    lapisDateField={this.lapisDateField}
                    displayMutations={this.displayMutations}
                    initialMeanProportionInterval={this.initialMeanProportionInterval}
                />
            </MutationAnnotationsContextProvider>
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-mutations-over-time': MutationsOverTimeComponent;
    }
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'gs-mutations-over-time': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
        }
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
type WidthMatches = Expect<Equals<typeof MutationsOverTimeComponent.prototype.width, MutationsOverTimeProps['width']>>;
type HeightMatches = Expect<
    Equals<typeof MutationsOverTimeComponent.prototype.height, MutationsOverTimeProps['height']>
>;
type GranularityMatches = Expect<
    Equals<typeof MutationsOverTimeComponent.prototype.granularity, MutationsOverTimeProps['granularity']>
>;
type LapisDateFieldMatches = Expect<
    Equals<typeof MutationsOverTimeComponent.prototype.lapisDateField, MutationsOverTimeProps['lapisDateField']>
>;
type DisplayMutationsMatches = Expect<
    Equals<typeof MutationsOverTimeComponent.prototype.displayMutations, MutationsOverTimeProps['displayMutations']>
>;
type InitialMeanProportionIntervalMatches = Expect<
    Equals<
        typeof MutationsOverTimeComponent.prototype.initialMeanProportionInterval,
        MutationsOverTimeProps['initialMeanProportionInterval']
    >
>;
/* eslint-enable @typescript-eslint/no-unused-vars, no-unused-vars */

import { customElement, property } from 'lit/decorators.js';

import {
    NumberSequencesOverTime,
    type NumberSequencesOverTimeProps,
} from '../../preact/numberSequencesOverTime/number-sequences-over-time';
import type { Equals, Expect } from '../../utils/typeAssertions';
import { PreactLitAdapterWithGridJsStyles } from '../PreactLitAdapterWithGridJsStyles';

@customElement('gs-number-sequences-over-time')
export class NumberSequencesOverTimeComponent extends PreactLitAdapterWithGridJsStyles {
    // prettier-ignore
    // The multiline union type must not start with `|` because it looks weird in the Storybook docs
    /**
     *   Required.
     * Either a LAPIS filter or an array of LAPIS filters to calculate the prevalence for.
     *
     * The `lapisFilter` will be sent as is to LAPIS to select the data.
     * It must be a valid LAPIS filter object.
     *
     * The `displayName` will be used as the label the prevalence in the views.
     * It should be human-readable.
     *
     */ @property({type: Object})
    lapisFilter:
        {
            lapisFilter: Record<string, string | number | null | boolean>;
            displayName: string;
        }
        | {
            lapisFilter: Record<string, string | number | null | boolean>;
            displayName: string;
        }[]= { displayName: '', lapisFilter: {} };

    /**
     * Required.
     *
     * The LAPIS field that the data should be aggregated by.
     * The values will be used on the x-axis of the diagram.
     * Must be a field of type `date` in LAPIS.
     */
    @property({ type: String })
    lapisDateField: string = 'date';

    /**
     * A list of tabs with views that this component should provide.
     */
    @property({ type: Array })
    views: ('bar' | 'line' | 'table')[] = ['bar', 'line', 'table'];

    /**
     * The headline of the component. Set to an empty string to hide the headline.
     */
    @property({ type: String })
    headline: string = 'Number of sequences of time';

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
    granularity: 'day' | 'week' | 'month' | 'year' = 'day';

    /**
     * The number of time steps to use for smoothing the data.
     * `0` means no smoothing.
     * Must be a non-negative integer.
     *
     * For a given time, the shown value is the mean of the neighbouring measured values.
     * The `smoothingWindow` value provides the number of neighbouring values to take into account.
     * The resulting time is computed via `Math.floor(smoothingWindow / 2)`.
     */
    @property({ type: Number })
    smoothingWindow: number = 0;

    override render() {
        return (
            <NumberSequencesOverTime
                lapisFilter={this.lapisFilter}
                lapisDateField={this.lapisDateField}
                views={this.views}
                headline={this.headline}
                width={this.width}
                height={this.height}
                granularity={this.granularity}
                smoothingWindow={this.smoothingWindow}
            />
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-number-sequences-over-time': NumberSequencesOverTimeComponent;
    }
}

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
type LapisFilterMatches = Expect<
    Equals<typeof NumberSequencesOverTimeComponent.prototype.lapisFilter, NumberSequencesOverTimeProps['lapisFilter']>
>;
type ViewsMatches = Expect<
    Equals<typeof NumberSequencesOverTimeComponent.prototype.views, NumberSequencesOverTimeProps['views']>
>;
type GranularityMatches = Expect<
    Equals<typeof NumberSequencesOverTimeComponent.prototype.granularity, NumberSequencesOverTimeProps['granularity']>
>;
type SmoothingWindowMatches = Expect<
    Equals<
        typeof NumberSequencesOverTimeComponent.prototype.smoothingWindow,
        NumberSequencesOverTimeProps['smoothingWindow']
    >
>;
/* eslint-enable @typescript-eslint/no-unused-vars, no-unused-vars */

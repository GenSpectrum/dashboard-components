import { customElement, property } from 'lit/decorators.js';

import PrevalenceOverTime, { type PrevalenceOverTimeProps } from '../../preact/prevalenceOverTime/prevalence-over-time';
import { type Equals, type Expect } from '../../utils/typeAssertions';
import { PreactLitAdapterWithGridJsStyles } from '../PreactLitAdapterWithGridJsStyles';

/**
 * ## Context
 *
 * This component displays the prevalence over time of one or more variants.
 * The prevalence is calculated as the ratio of the number of cases of each variant given as `numerator`
 * to the number of cases of the variant given as `denominator`.
 *
 * In the chart views,
 * - the user can select whether to display a confidence interval (not available in the bubble chart).
 *   The confidence interval is calculated using [Wilson score interval](https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval),
 *   with a confidence level of 95%.
 * - the x-axis shows time steps in the selected `granularity`.
 * - the user can select the y-axis scale (linear, logistic, logit).
 *
 * ## Views
 *
 * ### Bar View
 *
 * Displays the prevalence over time as a bar chart.
 * Shows a bar for each variant in the `numerator` on every time step.
 *
 * ### Line View
 *
 * Displays the prevalence over time as a line chart.
 * Each data point is connected for better visibility.
 * Shows a line for each variant in the `numerator`.
 *
 * ### Bubble View
 *
 * Displays the prevalence over time as a bubble chart.
 * The size of the bubbles represents the number of cases of the `denominator` variant.
 * The height of the bubbles represents the prevalence of the `numerator` variants.
 *
 * ### Table View
 *
 * Displays the prevalence over time as a table with one row per time point.
 */
@customElement('gs-prevalence-over-time')
export class PrevalenceOverTimeComponent extends PreactLitAdapterWithGridJsStyles {
    // prettier-ignore
    // The multiline union type must not start with `|` because it looks weird in the Storybook docs
    /**
     *   Required.
     *
     * Either a single variant or an array of variants to compare.
     * This must be a valid LAPIS filter object with an additional `displayName` property
     * which will be used as the label for the variant in the views,
     * or an array of such objects.
     */
    @property({type: Object})
    numerator:
        {
            lapisFilter: Record<string, string | number | null | boolean>;
            displayName: string;
        }
        | {
            lapisFilter: Record<string, string | number | null | boolean>;
            displayName: string;
        }[] = { displayName: '', lapisFilter: {} };

    /**
     * Required.
     *
     * The variant that the variants in `numerator` are compared to.
     */
    @property({ type: Object })
    denominator: Record<string, string | number | null | boolean> = {};

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

    /**
     * A list of tabs with views that this component should provide.
     */
    @property({ type: Array })
    views: ('bar' | 'line' | 'bubble' | 'table')[] = ['bar', 'line', 'bubble', 'table'];

    /**
     * A list of methods to calculate the confidence interval.
     * The option `none` is always available and disables confidence intervals.
     * Pass an empty array to disable the confidence interval selector.
     */
    @property({ type: Array })
    confidenceIntervalMethods: ('wilson' | 'none')[] = ['wilson'];

    /**
     * The headline of the component. Set to an empty string to hide the headline.
     */
    @property({ type: String })
    headline: string = 'Prevalence over time';

    /**
     * The width of the component.
     *
     * Visit https://genspectrum.github.io/dashboards/?path=/docs/components-size-of-components--docs for more information.
     */
    @property({ type: String })
    width: string = '100%';

    /**
     * The height of the component.
     *
     * Visit https://genspectrum.github.io/dashboards/?path=/docs/components-size-of-components--docs for more information.
     */
    @property({ type: String })
    height: string = '700px';

    /**
     * Required.
     *
     * The LAPIS field that the data should be aggregated by.
     * The values will be used on the x-axis of the diagram.
     * Must be a field of type `date` in LAPIS.
     */
    @property({ type: String })
    lapisDateField: string = 'date';

    override render() {
        return (
            <PrevalenceOverTime
                numerator={this.numerator}
                denominator={this.denominator}
                granularity={this.granularity}
                smoothingWindow={this.smoothingWindow}
                views={this.views}
                confidenceIntervalMethods={this.confidenceIntervalMethods}
                width={this.width}
                height={this.height}
                headline={this.headline}
                lapisDateField={this.lapisDateField}
            />
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-prevalence-over-time': PrevalenceOverTimeComponent;
    }
}

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
type NumeratorMatches = Expect<
    Equals<typeof PrevalenceOverTimeComponent.prototype.numerator, PrevalenceOverTimeProps['numerator']>
>;
type DenominatorMatches = Expect<
    Equals<typeof PrevalenceOverTimeComponent.prototype.denominator, PrevalenceOverTimeProps['denominator']>
>;
type GranularityMatches = Expect<
    Equals<typeof PrevalenceOverTimeComponent.prototype.granularity, PrevalenceOverTimeProps['granularity']>
>;
type ViewsMatches = Expect<
    Equals<typeof PrevalenceOverTimeComponent.prototype.views, PrevalenceOverTimeProps['views']>
>;
type ConfidenceIntervalMethodsMatches = Expect<
    Equals<
        typeof PrevalenceOverTimeComponent.prototype.confidenceIntervalMethods,
        PrevalenceOverTimeProps['confidenceIntervalMethods']
    >
>;
/* eslint-enable @typescript-eslint/no-unused-vars, no-unused-vars */

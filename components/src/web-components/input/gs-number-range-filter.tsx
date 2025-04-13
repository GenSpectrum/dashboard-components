import { customElement, property } from 'lit/decorators.js';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

import {
    type NumberRangeFilterChangedEvent,
    type NumberRangeValueChangedEvent,
} from '../../preact/numberRangeFilter/NumberRangeFilterChangedEvent';
import { NumberRangeFilter } from '../../preact/numberRangeFilter/number-range-filter';
import { type gsEventNames } from '../../utils/gsEventNames';
import { PreactLitAdapter } from '../PreactLitAdapter';

/**
 *
 * ## Context
 *
 * This component lets the user specify filters for a `float` or `int` field in LAPIS.
 * It consists of two text input fields and a slider.
 *
 * The slider must be restricted to a certain range.
 * Users can however still enter values outside of this range in the text input fields.
 *
 * @fires {CustomEvent<Record<string, string | undefined>>} gs-number-range-filter-changed
 * Fired when the slider is released,
 * `onBlur` on the input fields after the user has typed a valid range in the input fields,
 * or when one of the input fields is cleared.
 * The `details` of this event contain an object with `${lapisField}From` and `${lapisField}To` as keys.
 * The values are the numbers from the input fields or `undefined` if the input field is empty:
 * ```
 * {
 *     [`${lapisField}From`]: number | undefined
 *     [`${lapisField}To`]: number | undefined
 * }
 * ```
 * Example:
 * ```
 * {
 *     ageFrom: 18,
 *     ageTo: undefined
 * }
 * ```
 *
 * @fires {CustomEvent<Record<string, string | undefined>>} gs-number-range-value-changed
 * Similar to the `gs-number-range-filter-changed` event,
 * but contains an `event.detail` that has a fixed format:
 * ```
 * {
 *     min: number | undefined
 *     max: number | undefined
 * }
 * ```
 * This event should be used when you want to control this component externally.
 * The `event.detail` can be used as the value of the component.
 * Example:
 * ```
 * {
 *     min: 18,
 *     max: undefined
 * }
 * ```
 */
@customElement('gs-number-range-filter')
export class NumberRangeFilterComponent extends PreactLitAdapter {
    /**
     * The value to use for this number filter.
     *
     * Must be of the form:
     * ```
     * {
     *     [`${lapisField}From`]: number | undefined
     *     [`${lapisField}To`]: number | undefined
     * }
     * ```
     *
     * This is the same format that the `gs-number-value-changed` event will emit.
     */
    @property({ type: Object })
    value: { min?: number; max?: number } = {};

    /**
     * Required.
     *
     * The LAPIS field name to use for this text filter.
     * The field must exist on this LAPIS instance.
     */
    @property()
    lapisField = '';

    /**
     * The `min` value to use for the slider.
     */
    @property({ type: Number })
    sliderMin = 0;

    /**
     * The `max` value to use for the slider.
     */
    @property({ type: Number })
    sliderMax = 100;

    /**
     * The `step` value to use for the slider.
     *
     * This attribute has no effect on the text input.
     */
    @property({ type: Number })
    sliderStep = 1;

    /**
     * The width of the component.
     *
     * Visit https://genspectrum.github.io/dashboard-components/?path=/docs/concepts-size-of-components--docs for more information.
     */
    @property({ type: String })
    width: string = '100%';

    override render() {
        return (
            <NumberRangeFilter
                value={this.value}
                lapisField={this.lapisField}
                sliderMin={this.sliderMin}
                sliderMax={this.sliderMax}
                sliderStep={this.sliderStep}
                width={this.width}
            />
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-number-range-filter': NumberRangeFilterComponent;
    }

    interface HTMLElementEventMap {
        [gsEventNames.numberRangeFilterChanged]: NumberRangeFilterChangedEvent;
        [gsEventNames.numberRangeValueChanged]: NumberRangeValueChangedEvent;
    }
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'gs-number-range-filter': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}

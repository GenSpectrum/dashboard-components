import flatpickrStyle from 'flatpickr/dist/flatpickr.css?inline';
import { unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

import { DateRangeFilter, type DateRangeFilterProps } from '../../preact/dateRangeFilter/date-range-filter';
import { type DateRangeOptionChangedEvent } from '../../preact/dateRangeFilter/dateRangeOption';
import { type gsEventNames } from '../../utils/gsEventNames';
import { type Equals, type Expect } from '../../utils/typeAssertions';
import { PreactLitAdapter } from '../PreactLitAdapter';

const flatpickrCss = unsafeCSS(flatpickrStyle);

/**
 * ## Context
 * This component is a group of input fields designed to specify date range filters
 * for a given date column of this Lapis instance. It consists of 3 fields:
 *
 * - a select field to choose a predefined date range,
 * - an input field with an attached date picker for the start date,
 * - an input field with an attached date picker for the end date.
 *
 * Setting a value in the select field will overwrite the previous values of the start and end date.
 * Setting a value in either of the date pickers will set the select field to "custom",
 * which represents an arbitrary date range.
 *
 * @fires {CustomEvent<{ `${dateColumn}From`: string; `${dateColumn}To`: string; }>} gs-date-range-filter-changed
 * Fired when:
 * - The select field is changed,
 * - A date is selected in either of the date pickers,
 * - A date was typed into either of the date input fields, and the input field loses focus ("on blur").
 * Contains the dates in the format `YYYY-MM-DD`.
 *
 * Example: For `dateColumn = yourDate`, an event with `detail` containing
 * ```
 * {
 *  yourDataFrom: "2021-01-01",
 *  yourDataTo: "2021-12-31"
 * }
 *  ```
 *  will be fired.
 *
 *  Use this event, when you want to use the filter directly as a LAPIS filter.
 *
 *
 * @fires {CustomEvent<string | {dateFrom: string, dateTo: string} | null>} gs-date-range-option-changed
 * Fired when:
 * - The select field is changed,
 * - A date is selected in either of the date pickers,
 * - A date was typed into either of the date input fields, and the input field loses focus ("on blur"),
 * - The user deletes the current value by clicking the 'x' button.
 * Contains the selected dateRangeOption or when users select custom values it contains the selected dates
 * or `null` when the input was deleted.
 *
 * Use this event, when you want to control this component in your JS application.
 * You can supply the `detail` of this event to the `value` attribute of this component.
 */
@customElement('gs-date-range-filter')
export class DateRangeFilterComponent extends PreactLitAdapter {
    static override styles = [...PreactLitAdapter.styles, flatpickrCss];

    /**
     * An array of date range options that the select field should provide.
     * The `label` will be shown to the user, and it will be available as `value`.
     * The dates must be in the format `YYYY-MM-DD`.
     *
     * If dateFrom or dateTo is not set, the component will leave the corresponding input field empty.
     *
     * We provide some options in `dateRangeOptionPresets` for convenience.
     */
    @property({ type: Array })
    dateRangeOptions: { label: string; dateFrom?: string; dateTo?: string }[] = [];

    /**
     * The value to use for this date range selector.
     * - If it is a string, then it must be a valid label from the `dateRangeOptions`.
     * - If it is an object, then it accepts dates in the format `YYYY-MM-DD` for the keys `dateFrom` and `dateTo`.
     *   Keys that are not set will leave the corresponding input field empty.
     *
     * The `detail` of the `gs-date-range-option-changed` event can be used for this attribute,
     * if you want to control this component in your JS application.
     */
    @property({
        converter: (value) => {
            if (value === null) {
                return null;
            }
            try {
                const result = JSON.parse(value) as unknown;
                if (typeof result !== 'object' && typeof result !== 'string') {
                    return value;
                }
                return result;
            } catch (_) {
                return value;
            }
        },
    })
    value: string | { dateFrom?: string; dateTo?: string } | null = null;

    /**
     * The width of the component.
     *
     * Visit https://genspectrum.github.io/dashboard-components/?path=/docs/concepts-size-of-components--docs for more information.
     */
    @property({ type: String })
    width: string = '100%';

    /**
     * The placeholder to display on the select dropdown.
     */
    @property({ type: String })
    placeholder: string | undefined = undefined;

    /**
     * The name of the metadata field in LAPIS that contains the date information.
     */
    @property({ type: String })
    lapisDateField: string = '';

    override render() {
        return (
            <DateRangeFilter
                dateRangeOptions={this.dateRangeOptions}
                value={this.value}
                lapisDateField={this.lapisDateField}
                width={this.width}
                placeholder={this.placeholder}
            />
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-date-range-filter': DateRangeFilterComponent;
    }

    interface HTMLElementEventMap {
        [gsEventNames.dateRangeFilterChanged]: CustomEvent<Record<string, string>>;
        [gsEventNames.dateRangeOptionChanged]: DateRangeOptionChangedEvent;
    }
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'gs-date-range-filter': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
type CustomSelectOptionsMatches = Expect<
    Equals<typeof DateRangeFilterComponent.prototype.dateRangeOptions, DateRangeFilterProps['dateRangeOptions']>
>;
type ValueMatches = Expect<Equals<typeof DateRangeFilterComponent.prototype.value, DateRangeFilterProps['value']>>;
type WidthMatches = Expect<Equals<typeof DateRangeFilterComponent.prototype.width, DateRangeFilterProps['width']>>;
type DateColumnMatches = Expect<
    Equals<typeof DateRangeFilterComponent.prototype.lapisDateField, DateRangeFilterProps['lapisDateField']>
>;
/* eslint-enable @typescript-eslint/no-unused-vars, no-unused-vars */

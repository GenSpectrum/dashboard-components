import { customElement, property } from 'lit/decorators.js';

import { DateRangeSelector, type DateRangeSelectorProps } from '../../preact/dateRangeSelector/date-range-selector';
import { type DateRangeOptionChangedEvent } from '../../preact/dateRangeSelector/dateRangeOption';
import { type Equals, type Expect } from '../../utils/typeAssertions';
import { PreactLitAdapter } from '../PreactLitAdapter';

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
 * @fires {CustomEvent<{ string | {dateFrom: string, dateTo: string}}>} gs-date-range-option-changed
 * Fired when:
 * - The select field is changed,
 * - A date is selected in either of the date pickers,
 * - A date was typed into either of the date input fields, and the input field loses focus ("on blur").
 * Contains the selected dateRangeOption or when users select custom values it contains the selected dates.
 *
 * Use this event, when you want to control this component in your JS application.
 */
@customElement('gs-date-range-selector')
export class DateRangeSelectorComponent extends PreactLitAdapter {
    /**
     * An array of date range options that the select field should provide.
     * The `label` will be shown to the user, and it will be available as `initialValue`.
     * The dates must be in the format `YYYY-MM-DD`.
     *
     * If dateFrom or dateTo is not set, the component will default to the `earliestDate` or the current date.
     */
    @property({ type: Array })
    dateRangeOptions: { label: string; dateFrom?: string; dateTo?: string }[] = [];

    /**
     * The `dateFrom` value to use in the `allTimes` preset in the format `YYYY-MM-DD`.
     */
    @property({ type: String })
    earliestDate: string = '1900-01-01';

    /**
     * The initial value to use for this date range selector.
     * Must be a valid label from the `dateRangeOptions`.
     *
     * If the value is not set, the component will default to the range `earliestDate` until today.
     *
     * It will be overwritten if `initialDateFrom` or `initialDateTo` is set.
     *
     * We provide some options in `dateRangeOptionPresets` for convenience.
     */
    @property()
    initialValue: string | undefined = undefined;

    /**
     * A date string in the format `YYYY-MM-DD`.
     * If set, the date range selector will be initialized with the given date (overwriting `initialValue` to `custom`).
     * If `initialDateTo` is set, but this is unset, it will default to `earliestDate`.
     */
    @property()
    initialDateFrom: string | undefined = undefined;

    /**
     * A date string in the format `YYYY-MM-DD`.
     * If set, the date range selector will be initialized with the given date (overwriting `initialValue` to `custom`).
     * If `initialDateFrom` is set, but this is unset, it will default to the current date.
     */
    @property()
    initialDateTo: string | undefined = undefined;

    /**
     * The width of the component.
     *
     * Visit https://genspectrum.github.io/dashboard-components/?path=/docs/components-size-of-components--docs for more information.
     */
    @property({ type: String })
    width: string = '100%';

    /**
     * The name of the metadata field in LAPIS that contains the date information.
     */
    @property({ type: String })
    lapisDateField: string = '';

    override render() {
        return (
            <DateRangeSelector
                dateRangeOptions={this.dateRangeOptions}
                earliestDate={this.earliestDate}
                initialValue={this.initialValue}
                initialDateFrom={this.initialDateFrom}
                initialDateTo={this.initialDateTo}
                lapisDateField={this.lapisDateField}
                width={this.width}
            />
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-date-range-selector': DateRangeSelectorComponent;
    }

    interface HTMLElementEventMap {
        'gs-date-range-filter-changed': CustomEvent<Record<string, string>>;
        'gs-date-range-option-changed': DateRangeOptionChangedEvent;
    }
}

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'gs-date-range-selector': Partial<DateRangeSelectorProps>;
        }
    }
}

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
type CustomSelectOptionsMatches = Expect<
    Equals<typeof DateRangeSelectorComponent.prototype.dateRangeOptions, DateRangeSelectorProps['dateRangeOptions']>
>;
type EarliestDateMatches = Expect<
    Equals<typeof DateRangeSelectorComponent.prototype.earliestDate, DateRangeSelectorProps['earliestDate']>
>;
type InitialValueMatches = Expect<
    Equals<typeof DateRangeSelectorComponent.prototype.initialValue, DateRangeSelectorProps['initialValue']>
>;
type InitialDateFromMatches = Expect<
    Equals<typeof DateRangeSelectorComponent.prototype.initialDateFrom, DateRangeSelectorProps['initialDateFrom']>
>;
type InitialDateToMatches = Expect<
    Equals<typeof DateRangeSelectorComponent.prototype.initialDateTo, DateRangeSelectorProps['initialDateTo']>
>;
type WidthMatches = Expect<Equals<typeof DateRangeSelectorComponent.prototype.width, DateRangeSelectorProps['width']>>;
type DateColumnMatches = Expect<
    Equals<typeof DateRangeSelectorComponent.prototype.lapisDateField, DateRangeSelectorProps['lapisDateField']>
>;
/* eslint-enable @typescript-eslint/no-unused-vars, no-unused-vars */

import { customElement, property } from 'lit/decorators.js';
import { type DetailedHTMLProps, type HTMLAttributes } from 'react';

import { DateRangeSelector, type DateRangeSelectorProps } from '../../preact/dateRangeSelector/date-range-selector';
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
 * @fires {CustomEvent<{ `${dateColumn}From`: string; `${dateColumn}To`: string; }>} gs-date-range-changed
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
 */
@customElement('gs-date-range-selector')
export class DateRangeSelectorComponent extends PreactLitAdapter {
    /**
     * An array of custom options that the select field should provide,
     * in addition to the predefined options.
     * The `label` will be shown to the user, and it will be available as `initialValue`.
     * The dates must be in the format `YYYY-MM-DD`.
     */
    @property({ type: Array })
    customSelectOptions: { label: string; dateFrom: string; dateTo: string }[] = [];

    /**
     * The `dateFrom` value to use in the `allTimes` preset in the format `YYYY-MM-DD`.
     */
    @property({ type: String })
    earliestDate: string = '1900-01-01';

    // prettier-ignore
    // The multiline union type must not start with `| 'custom'` - Storybook will list "" as the first type which is wrong
    /**
     * The initial value to use for this date range selector.
     * Must be a valid label from the preset labels or a `label` given in the `customSelectOptions`.
     *
     * If the value is invalid, the component will default to `'last6Months'`.
     *
     * It will be overwritten if `initialDateFrom` or `initialDateTo` is set.
     */
    @property()
    initialValue:
        'custom'
        | 'allTimes'
        | 'last2Weeks'
        | 'lastMonth'
        | 'last2Months'
        | 'last3Months'
        | 'last6Months'
        | string = 'last6Months';

    /**
     * A date string in the format `YYYY-MM-DD`.
     * If set, the date range selector will be initialized with the given date (overwriting `initialValue` to `custom`).
     * If `initialDateTo` is set, but this is unset, it will default to `earliestDate`.
     */
    @property()
    initialDateFrom: string = '';

    /**
     * A date string in the format `YYYY-MM-DD`.
     * If set, the date range selector will be initialized with the given date (overwriting `initialValue` to `custom`).
     * If `initialDateFrom` is set, but this is unset, it will default to the current date.
     */
    @property()
    initialDateTo: string = '';

    /**
     * The width of the component.
     *
     * Visit https://genspectrum.github.io/dashboard-components/?path=/docs/components-size-of-components--docs for more information.
     */
    @property({ type: String })
    width: string = '100%';

    /**
     * The name of the column in LAPIS that contains the date information.
     */
    @property({ type: String })
    dateColumn: string = 'date';

    override render() {
        return (
            <DateRangeSelector
                customSelectOptions={this.customSelectOptions}
                earliestDate={this.earliestDate}
                initialValue={this.initialValue}
                initialDateFrom={this.initialDateFrom}
                initialDateTo={this.initialDateTo}
                dateColumn={this.dateColumn}
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
        'gs-date-range-changed': CustomEvent<Record<string, string>>;
    }
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'gs-date-range-selector': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
type CustomSelectOptionsMatches = Expect<
    Equals<
        typeof DateRangeSelectorComponent.prototype.customSelectOptions,
        DateRangeSelectorProps<string>['customSelectOptions']
    >
>;
type EarliestDateMatches = Expect<
    Equals<typeof DateRangeSelectorComponent.prototype.earliestDate, DateRangeSelectorProps<string>['earliestDate']>
>;
type InitialValueMatches = Expect<
    Equals<typeof DateRangeSelectorComponent.prototype.initialValue, DateRangeSelectorProps<string>['initialValue']>
>;
type InitialDateFromMatches = Expect<
    Equals<
        typeof DateRangeSelectorComponent.prototype.initialDateFrom,
        DateRangeSelectorProps<string>['initialDateFrom']
    >
>;
type InitialDateToMatches = Expect<
    Equals<typeof DateRangeSelectorComponent.prototype.initialDateTo, DateRangeSelectorProps<string>['initialDateTo']>
>;
type WidthMatches = Expect<
    Equals<typeof DateRangeSelectorComponent.prototype.width, DateRangeSelectorProps<string>['width']>
>;
type DateColumnMatches = Expect<
    Equals<typeof DateRangeSelectorComponent.prototype.dateColumn, DateRangeSelectorProps<string>['dateColumn']>
>;
/* eslint-enable @typescript-eslint/no-unused-vars, no-unused-vars */

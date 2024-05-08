import { customElement, property } from 'lit/decorators.js';

import {
    type CustomSelectOption,
    DateRangeSelector,
    type PresetOptionValues,
} from '../../preact/dateRangeSelector/date-range-selector';
import { type Equals, type Expect } from '../../utils/typeAssertions';
import { PreactLitAdapter } from '../PreactLitAdapter';

/**
 * This component is a group of input fields designed to specify a date range. It consists of 3 fields:
 *
 * - a select field to choose a predefined date range,
 * - an input field with an attached date picker for the start date,
 * - an input field with an attached date picker for the end date.
 *
 * Setting a value in the select field will overwrite the previous values of the start and end date.
 * Setting a value in either of the date pickers will set the select field to "custom",
 * which represents an arbitrary date range.
 *
 * @fires {CustomEvent<{ dateFrom: string; dateTo: string; }>} gs-date-range-changed
 * Fired when:
 * - The select field is changed,
 * - A date is selected in either of the date pickers,
 * - A date was typed into either of the date input fields, and the input field loses focus ("on blur").
 * Contains the dates in the format `YYYY-MM-DD`.
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
    earliestDate: string | undefined = '1900-01-01';

    // prettier-ignore
    // The multiline union type must not start with `| 'custom'` - Storybook will list "" as the first type which is wrong
    /**
     * The initial value to use for this date range selector.
     * Must be a valid label from the preset labels or a `label` given in the `customSelectOptions`.
     *
     * If the value is invalid, the component will default to `'last6Months'`.
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
        | string
        | undefined = 'last6Months';

    override render() {
        return (
            <DateRangeSelector
                customSelectOptions={this.customSelectOptions}
                earliestDate={this.earliestDate}
                initialValue={this.initialValue}
            />
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-date-range-selector': DateRangeSelectorComponent;
    }

    interface HTMLElementEventMap {
        'gs-date-range-changed': CustomEvent<{
            dateFrom: string;
            dateTo: string;
        }>;
    }
}

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
type CustomSelectOptionsMatches = Expect<
    Equals<typeof DateRangeSelectorComponent.prototype.customSelectOptions, CustomSelectOption<string>[]>
>;
type InitialValueMatches = Expect<
    Equals<typeof DateRangeSelectorComponent.prototype.initialValue, PresetOptionValues | string | undefined>
>;
/* eslint-enable @typescript-eslint/no-unused-vars, no-unused-vars */

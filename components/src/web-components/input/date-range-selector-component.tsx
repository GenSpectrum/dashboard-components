import { customElement, property } from 'lit/decorators.js';

import { type CustomSelectOption, DateRangeSelector } from '../../preact/dateRangeSelector/date-range-selector';
import { PreactLitAdapter } from '../PreactLitAdapter';

/**
 * @fires {CustomEvent<{ dateFrom: string; dateTo: string; }>} gs-date-range-changed - When the date range has changed
 */
@customElement('gs-date-range-selector')
export class DateRangeSelectorComponent extends PreactLitAdapter {
    @property({ type: Array })
    customSelectOptions: CustomSelectOption[] = [];

    @property({ type: String })
    earliestDate: string | undefined = '1900-01-01';

    override render() {
        return <DateRangeSelector customSelectOptions={this.customSelectOptions} earliestDate={this.earliestDate} />;
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

import { customElement, property } from 'lit/decorators.js';

import { type CustomSelectOption, DateRangeSelector } from '../../preact/dateRangeSelector/date-range-selector';
import { PreactLitAdapter } from '../PreactLitAdapter';

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
}

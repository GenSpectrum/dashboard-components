import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import flatpickr from 'flatpickr';
import '../container/component-select';

import 'flatpickr/dist/flatpickr.min.css';
import { TailwindElement } from '../../tailwind-element';

export type customSelectOption = { label: string; dateFrom: string; dateTo: string };

@customElement('gs-date-range-selector')
export class DateRangeSelector extends TailwindElement() {
    private dateFromPicker: flatpickr.Instance | null = null;
    private dateToPicker: flatpickr.Instance | null = null;

    @query('#date-picker') datePickerContainer!: HTMLInputElement;
    @query('#end-date-picker') endDatePickerContainer!: HTMLInputElement;

    @property({ type: String })
    selectedValue = 'last6Months';

    @property({ type: Array })
    customSelectOptions: customSelectOption[] = [];

    @property({ type: String })
    earliestDate: string = '1900-01-01';

    private selectableOptions() {
        const presetOptions = [
            { label: 'Custom', value: 'custom' },
            { label: 'All times', value: 'allTimes' },
            { label: 'Last 2 weeks', value: 'last2Weeks' },
            { label: 'Last month', value: 'lastMonth' },
            { label: 'Last 2 weeks', value: 'last2Weeks' },
            { label: 'Last month', value: 'lastMonth' },
            { label: 'Last 2 months', value: 'last2Months' },
            { label: 'Last 3 months', value: 'last3Months' },
            { label: 'Last 6 months', value: 'last6Months' },
        ];

        const customOptions = this.customSelectOptions.map((customSelectOption) => {
            return { label: customSelectOption.label, value: this.customLabelToOptionValue(customSelectOption.label) };
        });

        return [...presetOptions, ...customOptions];
    }

    private customLabelToOptionValue(customLabel: string) {
        return `${customLabel}customLabel`;
    }

    override firstUpdated() {
        const commonConfig = {
            allowInput: true,
            dateFormat: 'Y-m-d',
        };

        this.dateFromPicker = flatpickr(this.datePickerContainer, {
            ...commonConfig,
            defaultDate: this.getDatesForSelectorValue('last6Months').dateFrom,
            onChange: (selectedDates) => {
                this.dateToPicker?.set('minDate', selectedDates[0]);
                this.selectedValue = 'custom';
            },
        });

        this.dateToPicker = flatpickr(this.endDatePickerContainer, {
            ...commonConfig,
            defaultDate: this.getDatesForSelectorValue('last6Months').dateTo,
            onChange: (selectedDates) => {
                this.dateFromPicker?.set('maxDate', selectedDates[0]);
                this.selectedValue = 'custom';
            },
        });
    }

    private getDatesForSelectorValue(selectorValue: string) {
        const today = new Date();

        const customSelectOption = this.customSelectOptions.find(
            (option) => this.customLabelToOptionValue(option.label) === selectorValue,
        );
        if (customSelectOption) {
            return { dateFrom: customSelectOption.dateFrom, dateTo: customSelectOption.dateTo };
        }

        switch (selectorValue) {
            case 'last2Weeks': {
                const twoWeeksAgo = new Date(today);
                twoWeeksAgo.setDate(today.getDate() - 14);
                return { dateFrom: twoWeeksAgo, dateTo: today };
            }
            case 'lastMonth': {
                const lastMonth = new Date(today);
                lastMonth.setMonth(today.getMonth() - 1);
                return { dateFrom: lastMonth, dateTo: today };
            }
            case 'last2Months': {
                const twoMonthsAgo = new Date(today);
                twoMonthsAgo.setMonth(today.getMonth() - 2);
                return { dateFrom: twoMonthsAgo, dateTo: today };
            }
            case 'last3Months': {
                const threeMonthsAgo = new Date(today);
                threeMonthsAgo.setMonth(today.getMonth() - 3);
                return { dateFrom: threeMonthsAgo, dateTo: today };
            }
            case 'last6Months': {
                const sixMonthsAgo = new Date(today);
                sixMonthsAgo.setMonth(today.getMonth() - 6);
                return { dateFrom: sixMonthsAgo, dateTo: today };
            }
            case 'allTimes': {
                return { dateFrom: this.earliestDate, dateTo: today };
            }
        }
        const currentDateFrom = this.dateFromPicker?.selectedDates;
        const currentDateTo = this.dateToPicker?.selectedDates;

        return {
            dateFrom: currentDateFrom ? currentDateFrom[0] : today,
            dateTo: currentDateTo ? currentDateTo[0] : today,
        };
    }

    private onSelectChange(event: CustomEvent<{ value: string }>) {
        const value = event.detail.value;
        this.selectedValue = value;

        const dateRange = this.getDatesForSelectorValue(value);

        this.dateToPicker?.set('minDate', dateRange.dateFrom);
        this.dateFromPicker?.set('maxDate', dateRange.dateTo);

        this.dateFromPicker?.setDate(dateRange.dateFrom);
        this.dateToPicker?.setDate(dateRange.dateTo);
    }

    override createRenderRoot() {
        return this;
    }

    override render() {
        return html`
            <div class="join">
                <gs-select
                    class="join-item"
                    .items=${this.selectableOptions()}
                    .selected=${this.selectedValue}
                    selectStyle="select-bordered rounded-none"
                    @selectChange=${this.onSelectChange}
                ></gs-select>
                <input
                    class="input input-bordered rounded-none join-item"
                    type="text"
                    placeholder="Date from"
                    id="date-picker"
                />
                <input
                    class="input input-bordered rounded-none join-item"
                    type="text"
                    placeholder="Date to"
                    id="end-date-picker"
                />
            </div>
        `;
    }
}

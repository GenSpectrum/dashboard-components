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
        });

        this.dateToPicker = flatpickr(this.endDatePickerContainer, {
            ...commonConfig,
            defaultDate: this.getDatesForSelectorValue('last6Months').dateTo,
        });
    }

    private getDatesForSelectorValue(selectorValue: string) {
        const today = new Date();

        const customSelectOption = this.customSelectOptions.find(
            (option) => this.customLabelToOptionValue(option.label) === selectorValue,
        );
        if (customSelectOption) {
            return { dateFrom: new Date(customSelectOption.dateFrom), dateTo: new Date(customSelectOption.dateTo) };
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
                return { dateFrom: new Date(this.earliestDate), dateTo: today };
            }
        }
        const currentDateFrom = this.dateFromPicker?.selectedDates;
        const currentDateTo = this.dateToPicker?.selectedDates;

        return {
            dateFrom: currentDateFrom ? currentDateFrom[0] : today,
            dateTo: currentDateTo ? currentDateTo[0] : today,
        };
    }

    override createRenderRoot() {
        return this;
    }

    override render() {
        return html`
            <div class="join">
                <gs-select
                    class=" join-item"
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
                    @change=${() => {
                        this.onChangeDateFrom();
                    }}
                />
                <input
                    class="input input-bordered rounded-none join-item"
                    type="text"
                    placeholder="Date to"
                    id="end-date-picker"
                    @change=${() => {
                        this.onChangeDateTo();
                    }}
                />
            </div>
        `;
    }

    selectedDates = {
        dateFrom: this.getDatesForSelectorValue('last6Months').dateFrom,
        dateTo: this.getDatesForSelectorValue('last6Months').dateTo,
    };

    private onSelectChange(event: CustomEvent<{ value: string }>) {
        const value = event.detail.value;
        this.selectedValue = value;

        const dateRange = this.getDatesForSelectorValue(value);

        this.dateToPicker?.set('minDate', dateRange.dateFrom);
        this.dateFromPicker?.set('maxDate', dateRange.dateTo);

        this.dateFromPicker?.setDate(dateRange.dateFrom);
        this.dateToPicker?.setDate(dateRange.dateTo);

        this.selectedDates = {
            dateFrom: dateRange.dateFrom,
            dateTo: dateRange.dateTo,
        };

        this.submit();
    }

    private onChangeDateFrom() {
        if (this.selectedDates.dateFrom.toDateString() === this.dateFromPicker?.selectedDates[0].toDateString()) {
            return;
        }

        this.selectedDates.dateFrom = this.dateFromPicker?.selectedDates[0] || new Date();
        this.dateToPicker?.set('minDate', this.dateFromPicker?.selectedDates[0]);
        this.selectedValue = 'custom';

        this.submit();
    }

    private onChangeDateTo() {
        if (this.selectedDates.dateTo.toDateString() === this.dateToPicker?.selectedDates[0].toDateString()) {
            return;
        }

        this.selectedDates.dateTo = this.dateToPicker?.selectedDates[0] || new Date();
        this.dateFromPicker?.set('maxDate', this.dateToPicker?.selectedDates[0]);
        this.selectedValue = 'custom';

        this.submit();
    }

    private submit() {
        const dateFrom = toYYYYMMDD(this.dateFromPicker?.selectedDates[0]);
        const dateTo = toYYYYMMDD(this.dateToPicker?.selectedDates[0]);

        const detail = {
            ...(dateFrom !== undefined && { dateFrom }),
            ...(dateTo !== undefined && { dateTo }),
        };

        this.dispatchEvent(
            new CustomEvent('gs-date-range-changed', {
                detail,
                bubbles: true,
                composed: true,
            }),
        );
    }
}

export const toYYYYMMDD = (date?: Date) => {
    if (!date) {
        return undefined;
    }

    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('en-CA', options);
};

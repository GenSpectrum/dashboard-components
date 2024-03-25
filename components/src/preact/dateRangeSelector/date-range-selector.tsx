import { FunctionComponent } from 'preact';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { useEffect, useRef, useState } from 'preact/hooks';
import { Select } from '../components/select';
import type { ScaleType } from '../../components/charts/getYAxisScale';

export type CustomSelectOption = { label: string; dateFrom: string; dateTo: string };

export interface DateRangeSelectorProps {
    customSelectOptions: CustomSelectOption[];
    earliestDate?: string;
}

export const DateRangeSelector: FunctionComponent<DateRangeSelectorProps> = ({
    customSelectOptions,
    earliestDate = '1900-01-01',
}) => {
    const datePickerRef = useRef<HTMLInputElement>(null);
    const endDatePickerRef = useRef<HTMLInputElement>(null);
    const divRef = useRef<HTMLDivElement>(null);
    const [dateFromPicker, setDateFromPicker] = useState<flatpickr.Instance | null>(null);
    const [dateToPicker, setDateToPicker] = useState<flatpickr.Instance | null>(null);

    const [selectedDateRange, setSelectedDateRange] = useState('last6Months');
    const [selectedDates, setSelectedDates] = useState<{ dateFrom: Date; dateTo: Date }>({
        dateFrom: getDatesForSelectorValue('last6Months', customSelectOptions, earliestDate).dateFrom,
        dateTo: getDatesForSelectorValue('last6Months', customSelectOptions, earliestDate).dateTo,
    });

    useEffect(() => {
        const commonConfig = {
            allowInput: true,
            dateFormat: 'Y-m-d',
        };

        if (datePickerRef.current) {
            setDateFromPicker(
                flatpickr(datePickerRef.current, {
                    ...commonConfig,
                    defaultDate: selectedDates.dateFrom,
                }),
            );
        }

        if (endDatePickerRef.current) {
            setDateToPicker(
                flatpickr(endDatePickerRef.current, {
                    ...commonConfig,
                    defaultDate: selectedDates.dateTo,
                }),
            );
        }

        return () => {
            dateFromPicker?.destroy();
            dateToPicker?.destroy();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [datePickerRef, endDatePickerRef]);

    const selectableOptions = () => {
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

        const customOptions = customSelectOptions.map((customSelectOption) => {
            return { label: customSelectOption.label, value: customLabelToOptionValue(customSelectOption.label) };
        });

        return [...presetOptions, ...customOptions];
    };

    const onSelectChange = (value: string) => {
        setSelectedDateRange(value);

        const dateRange = getDatesForSelectorValue(value, customSelectOptions, earliestDate);

        dateToPicker?.set('minDate', dateRange.dateFrom);
        dateFromPicker?.set('maxDate', dateRange.dateTo);

        dateFromPicker?.setDate(dateRange.dateFrom);
        dateToPicker?.setDate(dateRange.dateTo);

        setSelectedDates({
            dateFrom: dateRange.dateFrom,
            dateTo: dateRange.dateTo,
        });

        submit();
    };

    const onChangeDateFrom = () => {
        if (selectedDates.dateFrom.toDateString() === dateFromPicker?.selectedDates[0].toDateString()) {
            return;
        }

        selectedDates.dateFrom = dateFromPicker?.selectedDates[0] || new Date();
        dateToPicker?.set('minDate', dateFromPicker?.selectedDates[0]);
        setSelectedDateRange('custom');

        submit();
    };

    const onChangeDateTo = () => {
        if (selectedDates.dateTo.toDateString() === dateToPicker?.selectedDates[0].toDateString()) {
            return;
        }

        selectedDates.dateTo = dateToPicker?.selectedDates[0] || new Date();
        dateFromPicker?.set('maxDate', dateToPicker?.selectedDates[0]);
        setSelectedDateRange('custom');

        submit();
    };

    const submit = () => {
        const dateFrom = toYYYYMMDD(dateFromPicker?.selectedDates[0]);
        const dateTo = toYYYYMMDD(dateToPicker?.selectedDates[0]);

        const detail = {
            ...(dateFrom !== undefined && { dateFrom }),
            ...(dateTo !== undefined && { dateTo }),
        };

        divRef.current?.dispatchEvent(
            new CustomEvent('gs-date-range-changed', {
                detail,
                bubbles: true,
                composed: true,
            }),
        );
    };

    return (
        <div class='join' ref={divRef}>
            <Select
                items={selectableOptions()}
                selected={selectedDateRange}
                selectStyle='select-bordered rounded-none join-item'
                onChange={(event: Event) => {
                    event.preventDefault();
                    const select = event.target as HTMLSelectElement;
                    const value = select.value as ScaleType;
                    onSelectChange(value);
                }}
            />
            <input
                class='input input-bordered rounded-none join-item'
                type='text'
                placeholder='Date from'
                ref={datePickerRef}
                onChange={onChangeDateFrom}
                onBlur={onChangeDateFrom}
            />
            <input
                class='input input-bordered rounded-none join-item'
                type='text'
                placeholder='Date to'
                ref={endDatePickerRef}
                onChange={onChangeDateTo}
                onBlur={onChangeDateFrom}
            />
        </div>
    );
};

const customLabelToOptionValue = (customLabel: string) => {
    return `${customLabel}customLabel`;
};

const getDatesForSelectorValue = (
    selectorValue: string,
    customSelectOptions: CustomSelectOption[],
    earliestDate: string,
) => {
    const today = new Date();

    const customSelectOption = customSelectOptions.find(
        (option) => customLabelToOptionValue(option.label) === selectorValue,
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
            return { dateFrom: new Date(earliestDate), dateTo: today };
        }
        default:
            return { dateFrom: today, dateTo: today };
    }
};

export const toYYYYMMDD = (date?: Date) => {
    if (!date) {
        return undefined;
    }

    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('en-CA', options);
};

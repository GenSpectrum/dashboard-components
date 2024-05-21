import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { useEffect, useRef, useState } from 'preact/hooks';

import { toYYYYMMDD } from './dateConversion';
import { ErrorBoundary } from '../components/error-boundary';
import { ResizeContainer } from '../components/resize-container';
import { Select } from '../components/select';
import type { ScaleType } from '../shared/charts/getYAxisScale';

export type CustomSelectOption<CustomLabel extends string> = { label: CustomLabel; dateFrom: string; dateTo: string };

export interface DateRangeSelectorProps<CustomLabel extends string> extends DateRangeSelectorPropsInner<CustomLabel> {
    width: string;
}

export interface DateRangeSelectorPropsInner<CustomLabel extends string> {
    customSelectOptions: CustomSelectOption<CustomLabel>[];
    earliestDate?: string;
    initialValue?: PresetOptionValues | CustomLabel;
    dateColumn: string;
}

export const PRESET_VALUE_CUSTOM = 'custom';
export const PRESET_VALUE_ALL_TIMES = 'allTimes';
export const PRESET_VALUE_LAST_2_WEEKS = 'last2Weeks';
export const PRESET_VALUE_LAST_MONTH = 'lastMonth';
export const PRESET_VALUE_LAST_2_MONTHS = 'last2Months';
export const PRESET_VALUE_LAST_3_MONTHS = 'last3Months';
export const PRESET_VALUE_LAST_6_MONTHS = 'last6Months';

export const presets = {
    [PRESET_VALUE_CUSTOM]: { label: 'Custom' },
    [PRESET_VALUE_ALL_TIMES]: { label: 'All times' },
    [PRESET_VALUE_LAST_2_WEEKS]: { label: 'Last 2 weeks' },
    [PRESET_VALUE_LAST_MONTH]: { label: 'Last month' },
    [PRESET_VALUE_LAST_2_MONTHS]: { label: 'Last 2 months' },
    [PRESET_VALUE_LAST_3_MONTHS]: { label: 'Last 3 months' },
    [PRESET_VALUE_LAST_6_MONTHS]: { label: 'Last 6 months' },
};

export type PresetOptionValues = keyof typeof presets;

export const DateRangeSelector = <CustomLabel extends string>({
    customSelectOptions,
    earliestDate = '1900-01-01',
    initialValue,
    width,
    dateColumn,
}: DateRangeSelectorProps<CustomLabel>) => {
    const size = { width, height: '3rem' };

    return (
        <ErrorBoundary size={size}>
            <ResizeContainer size={size}>
                <DateRangeSelectorInner
                    customSelectOptions={customSelectOptions}
                    earliestDate={earliestDate}
                    initialValue={initialValue}
                    dateColumn={dateColumn}
                />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

export const DateRangeSelectorInner = <CustomLabel extends string>({
    customSelectOptions,
    earliestDate = '1900-01-01',
    initialValue,
    dateColumn,
}: DateRangeSelectorPropsInner<CustomLabel>) => {
    const fromDatePickerRef = useRef<HTMLInputElement>(null);
    const toDatePickerRef = useRef<HTMLInputElement>(null);
    const divRef = useRef<HTMLDivElement>(null);
    const [dateFromPicker, setDateFromPicker] = useState<flatpickr.Instance | null>(null);
    const [dateToPicker, setDateToPicker] = useState<flatpickr.Instance | null>(null);

    const selectableOptions = getSelectableOptions(customSelectOptions);

    const initialSelectedDateRange =
        initialValue !== undefined && selectableOptions.some((option) => option.value === initialValue)
            ? initialValue
            : PRESET_VALUE_LAST_6_MONTHS;
    const [selectedDateRange, setSelectedDateRange] = useState<CustomLabel | PresetOptionValues>(
        initialSelectedDateRange,
    );

    const [selectedDates, setSelectedDates] = useState<{ dateFrom: Date; dateTo: Date }>({
        dateFrom: getDatesForSelectorValue(initialSelectedDateRange, customSelectOptions, earliestDate).dateFrom,
        dateTo: getDatesForSelectorValue(initialSelectedDateRange, customSelectOptions, earliestDate).dateTo,
    });

    useEffect(() => {
        const commonConfig = {
            allowInput: true,
            dateFormat: 'Y-m-d',
        };

        if (fromDatePickerRef.current) {
            setDateFromPicker(
                flatpickr(fromDatePickerRef.current, {
                    ...commonConfig,
                    defaultDate: selectedDates.dateFrom,
                }),
            );
        }

        if (toDatePickerRef.current) {
            setDateToPicker(
                flatpickr(toDatePickerRef.current, {
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
    }, [fromDatePickerRef, toDatePickerRef]);

    const onSelectChange = (value: CustomLabel | PresetOptionValues) => {
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
            ...(dateFrom !== undefined && { [`${dateColumn}From`]: dateFrom }),
            ...(dateTo !== undefined && { [`${dateColumn}To`]: dateTo }),
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
        <div class='join w-full' ref={divRef}>
            <Select
                items={selectableOptions}
                selected={selectedDateRange}
                selectStyle='select-bordered rounded-none join-item grow'
                onChange={(event: Event) => {
                    event.preventDefault();
                    const select = event.target as HTMLSelectElement;
                    const value = select.value as ScaleType;
                    onSelectChange(value as CustomLabel | PresetOptionValues);
                }}
            />
            <input
                class='input input-bordered rounded-none join-item grow'
                type='text'
                placeholder='Date from'
                ref={fromDatePickerRef}
                onChange={onChangeDateFrom}
                onBlur={onChangeDateFrom}
            />
            <input
                class='input input-bordered rounded-none join-item grow'
                type='text'
                placeholder='Date to'
                ref={toDatePickerRef}
                onChange={onChangeDateTo}
                onBlur={onChangeDateTo}
            />
        </div>
    );
};

const getSelectableOptions = <Label extends string>(customSelectOptions: CustomSelectOption<Label>[]) => {
    const presetOptions = Object.entries(presets).map(([key, value]) => {
        return { label: value.label, value: key };
    });

    const customOptions = customSelectOptions.map((customSelectOption) => {
        return { label: customSelectOption.label, value: customSelectOption.label };
    });

    return [...presetOptions, ...customOptions];
};

const getDatesForSelectorValue = <Label extends string>(
    selectorValue: string,
    customSelectOptions: CustomSelectOption<Label>[],
    earliestDate: string,
) => {
    const today = new Date();

    const customSelectOption = customSelectOptions.find((option) => option.label === selectorValue);
    if (customSelectOption) {
        return { dateFrom: new Date(customSelectOption.dateFrom), dateTo: new Date(customSelectOption.dateTo) };
    }

    switch (selectorValue) {
        case PRESET_VALUE_LAST_2_WEEKS: {
            const twoWeeksAgo = new Date(today);
            twoWeeksAgo.setDate(today.getDate() - 14);
            return { dateFrom: twoWeeksAgo, dateTo: today };
        }
        case PRESET_VALUE_LAST_MONTH: {
            const lastMonth = new Date(today);
            lastMonth.setMonth(today.getMonth() - 1);
            return { dateFrom: lastMonth, dateTo: today };
        }
        case PRESET_VALUE_LAST_2_MONTHS: {
            const twoMonthsAgo = new Date(today);
            twoMonthsAgo.setMonth(today.getMonth() - 2);
            return { dateFrom: twoMonthsAgo, dateTo: today };
        }
        case PRESET_VALUE_LAST_3_MONTHS: {
            const threeMonthsAgo = new Date(today);
            threeMonthsAgo.setMonth(today.getMonth() - 3);
            return { dateFrom: threeMonthsAgo, dateTo: today };
        }
        case PRESET_VALUE_LAST_6_MONTHS: {
            const sixMonthsAgo = new Date(today);
            sixMonthsAgo.setMonth(today.getMonth() - 6);
            return { dateFrom: sixMonthsAgo, dateTo: today };
        }
        case PRESET_VALUE_ALL_TIMES: {
            return { dateFrom: new Date(earliestDate), dateTo: today };
        }
        default:
            return { dateFrom: today, dateTo: today };
    }
};

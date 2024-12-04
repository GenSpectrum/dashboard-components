import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { useEffect, useRef, useState } from 'preact/hooks';
import z from 'zod';

import { computeInitialValues } from './computeInitialValues';
import { toYYYYMMDD } from './dateConversion';
import { DateRangeOptionChangedEvent, dateRangeOptionSchema, type DateRangeSelectOption } from './dateRangeOption';
import { getDatesForSelectorValue, getSelectableOptions } from './selectableOptions';
import { ErrorBoundary } from '../components/error-boundary';
import { Select } from '../components/select';
import type { ScaleType } from '../shared/charts/getYAxisScale';

const customOption = 'Custom';

const dateRangeSelectorInnerPropsSchema = z.object({
    dateRangeOptions: z.array(dateRangeOptionSchema),
    earliestDate: z.string().date(),
    initialValue: z.string().optional(),
    initialDateFrom: z.string().date().optional(),
    initialDateTo: z.string().date().optional(),
    dateColumn: z.string(),
});

const dateRangeSelectorPropsSchema = dateRangeSelectorInnerPropsSchema.extend({
    width: z.string(),
});

export type DateRangeSelectorProps = z.infer<typeof dateRangeSelectorPropsSchema>;
export type DateRangeSelectorInnerProps = z.infer<typeof dateRangeSelectorInnerPropsSchema>;

export const DateRangeSelector = (props: DateRangeSelectorProps) => {
    const { width, ...innerProps } = props;
    const size = { width, height: '3rem' };

    return (
        <ErrorBoundary size={size} layout='horizontal' componentProps={props} schema={dateRangeSelectorPropsSchema}>
            <div style={{ width }}>
                <DateRangeSelectorInner {...innerProps} />
            </div>
        </ErrorBoundary>
    );
};

export const DateRangeSelectorInner = ({
    dateRangeOptions,
    earliestDate = '1900-01-01',
    initialValue,
    dateColumn,
    initialDateFrom,
    initialDateTo,
}: DateRangeSelectorInnerProps) => {
    const initialValues = computeInitialValues(
        initialValue,
        initialDateFrom,
        initialDateTo,
        earliestDate,
        dateRangeOptions,
    );

    const fromDatePickerRef = useRef<HTMLInputElement>(null);
    const toDatePickerRef = useRef<HTMLInputElement>(null);
    const divRef = useRef<HTMLDivElement>(null);
    const [dateFromPicker, setDateFromPicker] = useState<flatpickr.Instance | null>(null);
    const [dateToPicker, setDateToPicker] = useState<flatpickr.Instance | null>(null);

    const [selectedDateRange, setSelectedDateRange] = useState<string | undefined>(
        initialValues.initialSelectedDateRange,
    );

    const [selectedDates, setSelectedDates] = useState<{ dateFrom: Date; dateTo: Date }>({
        dateFrom: initialValues.initialSelectedDateFrom,
        dateTo: initialValues.initialSelectedDateTo,
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

    const onSelectChange = (value: string) => {
        setSelectedDateRange(value);

        const dateRange = getDatesForSelectorValue(value, dateRangeOptions, earliestDate);

        dateToPicker?.set('minDate', dateRange.dateFrom);
        dateFromPicker?.set('maxDate', dateRange.dateTo);

        dateFromPicker?.setDate(dateRange.dateFrom);
        dateToPicker?.setDate(dateRange.dateTo);

        setSelectedDates({
            dateFrom: dateRange.dateFrom,
            dateTo: dateRange.dateTo,
        });

        fireFilterChangedEvent();
        fireOptionChangedEvent(value);
    };

    const onChangeDateFrom = () => {
        if (selectedDates.dateFrom.toDateString() === dateFromPicker?.selectedDates[0].toDateString()) {
            return;
        }

        const dateTo = dateToPicker?.selectedDates[0];
        const dateFrom = dateFromPicker?.selectedDates[0];

        selectedDates.dateFrom = dateFrom || new Date();
        dateToPicker?.set('minDate', dateFrom);
        setSelectedDateRange(customOption);

        fireFilterChangedEvent();
        fireOptionChangedEvent({
            dateFrom: dateFrom !== undefined ? toYYYYMMDD(dateFrom) : earliestDate,
            dateTo: toYYYYMMDD(dateTo || new Date())!,
        });
    };

    const onChangeDateTo = () => {
        if (selectedDates.dateTo.toDateString() === dateToPicker?.selectedDates[0].toDateString()) {
            return;
        }

        const dateTo = dateToPicker?.selectedDates[0];
        const dateFrom = dateFromPicker?.selectedDates[0];

        selectedDates.dateTo = dateTo || new Date();
        dateFromPicker?.set('maxDate', dateTo);
        setSelectedDateRange(customOption);

        fireFilterChangedEvent();
        fireOptionChangedEvent({
            dateFrom: dateFrom !== undefined ? toYYYYMMDD(dateFrom) : earliestDate,
            dateTo: toYYYYMMDD(dateTo || new Date())!,
        });
    };

    const fireOptionChangedEvent = (option: DateRangeSelectOption) => {
        divRef.current?.dispatchEvent(new DateRangeOptionChangedEvent(option));
    };

    const fireFilterChangedEvent = () => {
        const dateFrom = dateFromPicker?.selectedDates[0];
        const dateTo = dateToPicker?.selectedDates[0];

        const detail = {
            ...(dateFrom !== undefined && { [`${dateColumn}From`]: toYYYYMMDD(dateFrom) }),
            ...(dateTo !== undefined && { [`${dateColumn}To`]: toYYYYMMDD(dateTo) }),
        };

        divRef.current?.dispatchEvent(
            new CustomEvent('gs-date-range-filter-changed', {
                detail,
                bubbles: true,
                composed: true,
            }),
        );
    };

    return (
        <div class='flex flex-wrap' ref={divRef}>
            <Select
                items={[
                    ...getSelectableOptions(dateRangeOptions),
                    { label: customOption, value: customOption, disabled: true },
                ]}
                selected={selectedDateRange ?? customOption}
                selectStyle='select-bordered rounded-none flex-grow min-w-[7.5rem]'
                onChange={(event: Event) => {
                    event.preventDefault();
                    const select = event.target as HTMLSelectElement;
                    const value = select.value as ScaleType;
                    onSelectChange(value);
                }}
            />
            <div className={'flex flex-wrap flex-grow'}>
                <input
                    class='input input-bordered rounded-none flex-grow w-[7.5rem]'
                    type='text'
                    placeholder='Date from'
                    ref={fromDatePickerRef}
                    onChange={onChangeDateFrom}
                    onBlur={onChangeDateFrom}
                />
                <input
                    class='input input-bordered rounded-none flex-grow w-[7.5rem]'
                    type='text'
                    placeholder='Date to'
                    ref={toDatePickerRef}
                    onChange={onChangeDateTo}
                    onBlur={onChangeDateTo}
                />
            </div>
        </div>
    );
};

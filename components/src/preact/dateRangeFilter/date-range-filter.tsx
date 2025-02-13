import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import z from 'zod';

import { DatePicker } from './DatePicker';
import { computeInitialValues } from './computeInitialValues';
import { toYYYYMMDD } from './dateConversion';
import {
    type DateRangeOption,
    DateRangeOptionChangedEvent,
    dateRangeOptionSchema,
    type DateRangeValue,
    dateRangeValueSchema,
} from './dateRangeOption';
import { ClearableSelect } from '../components/clearable-select';
import { ErrorBoundary } from '../components/error-boundary';

const customOption = 'Custom';

const dateRangeFilterInnerPropsSchema = z.object({
    dateRangeOptions: z.array(dateRangeOptionSchema),
    earliestDate: z.string().date(),
    value: dateRangeValueSchema,
    lapisDateField: z.string().min(1),
});

const dateRangeFilterPropsSchema = dateRangeFilterInnerPropsSchema.extend({
    width: z.string(),
});

export type DateRangeFilterProps = z.infer<typeof dateRangeFilterPropsSchema>;
export type DateRangeFilterInnerProps = z.infer<typeof dateRangeFilterInnerPropsSchema>;

export const DateRangeFilter = (props: DateRangeFilterProps) => {
    const { width, ...innerProps } = props;
    const size = { width, height: '3rem' };

    return (
        <ErrorBoundary size={size} layout='horizontal' componentProps={props} schema={dateRangeFilterPropsSchema}>
            <div style={{ width }}>
                <DateRangeFilterInner {...innerProps} />
            </div>
        </ErrorBoundary>
    );
};

export const DateRangeFilterInner = ({
    dateRangeOptions,
    earliestDate = '1900-01-01',
    value,
    lapisDateField,
}: DateRangeFilterInnerProps) => {
    const initialValues = useMemo(
        () => computeInitialValues(value, earliestDate, dateRangeOptions),
        [value, earliestDate, dateRangeOptions],
    );

    const divRef = useRef<HTMLDivElement>(null);

    const getInitialComboboxValue = useCallback(() => {
        if (!initialValues) {
            return null;
        }
        return initialValues.initialSelectedDateRange
            ? {
                  label: initialValues.initialSelectedDateRange,
                  dateFrom: toYYYYMMDD(initialValues.initialSelectedDateFrom),
                  dateTo: toYYYYMMDD(initialValues.initialSelectedDateTo),
              }
            : { label: customOption };
    }, [initialValues]);

    const [comboboxValue, setComboboxValue] = useState<DateRangeOption | null>(getInitialComboboxValue());
    const [dateFromValue, setDateFromValue] = useState(initialValues?.initialSelectedDateFrom);
    const [dateToValue, setDateToValue] = useState(initialValues?.initialSelectedDateTo);

    useEffect(() => {
        setDateFromValue(initialValues?.initialSelectedDateFrom);
        setDateToValue(initialValues?.initialSelectedDateTo);
        setComboboxValue(getInitialComboboxValue());
    }, [getInitialComboboxValue, initialValues]);

    const customComboboxValue = { label: customOption };

    const onSelectChange = (option: DateRangeOption | null) => {
        setComboboxValue(option);

        const dateFrom = getFromDate(option, earliestDate);
        const dateTo = getToDate(option);

        setDateFromValue(dateFrom);
        setDateToValue(dateTo);

        fireFilterChangedEvent({ dateFrom, dateTo, lapisDateField });

        const eventDetail =
            option?.label === customOption
                ? {
                      dateFrom: dateFrom !== undefined ? toYYYYMMDD(dateFrom) : undefined,
                      dateTo: dateTo !== undefined ? toYYYYMMDD(dateTo) : undefined,
                  }
                : option?.label;

        fireOptionChangedEvent(eventDetail);
    };

    function getFromDate(option: DateRangeOption | null, earliestDate: string) {
        if (!option || option.label === customOption) {
            return undefined;
        }
        return new Date(option?.dateFrom ?? earliestDate);
    }

    function getToDate(option: DateRangeOption | null) {
        if (!option || option.label === customOption) {
            return undefined;
        }
        if (!option.dateTo) {
            return new Date();
        }

        return new Date(option.dateTo);
    }

    const onChangeDateFrom = (date: Date | undefined) => {
        if (date?.toDateString() === dateFromValue?.toDateString()) {
            return;
        }

        setDateFromValue(date);
        setComboboxValue(customComboboxValue);

        fireFilterChangedEvent({ dateFrom: date, dateTo: dateToValue, lapisDateField });

        fireOptionChangedEvent({
            dateFrom: date !== undefined ? toYYYYMMDD(date) : undefined,
            dateTo: dateToValue !== undefined ? toYYYYMMDD(dateToValue) : undefined,
        });
    };

    const onChangeDateTo = (date: Date | undefined) => {
        if (date?.toDateString() === dateToValue?.toDateString()) {
            return;
        }

        setDateToValue(date);
        setComboboxValue(customComboboxValue);

        fireFilterChangedEvent({ dateFrom: dateFromValue, dateTo: date, lapisDateField });

        fireOptionChangedEvent({
            dateFrom: dateFromValue !== undefined ? toYYYYMMDD(dateFromValue) : undefined,
            dateTo: date !== undefined ? toYYYYMMDD(date) : undefined,
        });
    };

    const fireFilterChangedEvent = ({
        dateFrom,
        dateTo,
        lapisDateField,
    }: {
        dateFrom: Date | undefined;
        dateTo: Date | undefined;
        lapisDateField: string;
    }) => {
        const detail = {
            ...(dateFrom !== undefined && { [`${lapisDateField}From`]: toYYYYMMDD(dateFrom) }),
            ...(dateTo !== undefined && { [`${lapisDateField}To`]: toYYYYMMDD(dateTo) }),
        };

        divRef.current?.dispatchEvent(
            new CustomEvent('gs-date-range-filter-changed', {
                detail,
                bubbles: true,
                composed: true,
            }),
        );
    };

    const fireOptionChangedEvent = (option: DateRangeValue) => {
        divRef.current?.dispatchEvent(new DateRangeOptionChangedEvent(option));
    };

    const allDateRangeOptions = [...dateRangeOptions, customComboboxValue];

    return (
        <div className={'@container'} ref={divRef}>
            <div className='flex min-w-[7.5rem] flex-col @md:flex-row'>
                <div className='flex-grow'>
                    <ClearableSelect
                        items={allDateRangeOptions.map((item) => item.label)}
                        placeholderText={'Select a date range'}
                        onChange={(value) => {
                            const dateRangeOption = allDateRangeOptions.find((item) => item.label === value);
                            onSelectChange(dateRangeOption ?? null);
                        }}
                        value={comboboxValue?.label ?? null}
                        selectClassName={'rounded-t-md rounded-b-none @md:rounded-l-md @md:rounded-r-none'}
                    />
                </div>
                <div className={'flex flex-grow flex-col @4xs:flex-row'}>
                    <DatePicker
                        className={'flex-grow min-w-[7.5rem] @4xs:rounded-bl-md @md:rounded-l-none rounded-none'}
                        value={dateFromValue}
                        onChange={(date) => {
                            onChangeDateFrom(date);
                        }}
                        maxDate={dateToValue}
                        placeholderText={'Date from'}
                    />
                    <DatePicker
                        className={
                            'flex-grow min-w-[7.5rem] rounded-b-md rounded-t-none @4xs:rounded-tr-none @4xs:rounded-l-none @md:rounded-r-md '
                        }
                        value={dateToValue}
                        onChange={(date) => {
                            onChangeDateTo(date);
                        }}
                        minDate={dateFromValue}
                        placeholderText={'Date to'}
                    />
                </div>
            </div>
        </div>
    );
};

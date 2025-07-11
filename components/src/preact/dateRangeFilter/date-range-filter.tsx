import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import z from 'zod';

import { computeInitialValues } from './computeInitialValues';
import { DatePicker } from './date-picker';
import { toYYYYMMDD } from './dateConversion';
import {
    type DateRangeOption,
    DateRangeOptionChangedEvent,
    dateRangeOptionSchema,
    dateRangeValueSchema,
} from './dateRangeOption';
import { gsEventNames } from '../../utils/gsEventNames';
import { ClearableSelect } from '../components/clearable-select';
import { ErrorBoundary } from '../components/error-boundary';

const CUSTOM_OPTION = 'Custom';

const dateRangeFilterInnerPropsSchema = z.object({
    dateRangeOptions: z.array(dateRangeOptionSchema),
    value: dateRangeValueSchema,
    lapisDateField: z.string().min(1),
    placeholder: z.string().optional(),
});

const dateRangeFilterPropsSchema = dateRangeFilterInnerPropsSchema.extend({
    width: z.string(),
});

export type DateRangeFilterProps = z.infer<typeof dateRangeFilterPropsSchema>;
export type DateRangeFilterInnerProps = z.infer<typeof dateRangeFilterInnerPropsSchema>;

type DateRangeFilterState = {
    label: string;
    dateFrom?: Date;
    dateTo?: Date;
} | null;

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
    value,
    lapisDateField,
    placeholder,
}: DateRangeFilterInnerProps) => {
    const initialValues = useMemo(() => computeInitialValues(value, dateRangeOptions), [value, dateRangeOptions]);

    const divRef = useRef<HTMLDivElement>(null);

    const getInitialState = useCallback(() => {
        if (!initialValues) {
            return null;
        }
        return initialValues.initialSelectedDateRange
            ? {
                  label: initialValues.initialSelectedDateRange,
                  dateFrom: initialValues.initialSelectedDateFrom,
                  dateTo: initialValues.initialSelectedDateTo,
              }
            : {
                  label: CUSTOM_OPTION,
                  dateFrom: initialValues.initialSelectedDateFrom,
                  dateTo: initialValues.initialSelectedDateTo,
              };
    }, [initialValues]);

    const customComboboxValue = { label: CUSTOM_OPTION };
    const [options, setOptions] = useState(
        getInitialState()?.label === CUSTOM_OPTION ? [...dateRangeOptions, customComboboxValue] : [...dateRangeOptions],
    );
    const [state, setState] = useState<DateRangeFilterState>(getInitialState());

    function updateState(newState: DateRangeFilterState) {
        setState(newState);
        fireFilterChangedEvent({ dateFrom: newState?.dateFrom, dateTo: newState?.dateTo, lapisDateField });
        fireOptionChangedEvent(newState);
    }

    useEffect(() => {
        setState(getInitialState());
    }, [getInitialState]);

    const onSelectChange = (option: DateRangeOption | null) => {
        updateState(
            option !== null
                ? {
                      label: option.label,
                      dateFrom: toMaybeDate(option.dateFrom),
                      dateTo: toMaybeDate(option.dateTo),
                  }
                : null,
        );
        if (option?.label !== CUSTOM_OPTION) {
            setOptions([...dateRangeOptions]);
        }
    };

    const onChangeDateFrom = (date: Date | undefined) => {
        if (date?.toDateString() === state?.dateFrom?.toDateString()) {
            return;
        }

        updateState({
            label: CUSTOM_OPTION,
            dateFrom: date,
            dateTo: state?.dateTo,
        });
        setOptions([...dateRangeOptions, customComboboxValue]);
    };

    const onChangeDateTo = (date: Date | undefined) => {
        if (date?.toDateString() === state?.dateTo?.toDateString()) {
            return;
        }

        updateState({
            label: CUSTOM_OPTION,
            dateFrom: state?.dateFrom,
            dateTo: date,
        });
        setOptions([...dateRangeOptions, customComboboxValue]);
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
            new CustomEvent(gsEventNames.dateRangeFilterChanged, {
                detail,
                bubbles: true,
                composed: true,
            }),
        );
    };

    const fireOptionChangedEvent = (state: DateRangeFilterState) => {
        const eventDetail = (() => {
            if (state === null) {
                return null;
            }
            if (state.label === CUSTOM_OPTION) {
                return {
                    dateFrom: state.dateFrom !== undefined ? toYYYYMMDD(state.dateFrom) : undefined,
                    dateTo: state.dateTo !== undefined ? toYYYYMMDD(state.dateTo) : undefined,
                };
            }
            return state.label;
        })();

        divRef.current?.dispatchEvent(new DateRangeOptionChangedEvent(eventDetail));
    };

    return (
        <div className={'@container'} ref={divRef}>
            <div className='flex min-w-[7.5rem] flex-col @md:flex-row'>
                <div className='grow'>
                    <ClearableSelect
                        items={options.map((item) => item.label)}
                        placeholderText={placeholder}
                        onChange={(value) => {
                            const dateRangeOption = options.find((item) => item.label === value);
                            onSelectChange(dateRangeOption ?? null);
                        }}
                        value={state?.label ?? null}
                        selectClassName={'rounded-t-md rounded-b-none @md:rounded-l-md @md:rounded-r-none'}
                    />
                </div>
                <div className={'flex grow flex-col @4xs:flex-row'}>
                    <DatePicker
                        className={'grow min-w-[7.5rem] @4xs:rounded-bl-md @md:rounded-l-none rounded-none'}
                        value={state?.dateFrom}
                        onChange={onChangeDateFrom}
                        maxDate={state?.dateTo}
                        placeholderText={'Date from'}
                    />
                    <DatePicker
                        className={
                            'grow min-w-[7.5rem] rounded-b-md rounded-t-none @4xs:rounded-tr-none @4xs:rounded-l-none @md:rounded-r-md '
                        }
                        value={state?.dateTo}
                        onChange={onChangeDateTo}
                        minDate={state?.dateFrom}
                        placeholderText={'Date to'}
                    />
                </div>
            </div>
        </div>
    );
};

function toMaybeDate(dateString: string | undefined) {
    return dateString ? new Date(dateString) : undefined;
}

import { type FunctionComponent } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import z from 'zod';

import { NumberFilterChangedEvent } from './NumberFilterChangedEvent';
import { type NumberRange, SetRangeActionType, useSelectedRangeReducer } from './useSelectedRangeReducer';
import { ErrorBoundary } from '../components/error-boundary';
import { UserFacingError } from '../components/error-display';
import { MinMaxRangeSlider } from '../components/min-max-range-slider';
import { ResizeContainer } from '../components/resize-container';
import { DeleteIcon } from '../shared/icons/DeleteIcon';

const numberFilterPropsSchema = z.object({
    value: z.record(z.number().optional()),
    lapisField: z.string().min(1),
    width: z.string(),
});
export type NumberFilterProps = z.infer<typeof numberFilterPropsSchema>;

export const NumberFilter: FunctionComponent<NumberFilterProps> = (props) => {
    const { width, ...innerProps } = props;
    const size = { width, height: '3rem' };

    return (
        <ErrorBoundary size={size} layout='horizontal' componentProps={props} schema={numberFilterPropsSchema}>
            <ResizeContainer size={size}>
                <NumberFilterInner {...innerProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

type NumberFilterInnerProps = Omit<NumberFilterProps, 'width'>;

const rangeMin = 0;
const rangeMax = 100;

const NumberFilterInner: FunctionComponent<NumberFilterInnerProps> = ({ value, lapisField }) => {
    const divRef = useRef<HTMLDivElement>(null);

    const cleanedValue = useCleanedValue(value, lapisField);

    const [currentRange, dispatchRange] = useSelectedRangeReducer(cleanedValue);
    const [shouldDispatchEvent, setShouldDispatchEvent] = useState(false);

    useEffect(() => {
        if (!shouldDispatchEvent) {
            return;
        }

        setShouldDispatchEvent(false);
        divRef.current?.dispatchEvent(
            new NumberFilterChangedEvent({
                [`${lapisField}From`]: currentRange.min,
                [`${lapisField}To`]: currentRange.max,
            }),
        );
    }, [divRef, currentRange, shouldDispatchEvent, lapisField]);

    const dispatchRangeWithEvent: typeof dispatchRange = (action) => {
        dispatchRange(action);
        setShouldDispatchEvent(true);
    };

    const onInput = (input: string, type: typeof SetRangeActionType.SET_MIN | typeof SetRangeActionType.SET_MAX) => {
        const trimmedInput = input.trim();

        if (trimmedInput === '') {
            dispatchRangeWithEvent({ type, value: undefined });
            return;
        }

        const value = Number(trimmedInput);
        if (!Number.isFinite(value)) {
            return;
        }
        dispatchRangeWithEvent({ type, value });
    };

    return (
        <div ref={divRef}>
            <div className='join w-full'>
                <div className='join-item w-full flex input px-2'>
                    <input
                        type='text'
                        inputmode='numeric'
                        className='w-full grow capitalize'
                        placeholder={`${lapisField} from`}
                        value={currentRange.min ?? ''}
                        onInput={(e) => {
                            onInput((e.target as HTMLInputElement).value, SetRangeActionType.SET_MIN);
                        }}
                    />
                    {currentRange.min !== undefined && (
                        <button
                            onClick={() =>
                                dispatchRangeWithEvent({ type: SetRangeActionType.SET_MIN, value: undefined })
                            }
                            className=' cursor-pointer'
                            aria-label='clear min input'
                        >
                            <DeleteIcon />
                        </button>
                    )}
                </div>
                <div className='join-item w-full flex input px-2'>
                    <input
                        type='text'
                        inputmode='numeric'
                        className='w-full grow capitalize'
                        placeholder={`${lapisField} to`}
                        value={currentRange.max ?? ''}
                        onInput={(e) => {
                            onInput((e.target as HTMLInputElement).value, SetRangeActionType.SET_MAX);
                        }}
                    />
                    {currentRange.max !== undefined && (
                        <button
                            onClick={() =>
                                dispatchRangeWithEvent({ type: SetRangeActionType.SET_MAX, value: undefined })
                            }
                            className='cursor-pointer'
                            aria-label='clear max input'
                        >
                            <DeleteIcon />
                        </button>
                    )}
                </div>
            </div>
            <MinMaxRangeSlider
                min={currentRange.min ?? rangeMin}
                max={currentRange.max ?? rangeMax}
                rangeMin={rangeMin}
                rangeMax={rangeMax}
                setMin={(min) => {
                    dispatchRange({ type: SetRangeActionType.SET_MIN, value: min });
                }}
                setMax={(max) => {
                    dispatchRange({ type: SetRangeActionType.SET_MAX, value: max });
                }}
                onDrop={() => setShouldDispatchEvent(true)}
            />
        </div>
    );
};

function useCleanedValue(value: Record<string, number | undefined>, lapisField: string): NumberRange {
    return useMemo(() => {
        const fromField = `${lapisField}From`;
        const toField = `${lapisField}To`;

        const valueSchema = z
            .object({
                [fromField]: z.number().optional(),
                [toField]: z.number().optional(),
            })
            .strict();

        const parseResult = valueSchema.safeParse(value);

        if (parseResult.success) {
            return {
                min: parseResult.data[fromField],
                max: parseResult.data[toField],
            };
        }

        throw new UserFacingError('Invalid value', `Got invalid 'value': ${parseResult.error.message}`);
    }, [lapisField, value]);
}

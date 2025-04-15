import { type FunctionComponent, type RefObject } from 'preact';
import { useEffect, useReducer, useRef } from 'preact/hooks';
import z from 'zod';

import { NumberFilterChangedEvent } from './NumberFilterChangedEvent';
import { ErrorBoundary } from '../components/error-boundary';
import { MinMaxRangeSlider } from '../components/min-max-range-slider';
import { ResizeContainer } from '../components/resize-container';
import { DeleteIcon } from '../shared/icons/DeleteIcon';

const numberRangeSchema = z.object({
    min: z.number().optional(),
    max: z.number().optional(),
});
type NumberRange = z.infer<typeof numberRangeSchema>;

const numberFilterPropsSchema = z.object({
    value: numberRangeSchema,
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

    const [currentRange, dispatchRange] = useRangeReducer(value, divRef, lapisField);

    const onMinInput = (input: string) => {
        const trimmedInput = input.trim();

        if (trimmedInput === '') {
            dispatchRange({ type: SET_MIN, value: undefined });
            return;
        }

        const value = Number(trimmedInput);
        if (!Number.isFinite(value)) {
            return;
        }
        dispatchRange({ type: SET_MIN, value });
    };

    const onMaxInput = (input: string) => {
        const trimmedInput = input.trim();

        if (trimmedInput === '') {
            dispatchRange({ type: SET_MIN, value: undefined });
            return;
        }

        const value = Number(trimmedInput);
        if (!Number.isFinite(value)) {
            return;
        }
        dispatchRange({ type: SET_MIN, value });
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
                            onMinInput((e.target as HTMLInputElement).value);
                        }}
                    />
                    {currentRange.min !== undefined && (
                        <button
                            onClick={() => dispatchRange({ type: SET_MIN, value: undefined })}
                            className=' cursor-pointer'
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
                            onMaxInput((e.target as HTMLInputElement).value);
                        }}
                    />
                    {currentRange.max !== undefined && (
                        <button
                            onClick={() => dispatchRange({ type: SET_MAX, value: undefined })}
                            className='cursor-pointer'
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
                    dispatchRange({ type: SET_MIN, value: min });
                }}
                setMax={(max) => {
                    dispatchRange({ type: SET_MAX, value: max });
                }}
            />
        </div>
    );
};

function useRangeReducer(initialValue: NumberRange, divRef: RefObject<HTMLDivElement>, lapisField: string) {
    const rangeReducerWithEvent: typeof rangeReducer = (currentRange, action) => {
        const newRange = rangeReducer(currentRange, action);

        if (action.type !== SET_VALUE_FROM_CONTROLLED_INPUT) {
            divRef.current?.dispatchEvent(
                new NumberFilterChangedEvent({
                    [`${lapisField}From`]: newRange.min,
                    [`${lapisField}To`]: newRange.max,
                }),
            );
        }

        return newRange;
    };

    const [range, dispatchRange] = useReducer(rangeReducerWithEvent, initialValue);

    useEffect(() => {
        dispatchRange({
            type: SET_VALUE_FROM_CONTROLLED_INPUT,
            range: initialValue,
        });
    }, [initialValue]);

    return [range, dispatchRange] as const;
}

const SET_MIN = 'setMin';
const SET_MAX = 'setMax';
const SET_VALUE_FROM_CONTROLLED_INPUT = 'setValueFromControlledInput';

type SetRangeAction =
    | {
          type: typeof SET_MIN | typeof SET_MAX;
          value: number | undefined;
      }
    | {
          type: typeof SET_VALUE_FROM_CONTROLLED_INPUT;
          range: NumberRange;
      };

function rangeReducer(currentRange: NumberRange, action: SetRangeAction) {
    const { min, max } = currentRange;

    switch (action.type) {
        case SET_MIN: {
            const newMax = max !== undefined && action.value !== undefined && action.value > max ? action.value : max;
            return { min: action.value, max: newMax };
        }

        case SET_MAX: {
            const newMin = min !== undefined && action.value !== undefined && min > action.value ? action.value : min;
            return { min: newMin, max: action.value };
        }

        case SET_VALUE_FROM_CONTROLLED_INPUT: {
            return action.range;
        }
    }
}

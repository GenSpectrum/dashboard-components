import { type FunctionComponent } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import z from 'zod';

import {
    NumberRangeFilterChangedEvent,
    numberRangeSchema,
    NumberRangeValueChangedEvent,
} from './NumberRangeFilterChangedEvent';
import { SetRangeActionType, useSelectedRangeReducer } from './useSelectedRangeReducer';
import { ErrorBoundary } from '../components/error-boundary';
import { MinMaxRangeSlider } from '../components/min-max-range-slider';
import { ResizeContainer } from '../components/resize-container';
import { DeleteIcon } from '../shared/icons/DeleteIcon';

const numberRangeFilterPropsSchema = z.object({
    value: numberRangeSchema,
    lapisField: z.string().min(1),
    sliderMin: z.number(),
    sliderMax: z.number(),
    sliderStep: z.number().positive(),
    width: z.string(),
});
export type NumberRangeFilterProps = z.infer<typeof numberRangeFilterPropsSchema>;

export const NumberRangeFilter: FunctionComponent<NumberRangeFilterProps> = (props) => {
    const { width, ...innerProps } = props;
    const size = { width, height: '4.8rem' };

    return (
        <ErrorBoundary size={size} layout='horizontal' componentProps={props} schema={numberRangeFilterPropsSchema}>
            <ResizeContainer size={size}>
                <NumberRangeFilterInner {...innerProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

type NumberRangeFilterInnerProps = Omit<NumberRangeFilterProps, 'width'>;

const NumberRangeFilterInner: FunctionComponent<NumberRangeFilterInnerProps> = ({
    value,
    lapisField,
    sliderMin,
    sliderMax,
    sliderStep,
}) => {
    const divRef = useRef<HTMLDivElement>(null);

    const [currentRange, dispatchRange] = useSelectedRangeReducer(value);
    const [shouldDispatchEvent, setShouldDispatchEvent] = useState(false);

    useEffect(() => {
        if (!shouldDispatchEvent || currentRange.wasDispatched) {
            return;
        }

        setShouldDispatchEvent(false);
        if (currentRange.range.isValidRange) {
            dispatchRange({ type: SetRangeActionType.DISPATCHED_EVENT });
            divRef.current?.dispatchEvent(
                new NumberRangeValueChangedEvent({
                    min: currentRange.range.min,
                    max: currentRange.range.max,
                }),
            );
            divRef.current?.dispatchEvent(
                new NumberRangeFilterChangedEvent({
                    [`${lapisField}From`]: currentRange.range.min,
                    [`${lapisField}To`]: currentRange.range.max,
                }),
            );
        }
    }, [divRef, currentRange.range, currentRange.wasDispatched, shouldDispatchEvent, lapisField, dispatchRange]);

    function scheduleEventDispatch() {
        setShouldDispatchEvent(true);
    }

    const dispatchRangeWithEvent: typeof dispatchRange = (action) => {
        dispatchRange(action);
        scheduleEventDispatch();
    };

    const inputError = currentRange.range.isValidRange ? '' : 'input-error';

    return (
        <div ref={divRef}>
            <div className='join w-full'>
                <div className={`join-item w-full flex input px-2 ${inputError}`}>
                    <input
                        type='text'
                        inputMode='numeric'
                        className='w-full grow capitalize'
                        placeholder={`${lapisField} from`}
                        value={currentRange.inputState.min}
                        onInput={(e) => {
                            dispatchRange({
                                type: SetRangeActionType.SET_MIN,
                                value: (e.target as HTMLInputElement).value,
                            });
                        }}
                        onBlur={() => scheduleEventDispatch()}
                        aria-invalid={!currentRange.range.isValidRange}
                    />
                    {currentRange.inputState.min !== '' && (
                        <button
                            onClick={() => dispatchRangeWithEvent({ type: SetRangeActionType.SET_MIN, value: '' })}
                            className='cursor-pointer'
                            aria-label='clear min input'
                        >
                            <DeleteIcon />
                        </button>
                    )}
                </div>
                <div className={`join-item w-full flex input px-2 ${inputError}`}>
                    <input
                        type='text'
                        inputMode='numeric'
                        className='w-full grow capitalize'
                        placeholder={`${lapisField} to`}
                        value={currentRange.inputState.max}
                        onInput={(e) => {
                            dispatchRange({
                                type: SetRangeActionType.SET_MAX,
                                value: (e.target as HTMLInputElement).value,
                            });
                        }}
                        onBlur={() => scheduleEventDispatch()}
                        aria-invalid={!currentRange.range.isValidRange}
                    />
                    {currentRange.inputState.max !== '' && (
                        <button
                            onClick={() => dispatchRangeWithEvent({ type: SetRangeActionType.SET_MAX, value: '' })}
                            className='cursor-pointer'
                            aria-label='clear max input'
                        >
                            <DeleteIcon />
                        </button>
                    )}
                </div>
            </div>
            <MinMaxRangeSlider
                min={currentRange.range.min ?? sliderMin}
                max={currentRange.range.max ?? sliderMax}
                rangeMin={sliderMin}
                rangeMax={sliderMax}
                setMin={(min) => {
                    dispatchRange({ type: SetRangeActionType.SET_MIN, value: min.toString() });
                }}
                setMax={(max) => {
                    dispatchRange({ type: SetRangeActionType.SET_MAX, value: max.toString() });
                }}
                onDrop={() => scheduleEventDispatch()}
                step={sliderStep}
            />
        </div>
    );
};

import { useEffect, useReducer, useState } from 'preact/hooks';

import { type NumberRange } from './NumberRangeFilterChangedEvent';

type InputState = {
    min: string;
    max: string;
};

export type RangeState = {
    inputState: InputState;
    range: NumberRange & { isValidRange: boolean };
    wasDispatched: boolean;
};

export function useSelectedRangeReducer(initialValue: NumberRange) {
    const [range, dispatchRange] = useReducer(
        rangeReducer,
        addRange({
            min: initialValue.min?.toString() ?? '',
            max: initialValue.max?.toString() ?? '',
        }),
    );
    const [isInitialRender, setIsInitialRender] = useState(true);

    useEffect(
        () => {
            if (isInitialRender) {
                setIsInitialRender(false);
                return;
            }

            dispatchRange({
                type: SetRangeActionType.SET_VALUE_FROM_CONTROLLED_INPUT,
                range: initialValue,
            });
        },
        [initialValue], // eslint-disable-line react-hooks/exhaustive-deps -- only run this when initialValue changes
    );

    return [range, dispatchRange] as const;
}

export const SetRangeActionType = {
    SET_MIN: 'setMin',
    SET_MAX: 'setMax',
    SET_VALUE_FROM_CONTROLLED_INPUT: 'setValueFromControlledInput',
    DISPATCHED_EVENT: 'dispatchedEvent',
} as const;

type SetRangeAction =
    | {
          type: typeof SetRangeActionType.SET_MIN | typeof SetRangeActionType.SET_MAX;
          value: string;
      }
    | {
          type: typeof SetRangeActionType.SET_VALUE_FROM_CONTROLLED_INPUT;
          range: NumberRange;
      }
    | {
          type: typeof SetRangeActionType.DISPATCHED_EVENT;
      };

function rangeReducer(currentState: RangeState, action: SetRangeAction) {
    const { min, max } = currentState.inputState;

    switch (action.type) {
        case SetRangeActionType.SET_MIN:
            return addRange({ min: action.value, max });
        case SetRangeActionType.SET_MAX:
            return addRange({ min, max: action.value });

        case SetRangeActionType.SET_VALUE_FROM_CONTROLLED_INPUT:
            return addRange({
                min: action.range.min?.toString() ?? '',
                max: action.range.max?.toString() ?? '',
            });

        case SetRangeActionType.DISPATCHED_EVENT:
            return {
                ...currentState,
                wasDispatched: true,
            };
    }
}

function addRange(inputState: InputState): RangeState {
    const parsedMin = parseRangeValue(inputState.min);
    const parsedMax = parseRangeValue(inputState.max);

    const range = {
        min: parsedMin.value,
        max: parsedMax.value,
    };

    const isValidRange = parsedMin.valid && parsedMax.valid && isValid(range);

    return {
        inputState,
        range: {
            ...range,
            isValidRange,
        },
        wasDispatched: false,
    };
}

function parseRangeValue(inputValue: string) {
    const trimmedInput = inputValue.trim();

    if (trimmedInput === '') {
        return {
            valid: true,
            value: undefined,
        };
    }

    const value = Number(trimmedInput);
    if (!Number.isFinite(value)) {
        return {
            valid: false,
            value: undefined,
        };
    }

    return {
        valid: true,
        value,
    };
}

function isValid(range: NumberRange) {
    if (range.min === undefined || range.max === undefined) {
        return true;
    }
    return range.min <= range.max;
}

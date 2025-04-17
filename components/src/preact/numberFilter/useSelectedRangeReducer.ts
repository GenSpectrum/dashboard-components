import { useEffect, useReducer, useState } from 'preact/hooks';
import z from 'zod';

export const numberRangeSchema = z.object({
    min: z.number().optional(),
    max: z.number().optional(),
});
export type NumberRange = z.infer<typeof numberRangeSchema>;

export function useSelectedRangeReducer(initialValue: NumberRange) {
    const [range, dispatchRange] = useReducer(rangeReducer, initialValue);
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
} as const;

type SetRangeAction =
    | {
          type: typeof SetRangeActionType.SET_MIN | typeof SetRangeActionType.SET_MAX;
          value: number | undefined;
          dispatchEvent?: boolean;
      }
    | {
          type: typeof SetRangeActionType.SET_VALUE_FROM_CONTROLLED_INPUT;
          range: NumberRange;
      };

function rangeReducer(currentRange: NumberRange, action: SetRangeAction) {
    const { min, max } = currentRange;

    switch (action.type) {
        case SetRangeActionType.SET_MIN: {
            const newMax = max !== undefined && action.value !== undefined && action.value > max ? action.value : max;
            return { min: action.value, max: newMax };
        }

        case SetRangeActionType.SET_MAX: {
            const newMin = min !== undefined && action.value !== undefined && min > action.value ? action.value : min;
            return { min: newMin, max: action.value };
        }

        case SetRangeActionType.SET_VALUE_FROM_CONTROLLED_INPUT: {
            return action.range;
        }
    }
}

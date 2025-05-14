import z from 'zod';

import { gsEventNames } from '../../utils/gsEventNames';

export type LapisNumberFilter = Record<string, number | undefined>;

export const numberRangeSchema = z.object({
    min: z.number().optional(),
    max: z.number().optional(),
});
export type NumberRange = z.infer<typeof numberRangeSchema>;

export class NumberRangeValueChangedEvent extends CustomEvent<NumberRange> {
    constructor(detail: NumberRange) {
        super(gsEventNames.numberRangeValueChanged, {
            detail,
            bubbles: true,
            composed: true,
        });
    }
}

export class NumberRangeFilterChangedEvent extends CustomEvent<LapisNumberFilter> {
    constructor(detail: LapisNumberFilter) {
        super(gsEventNames.numberRangeFilterChanged, {
            detail,
            bubbles: true,
            composed: true,
        });
    }
}

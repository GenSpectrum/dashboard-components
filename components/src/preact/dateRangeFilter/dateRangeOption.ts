import z from 'zod';

import { toYYYYMMDD } from './dateConversion';
import { gsEventNames } from '../../utils/gsEventNames';

/**
 * A date range option that can be used in the `gs-date-range-filter` component.
 */
export const dateRangeOptionSchema = z.object({
    /** The label of the date range option that will be shown to the user */
    label: z.string(),
    /**
     * The start date of the date range in the format `YYYY-MM-DD`.
     */
    dateFrom: z.string().date().optional(),
    /**
     * The end date of the date range in the format `YYYY-MM-DD`.
     */
    dateTo: z.string().date().optional(),
});

export type DateRangeOption = z.infer<typeof dateRangeOptionSchema>;

export const dateRangeValueSchema = z
    .union([
        z.string(),
        z.object({
            dateFrom: z.string().date().optional(),
            dateTo: z.string().date().optional(),
        }),
    ])
    .nullable();

export type DateRangeValue = z.infer<typeof dateRangeValueSchema>;

export class DateRangeOptionChangedEvent extends CustomEvent<DateRangeValue> {
    constructor(detail: DateRangeValue) {
        super(gsEventNames.dateRangeOptionChanged, {
            detail,
            bubbles: true,
            composed: true,
        });
    }
}

type DateRangeOptionPresets = {
    last2Weeks: DateRangeOption;
    lastMonth: DateRangeOption;
    last2Months: DateRangeOption;
    last3Months: DateRangeOption;
    last6Months: DateRangeOption;
    lastYear: DateRangeOption;
};

let dateRangeOptionsPresetsCacheDate: string | null = null;
let dateRangeOptionPresetsCache: DateRangeOptionPresets | null = null;

/**
 * Presets for the `gs-date-range-filter` component that can be used as `dateRangeOptions`.
 */
export const dateRangeOptionPresets = (): DateRangeOptionPresets => {
    const today = new Date();
    const todayString = new Date().toISOString().slice(0, 10);

    if (
        dateRangeOptionPresetsCache === null ||
        dateRangeOptionsPresetsCacheDate === null ||
        dateRangeOptionsPresetsCacheDate !== todayString
    ) {
        dateRangeOptionsPresetsCacheDate = todayString;

        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(today.getDate() - 14);

        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);

        const last2Months = new Date(today);
        last2Months.setMonth(today.getMonth() - 2);

        const last3Months = new Date(today);
        last3Months.setMonth(today.getMonth() - 3);

        const last6Months = new Date(today);
        last6Months.setMonth(today.getMonth() - 6);

        const lastYear = new Date(today);
        lastYear.setFullYear(today.getFullYear() - 1);

        dateRangeOptionPresetsCache = {
            last2Weeks: {
                label: 'Last 2 weeks',
                dateFrom: toYYYYMMDD(twoWeeksAgo),
            },
            lastMonth: {
                label: 'Last month',
                dateFrom: toYYYYMMDD(lastMonth),
            },
            last2Months: {
                label: 'Last 2 months',
                dateFrom: toYYYYMMDD(last2Months),
            },
            last3Months: {
                label: 'Last 3 months',
                dateFrom: toYYYYMMDD(last3Months),
            },
            last6Months: {
                label: 'Last 6 months',
                dateFrom: toYYYYMMDD(last6Months),
            },
            lastYear: {
                label: 'Last year',
                dateFrom: toYYYYMMDD(lastYear),
            },
        };
    }

    return dateRangeOptionPresetsCache;
};

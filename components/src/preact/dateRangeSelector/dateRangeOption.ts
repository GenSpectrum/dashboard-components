import { toYYYYMMDD } from './dateConversion';

/**
 * A date range option that can be used in the `gs-date-range-selector` component.
 */
export type DateRangeOption = {
    /** The label of the date range option that will be shown to the user */
    label: string;
    /**
     * The start date of the date range in the format `YYYY-MM-DD`.
     * If not set, the date range selector will default to the `earliestDate` property.
     */
    dateFrom?: string;
    /**
     * The end date of the date range in the format `YYYY-MM-DD`.
     * If not set, the date range selector will default to the current date.
     */
    dateTo?: string;
};

export type DateRangeSelectOption = string | { dateFrom: string; dateTo: string };
export class DateRangeOptionChangedEvent extends CustomEvent<DateRangeSelectOption> {
    constructor(detail: DateRangeSelectOption) {
        super('gs-date-range-option-changed', {
            detail,
            bubbles: true,
            composed: true,
        });
    }
}

const today = new Date();

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

/**
 * Presets for the `gs-date-range-selector` component that can be used as `dateRangeOptions`.
 */
export const dateRangeOptionPresets = {
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
    allTimes: {
        label: 'All times',
    },
} satisfies Record<string, DateRangeOption>;

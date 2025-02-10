import { type DateRangeOption } from './dateRangeOption';

export const getSelectableOptions = (dateRangeOptions: DateRangeOption[]) => {
    return dateRangeOptions.map((customSelectOption) => {
        return { label: customSelectOption.label, value: customSelectOption.label };
    });
};

export const getDatesForSelectorValue = (
    initialSelectedDateRange: string | undefined,
    dateRangeOptions: DateRangeOption[],
    earliestDate: string,
) => {
    const today = new Date();
    const defaultDates = { dateFrom: new Date(earliestDate), dateTo: today };

    if (initialSelectedDateRange === undefined) {
        return defaultDates;
    }

    const dateRangeOption = dateRangeOptions.find((option) => option.label === initialSelectedDateRange);
    if (dateRangeOption) {
        return {
            dateFrom: new Date(dateRangeOption.dateFrom ?? earliestDate),
            dateTo: new Date(dateRangeOption.dateTo ?? today),
        };
    }

    return defaultDates;
};

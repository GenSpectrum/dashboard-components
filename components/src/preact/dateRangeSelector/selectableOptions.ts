export const PRESET_VALUE_CUSTOM = 'custom';
export const PRESET_VALUE_ALL_TIMES = 'allTimes';
export const PRESET_VALUE_LAST_2_WEEKS = 'last2Weeks';
export const PRESET_VALUE_LAST_MONTH = 'lastMonth';
export const PRESET_VALUE_LAST_2_MONTHS = 'last2Months';
export const PRESET_VALUE_LAST_3_MONTHS = 'last3Months';
export const PRESET_VALUE_LAST_6_MONTHS = 'last6Months';

export const presets = {
    [PRESET_VALUE_CUSTOM]: { label: 'Custom' },
    [PRESET_VALUE_ALL_TIMES]: { label: 'All times' },
    [PRESET_VALUE_LAST_2_WEEKS]: { label: 'Last 2 weeks' },
    [PRESET_VALUE_LAST_MONTH]: { label: 'Last month' },
    [PRESET_VALUE_LAST_2_MONTHS]: { label: 'Last 2 months' },
    [PRESET_VALUE_LAST_3_MONTHS]: { label: 'Last 3 months' },
    [PRESET_VALUE_LAST_6_MONTHS]: { label: 'Last 6 months' },
};

export type PresetOptionValues = keyof typeof presets;

export type CustomSelectOption<CustomLabel extends string> = { label: CustomLabel; dateFrom: string; dateTo: string };

export const getSelectableOptions = <Label extends string>(customSelectOptions: CustomSelectOption<Label>[]) => {
    const presetOptions = Object.entries(presets).map(([key, value]) => {
        return { label: value.label, value: key };
    });

    const customOptions = customSelectOptions.map((customSelectOption) => {
        return { label: customSelectOption.label, value: customSelectOption.label };
    });

    return [...presetOptions, ...customOptions];
};

export const getDatesForSelectorValue = <Label extends string>(
    selectorValue: string,
    customSelectOptions: CustomSelectOption<Label>[],
    earliestDate: string,
) => {
    const today = new Date();

    const customSelectOption = customSelectOptions.find((option) => option.label === selectorValue);
    if (customSelectOption) {
        return { dateFrom: new Date(customSelectOption.dateFrom), dateTo: new Date(customSelectOption.dateTo) };
    }

    switch (selectorValue) {
        case PRESET_VALUE_LAST_2_WEEKS: {
            const twoWeeksAgo = new Date(today);
            twoWeeksAgo.setDate(today.getDate() - 14);
            return { dateFrom: twoWeeksAgo, dateTo: today };
        }
        case PRESET_VALUE_LAST_MONTH: {
            const lastMonth = new Date(today);
            lastMonth.setMonth(today.getMonth() - 1);
            return { dateFrom: lastMonth, dateTo: today };
        }
        case PRESET_VALUE_LAST_2_MONTHS: {
            const twoMonthsAgo = new Date(today);
            twoMonthsAgo.setMonth(today.getMonth() - 2);
            return { dateFrom: twoMonthsAgo, dateTo: today };
        }
        case PRESET_VALUE_LAST_3_MONTHS: {
            const threeMonthsAgo = new Date(today);
            threeMonthsAgo.setMonth(today.getMonth() - 3);
            return { dateFrom: threeMonthsAgo, dateTo: today };
        }
        case PRESET_VALUE_LAST_6_MONTHS: {
            const sixMonthsAgo = new Date(today);
            sixMonthsAgo.setMonth(today.getMonth() - 6);
            return { dateFrom: sixMonthsAgo, dateTo: today };
        }
        case PRESET_VALUE_ALL_TIMES: {
            return { dateFrom: new Date(earliestDate), dateTo: today };
        }
        default:
            return { dateFrom: today, dateTo: today };
    }
};

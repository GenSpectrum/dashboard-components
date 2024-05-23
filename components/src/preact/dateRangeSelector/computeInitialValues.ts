import {
    type CustomSelectOption,
    getDatesForSelectorValue,
    getSelectableOptions,
    PRESET_VALUE_CUSTOM,
    PRESET_VALUE_LAST_6_MONTHS,
    type PresetOptionValues,
} from './selectableOptions';
import { UserFacingError } from '../components/error-display';

export function computeInitialValues<CustomLabel extends string>(
    initialValue: PresetOptionValues | CustomLabel | undefined,
    initialDateFrom: string | undefined,
    initialDateTo: string | undefined,
    earliestDate: string,
    customSelectOptions: CustomSelectOption<CustomLabel>[],
): {
    initialSelectedDateRange: CustomLabel | PresetOptionValues;
    initialSelectedDateFrom: Date;
    initialSelectedDateTo: Date;
} {
    if (isUndefinedOrEmpty(initialDateFrom) && isUndefinedOrEmpty(initialDateTo)) {
        const selectableOptions = getSelectableOptions(customSelectOptions);
        const initialSelectedDateRange =
            initialValue !== undefined && selectableOptions.some((option) => option.value === initialValue)
                ? initialValue
                : PRESET_VALUE_LAST_6_MONTHS;

        const { dateFrom, dateTo } = getDatesForSelectorValue(
            initialSelectedDateRange,
            customSelectOptions,
            earliestDate,
        );

        return {
            initialSelectedDateRange,
            initialSelectedDateFrom: dateFrom,
            initialSelectedDateTo: dateTo,
        };
    }

    const initialSelectedDateFrom = isUndefinedOrEmpty(initialDateFrom)
        ? new Date(earliestDate)
        : new Date(initialDateFrom);
    let initialSelectedDateTo = isUndefinedOrEmpty(initialDateTo) ? new Date() : new Date(initialDateTo);

    if (isNaN(initialSelectedDateFrom.getTime())) {
        throw new UserFacingError(
            'Invalid initialDateFrom',
            `Invalid initialDateFrom "${initialDateFrom}", It must be of the format YYYY-MM-DD`,
        );
    }
    if (isNaN(initialSelectedDateTo.getTime())) {
        throw new UserFacingError(
            'Invalid initialDateTo',
            `Invalid initialDateTo "${initialDateTo}", It must be of the format YYYY-MM-DD`,
        );
    }

    if (initialSelectedDateFrom > initialSelectedDateTo) {
        initialSelectedDateTo = initialSelectedDateFrom;
    }

    return {
        initialSelectedDateRange: PRESET_VALUE_CUSTOM,
        initialSelectedDateFrom,
        initialSelectedDateTo,
    };
}

function isUndefinedOrEmpty(value: string | undefined): value is undefined | '' {
    return value === undefined || value === '';
}

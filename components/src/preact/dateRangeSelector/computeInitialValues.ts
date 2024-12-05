import { type DateRangeOption } from './dateRangeOption';
import { getDatesForSelectorValue, getSelectableOptions } from './selectableOptions';
import { UserFacingError } from '../components/error-display';

export function computeInitialValues(
    initialValue: string | undefined,
    initialDateFrom: string | undefined,
    initialDateTo: string | undefined,
    earliestDate: string,
    dateRangeOptions: DateRangeOption[],
): {
    initialSelectedDateRange: string | undefined;
    initialSelectedDateFrom: Date;
    initialSelectedDateTo: Date;
} {
    if (isUndefinedOrEmpty(initialDateFrom) && isUndefinedOrEmpty(initialDateTo)) {
        const selectableOptions = getSelectableOptions(dateRangeOptions);
        const initialSelectedDateRange = selectableOptions.find((option) => option.value === initialValue)?.value;

        if (initialValue !== undefined && initialSelectedDateRange === undefined) {
            if (selectableOptions.length === 0) {
                throw new UserFacingError(
                    'Invalid initialValue',
                    'There are no selectable options, but initialValue is set.',
                );
            }
            throw new UserFacingError(
                'Invalid initialValue',
                `Invalid initialValue "${initialValue}", It must be one of ${selectableOptions.map((option) => `'${option.value}'`).join(', ')}`,
            );
        }

        const { dateFrom, dateTo } = getDatesForSelectorValue(initialSelectedDateRange, dateRangeOptions, earliestDate);

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
        initialSelectedDateRange: undefined,
        initialSelectedDateFrom,
        initialSelectedDateTo,
    };
}

function isUndefinedOrEmpty(value: string | undefined): value is undefined | '' {
    return value === undefined || value === '';
}

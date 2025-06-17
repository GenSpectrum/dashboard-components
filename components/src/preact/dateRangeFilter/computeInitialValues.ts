import { type DateRangeOption, type DateRangeValue } from './dateRangeOption';
import { getSelectableOptions } from './selectableOptions';
import { UserFacingError } from '../components/error-display';

export function computeInitialValues(value: DateRangeValue, dateRangeOptions: DateRangeOption[]) {
    if (value === null) {
        return undefined;
    }

    if (typeof value === 'string') {
        const selectableOptions = getSelectableOptions(dateRangeOptions);
        const matchingOption = dateRangeOptions.find((option) => option.label === value);

        if (matchingOption === undefined) {
            if (selectableOptions.length === 0) {
                throw new UserFacingError('Invalid value', 'There are no selectable options, but value is set.');
            }
            throw new UserFacingError(
                'Invalid value',
                `Invalid value "${value}", It must be one of ${selectableOptions.map((option) => `'${option.value}'`).join(', ')}`,
            );
        }

        return {
            initialSelectedDateRange: matchingOption.label,
            initialSelectedDateFrom:
                matchingOption.dateFrom !== undefined ? new Date(matchingOption.dateFrom) : undefined,
            initialSelectedDateTo: matchingOption.dateTo !== undefined ? new Date(matchingOption.dateTo) : undefined,
        };
    }

    const { dateFrom, dateTo } = value;

    const initialSelectedDateFrom = parseMaybeDate(dateFrom, 'dateFrom');
    let initialSelectedDateTo = parseMaybeDate(dateTo, 'dateTo');

    if (
        initialSelectedDateFrom !== undefined &&
        initialSelectedDateTo !== undefined &&
        initialSelectedDateFrom > initialSelectedDateTo
    ) {
        initialSelectedDateTo = initialSelectedDateFrom;
    }

    return {
        initialSelectedDateRange: undefined,
        initialSelectedDateFrom,
        initialSelectedDateTo,
    };
}

function parseMaybeDate(date: string | undefined, name: string): Date | undefined {
    if (date === undefined || date === '') {
        return undefined;
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
        throw new UserFacingError(
            `Invalid value.${name}`,
            `Invalid value.${name} "${date}", it must be of the format YYYY-MM-DD`,
        );
    }

    return parsedDate;
}

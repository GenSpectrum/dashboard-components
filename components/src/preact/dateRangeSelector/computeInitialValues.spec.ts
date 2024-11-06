import { describe, expect, it } from 'vitest';

import { computeInitialValues } from './computeInitialValues';

const today = new Date();
const earliestDate = '1900-01-01';

const fromOption = 'fromOption';
const toOption = 'toOption';
const fromToOption = 'fromToOption';
const dateFromOptionValue = '2010-06-30';
const dateToOptionValue = '2020-01-01';

const dateRangeOptions = [
    { label: fromOption, dateFrom: dateFromOptionValue },
    { label: toOption, dateTo: dateToOptionValue },
    { label: fromToOption, dateFrom: dateFromOptionValue, dateTo: dateToOptionValue },
];

describe('computeInitialValues', () => {
    it('should compute for initial value if initial "from" and "to" are unset', () => {
        const result = computeInitialValues(fromToOption, undefined, undefined, earliestDate, dateRangeOptions);

        expect(result.initialSelectedDateRange).toEqual(fromToOption);
        expectDateMatches(result.initialSelectedDateFrom, new Date(dateFromOptionValue));
        expectDateMatches(result.initialSelectedDateTo, new Date(dateToOptionValue));
    });

    it('should use today as "dateTo" if it is unset in selected option', () => {
        const result = computeInitialValues(fromOption, undefined, undefined, earliestDate, dateRangeOptions);

        expect(result.initialSelectedDateRange).toEqual(fromOption);
        expectDateMatches(result.initialSelectedDateFrom, new Date(dateFromOptionValue));
        expectDateMatches(result.initialSelectedDateTo, today);
    });

    it('should use earliest date as "dateFrom" if it is unset in selected option', () => {
        const result = computeInitialValues(toOption, undefined, undefined, earliestDate, dateRangeOptions);

        expect(result.initialSelectedDateRange).toEqual(toOption);
        expectDateMatches(result.initialSelectedDateFrom, new Date(earliestDate));
        expectDateMatches(result.initialSelectedDateTo, new Date(dateToOptionValue));
    });

    it('should fall back to full range if initial value is not set', () => {
        const result = computeInitialValues(undefined, undefined, undefined, earliestDate, dateRangeOptions);

        expect(result.initialSelectedDateRange).toBeUndefined();
        expectDateMatches(result.initialSelectedDateFrom, new Date(earliestDate));
        expectDateMatches(result.initialSelectedDateTo, today);
    });

    it('should fall back to default when initial value is unknown', () => {
        expect(() => computeInitialValues('not a known value', undefined, undefined, earliestDate, [])).toThrowError(
            /Invalid initialValue "not a known value", It must be one of/,
        );
    });

    it('should overwrite initial value if initial "from" is set', () => {
        const initialDateFrom = '2020-01-01';
        const result = computeInitialValues(fromOption, initialDateFrom, undefined, earliestDate, dateRangeOptions);

        expect(result.initialSelectedDateRange).toBeUndefined();
        expectDateMatches(result.initialSelectedDateFrom, new Date(initialDateFrom));
        expectDateMatches(result.initialSelectedDateTo, today);
    });

    it('should overwrite initial value if initial "to" is set', () => {
        const initialDateTo = '2020-01-01';
        const result = computeInitialValues(fromOption, undefined, initialDateTo, earliestDate, dateRangeOptions);

        expect(result.initialSelectedDateRange).toBeUndefined();
        expectDateMatches(result.initialSelectedDateFrom, new Date(earliestDate));
        expectDateMatches(result.initialSelectedDateTo, new Date(initialDateTo));
    });

    it('should overwrite initial value if initial "to" and "from" are set', () => {
        const initialDateFrom = '2020-01-01';
        const initialDateTo = '2022-01-01';
        const result = computeInitialValues(fromOption, initialDateFrom, initialDateTo, earliestDate, dateRangeOptions);

        expect(result.initialSelectedDateRange).toBeUndefined();
        expectDateMatches(result.initialSelectedDateFrom, new Date(initialDateFrom));
        expectDateMatches(result.initialSelectedDateTo, new Date(initialDateTo));
    });

    it('should set initial "to" to "from" if "from" is after "to"', () => {
        const initialDateFrom = '2020-01-01';
        const initialDateTo = '1900-01-01';
        const result = computeInitialValues(undefined, initialDateFrom, initialDateTo, earliestDate, dateRangeOptions);

        expect(result.initialSelectedDateRange).toBeUndefined();
        expectDateMatches(result.initialSelectedDateFrom, new Date(initialDateFrom));
        expectDateMatches(result.initialSelectedDateTo, new Date(initialDateFrom));
    });

    it('should throw if initial "from" is not a valid date', () => {
        expect(() => computeInitialValues(undefined, 'not a date', undefined, earliestDate, [])).toThrowError(
            'Invalid initialDateFrom',
        );
    });

    it('should throw if initial "to" is not a valid date', () => {
        expect(() => computeInitialValues(undefined, undefined, 'not a date', earliestDate, [])).toThrowError(
            'Invalid initialDateTo',
        );
    });

    function expectDateMatches(actual: Date, expected: Date) {
        expect(actual.getFullYear()).toEqual(expected.getFullYear());
        expect(actual.getMonth()).toEqual(expected.getMonth());
        expect(actual.getDate()).toEqual(expected.getDate());
    }
});

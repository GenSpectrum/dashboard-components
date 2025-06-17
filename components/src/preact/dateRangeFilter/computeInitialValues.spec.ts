import { describe, expect, it } from 'vitest';

import { computeInitialValues } from './computeInitialValues';

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
    it('should return undefined for null value', () => {
        const result = computeInitialValues(null, dateRangeOptions);

        expect(result).toBeUndefined();
    });

    it('should compute initial value if value is dateRangeOption label', () => {
        const result = computeInitialValues(fromToOption, dateRangeOptions);

        expect(result?.initialSelectedDateRange).toEqual(fromToOption);
        expectDateMatches(result?.initialSelectedDateFrom, new Date(dateFromOptionValue));
        expectDateMatches(result?.initialSelectedDateTo, new Date(dateToOptionValue));
    });

    it('should compute initial value if value is dateRangeOption label with missing date to', () => {
        const result = computeInitialValues(fromOption, dateRangeOptions);

        expect(result?.initialSelectedDateRange).toEqual(fromOption);
        expectDateMatches(result?.initialSelectedDateFrom, new Date(dateFromOptionValue));
        expectDateMatches(result?.initialSelectedDateTo, undefined);
    });

    it('should compute initial value if value is dateRangeOption label with missing date from', () => {
        const result = computeInitialValues(toOption, dateRangeOptions);

        expect(result?.initialSelectedDateRange).toEqual(toOption);
        expectDateMatches(result?.initialSelectedDateFrom, undefined);
        expectDateMatches(result?.initialSelectedDateTo, new Date(dateToOptionValue));
    });

    it('should throw when initial value is unknown', () => {
        expect(() => computeInitialValues('not a known value', dateRangeOptions)).toThrowError(
            /Invalid value "not a known value", It must be one of/,
        );
    });

    it('should throw when initial value is set but no options are provided', () => {
        expect(() => computeInitialValues('not a known value', [])).toThrowError(/There are no selectable options/);
    });

    it('should compute initial date if only dateFrom is given', () => {
        const initialDateFrom = '2020-01-01';
        const result = computeInitialValues({ dateFrom: initialDateFrom }, dateRangeOptions);

        expect(result?.initialSelectedDateRange).toBeUndefined();
        expectDateMatches(result?.initialSelectedDateFrom, new Date(initialDateFrom));
        expectDateMatches(result?.initialSelectedDateTo, undefined);
    });

    it('should compute initial date if only dateTo is given', () => {
        const initialDateTo = '2020-01-01';
        const result = computeInitialValues({ dateTo: initialDateTo }, dateRangeOptions);

        expect(result?.initialSelectedDateRange).toBeUndefined();
        expectDateMatches(result?.initialSelectedDateFrom, undefined);
        expectDateMatches(result?.initialSelectedDateTo, new Date(initialDateTo));
    });

    it('should select date range is dateFrom and dateTo are given', () => {
        const initialDateFrom = '2020-01-01';
        const initialDateTo = '2022-01-01';
        const result = computeInitialValues(
            {
                dateFrom: initialDateFrom,
                dateTo: initialDateTo,
            },
            dateRangeOptions,
        );

        expect(result?.initialSelectedDateRange).toBeUndefined();
        expectDateMatches(result?.initialSelectedDateFrom, new Date(initialDateFrom));
        expectDateMatches(result?.initialSelectedDateTo, new Date(initialDateTo));
    });

    it('should set initial "to" to "from" if "from" is after "to"', () => {
        const initialDateFrom = '2020-01-01';
        const initialDateTo = '1900-01-01';
        const result = computeInitialValues(
            {
                dateFrom: initialDateFrom,
                dateTo: initialDateTo,
            },
            dateRangeOptions,
        );

        expect(result?.initialSelectedDateRange).toBeUndefined();
        expectDateMatches(result?.initialSelectedDateFrom, new Date(initialDateFrom));
        expectDateMatches(result?.initialSelectedDateTo, new Date(initialDateFrom));
    });

    it('should throw if initial "from" is not a valid date', () => {
        expect(() => computeInitialValues({ dateFrom: 'not a date' }, [])).toThrowError('Invalid value.dateFrom');
    });

    it('should throw if initial "to" is not a valid date', () => {
        expect(() => computeInitialValues({ dateTo: 'not a date' }, [])).toThrowError('Invalid value.dateTo');
    });

    function expectDateMatches(actual: Date | undefined, expected: Date | undefined) {
        expect(actual?.getFullYear()).toEqual(expected?.getFullYear());
        expect(actual?.getMonth()).toEqual(expected?.getMonth());
        expect(actual?.getDate()).toEqual(expected?.getDate());
    }
});

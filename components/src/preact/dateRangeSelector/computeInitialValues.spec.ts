import { describe, expect, it } from 'vitest';

import { computeInitialValues } from './computeInitialValues';
import { PRESET_VALUE_CUSTOM, PRESET_VALUE_LAST_3_MONTHS, PRESET_VALUE_LAST_6_MONTHS } from './selectableOptions';

const today = new Date();
const earliestDate = '1900-01-01';

describe('computeInitialValues', () => {
    it('should compute for initial value if initial "from" and "to" are unset', () => {
        const result = computeInitialValues(PRESET_VALUE_LAST_3_MONTHS, undefined, undefined, earliestDate, []);

        const expectedFrom = new Date();
        expectedFrom.setMonth(today.getMonth() - 3);

        expect(result.initialSelectedDateRange).toEqual(PRESET_VALUE_LAST_3_MONTHS);
        expectDateMatches(result.initialSelectedDateFrom, expectedFrom);
        expectDateMatches(result.initialSelectedDateTo, today);
    });

    it('should fall back to default when initial value is unknown', () => {
        const result = computeInitialValues('not a known value', undefined, undefined, earliestDate, []);

        const expectedFrom = new Date();
        expectedFrom.setMonth(today.getMonth() - 6);

        expect(result.initialSelectedDateRange).toEqual(PRESET_VALUE_LAST_6_MONTHS);
        expectDateMatches(result.initialSelectedDateFrom, expectedFrom);
        expectDateMatches(result.initialSelectedDateTo, today);
    });

    it('should overwrite initial value if initial "from" is set', () => {
        const initialDateFrom = '2020-01-01';
        const result = computeInitialValues(PRESET_VALUE_LAST_3_MONTHS, initialDateFrom, undefined, earliestDate, []);

        expect(result.initialSelectedDateRange).toEqual(PRESET_VALUE_CUSTOM);
        expectDateMatches(result.initialSelectedDateFrom, new Date(initialDateFrom));
        expectDateMatches(result.initialSelectedDateTo, today);
    });

    it('should overwrite initial value if initial "to" is set', () => {
        const initialDateTo = '2020-01-01';
        const result = computeInitialValues(PRESET_VALUE_LAST_3_MONTHS, undefined, initialDateTo, earliestDate, []);

        expect(result.initialSelectedDateRange).toEqual(PRESET_VALUE_CUSTOM);
        expectDateMatches(result.initialSelectedDateFrom, new Date(earliestDate));
        expectDateMatches(result.initialSelectedDateTo, new Date(initialDateTo));
    });

    it('should overwrite initial value if initial "to" and "from" are set', () => {
        const initialDateFrom = '2020-01-01';
        const initialDateTo = '2022-01-01';
        const result = computeInitialValues(
            PRESET_VALUE_LAST_3_MONTHS,
            initialDateFrom,
            initialDateTo,
            earliestDate,
            [],
        );

        expect(result.initialSelectedDateRange).toEqual(PRESET_VALUE_CUSTOM);
        expectDateMatches(result.initialSelectedDateFrom, new Date(initialDateFrom));
        expectDateMatches(result.initialSelectedDateTo, new Date(initialDateTo));
    });

    it('should set initial "to" to "from" if "from" is after "to"', () => {
        const initialDateFrom = '2020-01-01';
        const initialDateTo = '1900-01-01';
        const result = computeInitialValues(
            PRESET_VALUE_LAST_3_MONTHS,
            initialDateFrom,
            initialDateTo,
            earliestDate,
            [],
        );

        expect(result.initialSelectedDateRange).toEqual(PRESET_VALUE_CUSTOM);
        expectDateMatches(result.initialSelectedDateFrom, new Date(initialDateFrom));
        expectDateMatches(result.initialSelectedDateTo, new Date(initialDateFrom));
    });

    it('should throw if initial "from" is not a valid date', () => {
        expect(() =>
            computeInitialValues(PRESET_VALUE_LAST_3_MONTHS, 'not a date', undefined, earliestDate, []),
        ).toThrowError('Invalid initialDateFrom');
    });

    it('should throw if initial "to" is not a valid date', () => {
        expect(() =>
            computeInitialValues(PRESET_VALUE_LAST_3_MONTHS, undefined, 'not a date', earliestDate, []),
        ).toThrowError('Invalid initialDateTo');
    });

    function expectDateMatches(actual: Date, expected: Date) {
        expect(actual.getFullYear()).toEqual(expected.getFullYear());
        expect(actual.getMonth()).toEqual(expected.getMonth());
        expect(actual.getDate()).toEqual(expected.getDate());
    }
});

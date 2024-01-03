import { expect } from '@open-wc/testing';
import {
    generateAllDaysInRange,
    generateAllMonthsInRange,
    generateAllYearsInRange,
    TemporalCache,
    Year,
    YearMonth,
    YearMonthDay,
} from './temporal';

// TODO The tests don't work: error: "TypeError: dayjs is not a function"

describe('generateAllDaysInRange', () => {
    it('should return all days in range', () => {
        const cache = TemporalCache.getInstance();
        expect(
            generateAllDaysInRange(YearMonthDay.parse('2020-01-01', cache), YearMonthDay.parse('2020-01-04', cache)),
        ).deep.equal([
            YearMonthDay.parse('2020-01-01', cache),
            YearMonthDay.parse('2020-01-02', cache),
            YearMonthDay.parse('2020-01-03', cache),
            YearMonthDay.parse('2020-01-04', cache),
        ]);
    });
});

describe('generateAllMonthsInRange', () => {
    it('should return all months in range', () => {
        const cache = TemporalCache.getInstance();
        expect(
            generateAllMonthsInRange(YearMonth.parse('2020-01', cache), YearMonth.parse('2020-04', cache)),
        ).deep.equal([
            YearMonth.parse('2020-01', cache),
            YearMonth.parse('2020-02', cache),
            YearMonth.parse('2020-03', cache),
            YearMonth.parse('2020-04', cache),
        ]);
    });
});

describe('generateAllYearsInRange', () => {
    it('should return all years in range', () => {
        const cache = TemporalCache.getInstance();
        expect(generateAllYearsInRange(Year.parse('2020-01', cache), Year.parse('2023', cache))).deep.equal([
            Year.parse('2020', cache),
            Year.parse('2021', cache),
            Year.parse('2022', cache),
            Year.parse('2023', cache),
        ]);
    });
});

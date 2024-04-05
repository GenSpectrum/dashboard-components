import { describe, expect, it } from 'vitest';

import {
    generateAllDaysInRange,
    generateAllMonthsInRange,
    generateAllYearsInRange,
    TemporalCache,
    Year,
    YearMonth,
    YearMonthDay,
    YearWeek,
} from './temporal';

const cache = TemporalCache.getInstance();

describe('generateAllDaysInRange', () => {
    it('should return all days in range', () => {
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
        expect(generateAllYearsInRange(Year.parse('2020-01', cache), Year.parse('2023', cache))).deep.equal([
            Year.parse('2020', cache),
            Year.parse('2021', cache),
            Year.parse('2022', cache),
            Year.parse('2023', cache),
        ]);
    });
});

describe('YearMonthDay', () => {
    it('should parse from string', () => {
        const underTest = YearMonthDay.parse('2020-01-01', cache);

        expect(underTest.yearNumber).equal(2020);
        expect(underTest.monthNumber).equal(1);
        expect(underTest.dayNumber).equal(1);
        // seems to be a bug in dayjs: https://github.com/iamkun/dayjs/issues/2620
        expect(underTest.week.text).equal('2019-01');
        expect(underTest.text).equal('2020-01-01');
    });
});

describe('YearWeek', () => {
    it('should parse from string', () => {
        const underTest = YearWeek.parse('2020-02', cache);

        expect(underTest.isoYearNumber).equal(2020);
        expect(underTest.isoWeekNumber).equal(2);
        expect(underTest.firstDay.text).equal('2020-01-06');
        expect(underTest.text).equal('2020-02');
    });
});

describe('YearMonth', () => {
    it('should parse from string', () => {
        const underTest = YearMonth.parse('2020-01', cache);

        expect(underTest.yearNumber).equal(2020);
        expect(underTest.monthNumber).equal(1);
        expect(underTest.text).equal('2020-01');
        expect(underTest.firstDay.text).equal('2020-01-01');
    });
});

describe('Year', () => {
    it('should parse from string', () => {
        const underTest = Year.parse('2020', cache);

        expect(underTest.year).equal(2020);
        expect(underTest.text).equal('2020');
        expect(underTest.firstDay.text).equal('2020-01-01');
        expect(underTest.firstMonth.text).equal('2020-01');
    });
});

import { describe, expect, it } from 'vitest';

import {
    generateAllDaysInRange,
    generateAllMonthsInRange,
    generateAllYearsInRange,
    TemporalCache,
    YearClass,
    YearMonthClass,
    YearMonthDayClass,
    YearWeekClass,
} from './temporalClass';

const cache = TemporalCache.getInstance();

describe('generateAllDaysInRange', () => {
    it('should return all days in range', () => {
        expect(
            generateAllDaysInRange(
                YearMonthDayClass.parse('2020-01-01', cache),
                YearMonthDayClass.parse('2020-01-04', cache),
            ),
        ).deep.equal([
            YearMonthDayClass.parse('2020-01-01', cache),
            YearMonthDayClass.parse('2020-01-02', cache),
            YearMonthDayClass.parse('2020-01-03', cache),
            YearMonthDayClass.parse('2020-01-04', cache),
        ]);
    });
});

describe('generateAllMonthsInRange', () => {
    it('should return all months in range', () => {
        expect(
            generateAllMonthsInRange(YearMonthClass.parse('2020-01', cache), YearMonthClass.parse('2020-04', cache)),
        ).deep.equal([
            YearMonthClass.parse('2020-01', cache),
            YearMonthClass.parse('2020-02', cache),
            YearMonthClass.parse('2020-03', cache),
            YearMonthClass.parse('2020-04', cache),
        ]);
    });
});

describe('generateAllYearsInRange', () => {
    it('should return all years in range', () => {
        expect(generateAllYearsInRange(YearClass.parse('2020-01', cache), YearClass.parse('2023', cache))).deep.equal([
            YearClass.parse('2020', cache),
            YearClass.parse('2021', cache),
            YearClass.parse('2022', cache),
            YearClass.parse('2023', cache),
        ]);
    });
});

describe('YearMonthDay', () => {
    it('should parse from string', () => {
        const underTest = YearMonthDayClass.parse('2020-01-01', cache);

        expect(underTest.yearNumber).equal(2020);
        expect(underTest.monthNumber).equal(1);
        expect(underTest.dayNumber).equal(1);
        expect(underTest.week.text).equal('2020-W01');
        expect(underTest.text).equal('2020-01-01');
        expect(underTest.firstDay.text).equal('2020-01-01');
        expect(underTest.lastDay.text).equal('2020-01-01');
    });
});

describe('YearWeek', () => {
    it('should parse from string', () => {
        const underTest = YearWeekClass.parse('2020-W02', cache);

        expect(underTest.isoYearNumber).equal(2020);
        expect(underTest.isoWeekNumber).equal(2);
        expect(underTest.firstDay.text).equal('2020-01-06');
        expect(underTest.text).equal('2020-W02');
        expect(underTest.lastDay.text).equal('2020-01-12');
    });
});

describe('YearMonth', () => {
    it('should parse from string', () => {
        const underTest = YearMonthClass.parse('2020-01', cache);

        expect(underTest.yearNumber).equal(2020);
        expect(underTest.monthNumber).equal(1);
        expect(underTest.text).equal('2020-01');
        expect(underTest.firstDay.text).equal('2020-01-01');
        expect(underTest.lastDay.text).equal('2020-01-31');
    });
});

describe('Year', () => {
    it('should parse from string', () => {
        const underTest = YearClass.parse('2020', cache);

        expect(underTest.year).equal(2020);
        expect(underTest.text).equal('2020');
        expect(underTest.firstDay.text).equal('2020-01-01');
        expect(underTest.firstMonth.text).equal('2020-01');
        expect(underTest.lastDay.text).equal('2020-12-31');
    });
});

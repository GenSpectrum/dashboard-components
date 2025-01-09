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
    const examples = [
        {
            string: '2020-W01',
            expectedYear: 2020,
            expectedWeek: 1,
            expectedFirstDay: '2019-12-30',
            expectedLastDay: '2020-01-05',
            expectedText: '2020-W01',
        },
        {
            string: '2020-W53',
            expectedYear: 2020,
            expectedWeek: 53,
            expectedFirstDay: '2020-12-28',
            expectedLastDay: '2021-01-03',
            expectedText: '2020-W53',
        },
        {
            string: '2021-W01',
            expectedYear: 2021,
            expectedWeek: 1,
            expectedFirstDay: '2021-01-04',
            expectedLastDay: '2021-01-10',
            expectedText: '2021-W01',
        },
        {
            string: '2021-W53',
            expectedYear: 2021,
            expectedWeek: 53,
            expectedFirstDay: '2022-01-03',
            expectedLastDay: '2022-01-09',
            expectedText: '2022-W01',
        },
        {
            string: '2022-W01',
            expectedYear: 2022,
            expectedWeek: 1,
            expectedFirstDay: '2022-01-03',
            expectedLastDay: '2022-01-09',
            expectedText: '2022-W01',
        },
        {
            string: '2024-W01',
            expectedYear: 2024,
            expectedWeek: 1,
            expectedFirstDay: '2024-01-01',
            expectedLastDay: '2024-01-07',
            expectedText: '2024-W01',
        },
    ];

    for (const example of examples) {
        const { string, expectedYear, expectedWeek, expectedFirstDay, expectedLastDay, expectedText } = example;
        it(`should parse ${string} from string`, () => {
            const underTest = YearWeekClass.parse(string, cache);

            expect(underTest.isoYearNumber).equal(expectedYear);
            expect(underTest.isoWeekNumber).equal(expectedWeek);
            expect(underTest.firstDay.text).equal(expectedFirstDay);
            expect(underTest.text).equal(expectedText);
            expect(underTest.lastDay.text).equal(expectedLastDay);
        });
    }
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

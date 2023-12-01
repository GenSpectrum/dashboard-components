import {
    addDays,
    generateAllDaysInRange,
    generateAllMonthsInRange,
    generateAllYearsInRange,
    getDaysInBetween,
} from './temporal-utils';
import { expect } from '@open-wc/testing';

describe('generateAllDaysInRange', () => {
    it('should return all days in range', () => {
        expect(generateAllDaysInRange('2020-01-01', '2020-01-04')).deep.equal([
            '2020-01-01',
            '2020-01-02',
            '2020-01-03',
            '2020-01-04',
        ]);
    });
});

describe('generateAllMonthsInRange', () => {
    it('should return all months in range', () => {
        expect(generateAllMonthsInRange('2020-01', '2020-04')).deep.equal(['2020-01', '2020-02', '2020-03', '2020-04']);
    });
});

describe('generateAllYearsInRange', () => {
    it('should return all months in range', () => {
        expect(generateAllYearsInRange('2020', '2023')).deep.equal(['2020', '2021', '2022', '2023']);
    });
});

describe('getDaysInBetween', () => {
    it('should return days in between', () => {
        expect(getDaysInBetween('2020-01-01', '2020-01-04')).equal(3);
    });
});

describe('addDays', () => {
    it('should add days', () => {
        expect(addDays('2020-01-01', 3)).equal('2020-01-04');
    });
});

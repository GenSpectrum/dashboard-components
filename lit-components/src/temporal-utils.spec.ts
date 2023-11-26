import { generateAllDaysInRange, generateAllMonthsInRange, generateAllYearsInRange } from './temporal-utils';
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

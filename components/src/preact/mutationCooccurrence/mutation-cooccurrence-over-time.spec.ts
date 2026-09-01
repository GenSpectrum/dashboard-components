import { describe, expect, it } from 'vitest';

import { CooccurrenceOverTimeDataMap } from './CooccurrenceOverTimeData';
import { getFilteredCooccurrenceData } from './mutation-cooccurrence-over-time';
import { yearMonthDay } from '../../utils/temporalTestHelpers';

const pattern1 = { symbols: { '[1]': 'A', '[2]': 'T' } };
const pattern2 = { symbols: { '[1]': 'G', '[2]': 'C' } };
const day1 = yearMonthDay('2024-01-15');
const day2 = yearMonthDay('2024-01-16');

function buildMap() {
    const map = new CooccurrenceOverTimeDataMap();
    // pattern1: mean proportion = (90 + 50) / (100 + 100) = 0.7
    map.set(pattern1, day1, { type: 'valueWithCoverage', count: 90, coverage: 100, totalCount: 100 });
    map.set(pattern1, day2, { type: 'valueWithCoverage', count: 50, coverage: 100, totalCount: 100 });
    // pattern2: mean proportion = 1 / 100 = 0.01
    map.set(pattern2, day1, { type: 'valueWithCoverage', count: 1, coverage: 100, totalCount: 100 });
    map.set(pattern2, day2, null);
    return map;
}

describe('getFilteredCooccurrenceData', () => {
    it('keeps patterns whose mean proportion is within the interval', () => {
        const result = getFilteredCooccurrenceData(buildMap(), { min: 0, max: 1 }, false);

        expect(result.getFirstAxisKeys()).to.deep.equal([pattern1, pattern2]);
    });

    it('removes patterns whose mean proportion falls outside the interval', () => {
        const result = getFilteredCooccurrenceData(buildMap(), { min: 0.5, max: 1 }, false);

        expect(result.getFirstAxisKeys()).to.deep.equal([pattern1]);
    });

    it('removes date columns where every pattern has null when hideGaps is true', () => {
        const map = new CooccurrenceOverTimeDataMap();
        map.set(pattern1, day1, { type: 'valueWithCoverage', count: 90, coverage: 100, totalCount: 100 });
        map.set(pattern1, day2, null);
        map.set(pattern2, day1, { type: 'valueWithCoverage', count: 1, coverage: 100, totalCount: 100 });
        map.set(pattern2, day2, null);

        const result = getFilteredCooccurrenceData(map, { min: 0, max: 1 }, true);

        expect(result.getSecondAxisKeys()).to.deep.equal([day1]);
    });

    it('keeps date columns that have data for at least one pattern when hideGaps is true', () => {
        const result = getFilteredCooccurrenceData(buildMap(), { min: 0, max: 1 }, true);

        expect(result.getSecondAxisKeys()).to.deep.equal([day1, day2]);
    });
});

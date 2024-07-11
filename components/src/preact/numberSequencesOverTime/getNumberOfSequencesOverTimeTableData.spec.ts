import { describe, expect, test } from 'vitest';

import { getNumberOfSequencesOverTimeTableData } from './getNumberOfSequencesOverTimeTableData';
import { yearMonth } from '../../utils/temporalTestHelpers';

describe('getNumberOfSequencesOverTimeTableData', () => {
    test('should return empty array if no data', () => {
        const result = getNumberOfSequencesOverTimeTableData([], 'day');

        expect(result).to.deep.equal([]);
    });

    test('should generate missing date ranges for non-overlapping datasets', () => {
        const data = [
            {
                displayName: 'dataset1',
                content: [{ count: 1, dateRange: yearMonth('2023-01') }],
            },
            {
                displayName: 'dataset2',
                content: [{ count: 3, dateRange: yearMonth('2023-04') }],
            },
        ];

        const result = getNumberOfSequencesOverTimeTableData(data, 'month');

        expect(result).to.deep.equal([
            {
                dataset1: 1,
                dataset2: 0,
                month: '2023-01',
            },
            {
                dataset1: 0,
                dataset2: 0,
                month: '2023-02',
            },
            {
                dataset1: 0,
                dataset2: 0,
                month: '2023-03',
            },
            {
                dataset1: 0,
                dataset2: 3,
                month: '2023-04',
            },
        ]);
    });

    test('should maps null date ranges to "unknown"', () => {
        const data = [
            {
                displayName: 'dataset1',
                content: [
                    { count: 5, dateRange: null },
                    { count: 4, dateRange: yearMonth('2023-04') },
                ],
            },
        ];

        const result = getNumberOfSequencesOverTimeTableData(data, 'month');

        expect(result).to.deep.equal([
            {
                dataset1: 5,
                month: 'Unknown',
            },
            {
                dataset1: 4,
                month: '2023-04',
            },
        ]);
    });
});

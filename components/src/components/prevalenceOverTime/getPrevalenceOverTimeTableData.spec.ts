import { TemporalGranularity } from '../../types';
import { PrevalenceOverTimeData } from '../../query/queryPrevalenceOverTime';
import { getPrevalenceOverTimeTableData } from './getPrevalenceOverTimeTableData';
import { TemporalCache, YearMonthDay } from '../../temporal';
import { describe, expect, it } from 'vitest';

describe('getPrevalenceOverTimeTableData', () => {
    it('should flatten the data to CSV format', () => {
        const data: PrevalenceOverTimeData = [
            {
                displayName: 'Test 1',
                content: [
                    {
                        dateRange: new YearMonthDay(2021, 1, 1, TemporalCache.getInstance()),
                        prevalence: 0.5,
                        count: 100,
                        total: -5,
                    },
                    {
                        dateRange: new YearMonthDay(2021, 1, 2, TemporalCache.getInstance()),
                        prevalence: 0.6,
                        count: 200,
                        total: -5,
                    },
                ],
            },
            {
                displayName: 'Test 2',
                content: [
                    {
                        dateRange: new YearMonthDay(2021, 1, 1, TemporalCache.getInstance()),
                        prevalence: 0.7,
                        count: 300,
                        total: -5,
                    },
                    {
                        dateRange: new YearMonthDay(2021, 1, 2, TemporalCache.getInstance()),
                        prevalence: 0.8,
                        count: 400,
                        total: -5,
                    },
                ],
            },
        ];
        const granularity: TemporalGranularity = 'day';

        const result = getPrevalenceOverTimeTableData(data, granularity);

        expect(result).toEqual([
            {
                day: '2021-01-01',
                'Test 1 prevalence': '0.5000',
                'Test 1 count': 100,
                'Test 2 prevalence': '0.7000',
                'Test 2 count': 300,
            },
            {
                day: '2021-01-02',
                'Test 1 prevalence': '0.6000',
                'Test 1 count': 200,
                'Test 2 prevalence': '0.8000',
                'Test 2 count': 400,
            },
        ]);
    });
});

import { describe, expect, it } from 'vitest';

import { queryQueriesOverTimeData } from './queryQueriesOverTime';
import { DUMMY_LAPIS_URL, lapisRequestMocks } from '../../vitest.setup';

describe('queryQueriesOverTime', () => {
    it('should fetch queries over time and build Map2D structure', async () => {
        const lapisFilter = { field1: 'value1', field2: 'value2' };
        const dateField = 'dateField';

        // Mock date aggregation call
        lapisRequestMocks.aggregated(
            { ...lapisFilter, fields: [dateField] },
            {
                data: [
                    { count: 1, [dateField]: '2023-01-01' },
                    { count: 2, [dateField]: '2023-01-03' },
                ],
            },
        );

        const dateRanges = [
            { dateFrom: '2023-01-01', dateTo: '2023-01-01' },
            { dateFrom: '2023-01-02', dateTo: '2023-01-02' },
            { dateFrom: '2023-01-03', dateTo: '2023-01-03' },
        ];

        // Mock queries over time API call
        lapisRequestMocks.queriesOverTime([
            {
                body: {
                    filters: lapisFilter,
                    dateRanges,
                    queries: [
                        {
                            displayLabel: 'Query A',
                            countQuery: 'gene1:123G AND gene2:456T',
                            coverageQuery: '!gene1:123N AND !gene2:456N',
                        },
                        {
                            displayLabel: 'Query B',
                            countQuery: 'gene1:789C',
                            coverageQuery: '!gene1:789N',
                        },
                    ],
                    dateField,
                },
                response: {
                    data: {
                        queries: ['Query A', 'Query B'],
                        dateRanges,
                        data: [
                            [
                                { count: 10, coverage: 100 },
                                { count: 15, coverage: 100 },
                                { count: 20, coverage: 100 },
                            ],
                            [
                                { count: 5, coverage: 100 },
                                { count: 8, coverage: 100 },
                                { count: 12, coverage: 100 },
                            ],
                        ],
                        totalCountsByDateRange: [100, 120, 150],
                    },
                },
            },
        ]);

        const { queryOverTimeData } = await queryQueriesOverTimeData(
            lapisFilter,
            [
                {
                    displayLabel: 'Query A',
                    countQuery: 'gene1:123G AND gene2:456T',
                    coverageQuery: '!gene1:123N AND !gene2:456N',
                },
                {
                    displayLabel: 'Query B',
                    countQuery: 'gene1:789C',
                    coverageQuery: '!gene1:789N',
                },
            ],
            DUMMY_LAPIS_URL,
            dateField,
            'day',
        );

        // Verify Map2D structure
        const expectedData = [
            [
                { type: 'valueWithCoverage', count: 10, coverage: 100, totalCount: 100 },
                { type: 'valueWithCoverage', count: 15, coverage: 100, totalCount: 120 },
                { type: 'valueWithCoverage', count: 20, coverage: 100, totalCount: 150 },
            ],
            [
                { type: 'valueWithCoverage', count: 5, coverage: 100, totalCount: 100 },
                { type: 'valueWithCoverage', count: 8, coverage: 100, totalCount: 120 },
                { type: 'valueWithCoverage', count: 12, coverage: 100, totalCount: 150 },
            ],
        ];

        // Convert Map2DContents to array for comparison
        const actualData = Array.from(queryOverTimeData.keysFirstAxis.values()).map((query) => {
            return Array.from(queryOverTimeData.keysSecondAxis.keys()).map((dateKey) => {
                return queryOverTimeData.data.get(query)?.get(dateKey);
            });
        });

        expect(actualData).to.deep.equal(expectedData);

        // Verify first axis keys (queries)
        const queries = Array.from(queryOverTimeData.keysFirstAxis.values());
        expect(queries).to.deep.equal(['Query A', 'Query B']);

        // Verify second axis keys (dates)
        const dates = Array.from(queryOverTimeData.keysSecondAxis.values());
        expect(dates[0].dateString).toBe('2023-01-01');
        expect(dates[1].dateString).toBe('2023-01-02');
        expect(dates[2].dateString).toBe('2023-01-03');
    });

    it('should handle dates with no data (totalCount = 0)', async () => {
        const lapisFilter = { field1: 'value1' };
        const dateField = 'dateField';

        lapisRequestMocks.aggregated(
            { ...lapisFilter, fields: [dateField] },
            {
                data: [
                    { count: 1, [dateField]: '2023-01-01' },
                    { count: 1, [dateField]: '2023-01-03' },
                ],
            },
        );

        const dateRanges = [
            { dateFrom: '2023-01-01', dateTo: '2023-01-01' },
            { dateFrom: '2023-01-02', dateTo: '2023-01-02' },
            { dateFrom: '2023-01-03', dateTo: '2023-01-03' },
        ];

        lapisRequestMocks.queriesOverTime([
            {
                body: {
                    filters: lapisFilter,
                    dateRanges,
                    queries: [
                        {
                            displayLabel: 'Test Query',
                            countQuery: 'gene1:123G',
                            coverageQuery: '!gene1:123N',
                        },
                    ],
                    dateField,
                },
                response: {
                    data: {
                        queries: ['Test Query'],
                        dateRanges,
                        data: [
                            [
                                { count: 5, coverage: 50 },
                                { count: 0, coverage: 0 },
                                { count: 8, coverage: 60 },
                            ],
                        ],
                        totalCountsByDateRange: [50, 0, 60],
                    },
                },
            },
        ]);

        const { queryOverTimeData } = await queryQueriesOverTimeData(
            lapisFilter,
            [
                {
                    displayLabel: 'Test Query',
                    countQuery: 'gene1:123G',
                    coverageQuery: '!gene1:123N',
                },
            ],
            DUMMY_LAPIS_URL,
            dateField,
            'day',
        );

        const actualData = Array.from(queryOverTimeData.keysFirstAxis.values()).map((query) => {
            return Array.from(queryOverTimeData.keysSecondAxis.keys()).map((dateKey) => {
                return queryOverTimeData.data.get(query)?.get(dateKey);
            });
        });

        // Middle date should be null (no data)
        expect(actualData).to.deep.equal([
            [
                { type: 'valueWithCoverage', count: 5, coverage: 50, totalCount: 50 },
                null,
                { type: 'valueWithCoverage', count: 8, coverage: 60, totalCount: 60 },
            ],
        ]);
    });

    it('should handle zero coverage (belowThreshold)', async () => {
        const lapisFilter = { field1: 'value1' };
        const dateField = 'dateField';

        lapisRequestMocks.aggregated(
            { ...lapisFilter, fields: [dateField] },
            {
                data: [{ count: 1, [dateField]: '2023-01-01' }],
            },
        );

        const dateRanges = [{ dateFrom: '2023-01-01', dateTo: '2023-01-01' }];

        lapisRequestMocks.queriesOverTime([
            {
                body: {
                    filters: lapisFilter,
                    dateRanges,
                    queries: [
                        {
                            displayLabel: 'Zero Coverage Query',
                            countQuery: 'gene1:123G',
                            coverageQuery: '!gene1:123N',
                        },
                    ],
                    dateField,
                },
                response: {
                    data: {
                        queries: ['Zero Coverage Query'],
                        dateRanges,
                        data: [[{ count: 0, coverage: 0 }]],
                        totalCountsByDateRange: [100],
                    },
                },
            },
        ]);

        const { queryOverTimeData } = await queryQueriesOverTimeData(
            lapisFilter,
            [
                {
                    displayLabel: 'Zero Coverage Query',
                    countQuery: 'gene1:123G',
                    coverageQuery: '!gene1:123N',
                },
            ],
            DUMMY_LAPIS_URL,
            dateField,
            'day',
        );

        const actualData = Array.from(queryOverTimeData.keysFirstAxis.values()).map((query) => {
            return Array.from(queryOverTimeData.keysSecondAxis.keys()).map((dateKey) => {
                return queryOverTimeData.data.get(query)?.get(dateKey);
            });
        });

        expect(actualData).to.deep.equal([[{ type: 'belowThreshold', totalCount: 100 }]]);
    });

    it('should return empty structure when no dates are available', async () => {
        const lapisFilter = { field1: 'value1' };
        const dateField = 'dateField';

        lapisRequestMocks.aggregated(
            { ...lapisFilter, fields: [dateField] },
            {
                data: [],
            },
        );

        const { queryOverTimeData } = await queryQueriesOverTimeData(
            lapisFilter,
            [
                {
                    displayLabel: 'Test Query',
                    countQuery: 'gene1:123G',
                    coverageQuery: '!gene1:123N',
                },
            ],
            DUMMY_LAPIS_URL,
            dateField,
            'day',
        );

        expect(Array.from(queryOverTimeData.keysFirstAxis.values())).to.deep.equal([]);
        expect(Array.from(queryOverTimeData.keysSecondAxis.values())).to.deep.equal([]);
        expect(queryOverTimeData.data.size).toBe(0);
    });

    it('should respect dateFrom filter', async () => {
        const dateField = 'dateField';
        const lapisFilter = { field1: 'value1', [`${dateField}From`]: '2023-01-02' };

        lapisRequestMocks.aggregated(
            { ...lapisFilter, fields: [dateField] },
            {
                data: [
                    { count: 1, [dateField]: '2023-01-02' },
                    { count: 1, [dateField]: '2023-01-03' },
                ],
            },
        );

        const dateRanges = [
            { dateFrom: '2023-01-02', dateTo: '2023-01-02' },
            { dateFrom: '2023-01-03', dateTo: '2023-01-03' },
        ];

        lapisRequestMocks.queriesOverTime([
            {
                body: {
                    filters: lapisFilter,
                    dateRanges,
                    queries: [
                        {
                            displayLabel: 'Test',
                            countQuery: 'gene1:123G',
                            coverageQuery: '!gene1:123N',
                        },
                    ],
                    dateField,
                },
                response: {
                    data: {
                        queries: ['Test'],
                        dateRanges,
                        data: [
                            [
                                { count: 5, coverage: 50 },
                                { count: 8, coverage: 60 },
                            ],
                        ],
                        totalCountsByDateRange: [50, 60],
                    },
                },
            },
        ]);

        const { queryOverTimeData } = await queryQueriesOverTimeData(
            lapisFilter,
            [
                {
                    displayLabel: 'Test',
                    countQuery: 'gene1:123G',
                    coverageQuery: '!gene1:123N',
                },
            ],
            DUMMY_LAPIS_URL,
            dateField,
            'day',
        );

        const dates = Array.from(queryOverTimeData.keysSecondAxis.values());
        expect(dates.length).toBe(2);
        expect(dates[0].dateString).toBe('2023-01-02');
        expect(dates[1].dateString).toBe('2023-01-03');
    });

    it('should work with different granularities', async () => {
        const lapisFilter = { field1: 'value1' };
        const dateField = 'dateField';

        lapisRequestMocks.aggregated(
            { ...lapisFilter, fields: [dateField] },
            {
                data: [
                    { count: 1, [dateField]: '2023-01-15' },
                    { count: 1, [dateField]: '2023-02-20' },
                ],
            },
        );

        const dateRanges = [
            { dateFrom: '2023-01-01', dateTo: '2023-01-31' },
            { dateFrom: '2023-02-01', dateTo: '2023-02-28' },
        ];

        lapisRequestMocks.queriesOverTime([
            {
                body: {
                    filters: lapisFilter,
                    dateRanges,
                    queries: [
                        {
                            displayLabel: 'Monthly Query',
                            countQuery: 'gene1:123G',
                            coverageQuery: '!gene1:123N',
                        },
                    ],
                    dateField,
                },
                response: {
                    data: {
                        queries: ['Monthly Query'],
                        dateRanges,
                        data: [
                            [
                                { count: 10, coverage: 100 },
                                { count: 20, coverage: 150 },
                            ],
                        ],
                        totalCountsByDateRange: [100, 150],
                    },
                },
            },
        ]);

        const { queryOverTimeData } = await queryQueriesOverTimeData(
            lapisFilter,
            [
                {
                    displayLabel: 'Monthly Query',
                    countQuery: 'gene1:123G',
                    coverageQuery: '!gene1:123N',
                },
            ],
            DUMMY_LAPIS_URL,
            dateField,
            'month',
        );

        const dates = Array.from(queryOverTimeData.keysSecondAxis.values());
        expect(dates.length).toBe(2);
        expect(dates[0].dateString).toBe('2023-01');
        expect(dates[1].dateString).toBe('2023-02');
    });
});

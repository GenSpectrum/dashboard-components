import { describe, expect, it } from 'vitest';

import { queryMutationsOverTimeMetadata, queryMutationsOverTimePage } from './queryMutationsOverTime';
import { DUMMY_LAPIS_URL, lapisRequestMocks } from '../../vitest.setup';

const lapisFilter = { field1: 'value1', field2: 'value2' };
const dateField = 'dateField';

describe('queryMutationsOverTimeMetadata', () => {
    it('should fetch overall mutation data and sort by mutation code', async () => {
        lapisRequestMocks.aggregated(
            { ...lapisFilter, fields: [dateField] },
            {
                data: [
                    { count: 1, [dateField]: '2023-01-01' },
                    { count: 2, [dateField]: '2023-01-03' },
                ],
            },
        );
        lapisRequestMocks.multipleMutations(
            [
                {
                    body: {
                        ...lapisFilter,
                        dateFieldFrom: '2023-01-01',
                        dateFieldTo: '2023-01-03',
                        minProportion: 0.001,
                    },
                    response: {
                        data: [getSomeTestMutation(0.21, 6), getSomeOtherTestMutation(0.22, 4)],
                    },
                },
            ],
            'nucleotide',
        );

        const { overallMutationData, requestedDateRanges } = await queryMutationsOverTimeMetadata(
            lapisFilter,
            'nucleotide',
            DUMMY_LAPIS_URL,
            dateField,
            'day',
        );

        expect(overallMutationData).to.deep.equal([
            {
                type: 'substitution',
                mutation: {
                    valueAtReference: 'G',
                    substitutionValue: 'C',
                    position: 234,
                    segment: 'otherSequenceName',
                    code: 'otherSequenceName:G234C',
                    type: 'substitution',
                },
                count: 4,
                proportion: 0.22,
            },
            {
                type: 'substitution',
                mutation: {
                    valueAtReference: 'A',
                    substitutionValue: 'T',
                    position: 123,
                    segment: 'sequenceName',
                    code: 'sequenceName:A123T',
                    type: 'substitution',
                },
                count: 6,
                proportion: 0.21,
            },
        ]);

        expect(requestedDateRanges.map((d) => d.dateString)).to.deep.equal(['2023-01-01', '2023-01-02', '2023-01-03']);
    });

    it('should expand date ranges to cover first and last day of the granularity', async () => {
        lapisRequestMocks.aggregated(
            { ...lapisFilter, fields: [dateField] },
            {
                data: [
                    { count: 1, [dateField]: '2023-01-05' },
                    { count: 2, [dateField]: '2023-02-15' },
                ],
            },
        );
        lapisRequestMocks.multipleMutations(
            [
                {
                    body: {
                        ...lapisFilter,
                        dateFieldFrom: '2023-01-01',
                        dateFieldTo: '2023-02-28',
                        minProportion: 0.001,
                    },
                    response: { data: [getSomeTestMutation(0.21, 6)] },
                },
            ],
            'nucleotide',
        );

        const { requestedDateRanges } = await queryMutationsOverTimeMetadata(
            lapisFilter,
            'nucleotide',
            DUMMY_LAPIS_URL,
            dateField,
            'month',
        );

        expect(requestedDateRanges.map((d) => d.dateString)).to.deep.equal(['2023-01', '2023-02']);
    });

    it('should restrict date range when dateFrom is in the filter', async () => {
        const filterWithDateFrom = { ...lapisFilter, [`${dateField}From`]: '2023-01-02' };

        lapisRequestMocks.aggregated(
            { ...filterWithDateFrom, fields: [dateField] },
            {
                data: [
                    { count: 1, [dateField]: '2023-01-01' },
                    { count: 2, [dateField]: '2023-01-03' },
                ],
            },
        );
        lapisRequestMocks.multipleMutations(
            [
                {
                    body: {
                        ...filterWithDateFrom,
                        dateFieldFrom: '2023-01-02',
                        dateFieldTo: '2023-01-03',
                        minProportion: 0.001,
                    },
                    response: { data: [getSomeTestMutation(0.25, 5)] },
                },
            ],
            'nucleotide',
        );

        const { requestedDateRanges } = await queryMutationsOverTimeMetadata(
            filterWithDateFrom,
            'nucleotide',
            DUMMY_LAPIS_URL,
            dateField,
            'day',
        );

        expect(requestedDateRanges.map((d) => d.dateString)).to.deep.equal(['2023-01-02', '2023-01-03']);
    });

    it('should restrict date range when dateTo is in the filter', async () => {
        const filterWithDateTo = { ...lapisFilter, [`${dateField}To`]: '2023-01-02' };

        lapisRequestMocks.aggregated(
            { ...filterWithDateTo, fields: [dateField] },
            {
                data: [
                    { count: 1, [dateField]: '2023-01-01' },
                    { count: 2, [dateField]: '2023-01-03' },
                ],
            },
        );
        lapisRequestMocks.multipleMutations(
            [
                {
                    body: {
                        ...filterWithDateTo,
                        dateFieldFrom: '2023-01-01',
                        dateFieldTo: '2023-01-02',
                        minProportion: 0.001,
                    },
                    response: { data: [getSomeTestMutation(0.15, 3)] },
                },
            ],
            'nucleotide',
        );

        const { requestedDateRanges } = await queryMutationsOverTimeMetadata(
            filterWithDateTo,
            'nucleotide',
            DUMMY_LAPIS_URL,
            dateField,
            'day',
        );

        expect(requestedDateRanges.map((d) => d.dateString)).to.deep.equal(['2023-01-01', '2023-01-02']);
    });

    it('should restrict date range when an exact date is in the filter', async () => {
        const filterWithDate = { ...lapisFilter, [dateField]: '2023-01-02' };

        lapisRequestMocks.aggregated(
            { ...filterWithDate, fields: [dateField] },
            {
                data: [
                    { count: 1, [dateField]: '2023-01-01' },
                    { count: 2, [dateField]: '2023-01-03' },
                ],
            },
        );
        lapisRequestMocks.multipleMutations(
            [
                {
                    body: {
                        ...filterWithDate,
                        dateFieldFrom: '2023-01-02',
                        dateFieldTo: '2023-01-02',
                        minProportion: 0.001,
                    },
                    response: { data: [getSomeTestMutation(0.2, 2)] },
                },
            ],
            'nucleotide',
        );

        const { requestedDateRanges } = await queryMutationsOverTimeMetadata(
            filterWithDate,
            'nucleotide',
            DUMMY_LAPIS_URL,
            dateField,
            'day',
        );

        expect(requestedDateRanges.map((d) => d.dateString)).to.deep.equal(['2023-01-02']);
    });

    it('should return empty data when there are no dates in the dataset', async () => {
        lapisRequestMocks.aggregated({ ...lapisFilter, fields: [dateField] }, { data: [] });

        const { overallMutationData, requestedDateRanges } = await queryMutationsOverTimeMetadata(
            lapisFilter,
            'nucleotide',
            DUMMY_LAPIS_URL,
            dateField,
            'month',
        );

        expect(overallMutationData).to.deep.equal([]);
        expect(requestedDateRanges).to.deep.equal([]);
    });

    it('should filter overall mutations by includeMutations', async () => {
        lapisRequestMocks.aggregated(
            { ...lapisFilter, fields: [dateField] },
            {
                data: [
                    { count: 1, [dateField]: '2023-01-05' },
                    { count: 2, [dateField]: '2023-02-15' },
                ],
            },
        );
        lapisRequestMocks.multipleMutations(
            [
                {
                    body: {
                        ...lapisFilter,
                        dateFieldFrom: '2023-01-01',
                        dateFieldTo: '2023-02-28',
                        minProportion: 0.001,
                    },
                    response: {
                        data: [getSomeTestMutation(0.21, 6), getSomeOtherTestMutation(0.22, 4)],
                    },
                },
            ],
            'nucleotide',
        );

        const { overallMutationData } = await queryMutationsOverTimeMetadata(
            lapisFilter,
            'nucleotide',
            DUMMY_LAPIS_URL,
            dateField,
            'month',
            ['otherSequenceName:G234C', 'A122T'],
        );

        // Only otherSequenceName:G234C was in the dataset; A122T gets count/proportion 0
        expect(overallMutationData.map((m) => m.mutation.code)).to.deep.equal(['A122T', 'otherSequenceName:G234C']);
        expect(overallMutationData.find((m) => m.mutation.code === 'A122T')?.proportion).toBe(0);
        expect(overallMutationData.find((m) => m.mutation.code === 'otherSequenceName:G234C')?.proportion).toBe(0.22);
    });
});

describe('queryMutationsOverTimePage', () => {
    const threeDayDateRanges = [
        { dateFrom: '2023-01-01', dateTo: '2023-01-01' },
        { dateFrom: '2023-01-02', dateTo: '2023-01-02' },
        { dateFrom: '2023-01-03', dateTo: '2023-01-03' },
    ];
    const twoDayDateRanges = [
        { dateFrom: '2023-01-01', dateTo: '2023-01-01' },
        { dateFrom: '2023-01-02', dateTo: '2023-01-02' },
    ];

    async function fetchPage(dateRanges: typeof threeDayDateRanges, includeMutations: string[]) {
        // queryMutationsOverTimePage expects the Temporal objects from Phase 1;
        // we get them by running a minimal metadata call.
        lapisRequestMocks.aggregated(
            { ...lapisFilter, fields: [dateField] },
            { data: dateRanges.map((r) => ({ count: 1, [dateField]: r.dateFrom })) },
        );
        lapisRequestMocks.multipleMutations(
            [
                {
                    body: {
                        ...lapisFilter,
                        dateFieldFrom: dateRanges[0].dateFrom,
                        dateFieldTo: dateRanges[dateRanges.length - 1].dateTo,
                        minProportion: 0.001,
                    },
                    response: { data: [] },
                },
            ],
            'nucleotide',
        );
        const { requestedDateRanges } = await queryMutationsOverTimeMetadata(
            lapisFilter,
            'nucleotide',
            DUMMY_LAPIS_URL,
            dateField,
            'day',
        );
        return queryMutationsOverTimePage(
            lapisFilter,
            DUMMY_LAPIS_URL,
            dateField,
            'nucleotide',
            requestedDateRanges,
            includeMutations,
        );
    }

    it('should build the data map with valueWithCoverage entries', async () => {
        lapisRequestMocks.mutationsOverTime(
            [
                {
                    body: {
                        filters: lapisFilter,
                        dateRanges: threeDayDateRanges,
                        includeMutations: ['otherSequenceName:G234C', 'sequenceName:A123T'],
                        dateField,
                    },
                    response: {
                        data: {
                            data: [
                                [
                                    { count: 4, coverage: 10 },
                                    { count: 0, coverage: 10 },
                                    { count: 0, coverage: 10 },
                                ],
                                [
                                    { count: 1, coverage: 10 },
                                    { count: 2, coverage: 10 },
                                    { count: 3, coverage: 10 },
                                ],
                            ],
                            dateRanges: threeDayDateRanges,
                            mutations: ['otherSequenceName:G234C', 'sequenceName:A123T'],
                            totalCountsByDateRange: [11, 12, 13],
                        },
                    },
                },
            ],
            'nucleotide',
        );

        const result = await fetchPage(threeDayDateRanges, ['otherSequenceName:G234C', 'sequenceName:A123T']);

        expect(result.getAsArray()).to.deep.equal([
            [
                { type: 'valueWithCoverage', count: 4, coverage: 10, totalCount: 11 },
                { type: 'valueWithCoverage', count: 0, coverage: 10, totalCount: 12 },
                { type: 'valueWithCoverage', count: 0, coverage: 10, totalCount: 13 },
            ],
            [
                { type: 'valueWithCoverage', count: 1, coverage: 10, totalCount: 11 },
                { type: 'valueWithCoverage', count: 2, coverage: 10, totalCount: 12 },
                { type: 'valueWithCoverage', count: 3, coverage: 10, totalCount: 13 },
            ],
        ]);
        expect(result.getFirstAxisKeys().map((m) => m.code)).to.deep.equal([
            'otherSequenceName:G234C',
            'sequenceName:A123T',
        ]);
        expect(result.getSecondAxisKeys().map((d) => d.dateString)).to.deep.equal([
            '2023-01-01',
            '2023-01-02',
            '2023-01-03',
        ]);
    });

    it('should set cell to null when totalCount for a date range is zero', async () => {
        lapisRequestMocks.mutationsOverTime(
            [
                {
                    body: {
                        filters: lapisFilter,
                        dateRanges: threeDayDateRanges,
                        includeMutations: ['otherSequenceName:G234C', 'sequenceName:A123T'],
                        dateField,
                    },
                    response: {
                        data: {
                            data: [
                                [
                                    { count: 4, coverage: 10 },
                                    { count: 0, coverage: 10 },
                                    { count: 0, coverage: 10 },
                                ],
                                [
                                    { count: 1, coverage: 10 },
                                    { count: 0, coverage: 10 },
                                    { count: 3, coverage: 10 },
                                ],
                            ],
                            dateRanges: threeDayDateRanges,
                            mutations: ['otherSequenceName:G234C', 'sequenceName:A123T'],
                            totalCountsByDateRange: [11, 0, 13],
                        },
                    },
                },
            ],
            'nucleotide',
        );

        const result = await fetchPage(threeDayDateRanges, ['otherSequenceName:G234C', 'sequenceName:A123T']);

        expect(result.getAsArray()).to.deep.equal([
            [
                { type: 'valueWithCoverage', count: 4, coverage: 10, totalCount: 11 },
                null,
                { type: 'valueWithCoverage', count: 0, coverage: 10, totalCount: 13 },
            ],
            [
                { type: 'valueWithCoverage', count: 1, coverage: 10, totalCount: 11 },
                null,
                { type: 'valueWithCoverage', count: 3, coverage: 10, totalCount: 13 },
            ],
        ]);
    });

    it('should set cell to belowThreshold when coverage is zero', async () => {
        lapisRequestMocks.mutationsOverTime(
            [
                {
                    body: {
                        filters: lapisFilter,
                        dateRanges: twoDayDateRanges,
                        includeMutations: ['sequenceName:A123T'],
                        dateField,
                    },
                    response: {
                        data: {
                            data: [
                                [
                                    { count: 0, coverage: 0 },
                                    { count: 2, coverage: 10 },
                                ],
                            ],
                            dateRanges: twoDayDateRanges,
                            mutations: ['sequenceName:A123T'],
                            totalCountsByDateRange: [11, 12],
                        },
                    },
                },
            ],
            'nucleotide',
        );

        const result = await fetchPage(twoDayDateRanges, ['sequenceName:A123T']);

        expect(result.getAsArray()).to.deep.equal([
            [
                { type: 'belowThreshold', totalCount: 11 },
                { type: 'valueWithCoverage', count: 2, coverage: 10, totalCount: 12 },
            ],
        ]);
    });

    it('should return an empty map with date columns when no mutations are requested', async () => {
        // Short-circuits without an API call when includeMutationCodes is empty
        lapisRequestMocks.aggregated(
            { ...lapisFilter, fields: [dateField] },
            { data: threeDayDateRanges.map((r) => ({ count: 1, [dateField]: r.dateFrom })) },
        );
        lapisRequestMocks.multipleMutations(
            [
                {
                    body: {
                        ...lapisFilter,
                        dateFieldFrom: '2023-01-01',
                        dateFieldTo: '2023-01-03',
                        minProportion: 0.001,
                    },
                    response: { data: [] },
                },
            ],
            'nucleotide',
        );
        const { requestedDateRanges } = await queryMutationsOverTimeMetadata(
            lapisFilter,
            'nucleotide',
            DUMMY_LAPIS_URL,
            dateField,
            'day',
        );

        const result = await queryMutationsOverTimePage(
            lapisFilter,
            DUMMY_LAPIS_URL,
            dateField,
            'nucleotide',
            requestedDateRanges,
            [],
        );

        expect(result.getAsArray()).to.deep.equal([]);
        expect(result.getFirstAxisKeys()).to.deep.equal([]);
        expect(result.getSecondAxisKeys().map((d) => d.dateString)).to.deep.equal([
            '2023-01-01',
            '2023-01-02',
            '2023-01-03',
        ]);
    });

    it('should return an empty map when requestedDateRanges is empty', async () => {
        lapisRequestMocks.aggregated({ ...lapisFilter, fields: [dateField] }, { data: [] });
        const { requestedDateRanges } = await queryMutationsOverTimeMetadata(
            lapisFilter,
            'nucleotide',
            DUMMY_LAPIS_URL,
            dateField,
            'day',
        );

        const result = await queryMutationsOverTimePage(
            lapisFilter,
            DUMMY_LAPIS_URL,
            dateField,
            'nucleotide',
            requestedDateRanges,
            ['sequenceName:A123T'],
        );

        expect(result.getAsArray()).to.deep.equal([]);
        expect(result.getFirstAxisKeys()).to.deep.equal([]);
        expect(result.getSecondAxisKeys()).to.deep.equal([]);
    });
});

function getSomeTestMutation(proportion: number, count: number) {
    return {
        mutation: 'sequenceName:A123T',
        proportion,
        count,
        sequenceName: 'sequenceName',
        mutationFrom: 'A',
        mutationTo: 'T',
        position: 123,
    };
}

function getSomeOtherTestMutation(proportion: number, count: number) {
    return {
        mutation: 'otherSequenceName:G234C',
        proportion,
        count,
        sequenceName: 'otherSequenceName',
        mutationFrom: 'G',
        mutationTo: 'C',
        position: 234,
    };
}

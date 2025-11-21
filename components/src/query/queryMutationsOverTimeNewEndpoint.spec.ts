import { describe, expect, it } from 'vitest';

import { queryMutationsOverTimeData } from './queryMutationsOverTime';
import { DUMMY_LAPIS_URL, lapisRequestMocks } from '../../vitest.setup';

describe('queryMutationsOverTimeNewEndpoint', () => {
    it('should fetch for a filter without date and sort by mutation and date', async () => {
        const lapisFilter = { field1: 'value1', field2: 'value2' };
        const dateField = 'dateField';

        lapisRequestMocks.multipleAggregated([
            // this request is expected to get 'all dates in dataset' - since the user hasn't provided a date range
            {
                body: { ...lapisFilter, fields: [dateField] },
                response: {
                    data: [
                        { count: 1, [dateField]: '2023-01-01' },
                        { count: 2, [dateField]: '2023-01-03' },
                    ],
                },
            },
            {
                body: {
                    ...lapisFilter,
                    dateFieldFrom: '2023-01-01',
                    dateFieldTo: '2023-01-01',
                    fields: [],
                },
                response: { data: [{ count: 11 }] },
            },
            {
                body: {
                    ...lapisFilter,
                    dateFieldFrom: '2023-01-02',
                    dateFieldTo: '2023-01-02',
                    fields: [],
                },
                response: { data: [{ count: 12 }] },
            },
            {
                body: {
                    ...lapisFilter,
                    dateFieldFrom: '2023-01-03',
                    dateFieldTo: '2023-01-03',
                    fields: [],
                },
                response: { data: [{ count: 13 }] },
            },
        ]);
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
        const dateRanges = [
            {
                dateFrom: '2023-01-01',
                dateTo: '2023-01-01',
            },
            {
                dateFrom: '2023-01-02',
                dateTo: '2023-01-02',
            },
            {
                dateFrom: '2023-01-03',
                dateTo: '2023-01-03',
            },
        ];
        lapisRequestMocks.mutationsOverTime(
            [
                {
                    body: {
                        filters: lapisFilter,
                        dateRanges,
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
                            dateRanges,
                            mutations: ['otherSequenceName:G234C', 'sequenceName:A123T'],
                        },
                    },
                },
            ],
            'nucleotide',
        );

        const { mutationOverTimeData, overallMutationData } = await queryMutationsOverTimeData({
            lapisFilter,
            sequenceType: 'nucleotide',
            lapis: DUMMY_LAPIS_URL,
            lapisDateField: dateField,
            granularity: 'day',
            useNewEndpoint: true,
        });

        const expectedData = [
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
        ];
        expect(mutationOverTimeData.getAsArray()).to.deep.equal(expectedData);

        const sequences = mutationOverTimeData.getFirstAxisKeys();
        expect(sequences[0].code).toBe('otherSequenceName:G234C');
        expect(sequences[1].code).toBe('sequenceName:A123T');

        const dates = mutationOverTimeData.getSecondAxisKeys();
        expect(dates[0].dateString).toBe('2023-01-01');
        expect(dates[1].dateString).toBe('2023-01-02');
        expect(dates[2].dateString).toBe('2023-01-03');

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
    });

    it('should fetch for dates with no mutations', async () => {
        const lapisFilter = { field1: 'value1', field2: 'value2' };
        const dateField = 'dateField';

        lapisRequestMocks.multipleAggregated([
            {
                body: { ...lapisFilter, fields: [dateField] },
                response: {
                    data: [
                        { count: 1, [dateField]: '2023-01-01' },
                        { count: 2, [dateField]: '2023-01-03' },
                    ],
                },
            },
            {
                body: {
                    ...lapisFilter,
                    dateFieldFrom: '2023-01-01',
                    dateFieldTo: '2023-01-01',
                    fields: [],
                },
                response: { data: [{ count: 11 }] },
            },
            {
                body: {
                    ...lapisFilter,
                    dateFieldFrom: '2023-01-02',
                    dateFieldTo: '2023-01-02',
                    fields: [],
                },
                response: { data: [{ count: 0 }] },
            },
            {
                body: {
                    ...lapisFilter,
                    dateFieldFrom: '2023-01-03',
                    dateFieldTo: '2023-01-03',
                    fields: [],
                },
                response: { data: [{ count: 13 }] },
            },
        ]);

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
                        data: [getSomeTestMutation(0.2, 4), getSomeOtherTestMutation(0.4, 4)],
                    },
                },
            ],
            'nucleotide',
        );

        const dateRanges = [
            {
                dateFrom: '2023-01-01',
                dateTo: '2023-01-01',
            },
            {
                dateFrom: '2023-01-02',
                dateTo: '2023-01-02',
            },
            {
                dateFrom: '2023-01-03',
                dateTo: '2023-01-03',
            },
        ];

        lapisRequestMocks.mutationsOverTime(
            [
                {
                    body: {
                        filters: lapisFilter,
                        dateRanges,
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
                            dateRanges,
                            mutations: ['otherSequenceName:G234C', 'sequenceName:A123T'],
                        },
                    },
                },
            ],
            'nucleotide',
        );

        const { mutationOverTimeData } = await queryMutationsOverTimeData({
            lapisFilter,
            sequenceType: 'nucleotide',
            lapis: DUMMY_LAPIS_URL,
            lapisDateField: dateField,
            granularity: 'day',
            useNewEndpoint: true,
        });

        expect(mutationOverTimeData.getAsArray()).to.deep.equal([
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

        const sequences = mutationOverTimeData.getFirstAxisKeys();
        expect(sequences[0].code).toBe('otherSequenceName:G234C');
        expect(sequences[1].code).toBe('sequenceName:A123T');

        const dates = mutationOverTimeData.getSecondAxisKeys();
        expect(dates[0].dateString).toBe('2023-01-01');
        expect(dates[1].dateString).toBe('2023-01-02');
        expect(dates[2].dateString).toBe('2023-01-03');
    });

    it('should return empty map when no mutations are found', async () => {
        const lapisFilter = { field1: 'value1', field2: 'value2' };
        const dateField = 'dateField';

        lapisRequestMocks.multipleAggregated([
            {
                body: { ...lapisFilter, fields: [dateField] },
                response: {
                    data: [
                        { count: 1, [dateField]: '2023-01-01' },
                        { count: 2, [dateField]: '2023-01-03' },
                    ],
                },
            },
            {
                body: {
                    ...lapisFilter,
                    dateFieldFrom: '2023-01-01',
                    dateFieldTo: '2023-01-01',
                    fields: [],
                },
                response: { data: [{ count: 11 }] },
            },
            {
                body: {
                    ...lapisFilter,
                    dateFieldFrom: '2023-01-02',
                    dateFieldTo: '2023-01-02',
                    fields: [],
                },
                response: { data: [{ count: 12 }] },
            },
            {
                body: {
                    ...lapisFilter,
                    dateFieldFrom: '2023-01-03',
                    dateFieldTo: '2023-01-03',
                    fields: [],
                },
                response: { data: [{ count: 13 }] },
            },
        ]);

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
                        data: [],
                    },
                },
            ],
            'nucleotide',
        );

        const dateRanges = [
            {
                dateFrom: '2023-01-01',
                dateTo: '2023-01-01',
            },
            {
                dateFrom: '2023-01-02',
                dateTo: '2023-01-02',
            },
            {
                dateFrom: '2023-01-03',
                dateTo: '2023-01-03',
            },
        ];

        lapisRequestMocks.mutationsOverTime(
            [
                {
                    body: {
                        filters: lapisFilter,
                        dateRanges,
                        includeMutations: [],
                        dateField,
                    },
                    response: {
                        data: {
                            data: [],
                            dateRanges,
                            mutations: [],
                        },
                    },
                },
            ],
            'nucleotide',
        );

        const { mutationOverTimeData } = await queryMutationsOverTimeData({
            lapisFilter,
            sequenceType: 'nucleotide',
            lapis: DUMMY_LAPIS_URL,
            lapisDateField: dateField,
            granularity: 'day',
            useNewEndpoint: true,
        });

        expect(mutationOverTimeData.getAsArray()).to.deep.equal([]);
        expect(mutationOverTimeData.getFirstAxisKeys()).to.deep.equal([]);
        const dates = mutationOverTimeData.getSecondAxisKeys();
        expect(dates.length).toBe(3);
        expect(dates[0].dateString).toBe('2023-01-01');
        expect(dates[1].dateString).toBe('2023-01-02');
        expect(dates[2].dateString).toBe('2023-01-03');
    });

    it('should use dateFrom from filter', async () => {
        const dateField = 'dateField';
        const lapisFilter = { field1: 'value1', field2: 'value2', [`${dateField}From`]: '2023-01-02' };

        lapisRequestMocks.multipleAggregated([
            {
                body: { ...lapisFilter, fields: [dateField] },
                response: {
                    data: [
                        { count: 1, [dateField]: '2023-01-01' },
                        { count: 2, [dateField]: '2023-01-03' },
                    ],
                },
            },
            {
                body: {
                    ...lapisFilter,
                    dateFieldFrom: '2023-01-02',
                    dateFieldTo: '2023-01-02',
                    fields: [],
                },
                response: { data: [{ count: 11 }] },
            },
            {
                body: {
                    ...lapisFilter,
                    dateFieldFrom: '2023-01-03',
                    dateFieldTo: '2023-01-03',
                    fields: [],
                },
                response: { data: [{ count: 12 }] },
            },
        ]);

        lapisRequestMocks.multipleMutations(
            [
                {
                    body: {
                        ...lapisFilter,
                        dateFieldFrom: '2023-01-02',
                        dateFieldTo: '2023-01-03',
                        minProportion: 0.001,
                    },
                    response: {
                        data: [getSomeTestMutation(0.25, 5)],
                    },
                },
            ],
            'nucleotide',
        );

        const dateRanges = [
            {
                dateFrom: '2023-01-02',
                dateTo: '2023-01-02',
            },
            {
                dateFrom: '2023-01-03',
                dateTo: '2023-01-03',
            },
        ];

        lapisRequestMocks.mutationsOverTime(
            [
                {
                    body: {
                        filters: lapisFilter,
                        dateRanges,
                        includeMutations: ['sequenceName:A123T'],
                        dateField,
                    },
                    response: {
                        data: {
                            data: [
                                [
                                    { count: 2, coverage: 10 },
                                    { count: 3, coverage: 10 },
                                ],
                            ],
                            dateRanges,
                            mutations: ['sequenceName:A123T'],
                        },
                    },
                },
            ],
            'nucleotide',
        );

        const { mutationOverTimeData } = await queryMutationsOverTimeData({
            lapisFilter,
            sequenceType: 'nucleotide',
            lapis: DUMMY_LAPIS_URL,
            lapisDateField: dateField,
            granularity: 'day',
            useNewEndpoint: true,
        });

        expect(mutationOverTimeData.getAsArray()).to.deep.equal([
            [
                { type: 'valueWithCoverage', count: 2, coverage: 10, totalCount: 11 },
                { type: 'valueWithCoverage', count: 3, coverage: 10, totalCount: 12 },
            ],
        ]);

        const sequences = mutationOverTimeData.getFirstAxisKeys();
        expect(sequences[0].code).toBe('sequenceName:A123T');

        const dates = mutationOverTimeData.getSecondAxisKeys();
        expect(dates[0].dateString).toBe('2023-01-02');
        expect(dates[1].dateString).toBe('2023-01-03');
    });

    it('should use dateTo from filter', async () => {
        const dateField = 'dateField';
        const lapisFilter = { field1: 'value1', field2: 'value2', [`${dateField}To`]: '2023-01-02' };

        lapisRequestMocks.multipleAggregated([
            {
                body: { ...lapisFilter, fields: [dateField] },
                response: {
                    data: [
                        { count: 1, [dateField]: '2023-01-01' },
                        { count: 2, [dateField]: '2023-01-03' },
                    ],
                },
            },
            {
                body: {
                    ...lapisFilter,
                    dateFieldFrom: '2023-01-01',
                    dateFieldTo: '2023-01-01',
                    fields: [],
                },
                response: { data: [{ count: 11 }] },
            },
            {
                body: {
                    ...lapisFilter,
                    dateFieldFrom: '2023-01-02',
                    dateFieldTo: '2023-01-02',
                    fields: [],
                },
                response: { data: [{ count: 12 }] },
            },
        ]);

        lapisRequestMocks.multipleMutations(
            [
                {
                    body: {
                        ...lapisFilter,
                        dateFieldFrom: '2023-01-01',
                        dateFieldTo: '2023-01-02',
                        minProportion: 0.001,
                    },
                    response: {
                        data: [getSomeTestMutation(0.15, 3)],
                    },
                },
            ],
            'nucleotide',
        );

        const dateRanges = [
            {
                dateFrom: '2023-01-01',
                dateTo: '2023-01-01',
            },
            {
                dateFrom: '2023-01-02',
                dateTo: '2023-01-02',
            },
        ];

        lapisRequestMocks.mutationsOverTime(
            [
                {
                    body: {
                        filters: lapisFilter,
                        dateRanges,
                        includeMutations: ['sequenceName:A123T'],
                        dateField,
                    },
                    response: {
                        data: {
                            data: [
                                [
                                    { count: 1, coverage: 10 },
                                    { count: 2, coverage: 10 },
                                ],
                            ],
                            dateRanges,
                            mutations: ['sequenceName:A123T'],
                        },
                    },
                },
            ],
            'nucleotide',
        );

        const { mutationOverTimeData } = await queryMutationsOverTimeData({
            lapisFilter,
            sequenceType: 'nucleotide',
            lapis: DUMMY_LAPIS_URL,
            lapisDateField: dateField,
            granularity: 'day',
            useNewEndpoint: true,
        });

        expect(mutationOverTimeData.getAsArray()).to.deep.equal([
            [
                { type: 'valueWithCoverage', count: 1, coverage: 10, totalCount: 11 },
                { type: 'valueWithCoverage', count: 2, coverage: 10, totalCount: 12 },
            ],
        ]);

        const sequences = mutationOverTimeData.getFirstAxisKeys();
        expect(sequences[0].code).toBe('sequenceName:A123T');

        const dates = mutationOverTimeData.getSecondAxisKeys();
        expect(dates[0].dateString).toBe('2023-01-01');
        expect(dates[1].dateString).toBe('2023-01-02');
    });

    it('should use date from filter', async () => {
        const dateField = 'dateField';
        const lapisFilter = { field1: 'value1', field2: 'value2', [dateField]: '2023-01-02' };

        lapisRequestMocks.multipleAggregated([
            {
                body: { ...lapisFilter, fields: [dateField] },
                response: {
                    data: [
                        { count: 1, [dateField]: '2023-01-01' },
                        { count: 2, [dateField]: '2023-01-03' },
                    ],
                },
            },
            {
                body: {
                    ...lapisFilter,
                    dateFieldFrom: '2023-01-02',
                    dateFieldTo: '2023-01-02',
                    fields: [],
                },
                response: { data: [{ count: 11 }] },
            },
        ]);

        lapisRequestMocks.multipleMutations(
            [
                {
                    body: {
                        ...lapisFilter,
                        dateFieldFrom: '2023-01-02',
                        dateFieldTo: '2023-01-02',
                        minProportion: 0.001,
                    },
                    response: { data: [getSomeTestMutation(0.2, 2)] },
                },
            ],
            'nucleotide',
        );

        const dateRanges = [
            {
                dateFrom: '2023-01-02',
                dateTo: '2023-01-02',
            },
        ];

        lapisRequestMocks.mutationsOverTime(
            [
                {
                    body: {
                        filters: lapisFilter,
                        dateRanges,
                        includeMutations: ['sequenceName:A123T'],
                        dateField,
                    },
                    response: {
                        data: {
                            data: [[{ count: 2, coverage: 10 }]],
                            dateRanges,
                            mutations: ['sequenceName:A123T'],
                        },
                    },
                },
            ],
            'nucleotide',
        );

        const { mutationOverTimeData } = await queryMutationsOverTimeData({
            lapisFilter,
            sequenceType: 'nucleotide',
            lapis: DUMMY_LAPIS_URL,
            lapisDateField: dateField,
            granularity: 'day',
            useNewEndpoint: true,
        });

        expect(mutationOverTimeData.getAsArray()).to.deep.equal([
            [{ type: 'valueWithCoverage', count: 2, coverage: 10, totalCount: 11 }],
        ]);

        const sequences = mutationOverTimeData.getFirstAxisKeys();
        expect(sequences[0].code).toBe('sequenceName:A123T');

        const dates = mutationOverTimeData.getSecondAxisKeys();
        expect(dates[0].dateString).toBe('2023-01-02');
    });

    it('should fetch data including the first and last day of the granularity', async () => {
        const lapisFilter = { field1: 'value1', field2: 'value2' };
        const dateField = 'dateField';

        lapisRequestMocks.multipleAggregated([
            {
                body: { ...lapisFilter, fields: [dateField] },
                response: {
                    data: [
                        { count: 1, [dateField]: '2023-01-05' },
                        { count: 2, [dateField]: '2023-02-15' },
                    ],
                },
            },
            {
                body: {
                    ...lapisFilter,
                    dateFieldFrom: '2023-01-01',
                    dateFieldTo: '2023-01-31',
                    fields: [],
                },
                response: { data: [{ count: 11 }] },
            },
            {
                body: {
                    ...lapisFilter,
                    dateFieldFrom: '2023-02-01',
                    dateFieldTo: '2023-02-28',
                    fields: [],
                },
                response: { data: [{ count: 12 }] },
            },
        ]);

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

        const dateRanges = [
            {
                dateFrom: '2023-01-01',
                dateTo: '2023-01-31',
            },
            {
                dateFrom: '2023-02-01',
                dateTo: '2023-02-28',
            },
        ];

        lapisRequestMocks.mutationsOverTime(
            [
                {
                    body: {
                        filters: lapisFilter,
                        dateRanges,
                        includeMutations: ['otherSequenceName:G234C', 'sequenceName:A123T'],
                        dateField,
                    },
                    response: {
                        data: {
                            data: [
                                [
                                    { count: 2, coverage: 10 },
                                    { count: 3, coverage: 10 },
                                ],
                                [
                                    { count: 4, coverage: 10 },
                                    { count: 5, coverage: 10 },
                                ],
                            ],
                            dateRanges,
                            mutations: ['otherSequenceName:G234C', 'sequenceName:A123T'],
                        },
                    },
                },
            ],
            'nucleotide',
        );

        const { mutationOverTimeData } = await queryMutationsOverTimeData({
            lapisFilter,
            sequenceType: 'nucleotide',
            lapis: DUMMY_LAPIS_URL,
            lapisDateField: dateField,
            granularity: 'month',
            useNewEndpoint: true,
        });

        expect(mutationOverTimeData.getAsArray()).to.deep.equal([
            [
                { type: 'valueWithCoverage', count: 2, coverage: 10, totalCount: 11 },
                { type: 'valueWithCoverage', count: 3, coverage: 10, totalCount: 12 },
            ],
            [
                { type: 'valueWithCoverage', count: 4, coverage: 10, totalCount: 11 },
                { type: 'valueWithCoverage', count: 5, coverage: 10, totalCount: 12 },
            ],
        ]);

        const sequences = mutationOverTimeData.getFirstAxisKeys();
        expect(sequences[0].code).toBe('otherSequenceName:G234C');
        expect(sequences[1].code).toBe('sequenceName:A123T');

        const dates = mutationOverTimeData.getSecondAxisKeys();
        expect(dates[0].dateString).toBe('2023-01');
        expect(dates[1].dateString).toBe('2023-02');
    });

    it('should return empty data when there are no dates in filter', async () => {
        const lapisFilter = { field1: 'value1', field2: 'value2' };
        const dateField = 'dateField';

        lapisRequestMocks.multipleAggregated([
            {
                body: { ...lapisFilter, fields: [dateField] },
                response: {
                    data: [],
                },
            },
        ]);

        lapisRequestMocks.mutationsOverTime(
            [
                {
                    body: {
                        filters: lapisFilter,
                        dateRanges: [],
                        includeMutations: [],
                        dateField,
                    },
                    response: {
                        data: {
                            data: [],
                            dateRanges: [],
                            mutations: [],
                        },
                    },
                },
            ],
            'nucleotide',
        );

        const { mutationOverTimeData } = await queryMutationsOverTimeData({
            lapisFilter,
            sequenceType: 'nucleotide',
            lapis: DUMMY_LAPIS_URL,
            lapisDateField: dateField,
            granularity: 'month',
            useNewEndpoint: true,
        });

        expect(mutationOverTimeData.getAsArray()).to.deep.equal([]);

        const sequences = mutationOverTimeData.getFirstAxisKeys();
        expect(sequences.length).toBe(0);

        const dates = mutationOverTimeData.getSecondAxisKeys();
        expect(dates.length).toBe(0);
    });

    it('should respect the includeMutations parameter', async () => {
        const lapisFilter = { field1: 'value1', field2: 'value2' };
        const dateField = 'dateField';

        lapisRequestMocks.multipleAggregated([
            {
                body: { ...lapisFilter, fields: [dateField] },
                response: {
                    data: [
                        { count: 1, [dateField]: '2023-01-05' },
                        { count: 2, [dateField]: '2023-02-15' },
                    ],
                },
            },
            {
                body: {
                    ...lapisFilter,
                    dateFieldFrom: '2023-01-01',
                    dateFieldTo: '2023-01-31',
                    fields: [],
                },
                response: { data: [{ count: 11 }] },
            },
            {
                body: {
                    ...lapisFilter,
                    dateFieldFrom: '2023-02-01',
                    dateFieldTo: '2023-02-28',
                    fields: [],
                },
                response: { data: [{ count: 12 }] },
            },
        ]);

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

        const dateRanges = [
            {
                dateFrom: '2023-01-01',
                dateTo: '2023-01-31',
            },
            {
                dateFrom: '2023-02-01',
                dateTo: '2023-02-28',
            },
        ];

        lapisRequestMocks.mutationsOverTime(
            [
                {
                    body: {
                        filters: lapisFilter,
                        dateRanges,
                        includeMutations: ['A122T', 'otherSequenceName:G234C'],
                        dateField,
                    },
                    response: {
                        data: {
                            data: [
                                [
                                    { count: 0, coverage: 0 },
                                    { count: 0, coverage: 0 },
                                ],
                                [
                                    { count: 2, coverage: 10 },
                                    { count: 3, coverage: 10 },
                                ],
                            ],
                            dateRanges,
                            mutations: ['A122T', 'otherSequenceName:G234C'],
                        },
                    },
                },
            ],
            'nucleotide',
        );

        const { mutationOverTimeData } = await queryMutationsOverTimeData({
            lapisFilter,
            sequenceType: 'nucleotide',
            lapis: DUMMY_LAPIS_URL,
            lapisDateField: dateField,
            granularity: 'month',
            useNewEndpoint: true,
            displayMutations: ['otherSequenceName:G234C', 'A122T'],
        });

        expect(mutationOverTimeData.getAsArray()).to.deep.equal([
            [
                { type: 'belowThreshold', totalCount: 11 },
                { type: 'belowThreshold', totalCount: 12 },
            ],
            [
                { type: 'valueWithCoverage', count: 2, coverage: 10, totalCount: 11 },
                { type: 'valueWithCoverage', count: 3, coverage: 10, totalCount: 12 },
            ],
        ]);

        const sequences = mutationOverTimeData.getFirstAxisKeys();
        expect(sequences[0].code).toBe('A122T');
        expect(sequences[1].code).toBe('otherSequenceName:G234C');

        const dates = mutationOverTimeData.getSecondAxisKeys();
        expect(dates[0].dateString).toBe('2023-01');
        expect(dates[1].dateString).toBe('2023-02');
    });

    it('should return full mutation codes even if partial includeMutations are given', async () => {
        const lapisFilter = { field1: 'value1', field2: 'value2' };
        const dateField = 'dateField';

        lapisRequestMocks.multipleAggregated([
            {
                body: { ...lapisFilter, fields: [dateField] },
                response: {
                    data: [
                        { count: 1, [dateField]: '2023-01-05' },
                        { count: 2, [dateField]: '2023-02-15' },
                    ],
                },
            },
            {
                body: {
                    ...lapisFilter,
                    dateFieldFrom: '2023-01-01',
                    dateFieldTo: '2023-01-31',
                    fields: [],
                },
                response: { data: [{ count: 11 }] },
            },
            {
                body: {
                    ...lapisFilter,
                    dateFieldFrom: '2023-02-01',
                    dateFieldTo: '2023-02-28',
                    fields: [],
                },
                response: { data: [{ count: 12 }] },
            },
        ]);

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

        const dateRanges = [
            {
                dateFrom: '2023-01-01',
                dateTo: '2023-01-31',
            },
            {
                dateFrom: '2023-02-01',
                dateTo: '2023-02-28',
            },
        ];

        lapisRequestMocks.mutationsOverTime(
            [
                {
                    body: {
                        filters: lapisFilter,
                        dateRanges,
                        includeMutations: ['122', 'otherSequenceName:G234C'],
                        dateField,
                    },
                    response: {
                        data: {
                            data: [
                                [
                                    { count: 0, coverage: 0 },
                                    { count: 0, coverage: 0 },
                                ],
                                [
                                    { count: 2, coverage: 10 },
                                    { count: 3, coverage: 10 },
                                ],
                            ],
                            dateRanges,
                            mutations: ['A122T', 'otherSequenceName:G234C'],
                        },
                    },
                },
            ],
            'nucleotide',
        );

        const { mutationOverTimeData } = await queryMutationsOverTimeData({
            lapisFilter,
            sequenceType: 'nucleotide',
            lapis: DUMMY_LAPIS_URL,
            lapisDateField: dateField,
            granularity: 'month',
            useNewEndpoint: true,
            displayMutations: ['otherSequenceName:G234C', '122'],
        });

        expect(mutationOverTimeData.getAsArray()).to.deep.equal([
            [
                { type: 'belowThreshold', totalCount: 11 },
                { type: 'belowThreshold', totalCount: 12 },
            ],
            [
                { type: 'valueWithCoverage', count: 2, coverage: 10, totalCount: 11 },
                { type: 'valueWithCoverage', count: 3, coverage: 10, totalCount: 12 },
            ],
        ]);

        const sequences = mutationOverTimeData.getFirstAxisKeys();
        expect(sequences[0].code).toBe('A122T');
        expect(sequences[1].code).toBe('otherSequenceName:G234C');

        const dates = mutationOverTimeData.getSecondAxisKeys();
        expect(dates[0].dateString).toBe('2023-01');
        expect(dates[1].dateString).toBe('2023-02');
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
});

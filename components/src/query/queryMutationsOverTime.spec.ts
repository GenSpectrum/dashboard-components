import { describe, expect, it } from 'vitest';

import { queryMutationsOverTimeData } from './queryMutationsOverTime';
import { DUMMY_LAPIS_URL, lapisRequestMocks } from '../../vitest.setup';

describe('queryMutationsOverTime', () => {
    it('should fetch for a filter without date and sort by mutation and date', async () => {
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
                        dateFieldTo: '2023-01-01',
                        minProportion: 0.001,
                    },
                    response: { data: [getSomeTestMutation(0.1, 1), getSomeOtherTestMutation(0.4, 4)] },
                },
                {
                    body: {
                        ...lapisFilter,
                        dateFieldFrom: '2023-01-02',
                        dateFieldTo: '2023-01-02',
                        minProportion: 0.001,
                    },
                    response: { data: [getSomeTestMutation(0.2, 2)] },
                },
                {
                    body: {
                        ...lapisFilter,
                        dateFieldFrom: '2023-01-03',
                        dateFieldTo: '2023-01-03',
                        minProportion: 0.001,
                    },
                    response: { data: [getSomeTestMutation(0.3, 3)] },
                },
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

        const { mutationOverTimeData, overallMutationData } = await queryMutationsOverTimeData({
            lapisFilter,
            sequenceType: 'nucleotide',
            lapis: DUMMY_LAPIS_URL,
            lapisDateField: dateField,
            granularity: 'day',
        });

        expect(mutationOverTimeData.getAsArray()).to.deep.equal([
            [
                { proportion: 0.4, count: 4, totalCount: 11 },
                { proportion: 0, count: 0, totalCount: 12 },
                { proportion: 0, count: 0, totalCount: 13 },
            ],
            [
                { proportion: 0.1, count: 1, totalCount: 11 },
                { proportion: 0.2, count: 2, totalCount: 12 },
                { proportion: 0.3, count: 3, totalCount: 13 },
            ],
        ]);

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
                        dateFieldTo: '2023-01-01',
                        minProportion: 0.001,
                    },
                    response: { data: [getSomeTestMutation(0.1, 1), getSomeOtherTestMutation(0.4, 4)] },
                },
                {
                    body: {
                        ...lapisFilter,
                        dateFieldFrom: '2023-01-02',
                        dateFieldTo: '2023-01-02',
                        minProportion: 0.001,
                    },
                    response: { data: [] },
                },
                {
                    body: {
                        ...lapisFilter,
                        dateFieldFrom: '2023-01-03',
                        dateFieldTo: '2023-01-03',
                        minProportion: 0.001,
                    },
                    response: { data: [getSomeTestMutation(0.3, 3)] },
                },
                {
                    body: {
                        ...lapisFilter,
                        dateFieldFrom: '2023-01-01',
                        dateFieldTo: '2023-01-03',
                        minProportion: 0.001,
                    },
                    response: {
                        data: [
                            getSomeTestMutation(0.1, 1),
                            getSomeTestMutation(0.3, 3),
                            getSomeOtherTestMutation(0.4, 4),
                        ],
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
        });

        expect(mutationOverTimeData.getAsArray()).to.deep.equal([
            [{ proportion: 0.4, count: 4, totalCount: 11 }, null, { proportion: 0, count: 0, totalCount: 13 }],
            [{ proportion: 0.1, count: 1, totalCount: 11 }, null, { proportion: 0.3, count: 3, totalCount: 13 }],
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
                        dateFieldTo: '2023-01-01',
                        minProportion: 0.001,
                    },
                    response: { data: [] },
                },
                {
                    body: {
                        ...lapisFilter,
                        dateFieldFrom: '2023-01-02',
                        dateFieldTo: '2023-01-02',
                        minProportion: 0.001,
                    },
                    response: { data: [] },
                },
                {
                    body: {
                        ...lapisFilter,
                        dateFieldFrom: '2023-01-03',
                        dateFieldTo: '2023-01-03',
                        minProportion: 0.001,
                    },
                    response: { data: [] },
                },
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

        const { mutationOverTimeData } = await queryMutationsOverTimeData({
            lapisFilter,
            sequenceType: 'nucleotide',
            lapis: DUMMY_LAPIS_URL,
            lapisDateField: dateField,
            granularity: 'day',
        });

        expect(mutationOverTimeData.getAsArray()).to.deep.equal([]);
        expect(mutationOverTimeData.getFirstAxisKeys()).to.deep.equal([]);
        expect(mutationOverTimeData.getSecondAxisKeys()).to.deep.equal([]);
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
                        dateFieldTo: '2023-01-02',
                        minProportion: 0.001,
                    },
                    response: { data: [getSomeTestMutation(0.2, 2)] },
                },
                {
                    body: {
                        ...lapisFilter,
                        dateFieldFrom: '2023-01-03',
                        dateFieldTo: '2023-01-03',
                        minProportion: 0.001,
                    },
                    response: { data: [getSomeTestMutation(0.3, 3)] },
                },
                {
                    body: {
                        ...lapisFilter,
                        dateFieldFrom: '2023-01-02',
                        dateFieldTo: '2023-01-03',
                        minProportion: 0.001,
                    },
                    response: {
                        data: [getSomeTestMutation(0.2, 2), getSomeTestMutation(0.3, 3)],
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
        });

        expect(mutationOverTimeData.getAsArray()).to.deep.equal([
            [
                { proportion: 0.2, count: 2, totalCount: 11 },
                { proportion: 0.3, count: 3, totalCount: 12 },
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
                        dateFieldTo: '2023-01-01',
                        minProportion: 0.001,
                    },
                    response: { data: [getSomeTestMutation(0.1, 1)] },
                },
                {
                    body: {
                        ...lapisFilter,
                        dateFieldFrom: '2023-01-02',
                        dateFieldTo: '2023-01-02',
                        minProportion: 0.001,
                    },
                    response: { data: [getSomeTestMutation(0.2, 2)] },
                },
                {
                    body: {
                        ...lapisFilter,
                        dateFieldFrom: '2023-01-01',
                        dateFieldTo: '2023-01-02',
                        minProportion: 0.001,
                    },
                    response: {
                        data: [getSomeTestMutation(0.1, 1), getSomeTestMutation(0.2, 2)],
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
        });

        expect(mutationOverTimeData.getAsArray()).to.deep.equal([
            [
                { proportion: 0.1, count: 1, totalCount: 11 },
                { proportion: 0.2, count: 2, totalCount: 12 },
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

        const { mutationOverTimeData } = await queryMutationsOverTimeData({
            lapisFilter,
            sequenceType: 'nucleotide',
            lapis: DUMMY_LAPIS_URL,
            lapisDateField: dateField,
            granularity: 'day',
        });

        expect(mutationOverTimeData.getAsArray()).to.deep.equal([
            [
                {
                    proportion: 0.2,
                    count: 2,
                    totalCount: 11,
                },
            ],
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
                        dateFieldTo: '2023-01-31',
                        minProportion: 0.001,
                    },
                    response: { data: [getSomeTestMutation(0.1, 1), getSomeOtherTestMutation(0.4, 4)] },
                },
                {
                    body: {
                        ...lapisFilter,
                        dateFieldFrom: '2023-02-01',
                        dateFieldTo: '2023-02-28',
                        minProportion: 0.001,
                    },
                    response: { data: [getSomeTestMutation(0.2, 2)] },
                },
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

        const { mutationOverTimeData } = await queryMutationsOverTimeData({
            lapisFilter,
            sequenceType: 'nucleotide',
            lapis: DUMMY_LAPIS_URL,
            lapisDateField: dateField,
            granularity: 'month',
        });

        expect(mutationOverTimeData.getAsArray()).to.deep.equal([
            [
                { proportion: 0.4, count: 4, totalCount: 11 },
                { proportion: 0, count: 0, totalCount: 12 },
            ],
            [
                { proportion: 0.1, count: 1, totalCount: 11 },
                { proportion: 0.2, count: 2, totalCount: 12 },
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

        const { mutationOverTimeData } = await queryMutationsOverTimeData({
            lapisFilter,
            sequenceType: 'nucleotide',
            lapis: DUMMY_LAPIS_URL,
            lapisDateField: dateField,
            granularity: 'month',
        });

        expect(mutationOverTimeData.getAsArray()).to.deep.equal([]);

        const sequences = mutationOverTimeData.getFirstAxisKeys();
        expect(sequences.length).toBe(0);

        const dates = mutationOverTimeData.getSecondAxisKeys();
        expect(dates.length).toBe(0);
    });

    it('should fill with 0 if the mutation does not exist in a date range but count > 0', async () => {
        const lapisFilter = { field1: 'value1', field2: 'value2' };
        const dateField = 'dateField';

        lapisRequestMocks.multipleAggregated([
            {
                body: { ...lapisFilter, fields: [dateField] },
                response: {
                    data: [
                        { count: 1, [dateField]: '2023-01-01' },
                        { count: 1, [dateField]: '2023-01-02' },
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
                response: { data: [{ count: 11 }] },
            },
        ]);

        lapisRequestMocks.multipleMutations(
            [
                {
                    body: {
                        ...lapisFilter,
                        dateFieldFrom: '2023-01-01',
                        dateFieldTo: '2023-01-01',
                        minProportion: 0.001,
                    },
                    response: { data: [getSomeTestMutation(0.1, 1)] },
                },
                {
                    body: {
                        ...lapisFilter,
                        dateFieldFrom: '2023-01-02',
                        dateFieldTo: '2023-01-02',
                        minProportion: 0.001,
                    },
                    response: { data: [] },
                },
                {
                    body: {
                        ...lapisFilter,
                        dateFieldFrom: '2023-01-01',
                        dateFieldTo: '2023-01-02',
                        minProportion: 0.001,
                    },
                    response: {
                        data: [getSomeTestMutation(0.21, 6)],
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
        });

        expect(mutationOverTimeData.getAsArray()).to.deep.equal([
            [
                { proportion: 0.1, count: 1, totalCount: 11 },
                { proportion: 0, count: 0, totalCount: 11 },
            ],
        ]);
    });

    it('should return null if count in a date range is 0', async () => {
        const lapisFilter = { field1: 'value1', field2: 'value2' };
        const dateField = 'dateField';

        lapisRequestMocks.multipleAggregated([
            {
                body: { ...lapisFilter, fields: [dateField] },
                response: {
                    data: [{ count: 0, [dateField]: '2023-01-01' }],
                },
            },
            {
                body: {
                    ...lapisFilter,
                    dateFieldFrom: '2023-01-01',
                    dateFieldTo: '2023-01-01',
                    fields: [],
                },
                response: { data: [{ count: 0 }] },
            },
        ]);

        lapisRequestMocks.multipleMutations(
            [
                {
                    body: {
                        ...lapisFilter,
                        dateFieldFrom: '2023-01-01',
                        dateFieldTo: '2023-01-01',
                        minProportion: 0.001,
                    },
                    response: { data: [getSomeTestMutation(0.1, 1)] },
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
        });

        expect(mutationOverTimeData.getAsArray()).to.deep.equal([[null]]);
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

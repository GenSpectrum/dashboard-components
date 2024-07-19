import { describe, expect, it } from 'vitest';

import { queryMutationsOverTimeData } from './queryMutationsOverTime';
import { DUMMY_LAPIS_URL, lapisRequestMocks } from '../../vitest.setup';

describe('queryMutationsOverTime', () => {
    it('should fetch for a filter without date', async () => {
        const lapisFilter = { field1: 'value1', field2: 'value2' };
        const dateField = 'dateField';

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
            ],
            'nucleotide',
        );

        const result = await queryMutationsOverTimeData(lapisFilter, 'nucleotide', DUMMY_LAPIS_URL, dateField, 'day');

        expect(result.getAsArray({ count: 0, proportion: 0 })).to.deep.equal([
            [
                { proportion: 0.1, count: 1 },
                { proportion: 0.2, count: 2 },
                { proportion: 0.3, count: 3 },
            ],
            [
                { proportion: 0.4, count: 4 },
                { proportion: 0, count: 0 },
                { proportion: 0, count: 0 },
            ],
        ]);

        const sequences = result.getFirstAxisKeys();
        expect(sequences[0].code).toBe('sequenceName:A123T');
        expect(sequences[1].code).toBe('otherSequenceName:G234C');

        const dates = result.getSecondAxisKeys();
        expect(dates[0].toString()).toBe('2023-01-01');
        expect(dates[1].toString()).toBe('2023-01-02');
        expect(dates[2].toString()).toBe('2023-01-03');
    });

    it('should fetch for dates with no mutations', async () => {
        const lapisFilter = { field1: 'value1', field2: 'value2' };
        const dateField = 'dateField';

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
            ],
            'nucleotide',
        );

        const result = await queryMutationsOverTimeData(lapisFilter, 'nucleotide', DUMMY_LAPIS_URL, dateField, 'day');

        expect(result.getAsArray({ count: 0, proportion: 0 })).to.deep.equal([
            [
                { proportion: 0.1, count: 1 },
                { proportion: 0.3, count: 3 },
                { proportion: 0, count: 0 },
            ],
            [
                { proportion: 0.4, count: 4 },
                { proportion: 0, count: 0 },
                { proportion: 0, count: 0 },
            ],
        ]);

        const sequences = result.getFirstAxisKeys();
        expect(sequences[0].code).toBe('sequenceName:A123T');
        expect(sequences[1].code).toBe('otherSequenceName:G234C');

        const dates = result.getSecondAxisKeys();
        expect(dates[0].toString()).toBe('2023-01-01');
        expect(dates[1].toString()).toBe('2023-01-03');
        expect(dates[2].toString()).toBe('2023-01-02');
    });

    it('should return empty map when no mutations are found', async () => {
        const lapisFilter = { field1: 'value1', field2: 'value2' };
        const dateField = 'dateField';

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
            ],
            'nucleotide',
        );

        const result = await queryMutationsOverTimeData(lapisFilter, 'nucleotide', DUMMY_LAPIS_URL, dateField, 'day');

        expect(result.getAsArray({ count: 0, proportion: 0 })).to.deep.equal([]);
        expect(result.getFirstAxisKeys()).to.deep.equal([]);
        expect(result.getSecondAxisKeys()).to.deep.equal([]);
    });

    it('should use dateFrom from filter', async () => {
        const dateField = 'dateField';
        const lapisFilter = { field1: 'value1', field2: 'value2', [`${dateField}From`]: '2023-01-02' };

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
            ],
            'nucleotide',
        );

        const result = await queryMutationsOverTimeData(lapisFilter, 'nucleotide', DUMMY_LAPIS_URL, dateField, 'day');

        expect(result.getAsArray({ count: 0, proportion: 0 })).to.deep.equal([
            [
                { proportion: 0.2, count: 2 },
                { proportion: 0.3, count: 3 },
            ],
        ]);

        const sequences = result.getFirstAxisKeys();
        expect(sequences[0].code).toBe('sequenceName:A123T');

        const dates = result.getSecondAxisKeys();
        expect(dates[0].toString()).toBe('2023-01-02');
        expect(dates[1].toString()).toBe('2023-01-03');
    });

    it('should use dateTo from filter', async () => {
        const dateField = 'dateField';
        const lapisFilter = { field1: 'value1', field2: 'value2', [`${dateField}To`]: '2023-01-02' };

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
            ],
            'nucleotide',
        );

        const result = await queryMutationsOverTimeData(lapisFilter, 'nucleotide', DUMMY_LAPIS_URL, dateField, 'day');

        expect(result.getAsArray({ count: 0, proportion: 0 })).to.deep.equal([
            [
                { proportion: 0.1, count: 1 },
                { proportion: 0.2, count: 2 },
            ],
        ]);

        const sequences = result.getFirstAxisKeys();
        expect(sequences[0].code).toBe('sequenceName:A123T');

        const dates = result.getSecondAxisKeys();
        expect(dates[0].toString()).toBe('2023-01-01');
        expect(dates[1].toString()).toBe('2023-01-02');
    });

    it('should use date from filter', async () => {
        const dateField = 'dateField';
        const lapisFilter = { field1: 'value1', field2: 'value2', [dateField]: '2023-01-02' };

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
                        dateFieldFrom: '2023-01-02',
                        dateFieldTo: '2023-01-02',
                        minProportion: 0.001,
                    },
                    response: { data: [getSomeTestMutation(0.2, 2)] },
                },
            ],
            'nucleotide',
        );

        const result = await queryMutationsOverTimeData(lapisFilter, 'nucleotide', DUMMY_LAPIS_URL, dateField, 'day');

        expect(result.getAsArray({ count: 0, proportion: 0 })).to.deep.equal([[{ proportion: 0.2, count: 2 }]]);

        const sequences = result.getFirstAxisKeys();
        expect(sequences[0].code).toBe('sequenceName:A123T');

        const dates = result.getSecondAxisKeys();
        expect(dates[0].toString()).toBe('2023-01-02');
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
            mutation: 'otherSequenceName:A123T',
            proportion,
            count,
            sequenceName: 'otherSequenceName',
            mutationFrom: 'G',
            mutationTo: 'C',
            position: 234,
        };
    }
});

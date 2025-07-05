import { describe, expect, test } from 'vitest';

import { fetchLineageAutocompleteList } from './fetchLineageAutocompleteList';
import { DUMMY_LAPIS_URL, lapisRequestMocks } from '../../../vitest.setup';

describe('fetchLineageAutocompleteList', () => {
    const lapisFilter = { country: 'Germany' };
    const lineageField = 'lineageField';

    test('should return single lineage', async () => {
        lapisRequestMocks.aggregated(
            { fields: [lineageField], ...lapisFilter },
            {
                data: [
                    {
                        [lineageField]: 'A',
                        count: 1,
                    },
                ],
            },
        );

        lapisRequestMocks.lineageDefinition(
            {
                A: {
                    aliases: ['a'],
                },
            },
            lineageField,
        );

        const result = await fetchLineageAutocompleteList({
            lapisUrl: DUMMY_LAPIS_URL,
            lapisField: lineageField,
            lapisFilter,
        });

        expect(result).to.deep.equal([
            {
                lineage: 'A',
                count: 1,
            },
            {
                lineage: 'A*',
                count: 1,
            },
        ]);
    });

    test('should work without aliases', async () => {
        lapisRequestMocks.aggregated(
            { fields: [lineageField], ...lapisFilter },
            {
                data: [
                    {
                        [lineageField]: 'A',
                        count: 1,
                    },
                ],
            },
        );

        lapisRequestMocks.lineageDefinition(
            {
                A: {},
            },
            lineageField,
        );

        const result = await fetchLineageAutocompleteList({
            lapisUrl: DUMMY_LAPIS_URL,
            lapisField: lineageField,
            lapisFilter,
        });

        expect(result).to.deep.equal([
            {
                lineage: 'A',
                count: 1,
            },
            {
                lineage: 'A*',
                count: 1,
            },
        ]);
    });

    test('should add sublineage values', async () => {
        lapisRequestMocks.aggregated(
            { fields: [lineageField], ...lapisFilter },
            {
                data: [
                    {
                        [lineageField]: 'A',
                        count: 1,
                    },
                    {
                        [lineageField]: 'A.1',
                        count: 2,
                    },
                    {
                        [lineageField]: 'A.2',
                        count: 3,
                    },
                ],
            },
        );

        lapisRequestMocks.lineageDefinition(
            {
                A: {
                    aliases: ['a'],
                },
                'A.1': {
                    parents: ['A'],
                    aliases: ['a.1'],
                },
                'A.2': {
                    parents: ['A'],
                    aliases: ['a.1'],
                },
            },
            lineageField,
        );

        const result = await fetchLineageAutocompleteList({
            lapisUrl: DUMMY_LAPIS_URL,
            lapisField: lineageField,
            lapisFilter,
        });

        expect(result).to.deep.equal([
            {
                lineage: 'A',
                count: 1,
            },
            {
                lineage: 'A*',
                count: 6,
            },

            {
                lineage: 'A.1',
                count: 2,
            },
            {
                lineage: 'A.1*',
                count: 2,
            },

            {
                lineage: 'A.2',
                count: 3,
            },
            {
                lineage: 'A.2*',
                count: 3,
            },
        ]);
    });

    test('should work with recombinations', async () => {
        lapisRequestMocks.aggregated(
            { fields: [lineageField], ...lapisFilter },
            {
                data: [
                    {
                        [lineageField]: 'A',
                        count: 1,
                    },
                    {
                        [lineageField]: 'A.1',
                        count: 2,
                    },
                    {
                        [lineageField]: 'A.2',
                        count: 3,
                    },
                    {
                        [lineageField]: 'XA',
                        count: 4,
                    },
                ],
            },
        );

        lapisRequestMocks.lineageDefinition(
            {
                A: {
                    aliases: ['a'],
                },
                'A.1': {
                    parents: ['A'],
                    aliases: ['a.1'],
                },
                'A.2': {
                    parents: ['A'],
                    aliases: ['a.1'],
                },
                XA: {
                    aliases: ['xa'],
                    parents: ['A.1', 'A.2'],
                },
            },
            lineageField,
        );

        const result = await fetchLineageAutocompleteList({
            lapisUrl: DUMMY_LAPIS_URL,
            lapisField: lineageField,
            lapisFilter,
        });

        expect(result).to.deep.equal([
            {
                lineage: 'A',
                count: 1,
            },
            {
                lineage: 'A*',
                count: 10,
            },

            {
                lineage: 'A.1',
                count: 2,
            },
            {
                lineage: 'A.1*',
                count: 6,
            },
            {
                lineage: 'A.2',
                count: 3,
            },
            {
                lineage: 'A.2*',
                count: 7,
            },
            {
                lineage: 'XA',
                count: 4,
            },
            {
                lineage: 'XA*',
                count: 4,
            },
        ]);
    });

    test('should work with grandchildren', async () => {
        lapisRequestMocks.aggregated(
            { fields: [lineageField], ...lapisFilter },
            {
                data: [
                    {
                        [lineageField]: 'A',
                        count: 1,
                    },
                    {
                        [lineageField]: 'A.1',
                        count: 2,
                    },
                    {
                        [lineageField]: 'A.1.1',
                        count: 3,
                    },
                ],
            },
        );

        lapisRequestMocks.lineageDefinition(
            {
                'A.1': {
                    parents: ['A'],
                    aliases: ['a.1'],
                },
                A: {
                    aliases: ['a'],
                },
                'A.1.1': {
                    parents: ['A.1'],
                    aliases: ['a.1.1'],
                },
            },
            lineageField,
        );

        const result = await fetchLineageAutocompleteList({
            lapisUrl: DUMMY_LAPIS_URL,
            lapisField: lineageField,
            lapisFilter,
        });

        expect(result).to.deep.equal([
            {
                lineage: 'A',
                count: 1,
            },
            {
                lineage: 'A*',
                count: 6,
            },

            {
                lineage: 'A.1',
                count: 2,
            },
            {
                lineage: 'A.1*',
                count: 5,
            },

            {
                lineage: 'A.1.1',
                count: 3,
            },
            {
                lineage: 'A.1.1*',
                count: 3,
            },
        ]);
    });
});

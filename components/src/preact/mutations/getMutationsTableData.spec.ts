import { describe, expect, test } from 'vitest';

import { getMutationsTableData } from './getMutationsTableData';
import { Deletion, Substitution } from '../../utils/mutations';

describe('getMutationsTableData', () => {
    test('should return the correct data', () => {
        const data = [
            {
                type: 'substitution' as const,
                mutation: new Substitution('segment1', 'A', 'T', 123),
                count: 1,
                proportion: 0.1,
            },
            {
                type: 'deletion' as const,
                mutation: new Deletion('segment2', 'C', 123),
                count: 2,
                proportion: 0.2,
            },
        ];

        const proportionInterval = { min: 0, max: 1 };

        const result = getMutationsTableData(data, proportionInterval);

        expect(result).toEqual([
            {
                mutation: 'segment1:A123T',
                type: 'substitution',
                count: 1,
                proportion: 0.1,
            },
            {
                mutation: 'segment2:C123-',
                type: 'deletion',
                count: 2,
                proportion: 0.2,
            },
        ]);
    });

    test('should filter out data below/above proportionInterval', () => {
        const belowInterval = 0.03;
        const aboveInterval = 0.95;
        const inInterval = 0.5;

        const data = [
            {
                type: 'substitution' as const,
                mutation: new Substitution('segment1', 'A', 'T', 123),
                count: 1,
                proportion: inInterval,
            },
            {
                type: 'substitution' as const,
                mutation: new Substitution('segment1', 'A', 'T', 234),
                count: 1,
                proportion: belowInterval,
            },
            {
                type: 'deletion' as const,
                mutation: new Deletion('segment2', 'C', 123),
                count: 2,
                proportion: inInterval,
            },
            {
                type: 'deletion' as const,
                mutation: new Deletion('segment2', 'C', 456),
                count: 2,
                proportion: aboveInterval,
            },
        ];

        const proportionInterval = { min: 0.05, max: 0.9 };

        const result = getMutationsTableData(data, proportionInterval);

        expect(result).toEqual([
            {
                mutation: 'segment1:A123T',
                type: 'substitution',
                count: 1,
                proportion: inInterval,
            },
            {
                mutation: 'segment2:C123-',
                type: 'deletion',
                count: 2,
                proportion: inInterval,
            },
        ]);
    });
});

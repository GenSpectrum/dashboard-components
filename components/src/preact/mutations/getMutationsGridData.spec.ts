import { describe, expect, test } from 'vitest';

import { type BasesData, getMutationsGridData, type MutationsGridDataRow } from './getMutationsGridData';
import { Deletion, Substitution } from '../../utils/mutations';

describe('getMutationsGridData', () => {
    test('should return the correct data', () => {
        const data = [
            {
                type: 'substitution' as const,
                mutation: new Substitution(undefined, 'T', 'C', 123),
                count: 1,
                proportion: 0.9,
            },
            {
                type: 'substitution' as const,
                mutation: new Substitution(undefined, 'T', 'C', 234),
                count: 1,
                proportion: 0.8,
            },
            {
                type: 'substitution' as const,
                mutation: new Substitution(undefined, 'T', 'G', 234),
                count: 1,
                proportion: 0.05,
            },
            {
                type: 'deletion' as const,
                mutation: new Deletion(undefined, 'T', 234),
                count: 2,
                proportion: 0.1,
            },
        ];

        const proportionInterval = { min: 0, max: 1 };

        const result = getMutationsGridData(data, 'nucleotide', proportionInterval);

        const expected = [
            {
                position: '123',
                ...({
                    A: { proportion: 0, isReference: false },
                    C: { proportion: 0.9, isReference: false },
                    G: { proportion: 0, isReference: false },
                    T: { proportion: 0.1, isReference: true },
                    '-': { proportion: 0, isReference: false },
                } as BasesData),
            },
            {
                position: '234',
                ...({
                    A: { proportion: 0, isReference: false },
                    C: { proportion: 0.8, isReference: false },
                    G: { proportion: 0.05, isReference: false },
                    T: { proportion: 0.05, isReference: true },
                    '-': { proportion: 0.1, isReference: false },
                } as BasesData),
            },
        ] as MutationsGridDataRow[];

        expectGridDataIsApproximatelyEqual(result, expected);
    });

    test('should filter out rows where all entries are below/above proportionInterval', () => {
        const belowInterval = 0.03;
        const aboveInterval = 0.95;
        const inInterval = 0.5;

        const data = [
            {
                type: 'substitution' as const,
                mutation: new Substitution(undefined, 'T', 'C', 123),
                count: 1,
                proportion: aboveInterval,
            },
            {
                type: 'substitution' as const,
                mutation: new Substitution(undefined, 'T', 'C', 234),
                count: 1,
                proportion: inInterval,
            },
            {
                type: 'substitution' as const,
                mutation: new Substitution(undefined, 'T', 'G', 234),
                count: 1,
                proportion: belowInterval,
            },
            {
                type: 'deletion' as const,
                mutation: new Deletion(undefined, 'T', 234),
                count: 2,
                proportion: belowInterval,
            },
        ];

        const proportionInterval = { min: 0.05, max: 0.9 };

        const result = getMutationsGridData(data, 'nucleotide', proportionInterval);

        const expectedBases: BasesData = {
            A: { proportion: 0, isReference: false },
            C: { proportion: inInterval, isReference: false },
            G: { proportion: belowInterval, isReference: false },
            T: { proportion: 0.44, isReference: true },
            '-': { proportion: belowInterval, isReference: false },
        };

        const expected = [
            {
                position: '234',
                ...expectedBases,
            },
        ] as MutationsGridDataRow[];

        expectGridDataIsApproximatelyEqual(result, expected);
    });

    const expectGridDataIsApproximatelyEqual = (a: MutationsGridDataRow[], b: MutationsGridDataRow[]) => {
        expect(a.length).toBe(b.length);
        a.forEach((row, i) => expectRowsAreApproximatelyEqual(row, b[i]));
    };

    const expectRowsAreApproximatelyEqual = (a: MutationsGridDataRow, b: MutationsGridDataRow) => {
        const { position: positionA, ...basesA } = a;
        const { position: positionB, ...basesB } = b;
        expect(positionA).toBe(positionB);

        expect(Object.keys(basesA).length).toBe(Object.keys(basesB).length);
        for (const base in basesA) {
            expect(basesA[base].proportion).toBeCloseTo(basesB[base].proportion);
            expect(basesA[base].isReference).toBe(basesB[base].isReference);
        }
    };
});

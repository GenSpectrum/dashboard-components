import { describe, expect, test } from 'vitest';

import { sortMutationPositions } from './sortMutationPositions';

describe('sortMutationPositions with no segments', () => {
    test('should sort for positions', () => {
        const a = '1';
        const b = '2';

        expect(sortMutationPositions(a, b)).toBeLessThan(0);
        expect(sortMutationPositions(b, a)).toBeGreaterThan(0);
    });
});

describe('sortMutationPositions with segments', () => {
    test('should sort for segments first', () => {
        const a = 'AA1:1';
        const b = 'BB2:1';

        expect(sortMutationPositions(a, b)).toBeLessThan(0);
        expect(sortMutationPositions(b, a)).toBeGreaterThan(0);
    });

    test('should sort for positions second', () => {
        const a = 'ins_AA1:1';
        const b = 'ins_AA1:2';

        expect(sortMutationPositions(a, b)).toBeLessThan(0);
        expect(sortMutationPositions(b, a)).toBeGreaterThan(0);
    });
});

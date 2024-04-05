import { describe, expect, test } from 'vitest';

import { sortSubstitutionsAndDeletions } from './sortSubstitutionsAndDeletions';

describe('sortSubstitutionsAndDeletions with no segments', () => {
    test('should sort for positions first', () => {
        const a = 'A123B';
        const b = 'A234B';

        expect(sortSubstitutionsAndDeletions(a, b)).toBeLessThan(0);
        expect(sortSubstitutionsAndDeletions(b, a)).toBeGreaterThan(0);
    });

    test('should sort for substitutionValue second', () => {
        const a = 'A123A';
        const b = 'A123B';

        expect(sortSubstitutionsAndDeletions(a, b)).toBeLessThan(0);
        expect(sortSubstitutionsAndDeletions(b, a)).toBeGreaterThan(0);
    });
});

describe('sortSubstitutionsAndDeletions with segments', () => {
    test('should sort for segment first', () => {
        const a = 'AA1:A123B';
        const b = 'BB1:A234B';

        expect(sortSubstitutionsAndDeletions(a, b)).toBeLessThan(0);
        expect(sortSubstitutionsAndDeletions(b, a)).toBeGreaterThan(0);
    });

    test('should sort for position second', () => {
        const a = 'AA1:A123B';
        const b = 'AA1:A234B';

        expect(sortSubstitutionsAndDeletions(a, b)).toBeLessThan(0);
        expect(sortSubstitutionsAndDeletions(b, a)).toBeGreaterThan(0);
    });

    test('should sort for substitutionValue third', () => {
        const a = 'AA1:A123A';
        const b = 'AA1:A123B';

        expect(sortSubstitutionsAndDeletions(a, b)).toBeLessThan(0);
        expect(sortSubstitutionsAndDeletions(b, a)).toBeGreaterThan(0);
    });
});

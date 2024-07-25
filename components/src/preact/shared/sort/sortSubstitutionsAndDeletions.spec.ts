import { describe, expect, test } from 'vitest';

import { sortSubstitutionsAndDeletions } from './sortSubstitutionsAndDeletions';
import { Deletion, Substitution } from '../../../utils/mutations';

describe('sortSubstitutionsAndDeletions with no segments', () => {
    test('should sort for positions first', () => {
        const a = new Substitution(undefined, 'A', 'B', 123);
        const b = new Substitution(undefined, 'A', 'B', 234);

        expect(sortSubstitutionsAndDeletions(a, b)).toBeLessThan(0);
        expect(sortSubstitutionsAndDeletions(b, a)).toBeGreaterThan(0);
    });

    test('should sort for substitutionValue second', () => {
        const a = new Substitution(undefined, 'A', 'A', 123);
        const b = new Substitution(undefined, 'A', 'B', 123);

        expect(sortSubstitutionsAndDeletions(a, b)).toBeLessThan(0);
        expect(sortSubstitutionsAndDeletions(b, a)).toBeGreaterThan(0);
    });

    test('should sort for substitutionValue over deletion', () => {
        const a = new Substitution(undefined, 'A', 'A', 123);
        const b = new Deletion(undefined, 'A', 123);

        expect(sortSubstitutionsAndDeletions(a, b)).toBeLessThan(0);
        expect(sortSubstitutionsAndDeletions(b, a)).toBeGreaterThan(0);
    });
});

describe('sortSubstitutionsAndDeletions with segments', () => {
    test('should sort for segment first', () => {
        const a = new Substitution('AA1', 'A', 'B', 123);
        const b = new Substitution('BB1', 'A', 'B', 123);

        expect(sortSubstitutionsAndDeletions(a, b)).toBeLessThan(0);
        expect(sortSubstitutionsAndDeletions(b, a)).toBeGreaterThan(0);
    });

    test('should sort for position second', () => {
        const a = new Substitution('AA1', 'A', 'B', 123);
        const b = new Substitution('AA1', 'A', 'B', 234);

        expect(sortSubstitutionsAndDeletions(a, b)).toBeLessThan(0);
        expect(sortSubstitutionsAndDeletions(b, a)).toBeGreaterThan(0);
    });

    test('should sort for substitutionValue third', () => {
        const a = new Substitution('AA1', 'A', 'A', 123);
        const b = new Substitution('AA1', 'A', 'B', 123);

        expect(sortSubstitutionsAndDeletions(a, b)).toBeLessThan(0);
        expect(sortSubstitutionsAndDeletions(b, a)).toBeGreaterThan(0);
    });
});

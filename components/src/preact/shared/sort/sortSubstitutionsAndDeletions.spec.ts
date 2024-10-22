import { describe, expect, test } from 'vitest';

import { sortSubstitutionsAndDeletions } from './sortSubstitutionsAndDeletions';
import { DeletionClass, SubstitutionClass } from '../../../utils/mutations';

describe('sortSubstitutionsAndDeletions with no segments', () => {
    test('should sort for positions first', () => {
        const a = new SubstitutionClass(undefined, 'A', 'B', 123);
        const b = new SubstitutionClass(undefined, 'A', 'B', 234);

        expect(sortSubstitutionsAndDeletions(a, b)).toBeLessThan(0);
        expect(sortSubstitutionsAndDeletions(b, a)).toBeGreaterThan(0);
    });

    test('should sort for substitutionValue second', () => {
        const a = new SubstitutionClass(undefined, 'A', 'A', 123);
        const b = new SubstitutionClass(undefined, 'A', 'B', 123);

        expect(sortSubstitutionsAndDeletions(a, b)).toBeLessThan(0);
        expect(sortSubstitutionsAndDeletions(b, a)).toBeGreaterThan(0);
    });

    test('should sort for substitutionValue over deletion', () => {
        const a = new SubstitutionClass(undefined, 'A', 'A', 123);
        const b = new DeletionClass(undefined, 'A', 123);

        expect(sortSubstitutionsAndDeletions(a, b)).toBeLessThan(0);
        expect(sortSubstitutionsAndDeletions(b, a)).toBeGreaterThan(0);
    });
});

describe('sortSubstitutionsAndDeletions with segments', () => {
    test('should sort for segment first', () => {
        const a = new SubstitutionClass('AA1', 'A', 'B', 123);
        const b = new SubstitutionClass('BB1', 'A', 'B', 123);

        expect(sortSubstitutionsAndDeletions(a, b)).toBeLessThan(0);
        expect(sortSubstitutionsAndDeletions(b, a)).toBeGreaterThan(0);
    });

    test('should sort for position second', () => {
        const a = new SubstitutionClass('AA1', 'A', 'B', 123);
        const b = new SubstitutionClass('AA1', 'A', 'B', 234);

        expect(sortSubstitutionsAndDeletions(a, b)).toBeLessThan(0);
        expect(sortSubstitutionsAndDeletions(b, a)).toBeGreaterThan(0);
    });

    test('should sort for substitutionValue third', () => {
        const a = new SubstitutionClass('AA1', 'A', 'A', 123);
        const b = new SubstitutionClass('AA1', 'A', 'B', 123);

        expect(sortSubstitutionsAndDeletions(a, b)).toBeLessThan(0);
        expect(sortSubstitutionsAndDeletions(b, a)).toBeGreaterThan(0);
    });
});

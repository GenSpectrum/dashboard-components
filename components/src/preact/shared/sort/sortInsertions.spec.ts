import { describe, expect, test } from 'vitest';

import { sortInsertions } from './sortInsertions';
import { Insertion } from '../../../utils/mutations';

describe('sortInsertions with no segments', () => {
    test('should sort for positions first', () => {
        const a = new Insertion(undefined, 1, 'A');
        const b = new Insertion(undefined, 2, 'A');

        expect(sortInsertions(a, b)).toBeLessThan(0);
        expect(sortInsertions(b, a)).toBeGreaterThan(0);
    });

    test('should sort for symbols second', () => {
        const a = new Insertion(undefined, 1, 'A');
        const b = new Insertion(undefined, 1, 'B');

        expect(sortInsertions(a, b)).toBeLessThan(0);
        expect(sortInsertions(b, a)).toBeGreaterThan(0);
    });
});

describe('sortInsertions with segments', () => {
    test('should sort for segments first', () => {
        const a = new Insertion('AA1', 1, 'A');
        const b = new Insertion('BB1', 1, 'A');

        expect(sortInsertions(a, b)).toBeLessThan(0);
        expect(sortInsertions(b, a)).toBeGreaterThan(0);
    });

    test('should sort for positions second', () => {
        const a = new Insertion('AA1', 1, 'A');
        const b = new Insertion('AA1', 2, 'A');

        expect(sortInsertions(a, b)).toBeLessThan(0);
        expect(sortInsertions(b, a)).toBeGreaterThan(0);
    });

    test('should sort for symbols third', () => {
        const a = new Insertion('AA1', 1, 'A');
        const b = new Insertion('AA1', 1, 'B');

        expect(sortInsertions(a, b)).toBeLessThan(0);
        expect(sortInsertions(b, a)).toBeGreaterThan(0);
    });
});

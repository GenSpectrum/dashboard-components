import { describe, expect, test } from 'vitest';

import { sortInsertions } from './sortInsertions';
import { InsertionClass } from '../../../utils/mutations';

describe('sortInsertions with no segments', () => {
    test('should sort for positions first', () => {
        const a = new InsertionClass(undefined, 1, 'A');
        const b = new InsertionClass(undefined, 2, 'A');

        expect(sortInsertions(a, b)).toBeLessThan(0);
        expect(sortInsertions(b, a)).toBeGreaterThan(0);
    });

    test('should sort for symbols second', () => {
        const a = new InsertionClass(undefined, 1, 'A');
        const b = new InsertionClass(undefined, 1, 'B');

        expect(sortInsertions(a, b)).toBeLessThan(0);
        expect(sortInsertions(b, a)).toBeGreaterThan(0);
    });
});

describe('sortInsertions with segments', () => {
    test('should sort for segments first', () => {
        const a = new InsertionClass('AA1', 1, 'A');
        const b = new InsertionClass('BB1', 1, 'A');

        expect(sortInsertions(a, b)).toBeLessThan(0);
        expect(sortInsertions(b, a)).toBeGreaterThan(0);
    });

    test('should sort for positions second', () => {
        const a = new InsertionClass('AA1', 1, 'A');
        const b = new InsertionClass('AA1', 2, 'A');

        expect(sortInsertions(a, b)).toBeLessThan(0);
        expect(sortInsertions(b, a)).toBeGreaterThan(0);
    });

    test('should sort for symbols third', () => {
        const a = new InsertionClass('AA1', 1, 'A');
        const b = new InsertionClass('AA1', 1, 'B');

        expect(sortInsertions(a, b)).toBeLessThan(0);
        expect(sortInsertions(b, a)).toBeGreaterThan(0);
    });
});

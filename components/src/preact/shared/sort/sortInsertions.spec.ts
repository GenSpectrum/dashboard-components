import { describe, expect, test } from 'vitest';

import { sortInsertions } from './sortInsertions';

describe('sortInsertions with no segments', () => {
    test('should sort for positions first', () => {
        const a = 'ins_1:A';
        const b = 'ins_2:A';

        expect(sortInsertions(a, b)).toBeLessThan(0);
        expect(sortInsertions(b, a)).toBeGreaterThan(0);
    });

    test('should sort for symbols second', () => {
        const a = 'ins_1:A';
        const b = 'ins_1:B';

        expect(sortInsertions(a, b)).toBeLessThan(0);
        expect(sortInsertions(b, a)).toBeGreaterThan(0);
    });
});

describe('sortInsertions with segments', () => {
    test('should sort for segments first', () => {
        const a = 'ins_AA1:1:A';
        const b = 'ins_BB2:1:A';

        expect(sortInsertions(a, b)).toBeLessThan(0);
        expect(sortInsertions(b, a)).toBeGreaterThan(0);
    });

    test('should sort for positions second', () => {
        const a = 'ins_AA1:1:A';
        const b = 'ins_AA1:2:A';

        expect(sortInsertions(a, b)).toBeLessThan(0);
        expect(sortInsertions(b, a)).toBeGreaterThan(0);
    });

    test('should sort for symbols third', () => {
        const a = 'ins_AA1:1:A';
        const b = 'ins_AA1:1:B';

        expect(sortInsertions(a, b)).toBeLessThan(0);
        expect(sortInsertions(b, a)).toBeGreaterThan(0);
    });
});

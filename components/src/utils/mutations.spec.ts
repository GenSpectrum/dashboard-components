import { describe, expect, it } from 'vitest';

import { DeletionClass, InsertionClass, SubstitutionClass } from './mutations';

describe('SubstitutionClass', () => {
    it('should be parsed from string', () => {
        expect(SubstitutionClass.parse('A1T')).deep.equal(new SubstitutionClass(undefined, 'A', 'T', 1));
        expect(SubstitutionClass.parse('seg1:A1T')).deep.equal(new SubstitutionClass('seg1', 'A', 'T', 1));
    });

    it('should be parsed with stop codons', () => {
        expect(SubstitutionClass.parse('S:*1247T')).deep.equal(new SubstitutionClass('S', '*', 'T', 1247));
        expect(SubstitutionClass.parse('S:T1247*')).deep.equal(new SubstitutionClass('S', 'T', '*', 1247));
    });

    it('should render to string correctly', () => {
        const substitutions = [
            {
                substitution: new SubstitutionClass(undefined, 'A', 'T', 1),
                expected: 'A1T',
            },
            { substitution: new SubstitutionClass('segment', 'A', 'T', 1), expected: 'segment:A1T' },
            { substitution: new SubstitutionClass(undefined, undefined, undefined, 1), expected: '1' },
        ];

        for (const { substitution, expected } of substitutions) {
            expect(substitution.toString()).to.equal(expected);
        }
    });
});

describe('DeletionClass', () => {
    it('should be parsed from string', () => {
        expect(DeletionClass.parse('A1-')).deep.equal(new DeletionClass(undefined, 'A', 1));
        expect(DeletionClass.parse('seg1:A1-')).deep.equal(new DeletionClass('seg1', 'A', 1));
    });

    it('should be parsed with stop codons', () => {
        expect(DeletionClass.parse('seg1:*1-')).deep.equal(new DeletionClass('seg1', '*', 1));
    });

    it('should render to string correctly', () => {
        const substitutions = [
            {
                deletion: new DeletionClass(undefined, 'A', 1),
                expected: 'A1-',
            },
            { deletion: new DeletionClass('segment', 'A', 1), expected: 'segment:A1-' },
            { deletion: new DeletionClass(undefined, undefined, 1), expected: '1-' },
        ];

        for (const { deletion, expected } of substitutions) {
            expect(deletion.toString()).to.equal(expected);
        }
    });
});

describe('InsertionClass', () => {
    it('should be parsed from string', () => {
        expect(InsertionClass.parse('ins_1:A')).deep.equal(new InsertionClass(undefined, 1, 'A'));
        expect(InsertionClass.parse('ins_seg1:1:A')).deep.equal(new InsertionClass('seg1', 1, 'A'));
    });

    it('should be parsed with case insensitive ins prefix', () => {
        expect(InsertionClass.parse('INS_1:A')).deep.equal(new InsertionClass(undefined, 1, 'A'));
        expect(InsertionClass.parse('iNs_1:A')).deep.equal(new InsertionClass(undefined, 1, 'A'));
    });

    it('should be parsed with the other parts not case insensitive', () => {
        expect(InsertionClass.parse('ins_geNe1:1:A')).deep.equal(new InsertionClass('geNe1', 1, 'A'));
        expect(InsertionClass.parse('ins_1:aA')).deep.equal(new InsertionClass(undefined, 1, 'aA'));
    });

    it('should be parsed with stop codon insertion', () => {
        expect(InsertionClass.parse('ins_134:*')).deep.equal(new InsertionClass(undefined, 134, '*'));
    });
});

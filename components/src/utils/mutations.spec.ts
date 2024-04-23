import { describe, expect, it } from 'vitest';

import { Deletion, Insertion, Substitution } from './mutations';

describe('Substitution', () => {
    it('should be parsed from string', () => {
        expect(Substitution.parse('A1T')).deep.equal(new Substitution(undefined, 'A', 'T', 1));
        expect(Substitution.parse('seg1:A1T')).deep.equal(new Substitution('seg1', 'A', 'T', 1));
    });

    it('should render to string correctly', () => {
        const substitutions = [
            {
                substitution: new Substitution(undefined, 'A', 'T', 1),
                expected: 'A1T',
            },
            { substitution: new Substitution('segment', 'A', 'T', 1), expected: 'segment:A1T' },
            { substitution: new Substitution(undefined, undefined, undefined, 1), expected: '1' },
        ];

        for (const { substitution, expected } of substitutions) {
            expect(substitution.toString()).to.equal(expected);
        }
    });
});

describe('Deletion', () => {
    it('should be parsed from string', () => {
        expect(Deletion.parse('A1-')).deep.equal(new Deletion(undefined, 'A', 1));
        expect(Deletion.parse('seg1:A1-')).deep.equal(new Deletion('seg1', 'A', 1));
    });

    it('should render to string correctly', () => {
        const substitutions = [
            {
                deletion: new Deletion(undefined, 'A', 1),
                expected: 'A1-',
            },
            { deletion: new Deletion('segment', 'A', 1), expected: 'segment:A1-' },
            { deletion: new Deletion(undefined, undefined, 1), expected: '1-' },
        ];

        for (const { deletion, expected } of substitutions) {
            expect(deletion.toString()).to.equal(expected);
        }
    });
});

describe('Insertion', () => {
    it('should be parsed from string', () => {
        expect(Insertion.parse('ins_1:A')).deep.equal(new Insertion(undefined, 1, 'A'));
        expect(Insertion.parse('ins_seg1:1:A')).deep.equal(new Insertion('seg1', 1, 'A'));
    });

    it('should be parsed with case insensitive ins prefix', () => {
        expect(Insertion.parse('INS_1:A')).deep.equal(new Insertion(undefined, 1, 'A'));
        expect(Insertion.parse('iNs_1:A')).deep.equal(new Insertion(undefined, 1, 'A'));
    });

    it('should be parsed with the other parts not case insensitive', () => {
        expect(Insertion.parse('ins_geNe1:1:A')).deep.equal(new Insertion('geNe1', 1, 'A'));
        expect(Insertion.parse('ins_1:aA')).deep.equal(new Insertion(undefined, 1, 'aA'));
    });
});

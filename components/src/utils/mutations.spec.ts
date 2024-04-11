import { describe, expect, it } from 'vitest';

import { Deletion, Insertion, Substitution } from './mutations';

describe('Substitution', () => {
    it('should be parsed from string', () => {
        expect(Substitution.parse('A1T')).deep.equal(new Substitution(undefined, 'A', 'T', 1));
        expect(Substitution.parse('seg1:A1T')).deep.equal(new Substitution('seg1', 'A', 'T', 1));
    });
});
describe('Deletion', () => {
    it('should be parsed from string', () => {
        expect(Deletion.parse('A1-')).deep.equal(new Deletion(undefined, 'A', 1));
        expect(Deletion.parse('seg1:A1-')).deep.equal(new Deletion('seg1', 'A', 1));
    });
});
describe('Insertion', () => {
    it('should be parsed from string', () => {
        expect(Insertion.parse('ins_1:A')).deep.equal(new Insertion(undefined, 1, 'A'));
        expect(Insertion.parse('ins_seg1:1:A')).deep.equal(new Insertion('seg1', 1, 'A'));
    });
});

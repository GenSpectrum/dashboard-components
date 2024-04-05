import { expect, describe, it } from 'vitest';

import { Deletion, Insertion, MutationCache, Substitution } from './mutations';

describe('MutationCache.getMutation', () => {
    const cache = MutationCache.getInstance();

    it('should parse substitution', () => {
        expect(cache.getMutation('A1T')).deep.equal(new Substitution(undefined, 'A', 'T', 1));
        expect(cache.getMutation('seg1:A1T')).deep.equal(new Substitution('seg1', 'A', 'T', 1));
    });

    it('should parse deletion', () => {
        expect(cache.getMutation('A1-')).deep.equal(new Deletion(undefined, 'A', 1));
        expect(cache.getMutation('seg1:A1-')).deep.equal(new Deletion('seg1', 'A', 1));
    });

    it('should parse insertion', () => {
        expect(cache.getMutation('ins_1:A')).deep.equal(new Insertion(undefined, 1, 'A'));
        expect(cache.getMutation('ins_seg1:1:A')).deep.equal(new Insertion('seg1', 1, 'A'));
    });
});

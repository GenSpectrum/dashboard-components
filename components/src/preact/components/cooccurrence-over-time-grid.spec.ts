import { describe, expect, it } from 'vitest';

import { formatPosition } from './cooccurrence-over-time-grid';

describe('formatPosition', () => {
    it('strips brackets from a bare nucleotide position', () => {
        expect(formatPosition('[501]')).toBe('501');
    });

    it('formats an amino acid position with gene and colon separator', () => {
        expect(formatPosition('ORF1a[501]')).toBe('ORF1a:501');
        expect(formatPosition('S[501]')).toBe('S:501');
    });

    it('returns the input unchanged when it does not match the position syntax', () => {
        expect(formatPosition('country')).toBe('country');
    });
});

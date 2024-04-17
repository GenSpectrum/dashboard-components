import { describe, expect, it } from 'vitest';

import { sequenceTypeFromSegment } from './sequenceTypeFromSegment';

describe('getSequenceType', () => {
    const singleSegmentedReferenceGenome = {
        nucleotideSequences: [
            {
                name: 'nuc1',
                sequence: 'ACGT',
            },
        ],
        genes: [
            {
                name: 'gene1',
                sequence: 'ACGT',
            },
            {
                name: 'gene2',
                sequence: 'ACGT',
            },
        ],
    };

    const multiSegmentedReferenceGenome = {
        nucleotideSequences: [
            {
                name: 'nuc1',
                sequence: 'ACGT',
            },
            {
                name: 'nuc2',
                sequence: 'ACGT',
            },
        ],
        genes: [
            {
                name: 'gene1',
                sequence: 'ACGT',
            },
            {
                name: 'gene2',
                sequence: 'ACGT',
            },
        ],
    };

    it('should return nucleotide, even when the segment is undefined for singe segmented genome', () => {
        expect(sequenceTypeFromSegment('nuc1', singleSegmentedReferenceGenome)).toBe('nucleotide');
        expect(sequenceTypeFromSegment(undefined, singleSegmentedReferenceGenome)).toBe('nucleotide');
    });

    it('should return undefined, even when the segment is undefined for multi segmented genome', () => {
        expect(sequenceTypeFromSegment('nuc1', multiSegmentedReferenceGenome)).toBe('nucleotide');
        expect(sequenceTypeFromSegment(undefined, multiSegmentedReferenceGenome)).toBe(undefined);
    });

    it('should return amino acid, when the segment is a gene', () => {
        expect(sequenceTypeFromSegment('gene1', singleSegmentedReferenceGenome)).toBe('amino acid');
        expect(sequenceTypeFromSegment('gene2', singleSegmentedReferenceGenome)).toBe('amino acid');
    });

    it('should return undefined, when the segment is not found in the reference genome', () => {
        expect(sequenceTypeFromSegment('not-existing', singleSegmentedReferenceGenome)).toBe(undefined);
    });
});

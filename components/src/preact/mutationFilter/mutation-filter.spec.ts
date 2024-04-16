import { describe, expect, it } from 'vitest';

import { getSequenceType, parseInsertedMutation } from './mutation-filter';
import { Deletion, Insertion, Substitution } from '../../utils/mutations';

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
        expect(getSequenceType('nuc1', singleSegmentedReferenceGenome)).toBe('nucleotide');
        expect(getSequenceType(undefined, singleSegmentedReferenceGenome)).toBe('nucleotide');
    });

    it('should return undefined, even when the segment is undefined for multi segmented genome', () => {
        expect(getSequenceType('nuc1', multiSegmentedReferenceGenome)).toBe('nucleotide');
        expect(getSequenceType(undefined, multiSegmentedReferenceGenome)).toBe(undefined);
    });

    it('should return amino acid, when the segment is a gene', () => {
        expect(getSequenceType('gene1', singleSegmentedReferenceGenome)).toBe('amino acid');
        expect(getSequenceType('gene2', singleSegmentedReferenceGenome)).toBe('amino acid');
    });

    it('should return undefined, when the segment is not found in the reference genome', () => {
        expect(getSequenceType('not-existing', singleSegmentedReferenceGenome)).toBe(undefined);
    });
});

describe('parseInsertedMutation', () => {
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

    it('should parse nucleotide insertions', () => {
        const parsedInsertedMutation = parseInsertedMutation('ins_10:ACGT', singleSegmentedReferenceGenome);
        expect(parsedInsertedMutation?.nucleotideInsertions?.equals(new Insertion(undefined, 10, 'ACGT'))).toBe(true);
    });

    it('should parse amino acid insertions', () => {
        const parsedInsertedMutation = parseInsertedMutation('ins_gene1:10:ACGT', singleSegmentedReferenceGenome);
        expect(parsedInsertedMutation?.aminoAcidInsertions?.equals(new Insertion('gene1', 10, 'ACGT'))).toBe(true);
    });

    it('should return null for insertion with segment not in reference genome', () => {
        const parsedInsertedMutation = parseInsertedMutation(
            'INS_notInReferenceGenome:10:ACGT',
            singleSegmentedReferenceGenome,
        );
        expect(parsedInsertedMutation).toBe(null);
    });

    it('should parse nucleotide deletion in single segmented reference genome, when no segment is given', () => {
        const parsedInsertedMutation = parseInsertedMutation('A123-', singleSegmentedReferenceGenome);
        expect(parsedInsertedMutation?.nucleotideMutations?.equals(new Deletion(undefined, 'A', 123))).toBe(true);
    });

    it('should parse nucleotide deletion', () => {
        const parsedInsertedMutation = parseInsertedMutation('nuc1:A123-', singleSegmentedReferenceGenome);
        expect(parsedInsertedMutation?.nucleotideMutations?.equals(new Deletion('nuc1', 'A', 123))).toBe(true);
    });

    it('should parse amino acid deletion', () => {
        const parsedInsertedMutation = parseInsertedMutation('gene1:A123-', singleSegmentedReferenceGenome);
        expect(parsedInsertedMutation?.aminoAcidMutations?.equals(new Deletion('gene1', 'A', 123))).toBe(true);
    });

    it('should return null for deletion with segment not in reference genome', () => {
        const parsedInsertedMutation = parseInsertedMutation(
            'notInReferenceGenome:A123-',
            singleSegmentedReferenceGenome,
        );
        expect(parsedInsertedMutation).toBe(null);
    });

    it('should parse nucleotide substitution in single segmented reference genome, when no segment is given', () => {
        const parsedInsertedMutation = parseInsertedMutation('A123T', singleSegmentedReferenceGenome);
        expect(parsedInsertedMutation?.nucleotideMutations?.equals(new Substitution(undefined, 'A', 'T', 123))).toBe(
            true,
        );
    });

    it('should parse nucleotide substitution', () => {
        const parsedInsertedMutation = parseInsertedMutation('nuc1:A123T', singleSegmentedReferenceGenome);
        expect(parsedInsertedMutation?.nucleotideMutations?.equals(new Substitution('nuc1', 'A', 'T', 123))).toBe(true);
    });

    it('should parse amino acid substitution', () => {
        const parsedInsertedMutation = parseInsertedMutation('gene1:A123T', singleSegmentedReferenceGenome);
        expect(parsedInsertedMutation?.aminoAcidMutations?.equals(new Substitution('gene1', 'A', 'T', 123))).toBe(true);
    });

    it('should return null for substitution with segment not in reference genome', () => {
        const parsedInsertedMutation = parseInsertedMutation(
            'notInReferenceGenome:A123T',
            singleSegmentedReferenceGenome,
        );
        expect(parsedInsertedMutation).toBe(null);
    });

    it('should return null for invalid mutation', () => {
        const parsedInsertedMutation = parseInsertedMutation('invalidMutation', singleSegmentedReferenceGenome);
        expect(parsedInsertedMutation).toBe(null);
    });
});

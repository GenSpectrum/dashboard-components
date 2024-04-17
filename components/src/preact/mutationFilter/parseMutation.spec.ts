import { describe, expect, it } from 'vitest';
import { parseMutation } from './parseMutation';
import { Deletion, Insertion, Substitution } from '../../utils/mutations';

describe('parseMutation', () => {
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
        const parsedInsertedMutation = parseMutation('ins_10:ACGT', singleSegmentedReferenceGenome);
        expect(parsedInsertedMutation?.nucleotideInsertions?.equals(new Insertion(undefined, 10, 'ACGT'))).toBe(true);
    });

    it('should parse amino acid insertions', () => {
        const parsedInsertedMutation = parseMutation('ins_gene1:10:ACGT', singleSegmentedReferenceGenome);
        expect(parsedInsertedMutation?.aminoAcidInsertions?.equals(new Insertion('gene1', 10, 'ACGT'))).toBe(true);
    });

    it('should return null for insertion with segment not in reference genome', () => {
        const parsedInsertedMutation = parseMutation(
            'INS_notInReferenceGenome:10:ACGT',
            singleSegmentedReferenceGenome,
        );
        expect(parsedInsertedMutation).toBe(null);
    });

    it('should parse nucleotide deletion in single segmented reference genome, when no segment is given', () => {
        const parsedInsertedMutation = parseMutation('A123-', singleSegmentedReferenceGenome);
        expect(parsedInsertedMutation?.nucleotideMutations?.equals(new Deletion(undefined, 'A', 123))).toBe(true);
    });

    it('should parse nucleotide deletion', () => {
        const parsedInsertedMutation = parseMutation('nuc1:A123-', singleSegmentedReferenceGenome);
        expect(parsedInsertedMutation?.nucleotideMutations?.equals(new Deletion('nuc1', 'A', 123))).toBe(true);
    });

    it('should parse amino acid deletion', () => {
        const parsedInsertedMutation = parseMutation('gene1:A123-', singleSegmentedReferenceGenome);
        expect(parsedInsertedMutation?.aminoAcidMutations?.equals(new Deletion('gene1', 'A', 123))).toBe(true);
    });

    it('should return null for deletion with segment not in reference genome', () => {
        const parsedInsertedMutation = parseMutation('notInReferenceGenome:A123-', singleSegmentedReferenceGenome);
        expect(parsedInsertedMutation).toBe(null);
    });

    it('should parse nucleotide substitution in single segmented reference genome, when no segment is given', () => {
        const parsedInsertedMutation = parseMutation('A123T', singleSegmentedReferenceGenome);
        expect(parsedInsertedMutation?.nucleotideMutations?.equals(new Substitution(undefined, 'A', 'T', 123))).toBe(
            true,
        );
    });

    it('should parse nucleotide substitution', () => {
        const parsedInsertedMutation = parseMutation('nuc1:A123T', singleSegmentedReferenceGenome);
        expect(parsedInsertedMutation?.nucleotideMutations?.equals(new Substitution('nuc1', 'A', 'T', 123))).toBe(true);
    });

    it('should parse amino acid substitution', () => {
        const parsedInsertedMutation = parseMutation('gene1:A123T', singleSegmentedReferenceGenome);
        expect(parsedInsertedMutation?.aminoAcidMutations?.equals(new Substitution('gene1', 'A', 'T', 123))).toBe(true);
    });

    it('should return null for substitution with segment not in reference genome', () => {
        const parsedInsertedMutation = parseMutation('notInReferenceGenome:A123T', singleSegmentedReferenceGenome);
        expect(parsedInsertedMutation).toBe(null);
    });

    it('should return null for invalid mutation', () => {
        const parsedInsertedMutation = parseMutation('invalidMutation', singleSegmentedReferenceGenome);
        expect(parsedInsertedMutation).toBe(null);
    });
});

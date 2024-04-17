import { describe, expect, it } from 'vitest';

import { parseAndValidateMutation } from './parseAndValidateMutation';
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
        const result = parseAndValidateMutation('ins_10:ACGT', singleSegmentedReferenceGenome);
        expect(result?.value).deep.equals(new Insertion(undefined, 10, 'ACGT'));
    });

    it('should parse amino acid insertions', () => {
        const result = parseAndValidateMutation('ins_gene1:10:ACGT', singleSegmentedReferenceGenome);
        expect(result?.value).deep.equals(new Insertion('gene1', 10, 'ACGT'));
    });

    it('should return null for insertion with segment not in reference genome', () => {
        const result = parseAndValidateMutation('INS_notInReferenceGenome:10:ACGT', singleSegmentedReferenceGenome);
        expect(result).toBe(null);
    });

    it('should parse nucleotide deletion in single segmented reference genome, when no segment is given', () => {
        const result = parseAndValidateMutation('A123-', singleSegmentedReferenceGenome);
        expect(result?.value).deep.equals(new Deletion(undefined, 'A', 123));
    });
    it('should parse nucleotide deletion', () => {
        const result = parseAndValidateMutation('nuc1:A123-', singleSegmentedReferenceGenome);
        expect(result?.value).deep.equals(new Deletion('nuc1', 'A', 123));
    });
    it('should parse amino acid deletion', () => {
        const result = parseAndValidateMutation('gene1:A123-', singleSegmentedReferenceGenome);
        expect(result?.value).deep.equals(new Deletion('gene1', 'A', 123));
    });
    it('should return null for deletion with segment not in reference genome', () => {
        const result = parseAndValidateMutation('notInReferenceGenome:A123-', singleSegmentedReferenceGenome);
        expect(result).toBe(null);
    });

    it('should parse nucleotide substitution in single segmented reference genome, when no segment is given', () => {
        const result = parseAndValidateMutation('A123T', singleSegmentedReferenceGenome);
        expect(result?.value).deep.equals(new Substitution(undefined, 'A', 'T', 123));
    });

    it('should parse nucleotide substitution', () => {
        const result = parseAndValidateMutation('nuc1:A123T', singleSegmentedReferenceGenome);
        expect(result?.value).deep.equals(new Substitution('nuc1', 'A', 'T', 123));
    });
    it('should parse amino acid substitution', () => {
        const result = parseAndValidateMutation('gene1:A123T', singleSegmentedReferenceGenome);
        expect(result?.value).deep.equals(new Substitution('gene1', 'A', 'T', 123));
    });
    it('should return null for substitution with segment not in reference genome', () => {
        const result = parseAndValidateMutation('notInReferenceGenome:A123T', singleSegmentedReferenceGenome);
        expect(result).toBe(null);
    });

    it('should return null for invalid mutation', () => {
        const result = parseAndValidateMutation('invalidMutation', singleSegmentedReferenceGenome);
        expect(result).toBe(null);
    });
});

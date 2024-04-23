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

    const testCases = {
        insertions: [
            {
                name: 'should parse nucleotide insertions',
                input: 'ins_10:ACGT',
                expected: { type: 'nucleotideInsertions', value: new Insertion(undefined, 10, 'ACGT') },
            },
            {
                name: 'should parse amino acid insertions',
                input: 'ins_gene1:10:ACGT',
                expected: { type: 'aminoAcidInsertions', value: new Insertion('gene1', 10, 'ACGT') },
            },
            {
                name: 'should parse amino acid insertion with LAPIS-style wildcard',
                input: 'ins_gene1:10:?AC?GT',
                expected: { type: 'aminoAcidInsertions', value: new Insertion('gene1', 10, '?AC?GT') },
            },
            {
                name: 'should parse amino acid insertion with SILO-style wildcard',
                input: 'ins_gene1:10:.*AC.*GT',
                expected: { type: 'aminoAcidInsertions', value: new Insertion('gene1', 10, '.*AC.*GT') },
            },
            {
                name: 'should return null for insertion with segment not in reference genome',
                input: 'INS_notInReferenceGenome:10:ACGT',
                expected: null,
            },
            { name: 'should return null for insertion with missing position', input: 'ins_gene1:ACGT', expected: null },
        ],
        deletions: [
            {
                name: 'should parse nucleotide deletion in single segmented reference genome, when no segment is given',
                input: 'A123-',
                expected: { type: 'nucleotideMutations', value: new Deletion(undefined, 'A', 123) },
            },
            {
                name: 'should parse nucleotide deletion without valueAtReference when no segment is given',
                input: '123-',
                expected: { type: 'nucleotideMutations', value: new Deletion(undefined, undefined, 123) },
            },
            {
                name: 'should parse nucleotide deletion',
                input: 'nuc1:A123-',
                expected: { type: 'nucleotideMutations', value: new Deletion('nuc1', 'A', 123) },
            },
            {
                name: 'should parse nucleotide deletion without valueAtReference',
                input: 'nuc1:123-',
                expected: { type: 'nucleotideMutations', value: new Deletion('nuc1', undefined, 123) },
            },
            {
                name: 'should parse amino acid deletion',
                input: 'gene1:A123-',
                expected: { type: 'aminoAcidMutations', value: new Deletion('gene1', 'A', 123) },
            },
            {
                name: 'should parse amino acid deletion without valueAtReference',
                input: 'gene1:123-',
                expected: { type: 'aminoAcidMutations', value: new Deletion('gene1', undefined, 123) },
            },
            {
                name: 'should return null for deletion with segment not in reference genome',
                input: 'notInReferenceGenome:A123-',
                expected: null,
            },
        ],
        substitutions: [
            {
                name: 'should parse nucleotide substitution in single segmented reference genome, when no segment is given',
                input: 'A123T',
                expected: { type: 'nucleotideMutations', value: new Substitution(undefined, 'A', 'T', 123) },
            },
            {
                name: 'should parse substitution without valueAtReference',
                input: '123T',
                expected: { type: 'nucleotideMutations', value: new Substitution(undefined, undefined, 'T', 123) },
            },
            {
                name: 'should parse substitution with neither valueAtReference not substitutionValue',
                input: '123',
                expected: {
                    type: 'nucleotideMutations',
                    value: new Substitution(undefined, undefined, undefined, 123),
                },
            },
            {
                name: 'should parse a "no mutation" substitution',
                input: '123.',
                expected: { type: 'nucleotideMutations', value: new Substitution(undefined, undefined, '.', 123) },
            },
            {
                name: 'should parse nucleotide substitution',
                input: 'nuc1:A123T',
                expected: { type: 'nucleotideMutations', value: new Substitution('nuc1', 'A', 'T', 123) },
            },
            {
                name: 'should parse amino acid substitution',
                input: 'gene1:A123T',
                expected: { type: 'aminoAcidMutations', value: new Substitution('gene1', 'A', 'T', 123) },
            },
            {
                name: 'should return null for substitution with segment not in reference genome',
                input: 'notInReferenceGenome:A123T',
                expected: null,
            },
        ],
    };

    Object.entries(testCases).forEach(([type, cases]) => {
        describe(type, () => {
            cases.forEach(({ name, input, expected }) => {
                it(name, () => {
                    const result = parseAndValidateMutation(input, singleSegmentedReferenceGenome);

                    expect(result).deep.equals(expected);
                });
            });
        });
    });

    it('should return null for invalid mutation', () => {
        const result = parseAndValidateMutation('invalidMutation', singleSegmentedReferenceGenome);
        expect(result).toBe(null);
    });
});

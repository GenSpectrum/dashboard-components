import { describe, expect, it } from 'vitest';

import { parseAndValidateMutation } from './parseAndValidateMutation';
import { DeletionClass, InsertionClass, SubstitutionClass } from '../../utils/mutations';

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
                expected: { type: 'nucleotideInsertions', value: new InsertionClass(undefined, 10, 'ACGT') },
            },
            {
                name: 'should parse amino acid insertions',
                input: 'ins_gene1:10:ACGT',
                expected: { type: 'aminoAcidInsertions', value: new InsertionClass('gene1', 10, 'ACGT') },
            },
            {
                name: 'should parse amino acid insertions in all upper case',
                input: 'INS_GENE1:10:ACGT',
                expected: { type: 'aminoAcidInsertions', value: new InsertionClass('GENE1', 10, 'ACGT') },
            },
            {
                name: 'should parse amino acid insertions in all lower case',
                input: 'ins_gene1:10:acgt',
                expected: { type: 'aminoAcidInsertions', value: new InsertionClass('gene1', 10, 'acgt') },
            },
            {
                name: 'should parse amino acid insertion with LAPIS-style wildcard',
                input: 'ins_gene1:10:?AC?GT',
                expected: { type: 'aminoAcidInsertions', value: new InsertionClass('gene1', 10, '?AC?GT') },
            },
            {
                name: 'should parse amino acid insertion with SILO-style wildcard',
                input: 'ins_gene1:10:.*AC.*GT',
                expected: { type: 'aminoAcidInsertions', value: new InsertionClass('gene1', 10, '.*AC.*GT') },
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
                expected: { type: 'nucleotideMutations', value: new DeletionClass(undefined, 'A', 123) },
            },
            {
                name: 'should parse nucleotide deletion without valueAtReference when no segment is given',
                input: '123-',
                expected: { type: 'nucleotideMutations', value: new DeletionClass(undefined, undefined, 123) },
            },
            {
                name: 'should parse nucleotide deletion',
                input: 'nuc1:A123-',
                expected: { type: 'nucleotideMutations', value: new DeletionClass('nuc1', 'A', 123) },
            },
            {
                name: 'should parse nucleotide deletion without valueAtReference',
                input: 'nuc1:123-',
                expected: { type: 'nucleotideMutations', value: new DeletionClass('nuc1', undefined, 123) },
            },
            {
                name: 'should parse amino acid deletion',
                input: 'gene1:A123-',
                expected: { type: 'aminoAcidMutations', value: new DeletionClass('gene1', 'A', 123) },
            },
            {
                name: 'should parse amino acid deletion in all upper case',
                input: 'GENE1:A123-',
                expected: { type: 'aminoAcidMutations', value: new DeletionClass('GENE1', 'A', 123) },
            },
            {
                name: 'should parse amino acid deletion in all lower case',
                input: 'gene1:a123-',
                expected: { type: 'aminoAcidMutations', value: new DeletionClass('gene1', 'a', 123) },
            },
            {
                name: 'should parse amino acid deletion without valueAtReference',
                input: 'gene1:123-',
                expected: { type: 'aminoAcidMutations', value: new DeletionClass('gene1', undefined, 123) },
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
                expected: { type: 'nucleotideMutations', value: new SubstitutionClass(undefined, 'A', 'T', 123) },
            },
            {
                name: 'should parse substitution without valueAtReference',
                input: '123T',
                expected: { type: 'nucleotideMutations', value: new SubstitutionClass(undefined, undefined, 'T', 123) },
            },
            {
                name: 'should parse substitution with neither valueAtReference not substitutionValue',
                input: '123',
                expected: {
                    type: 'nucleotideMutations',
                    value: new SubstitutionClass(undefined, undefined, undefined, 123),
                },
            },
            {
                name: 'should parse a "no mutation" substitution',
                input: '123.',
                expected: { type: 'nucleotideMutations', value: new SubstitutionClass(undefined, undefined, '.', 123) },
            },
            {
                name: 'should parse nucleotide substitution',
                input: 'nuc1:A123T',
                expected: { type: 'nucleotideMutations', value: new SubstitutionClass('nuc1', 'A', 'T', 123) },
            },
            {
                name: 'should parse amino acid substitution',
                input: 'gene1:A123T',
                expected: { type: 'aminoAcidMutations', value: new SubstitutionClass('gene1', 'A', 'T', 123) },
            },
            {
                name: 'should parse amino acid substitution in all upper case',
                input: 'GENE1:A123T',
                expected: { type: 'aminoAcidMutations', value: new SubstitutionClass('GENE1', 'A', 'T', 123) },
            },
            {
                name: 'should parse amino acid substitution in all lower case',
                input: 'gene1:a123t',
                expected: { type: 'aminoAcidMutations', value: new SubstitutionClass('gene1', 'a', 't', 123) },
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

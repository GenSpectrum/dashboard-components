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
                input: 'ins_3:ACGT',
                expected: { type: 'nucleotideInsertions', value: new InsertionClass(undefined, 3, 'ACGT') },
            },
            {
                name: 'should parse amino acid insertions',
                input: 'ins_gene1:3:ACGT',
                expected: { type: 'aminoAcidInsertions', value: new InsertionClass('gene1', 3, 'ACGT') },
            },
            {
                name: 'should parse amino acid insertions in all upper case',
                input: 'INS_GENE1:3:ACGT',
                expected: { type: 'aminoAcidInsertions', value: new InsertionClass('GENE1', 3, 'ACGT') },
            },
            {
                name: 'should parse amino acid insertions in all lower case',
                input: 'ins_gene1:3:acgt',
                expected: { type: 'aminoAcidInsertions', value: new InsertionClass('gene1', 3, 'acgt') },
            },
            {
                name: 'should parse amino acid insertion with LAPIS-style wildcard',
                input: 'ins_gene1:3:?AC?GT',
                expected: { type: 'aminoAcidInsertions', value: new InsertionClass('gene1', 3, '?AC?GT') },
            },
            {
                name: 'should parse amino acid insertion with SILO-style wildcard',
                input: 'ins_gene1:3:.*AC.*GT',
                expected: { type: 'aminoAcidInsertions', value: new InsertionClass('gene1', 3, '.*AC.*GT') },
            },
            {
                name: 'should return null for insertion with segment not in reference genome',
                input: 'INS_notInReferenceGenome:3:ACGT',
                expected: null,
            },
            { name: 'should return null for insertion with missing position', input: 'ins_gene1:ACGT', expected: null },
            {
                name: 'should return null for insertion with position outside of reference genome',
                input: 'ins_gene1:10:ACGT',
                expected: null,
            },
        ],
        deletions: [
            {
                name: 'should parse nucleotide deletion in single segmented reference genome, when no segment is given',
                input: 'A3-',
                expected: { type: 'nucleotideMutations', value: new DeletionClass(undefined, 'A', 3) },
            },
            {
                name: 'should parse nucleotide deletion without valueAtReference when no segment is given',
                input: '3-',
                expected: { type: 'nucleotideMutations', value: new DeletionClass(undefined, undefined, 3) },
            },
            {
                name: 'should parse nucleotide deletion',
                input: 'nuc1:A3-',
                expected: { type: 'nucleotideMutations', value: new DeletionClass('nuc1', 'A', 3) },
            },
            {
                name: 'should parse nucleotide deletion without valueAtReference',
                input: 'nuc1:3-',
                expected: { type: 'nucleotideMutations', value: new DeletionClass('nuc1', undefined, 3) },
            },
            {
                name: 'should parse amino acid deletion',
                input: 'gene1:A3-',
                expected: { type: 'aminoAcidMutations', value: new DeletionClass('gene1', 'A', 3) },
            },
            {
                name: 'should parse amino acid deletion in all upper case',
                input: 'GENE1:A3-',
                expected: { type: 'aminoAcidMutations', value: new DeletionClass('GENE1', 'A', 3) },
            },
            {
                name: 'should parse amino acid deletion in all lower case',
                input: 'gene1:a3-',
                expected: { type: 'aminoAcidMutations', value: new DeletionClass('gene1', 'a', 3) },
            },
            {
                name: 'should parse amino acid deletion without valueAtReference',
                input: 'gene1:3-',
                expected: { type: 'aminoAcidMutations', value: new DeletionClass('gene1', undefined, 3) },
            },
            {
                name: 'should return null for deletion with segment not in reference genome',
                input: 'notInReferenceGenome:A3-',
                expected: null,
            },
            {
                name: 'should return null for deletion with position outside reference genome',
                input: 'gene1:A10-',
                expected: null,
            },
        ],
        substitutions: [
            {
                name: 'should parse nucleotide substitution in single segmented reference genome, when no segment is given',
                input: 'A3T',
                expected: { type: 'nucleotideMutations', value: new SubstitutionClass(undefined, 'A', 'T', 3) },
            },
            {
                name: 'should parse substitution without valueAtReference',
                input: '3T',
                expected: { type: 'nucleotideMutations', value: new SubstitutionClass(undefined, undefined, 'T', 3) },
            },
            {
                name: 'should parse substitution with neither valueAtReference not substitutionValue',
                input: '3',
                expected: {
                    type: 'nucleotideMutations',
                    value: new SubstitutionClass(undefined, undefined, undefined, 3),
                },
            },
            {
                name: 'should parse a "no mutation" substitution',
                input: '3.',
                expected: { type: 'nucleotideMutations', value: new SubstitutionClass(undefined, undefined, '.', 3) },
            },
            {
                name: 'should parse nucleotide substitution',
                input: 'nuc1:A3T',
                expected: { type: 'nucleotideMutations', value: new SubstitutionClass('nuc1', 'A', 'T', 3) },
            },
            {
                name: 'should parse amino acid substitution',
                input: 'gene1:A3T',
                expected: { type: 'aminoAcidMutations', value: new SubstitutionClass('gene1', 'A', 'T', 3) },
            },
            {
                name: 'should parse amino acid substitution in all upper case',
                input: 'GENE1:A3T',
                expected: { type: 'aminoAcidMutations', value: new SubstitutionClass('GENE1', 'A', 'T', 3) },
            },
            {
                name: 'should parse amino acid substitution in all lower case',
                input: 'gene1:a3t',
                expected: { type: 'aminoAcidMutations', value: new SubstitutionClass('gene1', 'a', 't', 3) },
            },
            {
                name: 'should return null for substitution with segment not in reference genome',
                input: 'notInReferenceGenome:A3T',
                expected: null,
            },
            {
                name: 'should return null for substitution with position outside reference genome',
                input: 'gene1:A10T',
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

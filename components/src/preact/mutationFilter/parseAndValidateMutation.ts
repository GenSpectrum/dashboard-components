import { type MutationFilterItem } from './mutation-filter';
import { sequenceTypeFromSegment } from './sequenceTypeFromSegment';
import type { ReferenceGenome } from '../../lapisApi/ReferenceGenome';
import type { SequenceType } from '../../types';
import { DeletionClass, InsertionClass, type Mutation, SubstitutionClass } from '../../utils/mutations';

export const parseAndValidateMutation = (
    value: string,
    referenceGenome: ReferenceGenome,
): MutationFilterItem | null => {
    const possibleMutation = parseMutation(value, referenceGenome);
    if (possibleMutation === null) {
        return null;
    }
    const sequenceType = getSequenceType(possibleMutation.type);
    const isOutside = isOutsideReferenceGenome(possibleMutation.value, referenceGenome, sequenceType);
    if (isOutside) {
        return null;
    }
    return possibleMutation;
};

const getSequenceType = (type: MutationFilterItem['type']) => {
    switch (type) {
        case 'nucleotideInsertions':
        case 'nucleotideMutations':
            return 'nucleotide';
        case 'aminoAcidInsertions':
        case 'aminoAcidMutations':
            return 'amino acid';
    }
};

const parseMutation = (value: string, referenceGenome: ReferenceGenome): MutationFilterItem | null => {
    const possibleInsertion = InsertionClass.parse(value);
    if (possibleInsertion !== null) {
        const sequenceType = sequenceTypeFromSegment(possibleInsertion.segment, referenceGenome);
        switch (sequenceType) {
            case 'nucleotide': {
                return { type: 'nucleotideInsertions', value: possibleInsertion };
            }
            case 'amino acid':
                return { type: 'aminoAcidInsertions', value: possibleInsertion };
            case undefined:
                return null;
        }
    }

    const possibleDeletion = DeletionClass.parse(value);
    if (possibleDeletion !== null) {
        const sequenceType = sequenceTypeFromSegment(possibleDeletion.segment, referenceGenome);
        switch (sequenceType) {
            case 'nucleotide':
                return { type: 'nucleotideMutations', value: possibleDeletion };
            case 'amino acid':
                return { type: 'aminoAcidMutations', value: possibleDeletion };
            case undefined:
                return null;
        }
    }

    const possibleSubstitution = SubstitutionClass.parse(value);
    if (possibleSubstitution !== null) {
        const sequenceType = sequenceTypeFromSegment(possibleSubstitution.segment, referenceGenome);
        switch (sequenceType) {
            case 'nucleotide': {
                return { type: 'nucleotideMutations', value: possibleSubstitution };
            }
            case 'amino acid': {
                return { type: 'aminoAcidMutations', value: possibleSubstitution };
            }

            case undefined:
                return null;
        }
    }

    return null;
};

function isOutsideReferenceGenome(mutation: Mutation, referenceGenome: ReferenceGenome, sequenceType: SequenceType) {
    const lengthOfSegment = getLengthOfSegment(mutation.segment, referenceGenome, sequenceType);
    if (lengthOfSegment === undefined) {
        return true;
    }

    return mutation.position >= lengthOfSegment;
}

function getLengthOfSegment(segment: string | undefined, referenceGenome: ReferenceGenome, sequenceType: SequenceType) {
    switch (sequenceType) {
        case 'nucleotide': {
            if (referenceGenome.nucleotideSequences.length === 1) {
                return referenceGenome.nucleotideSequences.at(0)?.sequence.length;
            }

            return referenceGenome.nucleotideSequences.find(
                (sequence) => sequence.name.toUpperCase() === segment?.toUpperCase(),
            )?.sequence.length;
        }
        case 'amino acid': {
            return referenceGenome.genes.find((gene) => gene.name.toUpperCase() === segment?.toUpperCase())?.sequence
                .length;
        }
    }
}

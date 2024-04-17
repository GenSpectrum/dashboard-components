import { sequenceTypeFromSegment } from './sequenceTypeFromSegment';
import type { ReferenceGenome } from '../../lapisApi/ReferenceGenome';
import { Deletion, Insertion, Substitution } from '../../utils/mutations';

export const parseMutation = (value: string, referenceGenome: ReferenceGenome) => {
    const possibleInsertion = Insertion.parse(value);
    if (possibleInsertion !== null) {
        const sequenceType = sequenceTypeFromSegment(possibleInsertion.segment, referenceGenome);
        switch (sequenceType) {
            case 'nucleotide':
                return { nucleotideInsertions: possibleInsertion };
            case 'amino acid':
                return { aminoAcidInsertions: possibleInsertion };
            case undefined:
                return null;
        }
    }

    const possibleDeletion = Deletion.parse(value);
    if (possibleDeletion !== null) {
        const sequenceType = sequenceTypeFromSegment(possibleDeletion.segment, referenceGenome);
        switch (sequenceType) {
            case 'nucleotide':
                return { nucleotideMutations: possibleDeletion };
            case 'amino acid':
                return { aminoAcidMutations: possibleDeletion };
            case undefined:
                return null;
        }
    }

    const possibleSubstitution = Substitution.parse(value);
    if (possibleSubstitution !== null) {
        const sequenceType = sequenceTypeFromSegment(possibleSubstitution.segment, referenceGenome);
        switch (sequenceType) {
            case 'nucleotide':
                return { nucleotideMutations: possibleSubstitution };
            case 'amino acid':
                return { aminoAcidMutations: possibleSubstitution };
            case undefined:
                return null;
        }
    }

    return null;
};

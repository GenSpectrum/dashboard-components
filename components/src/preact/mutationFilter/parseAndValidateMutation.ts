import { type SelectedFilters } from './mutation-filter';
import { sequenceTypeFromSegment } from './sequenceTypeFromSegment';
import type { ReferenceGenome } from '../../lapisApi/ReferenceGenome';
import { Deletion, Insertion, Substitution } from '../../utils/mutations';

type FilterUnion = {
    [MutationType in keyof SelectedFilters]: { type: MutationType; value: SelectedFilters[MutationType][number] };
}[keyof SelectedFilters];

export const parseAndValidateMutation = (value: string, referenceGenome: ReferenceGenome): FilterUnion | null => {
    const possibleInsertion = Insertion.parse(value);
    if (possibleInsertion !== null) {
        const sequenceType = sequenceTypeFromSegment(possibleInsertion.segment, referenceGenome);
        switch (sequenceType) {
            case 'nucleotide':
                return { type: 'nucleotideInsertions', value: possibleInsertion };
            case 'amino acid':
                return { type: 'aminoAcidInsertions', value: possibleInsertion };
            case undefined:
                return null;
        }
    }

    const possibleDeletion = Deletion.parse(value);
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

    const possibleSubstitution = Substitution.parse(value);
    if (possibleSubstitution !== null) {
        const sequenceType = sequenceTypeFromSegment(possibleSubstitution.segment, referenceGenome);
        switch (sequenceType) {
            case 'nucleotide':
                return { type: 'nucleotideMutations', value: possibleSubstitution };
            case 'amino acid':
                return { type: 'aminoAcidMutations', value: possibleSubstitution };
            case undefined:
                return null;
        }
    }

    return null;
};

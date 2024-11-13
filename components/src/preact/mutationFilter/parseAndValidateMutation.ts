import { type Option } from './asyncselect';
import { type SelectedFilters } from './mutation-filter';
import { sequenceTypeFromSegment } from './sequenceTypeFromSegment';
import type { ReferenceGenome } from '../../lapisApi/ReferenceGenome';
import { DeletionClass, InsertionClass, SubstitutionClass } from '../../utils/mutations';

type ParsedMutationFilter = {
    [MutationType in keyof SelectedFilters]: { type: MutationType; value: SelectedFilters[MutationType][number] };
}[keyof SelectedFilters];

export const parseAndValidateMutation = (
    value: string,
    referenceGenome: ReferenceGenome,
): ParsedMutationFilter | null => {
    const possibleInsertion = InsertionClass.parse(value);
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

export type SearchType =
    | 'nuc-insertion'
    | 'aa-insertion'
    | 'nuc-deletion'
    | 'aa-deletion'
    | 'nuc-mutation'
    | 'aa-mutation';

export type SearchOption = Option<SearchType>;

export const createLoadOptions = (referenceGenome: ReferenceGenome) => {
    return (value: string): SearchOption[] => {
        const possibleInsertion = InsertionClass.parse(value);
        if (possibleInsertion !== null) {
            const sequenceType = sequenceTypeFromSegment(possibleInsertion.segment, referenceGenome);
            switch (sequenceType) {
                case 'nucleotide':
                    return [
                        {
                            label: possibleInsertion.toString(),
                            value: possibleInsertion.toString(),
                            type: 'nuc-insertion',
                        },
                    ];
                case 'amino acid':
                    return [
                        {
                            label: possibleInsertion.toString(),
                            value: possibleInsertion.toString(),
                            type: 'aa-insertion',
                        },
                    ];
            }
        }

        const possibleDeletion = DeletionClass.parse(value);
        if (possibleDeletion !== null) {
            const sequenceType = sequenceTypeFromSegment(possibleDeletion.segment, referenceGenome);
            switch (sequenceType) {
                case 'nucleotide':
                    return [
                        {
                            label: possibleDeletion.toString(),
                            value: possibleDeletion.toString(),
                            type: 'nuc-deletion',
                        },
                    ];
                case 'amino acid':
                    return [
                        {
                            label: possibleDeletion.toString(),
                            value: possibleDeletion.toString(),
                            type: 'aa-deletion',
                        },
                    ];
            }
        }

        const possibleSubstitution = SubstitutionClass.parse(value);

        if (possibleSubstitution !== null) {
            const sequenceType = sequenceTypeFromSegment(possibleSubstitution.segment, referenceGenome);
            switch (sequenceType) {
                case 'nucleotide':
                    return [
                        {
                            label: possibleSubstitution.toString(),
                            value: possibleSubstitution.toString(),
                            type: 'nuc-mutation',
                        },
                    ];
                case 'amino acid':
                    return [
                        {
                            label: possibleSubstitution.toString(),
                            value: possibleSubstitution.toString(),
                            type: 'aa-mutation',
                        },
                    ];
            }
        }
        return [];
    };
};

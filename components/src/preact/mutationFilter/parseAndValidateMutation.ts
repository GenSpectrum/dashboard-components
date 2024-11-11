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

export type SearchType = 'nuc-insertion' | 'aa-insertion' | 'nuc-deletion' | 'aa-deletion' | 'nuc-mutation' | 'aa-mutation';

export type SearchOption = {
    label: string;
    value: string;
    type: SearchType;
  };

export const createLoadOptions = (referenceGenome: ReferenceGenome) => {
 return (value: string): SearchOption[] => {
    const suggestions: SearchOption[] = [];
    const possibleInsertion = InsertionClass.parse(value);
    console.log(possibleInsertion);
    if (possibleInsertion !== null) {
        const sequenceType = sequenceTypeFromSegment(possibleInsertion.segment, referenceGenome);
        let option: SearchOption;
        switch (sequenceType) {
            case 'nucleotide':
                option =  { label: value, value: value, type: 'nuc-insertion' };
                suggestions.push(option);
                break;
            case 'amino acid':
                option =  { label: value, value: value, type: 'aa-insertion'  };
                suggestions.push(option);
                break;
        }
    }

    const possibleDeletion = DeletionClass.parse(value);
    if (possibleDeletion !== null) {
        const sequenceType = sequenceTypeFromSegment(possibleDeletion.segment, referenceGenome);
        let option: SearchOption;
        switch (sequenceType) {
            case 'nucleotide':
                option =  { label: value, value: value, type: 'nuc-deletion' };
                suggestions.push(option);
                break;
            case 'amino acid':
                option =  { label: value, value: value, type: 'aa-deletion' };
                suggestions.push(option);
                break;
        }
    }

    const possibleSubstitution = SubstitutionClass.parse(value);
    console.log(possibleSubstitution);
    if (possibleSubstitution !== null) {
        const sequenceType = sequenceTypeFromSegment(possibleSubstitution.segment, referenceGenome);
        let option: SearchOption;
        switch (sequenceType) {
            case 'nucleotide':
                option =  { label: value, value: value, type: 'nuc-mutation' };
                suggestions.push(option);
                break;
            case 'amino acid':
                option =  { label: value, value: value, type: 'aa-mutation' };
                suggestions.push(option);
                break;
        }
    }

    return suggestions.slice(0, 20);
};
};

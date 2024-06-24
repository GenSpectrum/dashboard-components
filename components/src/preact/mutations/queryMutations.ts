import { queryInsertions } from '../../query/queryInsertions';
import { querySubstitutionsOrDeletions } from '../../query/querySubstitutionsOrDeletions';
import {
    type InsertionEntry,
    type LapisFilter,
    type MutationEntry,
    type SubstitutionOrDeletionEntry,
} from '../../types';
import { type DisplayedSegment } from '../components/SegmentSelector';
import { type DisplayedMutationType } from '../components/mutation-type-selector';

export async function queryMutationsData(
    lapisFilter: LapisFilter,
    sequenceType: 'nucleotide' | 'amino acid',
    lapis: string,
) {
    const substitutionsOrDeletions = (await querySubstitutionsOrDeletions(lapisFilter, sequenceType, lapis)).content;
    const insertions = (await queryInsertions(lapisFilter, sequenceType, lapis)).content;

    return {
        substitutionsOrDeletions,
        insertions,
    };
}

export function filterMutationsData(
    data: { insertions: InsertionEntry[]; substitutionsOrDeletions: SubstitutionOrDeletionEntry[] },
    displayedSegments: DisplayedSegment[],
    displayedMutationTypes: DisplayedMutationType[],
) {
    function bySelectedSegments(mutationEntry: MutationEntry) {
        if (mutationEntry.mutation.segment === undefined) {
            return true;
        }
        return displayedSegments.some(
            (displayedSegment) =>
                displayedSegment.segment === mutationEntry.mutation.segment && displayedSegment.checked,
        );
    }

    const byDisplayedMutationTypes = (mutationEntry: SubstitutionOrDeletionEntry) => {
        return displayedMutationTypes.some(
            (displayedMutationType) =>
                displayedMutationType.checked && displayedMutationType.type === mutationEntry.type,
        );
    };

    const filteredSubstitutionsOrDeletions = data.substitutionsOrDeletions.filter(bySelectedSegments);

    return {
        insertions: data.insertions.filter(bySelectedSegments),
        tableData: filteredSubstitutionsOrDeletions.filter(byDisplayedMutationTypes),
        gridData: filteredSubstitutionsOrDeletions,
    };
}

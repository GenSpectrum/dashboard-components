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
    variant: LapisFilter,
    sequenceType: 'nucleotide' | 'amino acid',
    lapis: string,
) {
    const substitutionsOrDeletions = (await querySubstitutionsOrDeletions(variant, sequenceType, lapis)).content;
    const insertions = (await queryInsertions(variant, sequenceType, lapis)).content;

    const mutationSegments = substitutionsOrDeletions
        .map((mutationEntry) => mutationEntry.mutation.segment)
        .filter((segment): segment is string => segment !== undefined);

    const segments = [...new Set(mutationSegments)];

    return {
        mutationsData: { substitutionsOrDeletions, insertions },
        segments,
    };
}

export function filterMutationsData(
    data: { insertions: InsertionEntry[]; substitutionsOrDeletions: SubstitutionOrDeletionEntry[] },
    displayedSegments: DisplayedSegment[],
    minProportion: number,
    maxProportion: number,
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

    const byProportion = (mutationEntry: SubstitutionOrDeletionEntry) => {
        return mutationEntry.proportion >= minProportion && mutationEntry.proportion <= maxProportion;
    };

    const byDisplayedMutationTypes = (mutationEntry: SubstitutionOrDeletionEntry) => {
        return displayedMutationTypes.some(
            (displayedMutationType) =>
                displayedMutationType.checked && displayedMutationType.type === mutationEntry.type,
        );
    };

    const filteredSubstitutionsOrDeletions = data.substitutionsOrDeletions
        .filter(byProportion)
        .filter(bySelectedSegments);

    return {
        insertions: data.insertions.filter(bySelectedSegments),
        tableData: filteredSubstitutionsOrDeletions.filter(byDisplayedMutationTypes),
        gridData: filteredSubstitutionsOrDeletions,
    };
}

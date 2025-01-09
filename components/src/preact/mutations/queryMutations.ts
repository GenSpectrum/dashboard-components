import { FetchAggregatedOperator } from '../../operator/FetchAggregatedOperator';
import { queryInsertions } from '../../query/queryInsertions';
import { querySubstitutionsOrDeletions } from '../../query/querySubstitutionsOrDeletions';
import type { InsertionEntry, LapisFilter, MutationEntry, SubstitutionOrDeletionEntry } from '../../types';
import { type DisplayedMutationType } from '../components/mutation-type-selector';
import { type DisplayedSegment } from '../components/segment-selector';

export type QueriedMutationsData = {
    insertions: InsertionEntry[];
    substitutionsOrDeletions: SubstitutionOrDeletionEntry[];
    baselineSubstitutionsOrDeletions: SubstitutionOrDeletionEntry[] | undefined;
    overallVariantCount: number;
};

export async function queryMutationsData(
    lapisFilter: LapisFilter,
    baselineLapisFilter: LapisFilter | undefined,
    sequenceType: 'nucleotide' | 'amino acid',
    lapis: string,
): Promise<QueriedMutationsData> {
    const substitutionsOrDeletions = (await querySubstitutionsOrDeletions(lapisFilter, sequenceType, lapis)).content;
    const baselineSubstitutionsOrDeletions =
        baselineLapisFilter === undefined
            ? undefined
            : (await querySubstitutionsOrDeletions(baselineLapisFilter, sequenceType, lapis)).content;
    const insertions = (await queryInsertions(lapisFilter, sequenceType, lapis)).content;

    const aggregatedData = await new FetchAggregatedOperator<Record<string, string | null | number>>(
        lapisFilter,
        [],
    ).evaluate(lapis);
    if (aggregatedData.content.length === 0) {
        throw new Error('No aggregated data found for the given filters - did LAPIS respond properly?');
    }
    const overallVariantCount = aggregatedData.content[0].count;

    return {
        substitutionsOrDeletions,
        baselineSubstitutionsOrDeletions,
        insertions,
        overallVariantCount,
    };
}

export function filterMutationsData(
    data: QueriedMutationsData,
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
        baselineSubstitutionsOrDeletions: data.baselineSubstitutionsOrDeletions,
    };
}

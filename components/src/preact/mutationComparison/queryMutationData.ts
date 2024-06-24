import { querySubstitutionsOrDeletions } from '../../query/querySubstitutionsOrDeletions';
import { type NamedLapisFilter, type SubstitutionOrDeletionEntry } from '../../types';
import { type DisplayedSegment } from '../components/SegmentSelector';
import { type DisplayedMutationType } from '../components/mutation-type-selector';

export type MutationData = {
    displayName: string;
    data: SubstitutionOrDeletionEntry[];
};

export async function queryMutationData(
    lapisFilters: NamedLapisFilter[],
    sequenceType: 'nucleotide' | 'amino acid',
    lapis: string,
) {
    const mutationData = await Promise.all(
        lapisFilters.map(async (filter) => {
            return {
                displayName: filter.displayName,
                data: (await querySubstitutionsOrDeletions(filter.lapisFilter, sequenceType, lapis)).content,
            };
        }),
    );
    return { mutationData };
}

export function filterMutationData(
    data: MutationData[],
    displayedSegments: DisplayedSegment[],
    displayedMutationTypes: DisplayedMutationType[],
) {
    const byDisplayedSegments = (mutationEntry: SubstitutionOrDeletionEntry) => {
        if (mutationEntry.mutation.segment === undefined) {
            return true;
        }
        return displayedSegments.some(
            (displayedSegment) =>
                displayedSegment.segment === mutationEntry.mutation.segment && displayedSegment.checked,
        );
    };
    const byDisplayedMutationTypes = (mutationEntry: SubstitutionOrDeletionEntry) => {
        return displayedMutationTypes.some(
            (displayedMutationType) =>
                displayedMutationType.checked && displayedMutationType.type === mutationEntry.type,
        );
    };

    return data.map((mutationEntry) => ({
        displayName: mutationEntry.displayName,
        data: mutationEntry.data.filter(byDisplayedSegments).filter(byDisplayedMutationTypes),
    }));
}

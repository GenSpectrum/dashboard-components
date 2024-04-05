import { type DisplayedMutationType, type MutationComparisonVariant } from './mutation-comparison';
import { type MutationEntry } from '../../operator/FetchMutationsOperator';
import { queryMutations } from '../../query/queryMutations';
import { type DisplayedSegment } from '../components/SegmentSelector';

export type MutationData = {
    displayName: string;
    data: MutationEntry[];
};

export async function queryMutationData(
    variants: MutationComparisonVariant[],
    sequenceType: 'nucleotide' | 'amino acid',
    lapis: string,
) {
    const mutationData = await Promise.all(
        variants.map(async (variant) => {
            return {
                displayName: variant.displayName,
                data: (await queryMutations(variant.lapisFilter, sequenceType, lapis)).content,
            };
        }),
    );

    const mutationSegments = mutationData[0].data
        .map((mutationEntry) => mutationEntry.mutation.segment)
        .filter((segment): segment is string => segment !== undefined);

    const segments = [...new Set(mutationSegments)];
    return { mutationData, segments };
}

export function filterMutationData(
    data: MutationData[],
    displayedSegments: DisplayedSegment[],
    displayedMutationTypes: DisplayedMutationType[],
) {
    const byDisplayedSegments = (mutationEntry: MutationEntry) => {
        if (mutationEntry.mutation.segment === undefined) {
            return true;
        }
        return displayedSegments.some(
            (displayedSegment) =>
                displayedSegment.segment === mutationEntry.mutation.segment && displayedSegment.checked,
        );
    };
    const byDisplayedMutationTypes = (mutationEntry: MutationEntry) => {
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

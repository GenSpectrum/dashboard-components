import { type SubstitutionOrDeletionEntry } from '../../types';
import { type ProportionInterval } from '../components/proportion-selector';

export function getMutationsTableData(
    data: SubstitutionOrDeletionEntry[],
    baselineSubstitutionsOrDeletions: SubstitutionOrDeletionEntry[] | undefined,
    overallVariantCount: number,
    proportionInterval: ProportionInterval,
) {
    const byProportion = (mutationEntry: SubstitutionOrDeletionEntry) => {
        return mutationEntry.proportion >= proportionInterval.min && mutationEntry.proportion <= proportionInterval.max;
    };

    const tableData = data.filter(byProportion).map((mutationEntry) => {
        return {
            mutation: mutationEntry.mutation,
            type: mutationEntry.type,
            count: mutationEntry.count,
            proportion: mutationEntry.proportion,
        };
    });

    if (baselineSubstitutionsOrDeletions === undefined) {
        return tableData;
    }

    const baselineMutationCounts = baselineSubstitutionsOrDeletions.reduce((baselineMutationCounts, mutation) => {
        baselineMutationCounts.set(mutation.mutation.code, mutation.count);
        return baselineMutationCounts;
    }, new Map<string, number>());

    return tableData.map((datum) => {
        const baselineMutationCount = baselineMutationCounts.get(datum.mutation.code) ?? 0;
        const jaccardSimilarity = calculateJaccardSimilarity(overallVariantCount, baselineMutationCount, datum.count);

        return {
            ...datum,
            jaccardSimilarity,
        };
    });
}

/**
 * Taken from https://github.com/GenSpectrum/cov-spectrum-website/blob/9372a618dfd2d0dc5106fb07dce4e9f02fe24471/src/components/VariantMutations.tsx#L484-L486
 *
 * @param variantCount The number of sequences of the variant
 * @param mutationCount The number of sequences with the mutation
 * @param variantWithMutationCount The number of sequences that belong to the variant and have the mutation
 */
const calculateJaccardSimilarity = (variantCount: number, mutationCount: number, variantWithMutationCount: number) => {
    return variantWithMutationCount / (variantCount + mutationCount - variantWithMutationCount);
};

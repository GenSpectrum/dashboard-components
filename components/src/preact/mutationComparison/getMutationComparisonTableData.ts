import { type MutationData } from './queryMutationData';
import { type Dataset } from '../../operator/Dataset';

type Proportions = {
    [displayName: string]: number;
};

export function getMutationComparisonTableData(data: Dataset<MutationData>) {
    const mutationsToProportions = new Map<string, Proportions>();

    for (const mutationData of data.content) {
        for (const mutationEntry of mutationData.data) {
            const mutation = mutationEntry.mutation.toString();
            const proportions = mutationsToProportions.get(mutation) || {};
            proportions[mutationData.displayName] = mutationEntry.proportion;
            mutationsToProportions.set(mutation, proportions);
        }
    }

    return [...mutationsToProportions.entries()].map(([mutation, proportions]) => {
        return {
            mutation,
            ...data.content
                .map((mutationData) => {
                    return {
                        [`${mutationData.displayName} prevalence`]: proportions[mutationData.displayName] || 0,
                    };
                })
                .reduce((acc, val) => ({ ...acc, ...val }), {}),
        };
    });
}

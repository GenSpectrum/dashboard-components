import { type MutationData } from './queryMutationData';
import { type Dataset } from '../../operator/Dataset';
import { type ProportionInterval } from '../components/proportion-selector';

type Proportions = {
    [displayName: string]: number;
};

export function getMutationComparisonTableData(data: Dataset<MutationData>, proportionInterval: ProportionInterval) {
    const mutationsToProportions = new Map<string, Proportions>();

    for (const mutationData of data.content) {
        for (const mutationEntry of mutationData.data) {
            const mutation = mutationEntry.mutation.toString();
            const proportions = mutationsToProportions.get(mutation) || {};
            proportions[mutationData.displayName] = mutationEntry.proportion;
            mutationsToProportions.set(mutation, proportions);
        }
    }

    return [...mutationsToProportions.entries()]
        .map(([mutation, proportions]) => {
            return {
                mutation,
                ...data.content
                    .map((mutationData) => {
                        return {
                            [`${mutationData.displayName} prevalence`]: proportions[mutationData.displayName] || 0,
                        };
                    })
                    .reduce((acc, val) => ({ ...acc, ...val }), {}),
            } as { mutation: string } & Proportions;
        })
        .filter((row) =>
            Object.values(row).some(
                (value) =>
                    typeof value === 'number' && value >= proportionInterval.min && value <= proportionInterval.max,
            ),
        );
}

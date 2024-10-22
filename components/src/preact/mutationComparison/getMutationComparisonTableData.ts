import { type MutationData } from './queryMutationData';
import { type Dataset } from '../../operator/Dataset';
import { type DeletionClass, type SubstitutionClass } from '../../utils/mutations';
import { type ProportionInterval } from '../components/proportion-selector';

type Proportions = {
    [displayName: string]: number;
};

type MutationComparisonRow = {
    mutation: SubstitutionClass | DeletionClass;
    proportions: Proportions;
};

export function getMutationComparisonTableData(data: Dataset<MutationData>, proportionInterval: ProportionInterval) {
    const mutationsToProportions = new Map<string, MutationComparisonRow>();

    for (const mutationData of data.content) {
        for (const mutationEntry of mutationData.data) {
            const mutationKey = mutationEntry.mutation.toString();
            const existingRow = mutationsToProportions.get(mutationKey);

            if (!existingRow) {
                mutationsToProportions.set(
                    mutationKey,
                    initializeMutationRow(mutationEntry.mutation, mutationData.displayName, mutationEntry.proportion),
                );
            } else {
                existingRow.proportions = updateProportions(
                    existingRow.proportions,
                    mutationData.displayName,
                    mutationEntry.proportion,
                );
                mutationsToProportions.set(mutationKey, existingRow);
            }
        }
    }

    return [...mutationsToProportions.values()]
        .map((row) => {
            return {
                mutation: row.mutation,
                ...data.content
                    .map((mutationData) => {
                        return {
                            [`${mutationData.displayName} prevalence`]: row.proportions[mutationData.displayName] || 0,
                        };
                    })
                    .reduce((acc, val) => ({ ...acc, ...val }), {}),
            } as { mutation: SubstitutionClass | DeletionClass } & Proportions;
        })
        .filter((row) =>
            Object.values(row).some(
                (value) =>
                    typeof value === 'number' && value >= proportionInterval.min && value <= proportionInterval.max,
            ),
        );
}

function initializeMutationRow(
    mutation: SubstitutionClass | DeletionClass,
    displayName: string,
    proportion: number,
): MutationComparisonRow {
    return {
        mutation,
        proportions: {
            [displayName]: proportion,
        },
    };
}

function updateProportions(proportions: Proportions, displayName: string, proportion: number): Proportions {
    return { ...proportions, [displayName]: proportion };
}

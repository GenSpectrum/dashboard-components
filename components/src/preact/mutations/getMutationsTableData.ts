import { type SubstitutionOrDeletionEntry } from '../../types';
import { type ProportionInterval } from '../components/proportion-selector';

export function getMutationsTableData(data: SubstitutionOrDeletionEntry[], proportionInterval: ProportionInterval) {
    const byProportion = (mutationEntry: SubstitutionOrDeletionEntry) => {
        return mutationEntry.proportion >= proportionInterval.min && mutationEntry.proportion <= proportionInterval.max;
    };

    return data.filter(byProportion).map((mutationEntry) => {
        return {
            mutation: mutationEntry.mutation.toString(),
            type: mutationEntry.type,
            count: mutationEntry.count,
            proportion: mutationEntry.proportion,
        };
    });
}

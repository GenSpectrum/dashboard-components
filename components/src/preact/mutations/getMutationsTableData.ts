import { type SubstitutionOrDeletionEntry } from '../../types';

export function getMutationsTableData(data: SubstitutionOrDeletionEntry[]) {
    return data.map((mutationEntry) => {
        return {
            mutation: mutationEntry.mutation.toString(),
            type: mutationEntry.type,
            count: mutationEntry.count,
            proportion: mutationEntry.proportion,
        };
    });
}

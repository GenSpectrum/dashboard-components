import { type InsertionEntry } from '../../types';

export function getInsertionsTableData(data: InsertionEntry[]) {
    return data.map((mutationEntry) => {
        return {
            insertion: mutationEntry.mutation.toString(),
            count: mutationEntry.count,
        };
    });
}

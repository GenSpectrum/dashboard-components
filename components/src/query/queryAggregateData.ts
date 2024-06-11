import { FetchAggregatedOperator } from '../operator/FetchAggregatedOperator';
import { SortOperator } from '../operator/SortOperator';
import { type InitialSort } from '../preact/aggregatedData/aggregate';
import { type LapisFilter } from '../types';

export type AggregateData = (Record<string, string | null | number | boolean> & {
    count: number;
    proportion: number;
})[];

const compareAscending = (a: string | null | number, b: string | null | number) => {
    if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
    }

    const strA = a != null ? String(a) : '';
    const strB = b != null ? String(b) : '';

    return strA.localeCompare(strB);
};

export async function queryAggregateData(
    variant: LapisFilter,
    fields: string[],
    lapis: string,
    initialSort: InitialSort = { field: 'count', direction: 'descending' },
    signal?: AbortSignal,
) {
    const validSortFields = ['count', 'proportion', ...fields];
    if (!validSortFields.includes(initialSort.field)) {
        throw new Error(`InitialSort field not in fields. Valid fields are: ${validSortFields.join(', ')}`);
    }

    const fetchData = new FetchAggregatedOperator<Record<string, string | null | number>>(variant, fields);
    const sortData = new SortOperator(fetchData, (a, b) => {
        return initialSort.direction === 'ascending'
            ? compareAscending(a[initialSort.field], b[initialSort.field])
            : compareAscending(b[initialSort.field], a[initialSort.field]);
    });
    const data = (await sortData.evaluate(lapis, signal)).content;

    const total = data.reduce((acc, row) => acc + row.count, 0);

    return data.map(
        (row) =>
            ({
                ...row,
                proportion: row.count / total,
            }) as Record<string, string | null | number | boolean> & {
                count: number;
                proportion: number;
            },
    );
}

import { FetchAggregatedOperator } from '../operator/FetchAggregatedOperator';
import { SortOperator } from '../operator/SortOperator';
import { type LapisFilter } from '../types';

export type InitialSort = { field: string; direction: 'ascending' | 'descending' };

export type AggregateData = (Record<string, string | null | number | boolean> & {
    count: number;
    proportion: number;
})[];

export const compareAscending = (a: string | null | number | boolean, b: string | null | number | boolean) => {
    if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
    }

    const strA = a != null ? String(a) : '';
    const strB = b != null ? String(b) : '';

    return strA.localeCompare(strB);
};

export async function queryAggregateData(
    lapisFilter: LapisFilter,
    fields: string[],
    lapis: string,
    signal?: AbortSignal,
) {
    const fetchData = new FetchAggregatedOperator<Record<string, string | null | number>>(lapisFilter, fields);
    const sortData = new SortOperator(fetchData, (a, b) => compareAscending(b.count, a.count));
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

import { FetchAggregatedOperator } from '../operator/FetchAggregatedOperator';
import { type LapisFilter } from '../types';

export type AggregateData = (Record<string, string | null | number | boolean> & {
    count: number;
    proportion: number;
})[];

export async function queryAggregateData(variant: LapisFilter, fields: string[], lapis: string, signal?: AbortSignal) {
    const fetchData = new FetchAggregatedOperator<Record<string, string | null | number>>(variant, fields);
    const data = (await fetchData.evaluate(lapis, signal)).content;

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

import { FetchAggregatedOperator } from '../../operator/FetchAggregatedOperator';
import type { LapisFilter } from '../../types';

export async function fetchLineageAutocompleteList({
    lapis,
    field,
    signal,
    lapisFilter,
}: {
    lapis: string;
    field: string;
    lapisFilter?: LapisFilter;
    signal?: AbortSignal;
}) {
    const fetchAggregatedOperator = new FetchAggregatedOperator<Record<string, string>>(lapisFilter ?? {}, [field]);

    const data = (await fetchAggregatedOperator.evaluate(lapis, signal)).content;

    return data.flatMap((item) => [item[field], `${item[field]}*`]).sort();
}

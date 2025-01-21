import { FetchAggregatedOperator } from '../../operator/FetchAggregatedOperator';
import { type LapisFilter } from '../../types';

export async function fetchStringAutocompleteList({
    lapis,
    field,
    lapisFilter,
    signal,
}: {
    lapis: string;
    field: string;
    lapisFilter?: LapisFilter;
    signal?: AbortSignal;
}) {
    const fetchAggregatedOperator = new FetchAggregatedOperator<Record<string, string | null>>(lapisFilter ?? {}, [
        field,
    ]);

    const data = (await fetchAggregatedOperator.evaluate(lapis, signal)).content;

    return data
        .map((item) => ({ count: item.count, value: item[field] }))
        .filter((item): item is { count: number; value: string } => item.value !== null)
        .sort((a, b) => {
            if (a.value === null) {
                return 1;
            }
            if (b.value === null) {
                return -1;
            }

            return a.value.localeCompare(b.value);
        });
}

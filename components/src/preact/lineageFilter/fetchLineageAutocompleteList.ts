import { FetchAggregatedOperator } from '../../operator/FetchAggregatedOperator';

export async function fetchLineageAutocompleteList(lapis: string, field: string, signal?: AbortSignal) {
    const fetchAggregatedOperator = new FetchAggregatedOperator<Record<string, string>>({}, [field]);

    const data = (await fetchAggregatedOperator.evaluate(lapis, signal)).content;

    return data.flatMap((item) => [item[field], `${item[field]}*`]).sort();
}

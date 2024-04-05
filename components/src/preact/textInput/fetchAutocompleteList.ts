import { FetchAggregatedOperator } from '../../operator/FetchAggregatedOperator';

export async function fetchAutocompleteList(lapis: string, field: string, signal?: AbortSignal) {
    const fetchAggregatedOperator = new FetchAggregatedOperator<Record<string, string>>({}, [field]);

    const data = (await fetchAggregatedOperator.evaluate(lapis, signal)).content;

    return data.map((item) => item[field]);
}

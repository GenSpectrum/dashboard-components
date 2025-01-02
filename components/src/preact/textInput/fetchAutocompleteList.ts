import { FetchAggregatedOperator } from '../../operator/FetchAggregatedOperator';
import { type LapisFilter } from '../../types';

export async function fetchAutocompleteList(
    lapisFilter: LapisFilter,
    lapis: string,
    field: string,
    signal?: AbortSignal,
) {
    const fetchAggregatedOperator = new FetchAggregatedOperator<Record<string, string>>(lapisFilter, [field]);

    const data = (await fetchAggregatedOperator.evaluate(lapis, signal)).content;

    return sortDataByField(data, field);
}

const sortDataByField = (data: (Record<string, string | null> & { count: number })[], field: string) => {
    return data.sort((a, b) => {
        const aValue = a[field];
        const bValue = b[field];

        if ((aValue === undefined || aValue === null) && bValue !== undefined && bValue !== null) {
            return 1;
        }
        if ((bValue === undefined || bValue === null) && aValue !== undefined && aValue !== null) {
            return -1;
        }
        if ((aValue === undefined || aValue === null) && (bValue === undefined || bValue === null)) {
            return 0;
        }

        // Compare values when both are non-null and defined
        return aValue!.localeCompare(bValue!);
    });
};

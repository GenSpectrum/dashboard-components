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

    const filteredData = data.filter((record) => record[field] !== null);

    return sortDataByField(filteredData, field);
}

const sortDataByField = (data: (Record<string, string> & { count: number })[], field: string) => {
    return data.sort((a, b) => {
        const aValue = a[field];
        const bValue = b[field];

        if (aValue === undefined && bValue !== undefined) {
            return 1;
        }
        if (bValue === undefined && aValue !== undefined) {
            return -1;
        }
        if (aValue === undefined && bValue === undefined) {
            return 0;
        }

        return aValue.localeCompare(bValue);
    });
};

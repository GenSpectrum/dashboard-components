import { FetchAggregatedOperator } from '../../operator/FetchAggregatedOperator';
import { type LapisFilter } from '../../types';

type GroupType = Record<string, string> & { count: number };

export async function fetchLineageAutocompleteList(
    lapisFilter: LapisFilter,
    lapis: string,
    field: string,
    signal?: AbortSignal,
) {
    const fetchAggregatedOperator = new FetchAggregatedOperator<Record<string, string>>(lapisFilter, [field]);

    const data = (await fetchAggregatedOperator.evaluate(lapis, signal)).content;

    const output: (Record<string, string> & {
        count: number;
    })[] = [];

    const findOrCreateGroup = (pattern: string) => {
        let group = output.find((item) => item[field] === pattern) as GroupType | undefined;
        if (!group) {
            group = { count: 0, [field]: pattern } as GroupType;
            output.push(group);
        }
        return group;
    };

    data.forEach((item) => {
        if (!item[field]) {
            return;
        }
        const parts = item[field].split('.');
        for (let step = 0; step < parts.length; step++) {
            const section = `${parts.slice(0, step + 1).join('.')}*`;
            const group = findOrCreateGroup(section);
            group.count += item.count;
        }
        const group = findOrCreateGroup(item[field]);
        group.count += item.count;
    });

    return sortDataByField(output, field);
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

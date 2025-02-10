import { FetchAggregatedOperator } from '../../operator/FetchAggregatedOperator';
import type { LapisFilter, LapisLocationFilter } from '../../types';

export type LocationEntry = {
    value: LapisLocationFilter;
    count: number;
};

export async function fetchAutocompletionList({
    fields,
    lapis,
    signal,
    lapisFilter,
}: {
    fields: string[];
    lapis: string;
    lapisFilter?: LapisFilter;
    signal?: AbortSignal;
}): Promise<LocationEntry[]> {
    const helpersThatOverwriteAValueToItsAncestor = fields.map((_, i) =>
        fields.slice(i + 1).reduce((acc, field) => ({ ...acc, [field]: null }), {}),
    );

    const fetchAggregatedOperator = new FetchAggregatedOperator<Record<string, string | null>>(
        lapisFilter ?? {},
        fields,
    );

    const data = (await fetchAggregatedOperator.evaluate(lapis, signal)).content;

    const locationValues = data
        .map((entry) => ({
            value: fields.reduce((acc, field) => ({ ...acc, [field]: entry[field] }), {}),
            count: entry.count,
        }))
        .reduce((mapOfAllHierarchiesAndCounts, entry) => {
            return addValueAndAllAncestorsToMap(
                entry,
                helpersThatOverwriteAValueToItsAncestor,
                mapOfAllHierarchiesAndCounts,
            );
        }, new Map<string, number>());

    return [...locationValues]
        .map<EntryWithNullValues>(([json, count]) => ({
            value: JSON.parse(json) as Record<string, string | null>,
            count,
        }))
        .sort(compareLocationEntries(fields))
        .map(({ value, count }) => ({
            value: fields.reduce((acc, field) => ({ ...acc, [field]: value[field] ?? undefined }), {}),
            count,
        }));
}

function addValueAndAllAncestorsToMap(
    { value, count }: LocationEntry,
    helpersThatOverwriteAValueToItsAncestor: Record<string, null>[],
    mapOfAllHierarchiesAndCounts: Map<string, number>,
) {
    const keysOfAllHierarchyLevels = new Set(
        helpersThatOverwriteAValueToItsAncestor
            .map((overwriteValues) => ({ ...value, ...overwriteValues }))
            .map((value) => JSON.stringify(value)),
    );

    for (const key of keysOfAllHierarchyLevels) {
        mapOfAllHierarchiesAndCounts.set(key, (mapOfAllHierarchiesAndCounts.get(key) ?? 0) + count);
    }

    return mapOfAllHierarchiesAndCounts;
}

type EntryWithNullValues = {
    value: Record<string, string | null>;
    count: number;
};

function compareLocationEntries(fields: string[]) {
    return (a: EntryWithNullValues, b: EntryWithNullValues) => {
        for (const field of fields) {
            const valueA = a.value[field];
            const valueB = b.value[field];
            if (valueA === valueB) {
                continue;
            }
            if (valueA === null) {
                return -1;
            }
            if (valueB === null) {
                return 1;
            }
            return valueA < valueB ? -1 : 1;
        }
        return 0;
    };
}

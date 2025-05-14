import { fetchLineageDefinition } from '../../lapisApi/lapisApi';
import { FetchAggregatedOperator } from '../../operator/FetchAggregatedOperator';
import type { LapisFilter } from '../../types';

export async function fetchLineageAutocompleteList({
    lapisUrl,
    lapisField,
    lapisFilter,
    signal,
}: {
    lapisUrl: string;
    lapisField: string;
    lapisFilter?: LapisFilter;
    signal?: AbortSignal;
}): Promise<LineageItem[]> {
    const [countsByLineage, lineageTree] = await Promise.all([
        getCountsByLineage({
            lapisUrl,
            lapisField,
            lapisFilter,
            signal,
        }),
        getLineageTree({ lapisUrl, lapisField, signal }),
    ]);

    return Array.from(lineageTree.keys())
        .sort((a, b) => a.localeCompare(b))
        .map((lineage) => {
            return [
                {
                    lineage,
                    count: countsByLineage.get(lineage) ?? 0,
                },
                {
                    lineage: `${lineage}*`,
                    count: getCountsIncludingSublineages(lineage, lineageTree, countsByLineage),
                },
            ];
        })
        .flat();
}

export type LineageItem = { lineage: string; count: number };

async function getCountsByLineage({
    lapisUrl,
    lapisField,
    lapisFilter,
    signal,
}: {
    lapisUrl: string;
    lapisField: string;
    lapisFilter?: LapisFilter;
    signal?: AbortSignal;
}) {
    const fetchAggregatedOperator = new FetchAggregatedOperator<Record<string, string>>(lapisFilter ?? {}, [
        lapisField,
    ]);

    const countsByLineageArray = (await fetchAggregatedOperator.evaluate(lapisUrl, signal)).content;
    return new Map<string, number>(countsByLineageArray.map((value) => [value[lapisField], value.count]));
}

async function getLineageTree({
    lapisUrl,
    lapisField,
    signal,
}: {
    lapisUrl: string;
    lapisField: string;
    signal?: AbortSignal;
}) {
    const lineageDefinitions = await fetchLineageDefinition({ lapisUrl, lapisField, signal });

    const lineageTree = new Map<string, { children: string[] }>();

    Object.entries(lineageDefinitions).forEach(([lineage, definition]) => {
        if (!lineageTree.has(lineage)) {
            lineageTree.set(lineage, { children: [] });
        }

        definition.parents?.forEach((parent) => {
            const parentChildren = lineageTree.get(parent)?.children;

            const newParentChildren = parentChildren ? [...parentChildren, lineage] : [lineage];

            lineageTree.set(parent, { children: newParentChildren });
        });
    });

    return lineageTree;
}

function getCountsIncludingSublineages(
    lineage: string,
    lineageTree: Map<string, { children: string[] }>,
    countsByLineage: Map<string, number>,
): number {
    const descendants = getAllDescendants(lineage, lineageTree);

    const countOfChildren = [...descendants].reduce((sum, child) => {
        return sum + (countsByLineage.get(child) ?? 0);
    }, 0);
    const countLineage = countsByLineage.get(lineage) ?? 0;

    return countOfChildren + countLineage;
}

function getAllDescendants(lineage: string, lineageTree: Map<string, { children: string[] }>): Set<string> {
    const children = lineageTree.get(lineage)?.children ?? [];

    const childrenOfChildren = children.flatMap((child) => {
        return getAllDescendants(child, lineageTree);
    });

    return new Set([...children, ...childrenOfChildren.flatMap((child) => Array.from(child))]);
}

import { type LineageDefinitionResponse } from '../../lapisApi/LineageDefinition';
import { fetchLineageDefinition } from '../../lapisApi/lapisApi';
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

    const countsByLineageArray = (await fetchAggregatedOperator.evaluate(lapis, signal)).content;
    const countsByLineage = countsByLineageArray.reduce(
        (acc, value) => acc.set(value[field], value.count),
        new Map<string, number>(),
    );

    const lineageDefinitions = await fetchLineageDefinition(lapis, field, signal);

    const lineageTree = getLineageTree(lineageDefinitions);

    return Object.keys(lineageDefinitions)
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
        .sort((a, b) => a[0].lineage.localeCompare(b[0].lineage))
        .flat();
}

function getLineageTree(lineageDefinitions: LineageDefinitionResponse) {
    const lineageTree = new Map<string, { children: string[] }>();

    Object.entries(lineageDefinitions).forEach(([lineage, definition]) => {
        lineageTree.set(lineage, { children: [] });

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
    const descendents = new Set(getAllDescendents(lineage, lineageTree));

    const countOfChildren = [...descendents].reduce((sum, child) => {
        return sum + (countsByLineage.get(child) ?? 0);
    }, 0);
    const countLineage = countsByLineage.get(lineage) ?? 0;

    return countOfChildren + countLineage;
}

function getAllDescendents(lineage: string, lineageTree: Map<string, { children: string[] }>): string[] {
    const children = lineageTree.get(lineage)?.children ?? [];

    const childrenOfChildren = children.flatMap((child) => {
        return getAllDescendents(child, lineageTree);
    });

    return [...children, ...childrenOfChildren];
}

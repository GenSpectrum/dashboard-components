import { fetchLineageDefinition } from '../../lapisApi/lapisApi';
import { FetchAggregatedOperator } from '../../operator/FetchAggregatedOperator';
import type { LapisFilter } from '../../types';

export type LineageItem = { lineage: string; count: number };

/**
 * Generates the autocomplete list for lineage search. It includes:
 * - Each lineage from the definition, with and without a wildcard ("BA.3.2.1" and "BA.3.2.1*")
 * - Each alias as a direct option with and without a wildcard ("BA.3.2" and "BA.3.2*"),
 *   deduplicated case-insensitively to avoid showing noise from lowercase variants
 */
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
    const [countsByLineage, { lineageTree, aliasMapping }] = await Promise.all([
        getCountsByLineage({
            lapisUrl,
            lapisField,
            lapisFilter,
            signal,
        }),
        getLineageTreeAndAliases({ lapisUrl, lapisField, signal }),
    ]);

    // Combine actual lineages with their wildcard versions
    const actualLineageItems = Array.from(lineageTree.keys()).flatMap((lineage) => [
        {
            lineage,
            count: countsByLineage.get(lineage) ?? 0,
        },
        {
            lineage: `${lineage}*`,
            count: getCountsIncludingSublineages(lineage, lineageTree, countsByLineage),
        },
    ]);

    // Add alias items (exact and wildcard) for aliases that are meaningfully different from their
    // canonical lineage. Deduplicated case-insensitively to avoid noise from case variants.
    const seenAliasesUpper = new Set<string>(Array.from(lineageTree.keys()).map((k) => k.toUpperCase()));
    const aliasItems = Array.from(aliasMapping.entries()).flatMap(([canonicalLineage, aliases]) =>
        aliases.flatMap((alias): LineageItem[] => {
            const aliasUpper = alias.toUpperCase();
            if (seenAliasesUpper.has(aliasUpper)) {
                return [];
            }
            seenAliasesUpper.add(aliasUpper);

            const wildcardCount = getCountsIncludingSublineages(canonicalLineage, lineageTree, countsByLineage);
            return [
                { lineage: alias, count: countsByLineage.get(alias) ?? 0 },
                { lineage: `${alias}*`, count: wildcardCount },
            ];
        }),
    );

    // Combine and sort all items (asterisk before period for same prefix)
    return [...actualLineageItems, ...aliasItems].sort((a, b) => {
        // Replace * with a character that sorts before . in ASCII
        const aKey = a.lineage.replace(/\*/g, ' ');
        const bKey = b.lineage.replace(/\*/g, ' ');
        return aKey.localeCompare(bKey);
    });
}

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

async function getLineageTreeAndAliases({
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
    const aliasMapping = new Map<string, string[]>();

    Object.entries(lineageDefinitions).forEach(([lineage, definition]) => {
        if (!lineageTree.has(lineage)) {
            lineageTree.set(lineage, { children: [] });
        }

        if (definition.aliases && definition.aliases.length > 0) {
            aliasMapping.set(lineage, definition.aliases);
        }

        definition.parents?.forEach((parent) => {
            const parentChildren = lineageTree.get(parent)?.children;

            const newParentChildren = parentChildren ? [...parentChildren, lineage] : [lineage];

            lineageTree.set(parent, { children: newParentChildren });
        });
    });

    return { lineageTree, aliasMapping };
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


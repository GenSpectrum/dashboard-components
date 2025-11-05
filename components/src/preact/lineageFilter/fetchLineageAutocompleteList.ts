import { fetchLineageDefinition } from '../../lapisApi/lapisApi';
import { FetchAggregatedOperator } from '../../operator/FetchAggregatedOperator';
import type { LapisFilter } from '../../types';

export type LineageItem = { lineage: string; count: number };

/**
 * Generates the autocomplete list for lineage search. It includes lineages with wild cards
 * (i.e. "BA.3.2.1" and "BA.3.2.1*") as well as all prefixes of lineages with an asterisk ("BA.3.2*").
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

    const prefixToLineage = findMissingPrefixMappings(lineageTree, aliasMapping);

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

    // Add prefix alias items with wildcard and their counts
    const prefixAliasItems = Array.from(prefixToLineage.entries()).map(([prefix, actualLineage]) => ({
        lineage: `${prefix}*`,
        count: getCountsIncludingSublineages(actualLineage, lineageTree, countsByLineage),
    }));

    // Combine and sort all items (asterisk before period for same prefix)
    return [...actualLineageItems, ...prefixAliasItems].sort((a, b) => {
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

/**
 * This function finds prefixes (i.e. "BA.3.2" for "BA.3.2.1") that are not in the lineageTree,
 * but do appear as an alias. It returns a reverse mapping for those prefixes, back to a lineage
 * that can be found in the lineageTree (i.e. "BA.3.2" -> "B.1.1.529.3.2").
 */
function findMissingPrefixMappings(
    lineageTree: Map<string, { children: string[] }>,
    aliasMapping: Map<string, string[]>,
): Map<string, string> {
    const lineages = Array.from(lineageTree.keys());
    const lineagesSet = new Set(lineages);

    // Generate all prefixes for each lineage (e.g., "A.B.1" -> ["A", "A.B", "A.B.1"])
    const allPrefixes = lineages.flatMap((lineage) => {
        const parts = lineage.split('.');
        return parts.map((_, i) => parts.slice(0, i + 1).join('.'));
    });

    // Find prefixes that are NOT in the actual lineages list
    const missingPrefixes = new Set(allPrefixes.filter((prefix) => !lineagesSet.has(prefix)));

    // Create reverse alias mapping: alias -> original lineage
    const reverseAliasMapping = new Map<string, string>();
    aliasMapping.forEach((aliases, lineage) => {
        aliases.forEach((alias) => {
            reverseAliasMapping.set(alias, lineage);
        });
    });

    // Map missing prefixes to their actual lineage names via reverse alias lookup
    const prefixToLineage = new Map<string, string>();
    missingPrefixes.forEach((prefix) => {
        const actualLineage = reverseAliasMapping.get(prefix);
        if (actualLineage) {
            prefixToLineage.set(prefix, actualLineage);
        }
    });

    return prefixToLineage;
}

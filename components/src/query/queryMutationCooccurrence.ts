import { queryDatesInDataset } from './queryDatesInDataset';
import { fetchAggregated } from '../lapisApi/lapisApi';
import { type AggregatedItem } from '../lapisApi/lapisTypes';
import { UserFacingError } from '../preact/components/error-display';
import {
    CooccurrenceOverTimeDataMap,
    type CooccurrencePattern,
    serializeCooccurrencePattern,
} from '../preact/mutationCooccurrence/CooccurrenceOverTimeData';
import { type LapisFilter, type TemporalGranularity } from '../types';
import { parseDateStringToTemporal, type Temporal } from '../utils/temporalClass';

const MAX_NUMBER_OF_GRID_COLUMNS = 200;

type Group = { symbols: Record<string, string | null>; count: number };

export async function queryMutationCooccurrence(
    lapisFilter: LapisFilter,
    positions: string[],
    lapis: string,
    lapisDateField: string,
    granularity: TemporalGranularity,
    signal?: AbortSignal,
): Promise<CooccurrenceOverTimeDataMap> {
    if (positions.length === 0) {
        return new CooccurrenceOverTimeDataMap();
    }

    const requestedDateRanges = await queryDatesInDataset(lapisFilter, lapis, granularity, lapisDateField, signal);

    if (requestedDateRanges.length > MAX_NUMBER_OF_GRID_COLUMNS) {
        throw new UserFacingError(
            'Too many dates',
            `The dataset would contain ${requestedDateRanges.length} date intervals. ` +
                `Please reduce the number to below ${MAX_NUMBER_OF_GRID_COLUMNS} to display the data. ` +
                'You can achieve this by either narrowing the date range in the provided LAPIS filter or by selecting a larger granularity.',
        );
    }

    if (requestedDateRanges.length === 0) {
        return new CooccurrenceOverTimeDataMap();
    }

    const result = await fetchAggregated(
        lapis,
        {
            ...lapisFilter,
            fields: [lapisDateField, ...positions],
        },
        signal,
    );

    const dateRangeByKey = new Map<string, Temporal>(requestedDateRanges.map((dr) => [dr.dateString, dr]));

    const countsByPatternAndDate = new Map<string, Map<string, number>>();
    const patternByKey = new Map<string, CooccurrencePattern>();
    const totalByDate = new Map<string, number>();
    const groupsByDate = new Map<string, Group[]>();

    for (const item of result.data) {
        const rawDate = item[lapisDateField];
        if (rawDate === null || typeof rawDate !== 'string') {
            continue;
        }

        const temporal = parseDateStringToTemporal(rawDate, granularity);
        const dateRange = dateRangeByKey.get(temporal.dateString);
        if (dateRange === undefined) {
            continue;
        }

        const symbols = extractSymbols(item, positions);
        const count = item.count;
        const dateKey = dateRange.dateString;

        const groups = groupsByDate.get(dateKey) ?? [];
        groups.push({ symbols, count });
        groupsByDate.set(dateKey, groups);

        totalByDate.set(dateKey, (totalByDate.get(dateKey) ?? 0) + count);

        const pattern: CooccurrencePattern = { symbols };
        const patternKey = serializeCooccurrencePattern(pattern);
        patternByKey.set(patternKey, pattern);

        if (!countsByPatternAndDate.has(patternKey)) {
            countsByPatternAndDate.set(patternKey, new Map());
        }
        countsByPatternAndDate
            .get(patternKey)!
            .set(dateKey, (countsByPatternAndDate.get(patternKey)!.get(dateKey) ?? 0) + count);
    }

    const resultMap = new CooccurrenceOverTimeDataMap();

    const sortedPatternKeys = sortPatternKeysByCoverageAndCount(
        [...countsByPatternAndDate.keys()].filter((key) => isCovered(patternByKey.get(key)!)),
        patternByKey,
        countsByPatternAndDate,
        positions,
    );

    for (const patternKey of sortedPatternKeys) {
        const dateMap = countsByPatternAndDate.get(patternKey)!;
        const pattern = patternByKey.get(patternKey)!;

        const coveredPositions = positions.filter((pos) => pattern.symbols[pos] !== null);

        for (const dateRange of requestedDateRanges) {
            const dateKey = dateRange.dateString;
            const count = dateMap.get(dateKey) ?? 0;
            const total = totalByDate.get(dateKey) ?? 0;

            if (total === 0) {
                resultMap.set(pattern, dateRange, null);
                continue;
            }

            const coverage = computeCoverage(groupsByDate.get(dateKey) ?? [], coveredPositions);

            if (coverage === 0) {
                resultMap.set(pattern, dateRange, null);
            } else {
                resultMap.set(pattern, dateRange, {
                    type: 'valueWithCoverage',
                    count,
                    coverage,
                    totalCount: total,
                });
            }
        }
    }

    return resultMap;
}

/**
 * Reads the symbol at each queried position from a raw LAPIS response row.
 * Nucleotide positions (e.g. `[123]`) treat `'N'` as uncovered; amino acid positions
 * (e.g. `S[501]`) treat `'X'` as uncovered. Both map to `null` in the result.
 */
function extractSymbols(item: AggregatedItem, positions: string[]): Record<string, string | null> {
    const symbols: Record<string, string | null> = {};
    for (const pos of positions) {
        const val = item[pos];
        const uncoveredSymbol = /^[A-Za-z]/.test(pos) ? 'X' : 'N';
        symbols[pos] = typeof val === 'string' && val !== uncoveredSymbol ? val : null;
    }
    return symbols;
}

/** A pattern is only displayed if at least one of its queried positions is covered. */
function isCovered(pattern: CooccurrencePattern): boolean {
    return Object.values(pattern.symbols).some((symbol) => symbol !== null);
}

/**
 * Sorts pattern keys so that patterns covering more positions come first (patterns covering fewer
 * positions are less specific and group together sequences that would otherwise appear separately),
 * and ties are broken by total observation count, descending.
 */
function sortPatternKeysByCoverageAndCount(
    patternKeys: string[],
    patternByKey: Map<string, CooccurrencePattern>,
    countsByPatternAndDate: Map<string, Map<string, number>>,
    positions: string[],
): string[] {
    const coverageBits = (key: string) => {
        const symbols = patternByKey.get(key)!.symbols;
        return positions.reduce((acc, pos, i) => {
            const bit = symbols[pos] !== null ? 1 : 0;
            return acc | (bit << (positions.length - 1 - i));
        }, 0);
    };
    const totalCount = (key: string) =>
        [...(countsByPatternAndDate.get(key)?.values() ?? [])].reduce((sum, count) => sum + count, 0);

    return [...patternKeys].sort((a, b) => {
        const bitsA = coverageBits(a);
        const bitsB = coverageBits(b);
        if (bitsA !== bitsB) {
            return bitsB - bitsA;
        }
        return totalCount(b) - totalCount(a);
    });
}

/** Sums the counts of groups that are covered at every one of the given positions. */
function computeCoverage(groups: Group[], coveredPositions: string[]): number {
    return groups
        .filter((group) => coveredPositions.every((pos) => group.symbols[pos] !== null))
        .reduce((sum, group) => sum + group.count, 0);
}

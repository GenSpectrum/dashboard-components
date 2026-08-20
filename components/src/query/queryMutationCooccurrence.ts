import { queryDatesInDataset } from './queryDatesInDataset';
import { fetchAggregated } from '../lapisApi/lapisApi';
import { UserFacingError } from '../preact/components/error-display';
import {
    CooccurrenceOverTimeDataMap,
    type CooccurrencePattern,
    serializeCooccurrencePattern,
} from '../preact/mutationCooccurrence/CooccurrenceOverTimeData';
import { type LapisFilter, type TemporalGranularity } from '../types';
import { parseDateStringToTemporal, type Temporal } from '../utils/temporalClass';

const MAX_NUMBER_OF_GRID_COLUMNS = 200;

type Group = { alleles: Record<string, string | null>; count: number };

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

        const alleles: Record<string, string | null> = {};
        for (const pos of positions) {
            const val = item[pos];
            alleles[pos] = typeof val === 'string' ? val : null;
        }
        const count = item.count;
        const dateKey = dateRange.dateString;

        const groups = groupsByDate.get(dateKey) ?? [];
        groups.push({ alleles, count });
        groupsByDate.set(dateKey, groups);

        totalByDate.set(dateKey, (totalByDate.get(dateKey) ?? 0) + count);

        const pattern: CooccurrencePattern = { alleles };
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

    const sortedPatternKeys = [...countsByPatternAndDate.keys()]
        .filter((key) => {
            const alleles = patternByKey.get(key)!.alleles;
            return Object.values(alleles).some((v) => v !== null && v !== 'N');
        })
        .sort((a, b) => {
            const coverageBits = (key: string) =>
                positions.reduce((acc, pos, i) => {
                    const alleles = patternByKey.get(key)!.alleles;
                    const bit = typeof alleles[pos] === 'string' && alleles[pos] !== 'N' ? 1 : 0;
                    return acc | (bit << (positions.length - 1 - i));
                }, 0);
            const bitsA = coverageBits(a);
            const bitsB = coverageBits(b);
            if (bitsA !== bitsB) {
                return bitsB - bitsA;
            }
            const totalA = [...(countsByPatternAndDate.get(a)?.values() ?? [])].reduce((s, c) => s + c, 0);
            const totalB = [...(countsByPatternAndDate.get(b)?.values() ?? [])].reduce((s, c) => s + c, 0);
            return totalB - totalA;
        });

    for (const patternKey of sortedPatternKeys) {
        const dateMap = countsByPatternAndDate.get(patternKey)!;
        const pattern = patternByKey.get(patternKey)!;

        const coveredPositions = positions.filter(
            (pos) => typeof pattern.alleles[pos] === 'string' && pattern.alleles[pos] !== 'N',
        );

        for (const dateRange of requestedDateRanges) {
            const dateKey = dateRange.dateString;
            const count = dateMap.get(dateKey) ?? 0;
            const total = totalByDate.get(dateKey) ?? 0;

            if (total === 0) {
                resultMap.set(pattern, dateRange, null);
                continue;
            }

            const groups = groupsByDate.get(dateKey) ?? [];
            const coverage = groups
                .filter((g) =>
                    coveredPositions.every((pos) => typeof g.alleles[pos] === 'string' && g.alleles[pos] !== 'N'),
                )
                .reduce((sum, g) => sum + g.count, 0);

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

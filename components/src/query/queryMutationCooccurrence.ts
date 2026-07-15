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

    // Accumulate counts per (serializedPattern, dateKey) before computing proportions
    const countsByPatternAndDate = new Map<string, Map<string, number>>();
    const patternByKey = new Map<string, CooccurrencePattern>();
    const totalByDate = new Map<string, number>();

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
        const pattern: CooccurrencePattern = { alleles };
        const patternKey = serializeCooccurrencePattern(pattern);
        const count = item.count;

        patternByKey.set(patternKey, pattern);

        const dateKey = dateRange.dateString;
        if (!countsByPatternAndDate.has(patternKey)) {
            countsByPatternAndDate.set(patternKey, new Map());
        }
        const dateMap = countsByPatternAndDate.get(patternKey)!;
        dateMap.set(dateKey, (dateMap.get(dateKey) ?? 0) + count);

        totalByDate.set(dateKey, (totalByDate.get(dateKey) ?? 0) + count);
    }

    const resultMap = new CooccurrenceOverTimeDataMap();

    for (const [patternKey, dateMap] of countsByPatternAndDate) {
        const pattern = patternByKey.get(patternKey)!;
        for (const dateRange of requestedDateRanges) {
            const dateKey = dateRange.dateString;
            const count = dateMap.get(dateKey) ?? 0;
            const total = totalByDate.get(dateKey) ?? 0;

            if (total === 0) {
                resultMap.set(pattern, dateRange, null);
            } else {
                resultMap.set(pattern, dateRange, {
                    type: 'value',
                    count,
                    proportion: count / total,
                    totalCount: total,
                });
            }
        }
    }

    return resultMap;
}

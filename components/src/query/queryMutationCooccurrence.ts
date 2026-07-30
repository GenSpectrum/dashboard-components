import { queryDatesInDataset } from './queryDatesInDataset';
import { fetchAggregated } from '../lapisApi/lapisApi';
import { UserFacingError } from '../preact/components/error-display';
import {
    CooccurrenceOverTimeDataMap,
    type CooccurrencePattern,
    serializeCooccurrencePattern,
} from '../preact/mutationCooccurrence/CooccurrenceOverTimeData';
import { type LapisFilter, type TemporalGranularity } from '../types';
import { toTemporalClass } from '../utils/temporalClass';

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

    const results = await Promise.all(
        requestedDateRanges.map((dateRange) => {
            const tc = toTemporalClass(dateRange);
            return fetchAggregated(
                lapis,
                {
                    ...lapisFilter,
                    [`${lapisDateField}From`]: tc.firstDay.toString(),
                    [`${lapisDateField}To`]: tc.lastDay.toString(),
                    fields: [...positions],
                },
                signal,
            );
        }),
    );

    const countsByPatternAndDate = new Map<string, Map<string, number>>();
    const patternByKey = new Map<string, CooccurrencePattern>();
    const totalByDate = new Map<string, number>();

    for (let i = 0; i < requestedDateRanges.length; i++) {
        const dateRange = requestedDateRanges[i];
        const dateKey = dateRange.dateString;

        for (const item of results[i].data) {
            const alleles: Record<string, string | null> = {};
            for (const pos of positions) {
                const val = item[pos];
                alleles[pos] = typeof val === 'string' ? val : null;
            }
            const pattern: CooccurrencePattern = { alleles };
            const patternKey = serializeCooccurrencePattern(pattern);
            const count = item.count;

            patternByKey.set(patternKey, pattern);

            if (!countsByPatternAndDate.has(patternKey)) {
                countsByPatternAndDate.set(patternKey, new Map());
            }
            countsByPatternAndDate
                .get(patternKey)!
                .set(dateKey, (countsByPatternAndDate.get(patternKey)!.get(dateKey) ?? 0) + count);

            totalByDate.set(dateKey, (totalByDate.get(dateKey) ?? 0) + count);
        }
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

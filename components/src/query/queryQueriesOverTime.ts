import { queryDatesInDataset } from './queryDatesInDataset';
import { fetchQueriesOverTime } from '../lapisApi/lapisApi';
import { type QueryDefinition } from '../lapisApi/lapisTypes';
import { UserFacingError } from '../preact/components/error-display';
import { type LapisFilter, type TemporalGranularity } from '../types';
import { type ProportionValue } from './queryMutationsOverTime';
import { type Map2DContents } from '../utils/map2d';
import { type Temporal } from '../utils/temporalClass';

const MAX_NUMBER_OF_GRID_COLUMNS = 200;

/**
 * Query data for multiple queries over time periods.
 *
 * @param lapisFilter - Standard LAPIS filters to apply
 * @param queries - Array of query definitions with countQuery and coverageQuery
 * @param lapis - LAPIS URL
 * @param lapisDateField - The metadata field to use for dates (e.g., "date", "submissionDate")
 * @param granularity - Temporal granularity (day, week, month, year)
 * @param signal - Optional abort signal for cancellation
 * @returns Map2D structure with queries as first axis, dates as second axis
 */
export async function queryQueriesOverTimeData(
    lapisFilter: LapisFilter,
    queries: QueryDefinition[],
    lapis: string,
    lapisDateField: string,
    granularity: TemporalGranularity,
    signal?: AbortSignal,
) {
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
        return {
            queryOverTimeData: {
                keysFirstAxis: new Map<string, string>(),
                keysSecondAxis: new Map<string, Temporal>(),
                data: new Map<string, Map<string, ProportionValue>>(),
            } as Map2DContents<string, Temporal, ProportionValue>,
        };
    }

    const apiResult = await fetchQueriesOverTime(
        lapis,
        {
            filters: lapisFilter,
            queries: queries.map((q) => ({
                displayLabel: q.displayLabel,
                countQuery: q.countQuery,
                coverageQuery: q.coverageQuery,
            })),
            dateRanges: requestedDateRanges.map((date) => ({
                dateFrom: date.firstDay.toString(),
                dateTo: date.lastDay.toString(),
            })),
            dateField: lapisDateField,
        },
        signal,
    );

    const totalCounts = apiResult.data.totalCountsByDateRange;
    const responseQueries = apiResult.data.queries;

    const queryOverTimeData: Map2DContents<string, Temporal, ProportionValue> = {
        keysFirstAxis: new Map(responseQueries.map((query) => [query, query])),
        keysSecondAxis: new Map(requestedDateRanges.map((date) => [date.dateString, date])),
        data: new Map(
            responseQueries.map((query, i) => [
                query,
                new Map(
                    requestedDateRanges.map((date, j): [string, ProportionValue] => {
                        if (totalCounts[j] === 0) {
                            return [date.dateString, null];
                        }

                        const count = apiResult.data.data[i][j].count;
                        const coverage = apiResult.data.data[i][j].coverage;
                        const totalCount = totalCounts[j];

                        if (coverage === 0) {
                            return [
                                date.dateString,
                                {
                                    type: 'belowThreshold',
                                    totalCount,
                                },
                            ];
                        }

                        return [
                            date.dateString,
                            {
                                type: 'valueWithCoverage',
                                count,
                                coverage,
                                totalCount,
                            },
                        ];
                    }),
                ),
            ]),
        ),
    };

    return {
        queryOverTimeData,
    };
}

export function serializeQuery(displayLabel: string): string {
    return displayLabel;
}

export function serializeTemporal(date: Temporal): string {
    return date.dateString;
}

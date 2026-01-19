import { queryDatesInDataset } from './queryDatesInDataset';
import { fetchQueriesOverTime } from '../lapisApi/lapisApi';
import { UserFacingError } from '../preact/components/error-display';
import { type LapisFilter, type TemporalGranularity } from '../types';
import { type Map2DContents } from '../utils/map2d';
import { type Temporal } from '../utils/temporalClass';
import { type ProportionValue } from './queryMutationsOverTime';

const MAX_NUMBER_OF_GRID_COLUMNS = 200;

/**
 * Query definition for queries over time.
 * Matches the LAPIS /component/queriesOverTime API schema.
 */
export interface QueryDefinition {
    // TODO - why do we have this interface here, don't we have this type already in lapisTypes.ts?
    displayLabel?: string;
    countQuery: string;
    coverageQuery: string;
}

/**
 * Serialize a query displayLabel for use as Map2D key.
 */
export function serializeQuery(displayLabel: string): string {
    // TODO - is this sufficient? That would require the label to be unique; which it doesn't need to be.
    return displayLabel;
}

/**
 * Serialize a Temporal object for use as Map2D key.
 * Reuses the same pattern as mutations over time.
 */
export function serializeTemporal(date: Temporal): string {
    // TODO - (see above)
    return date.dateString;
}

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
    // Step 1: Query available date ranges (respects date filters in lapisFilter)
    const requestedDateRanges = await queryDatesInDataset(lapisFilter, lapis, granularity, lapisDateField, signal);

    // Step 2: Validate date range count
    if (requestedDateRanges.length > MAX_NUMBER_OF_GRID_COLUMNS) {
        throw new UserFacingError(
            'Too many dates',
            `The dataset would contain ${requestedDateRanges.length} date intervals. ` +
                `Please reduce the number to below ${MAX_NUMBER_OF_GRID_COLUMNS} to display the data. ` +
                'You can achieve this by either narrowing the date range in the provided LAPIS filter or by selecting a larger granularity.',
        );
    }

    // Step 3: Handle empty date ranges
    if (requestedDateRanges.length === 0) {
        return {
            queryOverTimeData: {
                keysFirstAxis: new Map<string, string>(),
                keysSecondAxis: new Map<string, Temporal>(),
                data: new Map<string, Map<string, ProportionValue>>(),
            } as Map2DContents<string, Temporal, ProportionValue>,
        };
    }

    // Step 4: Call LAPIS API
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

    // Step 5: Extract data from API response
    const totalCounts = apiResult.data.totalCountsByDateRange;
    const responseQueries = apiResult.data.queries;

    // Step 6: Build Map2D structure
    const queryOverTimeData: Map2DContents<string, Temporal, ProportionValue> = {
        keysFirstAxis: new Map(responseQueries.map((query) => [query, query])),
        keysSecondAxis: new Map(requestedDateRanges.map((date) => [date.dateString, date])),
        data: new Map(
            responseQueries.map((query, i) => [
                query,
                new Map(
                    requestedDateRanges.map((date, j): [string, ProportionValue] => {
                        // Handle dates with no data (totalCount = 0)
                        if (totalCounts[j] === 0) {
                            return [date.dateString, null];
                        }

                        const count = apiResult.data.data[i][j].count;
                        const coverage = apiResult.data.data[i][j].coverage;
                        const totalCount = totalCounts[j];

                        // Handle zero coverage (below threshold)
                        if (coverage === 0) {
                            return [
                                date.dateString,
                                {
                                    type: 'belowThreshold',
                                    totalCount,
                                },
                            ];
                        }

                        // Standard value with coverage
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

    // TODO: Consider adding overall query statistics (aggregate across all dates)
    // Similar to overallMutationData in queryMutationsOverTime
    // This would require a separate aggregation query or additional API endpoint

    return {
        queryOverTimeData,
    };
}

import { type ProportionValue } from '../../query/queryMutationsOverTime';
import { serializeQuery, serializeTemporal } from '../../query/queryQueriesOverTime';
import { Map2dBase, Map2dView, type Map2DContents } from '../../utils/map2d';
import { type Temporal } from '../../utils/temporalClass';

export type QueryFilter = {
    textFilter: string;
};

export type GetFilteredQueryOverTimeDataArgs = {
    data: Map2DContents<string, Temporal, ProportionValue>;
    proportionInterval: { min: number; max: number };
    hideGaps: boolean;
    queryFilterValue: QueryFilter;
};

/**
 * Create a Map2d wrapper for query over time data.
 * Uses displayLabel strings as the first axis (queries) and Temporal objects as the second axis (dates).
 */
export class QueryOverTimeDataMap extends Map2dBase<string, Temporal, ProportionValue> {
    constructor(initialContent: Map2DContents<string, Temporal, ProportionValue>) {
        super(serializeQuery, serializeTemporal, initialContent);
    }
}

export function getFilteredQueryOverTimeData({
    data,
    proportionInterval,
    hideGaps,
    queryFilterValue,
}: GetFilteredQueryOverTimeDataArgs) {
    // Create a Map2d instance from the contents
    const dataMap = new QueryOverTimeDataMap(data);
    const filteredData = new Map2dView(dataMap);

    // Calculate overall proportions for filtering
    // Since overallQueryData is not yet available from the API (marked as TODO),
    // we calculate it here from the data
    const queries = filteredData.getFirstAxisKeys();
    const dates = filteredData.getSecondAxisKeys();

    const queriesToFilterOut = queries.filter((query) => {
        // Calculate overall proportion for this query
        let totalCount = 0;
        let totalCoverage = 0;

        dates.forEach((date) => {
            const value = filteredData.get(query, date);
            if (value !== null && value !== undefined && value.type === 'valueWithCoverage') {
                totalCount += value.count;
                totalCoverage += value.coverage;
            }
        });

        const overallProportion = totalCoverage > 0 ? totalCount / totalCoverage : 0;

        // Filter by proportion interval
        if (overallProportion < proportionInterval.min || overallProportion > proportionInterval.max) {
            return true;
        }

        // Filter by text (case-insensitive search in displayLabel)
        if (queryFilterValue.textFilter !== '' && !query.toLowerCase().includes(queryFilterValue.textFilter.toLowerCase())) {
            return true;
        }

        return false;
    });

    // Remove filtered queries from the data view
    queriesToFilterOut.forEach((query) => {
        filteredData.deleteRow(query);
    });

    // Hide gaps (columns with no data)
    if (hideGaps) {
        const dateRangesToFilterOut = filteredData.getSecondAxisKeys().filter((dateRange) => {
            const vals = filteredData.getColumn(dateRange);
            return !vals.some((v) => (v?.type === 'value' || v?.type === 'valueWithCoverage') && v.totalCount > 0);
        });
        dateRangesToFilterOut.forEach((dateRange) => filteredData.deleteColumn(dateRange));
    }

    return filteredData;
}

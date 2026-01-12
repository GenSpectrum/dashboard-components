import { mapDateToGranularityRange } from './queryAggregatedDataOverTime';
import { FetchAggregatedOperator } from '../operator/FetchAggregatedOperator';
import { GroupByAndSumOperator } from '../operator/GroupByAndSumOperator';
import { MapOperator } from '../operator/MapOperator';
import { RenameFieldOperator } from '../operator/RenameFieldOperator';
import { SortOperator } from '../operator/SortOperator';
import { type LapisFilter, type TemporalGranularity } from '../types';
import {
    dateRangeCompare,
    generateAllInRange,
    getMinMaxTemporal,
    parseDateStringToTemporal,
} from '../utils/temporalClass';

/**
 * Returns a list of date ranges as TemporalClass.
 * Respects date range filters given in the lapisFilter as <lapisDateField>From and <lapisDateField>To.
 * If either side (or both sides) of the range are not given, the min and max are determined from
 * the available data.
 */
export async function queryDatesInDataset(
    lapisFilter: LapisFilter,
    lapis: string,
    granularity: TemporalGranularity,
    lapisDateField: string,
    signal: AbortSignal | undefined,
) {
    const { dateFrom, dateTo } = getDateRangeFromFilter(lapisFilter, lapisDateField, granularity);
    if (dateFrom !== null && dateTo !== null) {
        return generateAllInRange(dateFrom, dateTo);
    }

    const { content: availableDates } = await queryAvailableDates(
        lapisFilter,
        lapis,
        granularity,
        lapisDateField,
        signal,
    );

    const { min, max } = getMinMaxTemporal(availableDates);

    return generateAllInRange(dateFrom ?? min, dateTo ?? max);
}

function getDateRangeFromFilter(lapisFilter: LapisFilter, lapisDateField: string, granularity: TemporalGranularity) {
    const valueFromFilter = lapisFilter[lapisDateField] as string | null;

    if (valueFromFilter) {
        return {
            dateFrom: parseDateStringToTemporal(valueFromFilter, granularity),
            dateTo: parseDateStringToTemporal(valueFromFilter, granularity),
        };
    }

    const minFromFilter = lapisFilter[`${lapisDateField}From`] as string | null;
    const maxFromFilter = lapisFilter[`${lapisDateField}To`] as string | null;

    return {
        dateFrom: minFromFilter ? parseDateStringToTemporal(minFromFilter, granularity) : null,
        dateTo: maxFromFilter ? parseDateStringToTemporal(maxFromFilter, granularity) : null,
    };
}

/**
 * Returns the sorted list of date ranges that have data in them.
 * Date ranges have the size of the given granularity.
 */
function queryAvailableDates(
    lapisFilter: LapisFilter,
    lapis: string,
    granularity: TemporalGranularity,
    lapisDateField: string,
    signal?: AbortSignal,
) {
    return fetchAndPrepareDates(lapisFilter, granularity, lapisDateField).evaluate(lapis, signal);
}

function fetchAndPrepareDates(filter: LapisFilter, granularity: TemporalGranularity, lapisDateField: string) {
    // fetch data aggregated by date
    const fetchData = new FetchAggregatedOperator<Record<string, string | null>>(filter, [lapisDateField]);
    const dataWithFixedDateKey = new RenameFieldOperator(fetchData, lapisDateField, 'date');
    // now we have a list of { count, date }
    const mapData = new MapOperator(dataWithFixedDateKey, (data) => mapDateToGranularityRange(data, granularity));
    const groupByData = new GroupByAndSumOperator(mapData, 'dateRange', 'count');
    // how we have a list of { dateRange, count }
    const sortData = new SortOperator(groupByData, dateRangeCompare);
    return new MapOperator(sortData, (data) => data.dateRange);
}

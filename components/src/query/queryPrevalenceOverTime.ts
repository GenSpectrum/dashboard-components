import { DivisionOperator } from '../operator/DivisionOperator';
import { FetchAggregatedOperator } from '../operator/FetchAggregatedOperator';
import { FillMissingOperator } from '../operator/FillMissingOperator';
import { GroupByAndSumOperator } from '../operator/GroupByAndSumOperator';
import { MapOperator } from '../operator/MapOperator';
import { RenameFieldOperator } from '../operator/RenameFieldOperator';
import { SlidingOperator } from '../operator/SlidingOperator';
import { SortOperator } from '../operator/SortOperator';
import { type LapisFilter, type NamedLapisFilter, type TemporalGranularity } from '../types';
import {
    compareTemporal,
    generateAllInRange,
    getMinMaxTemporal,
    type Temporal,
    TemporalCache,
} from '../utils/temporal';

export type PrevalenceOverTimeData = PrevalenceOverTimeVariantData[];

export type PrevalenceOverTimeVariantData = {
    displayName: string;
    content: { count: number; prevalence: number; total: number; dateRange: Temporal | null }[];
};

export function queryPrevalenceOverTime(
    numeratorFilter: NamedLapisFilter | NamedLapisFilter[],
    denominatorFilter: LapisFilter,
    granularity: TemporalGranularity,
    smoothingWindow: number,
    lapis: string,
    lapisDateField: string,
    signal?: AbortSignal,
): Promise<PrevalenceOverTimeData> {
    const numeratorFilters = makeArray(numeratorFilter);

    const denominatorData = fetchAndPrepare(denominatorFilter, granularity, smoothingWindow, lapisDateField);
    const subQueries = numeratorFilters.map(async (namedLapisFilter) => {
        const { displayName, lapisFilter } = namedLapisFilter;
        const numeratorData = fetchAndPrepare(lapisFilter, granularity, smoothingWindow, lapisDateField);
        const divide = new DivisionOperator(
            numeratorData,
            denominatorData,
            'dateRange',
            'count',
            'prevalence',
            'count',
            'total',
        );
        const dataset = await divide.evaluate(lapis, signal);
        return {
            displayName,
            content: dataset.content,
        };
    });
    return Promise.all(subQueries);
}

function makeArray<T>(arrayOrSingleItem: T | T[]) {
    if (Array.isArray(arrayOrSingleItem)) {
        return arrayOrSingleItem;
    }
    return [arrayOrSingleItem];
}

function fetchAndPrepare<LapisDateField extends string>(
    filter: LapisFilter,
    granularity: TemporalGranularity,
    smoothingWindow: number,
    lapisDateField: LapisDateField,
) {
    const fetchData = new FetchAggregatedOperator<{ [key in LapisDateField]: string | null }>(filter, [lapisDateField]);
    const dataWithFixedDateKey = new RenameFieldOperator(fetchData, lapisDateField, 'date');
    const mapData = new MapOperator(dataWithFixedDateKey, (d) => mapDateToGranularityRange(d, granularity));
    const groupByData = new GroupByAndSumOperator(mapData, 'dateRange', 'count');
    const fillData = new FillMissingOperator(
        groupByData,
        'dateRange',
        getMinMaxTemporal,
        generateAllInRange,
        (key) => ({ dateRange: key, count: 0 }),
    );
    const sortData = new SortOperator(fillData, dateRangeCompare);

    return smoothingWindow >= 1 ? new SlidingOperator(sortData, smoothingWindow, averageSmoothing) : sortData;
}

function mapDateToGranularityRange(d: { date: string | null; count: number }, granularity: TemporalGranularity) {
    let dateRange: Temporal | null = null;
    if (d.date !== null) {
        const date = TemporalCache.getInstance().getYearMonthDay(d.date);
        switch (granularity) {
            case 'day':
                dateRange = date;
                break;
            case 'week':
                dateRange = date.week;
                break;
            case 'month':
                dateRange = date.month;
                break;
            case 'year':
                dateRange = date.year;
                break;
        }
    }
    return {
        dateRange,
        count: d.count,
    };
}

function dateRangeCompare(a: { dateRange: Temporal | null }, b: { dateRange: Temporal | null }) {
    if (a.dateRange === null) {
        return 1;
    }
    if (b.dateRange === null) {
        return -1;
    }
    return compareTemporal(a.dateRange, b.dateRange);
}

function averageSmoothing(slidingWindow: { dateRange: Temporal | null; count: number }[]) {
    const average = slidingWindow.reduce((acc, curr) => acc + curr.count, 0) / slidingWindow.length;
    const centerIndex = Math.floor(slidingWindow.length / 2);
    return { dateRange: slidingWindow[centerIndex].dateRange, count: average };
}

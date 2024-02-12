import { LapisFilter, NamedLapisFilter, TemporalGranularity } from '../types';
import { FetchAggregatedOperator } from '../operator/FetchAggregatedOperator';
import { MapOperator } from '../operator/MapOperator';
import { GroupByAndSumOperator } from '../operator/GroupByAndSumOperator';
import { FillMissingOperator } from '../operator/FillMissingOperator';
import { SortOperator } from '../operator/SortOperator';
import { Operator } from '../operator/Operator';
import { SlidingOperator } from '../operator/SlidingOperator';
import { DivisionOperator } from '../operator/DivisionOperator';
import { compareTemporal, generateAllInRange, getMinMaxTemporal, Temporal, TemporalCache } from '../temporal';

export function queryPrevalenceOverTime(
    numerator: NamedLapisFilter | NamedLapisFilter[],
    denominator: NamedLapisFilter,
    granularity: TemporalGranularity,
    smoothingWindow: number,
    lapis: string,
    signal?: AbortSignal,
) {
    const numerators = [];
    if (Array.isArray(numerator)) {
        numerators.push(...numerator);
    } else {
        numerators.push(numerator);
    }

    const denominatorData = fetchAndPrepare(denominator, granularity, smoothingWindow);
    const subQueries = numerators.map(async (namedLapisFilter) => {
        const numeratorData = fetchAndPrepare(namedLapisFilter, granularity, smoothingWindow);
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
            displayName: namedLapisFilter.displayName,
            content: dataset.content,
        };
    });
    return Promise.all(subQueries);
}

function fetchAndPrepare(filter: LapisFilter, granularity: TemporalGranularity, smoothingWindow: number) {
    const fetchData = new FetchAggregatedOperator<{
        date: string | null;
    }>(filter, ['date']);
    const mapData = new MapOperator(fetchData, (d) => mapDateToGranularityRange(d, granularity));
    const groupByData = new GroupByAndSumOperator(mapData, 'dateRange', 'count');
    const fillData = new FillMissingOperator(
        groupByData,
        'dateRange',
        getMinMaxTemporal,
        generateAllInRange,
        (key) => ({ dateRange: key, count: 0 }),
    );
    const sortData = new SortOperator(fillData, dateRangeCompare);
    let smoothData: Operator<{ dateRange: Temporal | null; count: number }> = sortData;
    if (smoothingWindow >= 1) {
        smoothData = new SlidingOperator(sortData, smoothingWindow, averageSmoothing);
    }
    return smoothData;
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

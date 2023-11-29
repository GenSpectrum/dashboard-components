import { LapisFilter, TemporalGranularity } from '../types';
import { FetchAggregatedOperator } from '../operator/FetchAggregatedOperator';
import { MapOperator } from '../operator/MapOperator';
import { GroupByAndSumOperator } from '../operator/GroupByAndSumOperator';
import { FillMissingOperator } from '../operator/FillMissingOperator';
import { getMinMaxString } from '../utils';
import { generateAllInRange } from '../temporal-utils';
import { SortOperator } from '../operator/SortOperator';
import { Operator } from '../operator/Operator';
import { SlidingOperator } from '../operator/SlidingOperator';
import { DivisionOperator } from '../operator/DivisionOperator';

export function queryPrevalenceOverTime(
    numerator: LapisFilter,
    denominator: LapisFilter,
    granularity: TemporalGranularity,
    smoothingWindow: number,
    lapis: string,
    signal?: AbortSignal,
) {
    const fetchNumerator = new FetchAggregatedOperator<{
        date: string | null;
    }>(numerator, ['date']);
    const fetchDenominator = new FetchAggregatedOperator<{
        date: string | null;
    }>(denominator, ['date']);
    const mapNumerator = new MapOperator(fetchNumerator, (d) => mapDateToGranularityRange(d, granularity));
    const mapDenominator = new MapOperator(fetchDenominator, (d) => mapDateToGranularityRange(d, granularity));
    const groupByNumerator = new GroupByAndSumOperator(mapNumerator, 'dateRange', 'count');
    const groupByDenominator = new GroupByAndSumOperator(mapDenominator, 'dateRange', 'count');
    const fillNumerator = new FillMissingOperator(
        groupByNumerator,
        'dateRange',
        getMinMaxString,
        (min, max) => generateAllInRange(min, max, granularity),
        (key) => ({ dateRange: key, count: 0 }),
    );
    const fillDenominator = new FillMissingOperator(
        groupByDenominator,
        'dateRange',
        getMinMaxString,
        (min, max) => generateAllInRange(min, max, granularity),
        (key) => ({ dateRange: key, count: 0 }),
    );
    const sortNumerator = new SortOperator(fillNumerator, dateRangeCompare);
    const sortDenominator = new SortOperator(fillDenominator, dateRangeCompare);
    let smoothNumerator: Operator<{ dateRange: string | null; count: number }> = sortNumerator;
    let smoothDenominator: Operator<{ dateRange: string | null; count: number }> = sortDenominator;
    if (smoothingWindow >= 1) {
        smoothNumerator = new SlidingOperator(sortNumerator, smoothingWindow, averageSmoothing);
        smoothDenominator = new SlidingOperator(sortDenominator, smoothingWindow, averageSmoothing);
    }
    const divide = new DivisionOperator(smoothNumerator, smoothDenominator, 'dateRange', 'count', 'prevalence');
    return divide.evaluate(lapis, signal);
}

function mapDateToGranularityRange(d: { date: string | null; count: number }, granularity: TemporalGranularity) {
    let dateRange: string | null = null;
    if (d.date !== null) {
        switch (granularity) {
            case 'day':
                dateRange = d.date;
                break;
            case 'month':
                dateRange = `${new Date(d.date).getFullYear()}-${(new Date(d.date).getMonth() + 1)
                    .toString()
                    .padStart(2, '0')}`;
                break;
            case 'year':
                dateRange = new Date(d.date).getFullYear().toString();
                break;
        }
    }
    return {
        dateRange,
        count: d.count,
    };
}

function dateRangeCompare(a: { dateRange: string | null }, b: { dateRange: string | null }) {
    if (a.dateRange === null) {
        return 1;
    }
    if (b.dateRange === null) {
        return -1;
    }
    return a.dateRange.localeCompare(b.dateRange);
}

function averageSmoothing(slidingWindow: { dateRange: string | null; count: number }[]) {
    const average = slidingWindow.reduce((acc, curr) => acc + curr.count, 0) / slidingWindow.length;
    const centerIndex = Math.floor(slidingWindow.length / 2);
    return { dateRange: slidingWindow[centerIndex].dateRange, count: average };
}

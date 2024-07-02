import { FetchAggregatedOperator } from '../operator/FetchAggregatedOperator';
import { FillMissingOperator } from '../operator/FillMissingOperator';
import { GroupByAndSumOperator } from '../operator/GroupByAndSumOperator';
import { MapOperator } from '../operator/MapOperator';
import { RenameFieldOperator } from '../operator/RenameFieldOperator';
import { SlidingOperator } from '../operator/SlidingOperator';
import { SortOperator } from '../operator/SortOperator';
import type { LapisFilter, TemporalGranularity } from '../types';
import {
    dateRangeCompare,
    generateAllInRange,
    getMinMaxTemporal,
    parseDateStringToTemporal,
    type Temporal,
} from '../utils/temporal';

export function queryAggregatedDataOverTime<LapisDateField extends string>(
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

export function mapDateToGranularityRange(
    data: { date: string | null; count: number },
    granularity: TemporalGranularity,
) {
    return {
        dateRange: data.date === null ? null : parseDateStringToTemporal(data.date, granularity),
        count: data.count,
    };
}

function averageSmoothing(slidingWindow: { dateRange: Temporal | null; count: number }[]) {
    const average = slidingWindow.reduce((acc, curr) => acc + curr.count, 0) / slidingWindow.length;
    const centerIndex = Math.floor(slidingWindow.length / 2);
    return { dateRange: slidingWindow[centerIndex].dateRange, count: average };
}

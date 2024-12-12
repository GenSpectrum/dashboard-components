import { queryAggregatedDataOverTime } from './queryAggregatedDataOverTime';
import { DivisionOperator } from '../operator/DivisionOperator';
import { type LapisFilter, type NamedLapisFilter, type TemporalGranularity } from '../types';
import { type TemporalClass } from '../utils/temporalClass';

export type PrevalenceOverTimeData = PrevalenceOverTimeVariantData[];

export type PrevalenceOverTimeVariantData = {
    displayName: string;
    content: PrevalenceOverTimeVariantDataPoint[];
};

export type PrevalenceOverTimeVariantDataPoint = {
    count: number;
    prevalence: number;
    total: number;
    dateRange: TemporalClass | null;
};

export function queryPrevalenceOverTime(
    numeratorFilters: NamedLapisFilter[],
    denominatorFilter: LapisFilter,
    granularity: TemporalGranularity,
    smoothingWindow: number,
    lapis: string,
    lapisDateField: string,
    signal?: AbortSignal,
): Promise<PrevalenceOverTimeData> {
    const denominatorData = queryAggregatedDataOverTime(
        denominatorFilter,
        granularity,
        smoothingWindow,
        lapisDateField,
    );
    const subQueries = numeratorFilters.map(async (namedLapisFilter) => {
        const { displayName, lapisFilter } = namedLapisFilter;
        const numeratorData = queryAggregatedDataOverTime(lapisFilter, granularity, smoothingWindow, lapisDateField);
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

import { type LapisFilter } from '../types';
import { queryAggregateData } from './queryAggregateData';

export async function queryGeneralStatistics(
    numeratorFilter: LapisFilter,
    denominatorFilter: LapisFilter,
    lapis: string,
    signal?: AbortSignal,
) {
    const numeratorCount = await queryAggregateData(numeratorFilter, [], lapis, undefined, signal);
    const denominatorCount = await queryAggregateData(denominatorFilter, [], lapis, undefined, signal);

    if (numeratorCount.length === 0 || denominatorCount.length === 0) {
        throw new Error('No data found for the given filters');
    }

    return { proportion: numeratorCount[0].count / denominatorCount[0].count, count: numeratorCount[0].count };
}

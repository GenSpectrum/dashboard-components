import { queryAggregatedDataOverTime } from './queryAggregatedDataOverTime';
import { type NamedLapisFilter, type TemporalGranularity } from '../types';
import { sortNullToBeginningThenByDate } from '../utils/sort';

export type NumberOfSequencesDatasets = Awaited<ReturnType<typeof queryNumberOfSequencesOverTime>>;

export async function queryNumberOfSequencesOverTime(
    lapis: string,
    lapisFilters: NamedLapisFilter[],
    lapisDateField: string,
    granularity: TemporalGranularity,
    smoothingWindow: number,
) {
    const queries = lapisFilters.map(async ({ displayName, lapisFilter }) => {
        const { content } = await queryAggregatedDataOverTime(
            lapisFilter,
            granularity,
            smoothingWindow,
            lapisDateField,
        ).evaluate(lapis);

        return {
            displayName,
            content: content.sort(sortNullToBeginningThenByDate),
        };
    });

    return Promise.all(queries);
}

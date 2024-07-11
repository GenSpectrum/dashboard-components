import { queryAggregatedDataOverTime } from './queryAggregatedDataOverTime';
import { type NamedLapisFilter, type TemporalGranularity } from '../types';
import { sortNullToBeginningThenByDate } from '../utils/sort';
import { makeArray } from '../utils/utils';

export type NumberOfSequencesDatasets = Awaited<ReturnType<typeof queryNumberOfSequencesOverTime>>;
export type NumberOfSequencesDataset = NumberOfSequencesDatasets[number];

export async function queryNumberOfSequencesOverTime(
    lapis: string,
    lapisFilter: NamedLapisFilter | NamedLapisFilter[],
    lapisDateField: string,
    granularity: TemporalGranularity,
    smoothingWindow: number,
) {
    const lapisFilters = makeArray(lapisFilter);

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

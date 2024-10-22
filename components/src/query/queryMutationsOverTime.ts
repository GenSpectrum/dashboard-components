import { mapDateToGranularityRange } from './queryAggregatedDataOverTime';
import { FetchAggregatedOperator } from '../operator/FetchAggregatedOperator';
import { FetchSubstitutionsOrDeletionsOperator } from '../operator/FetchSubstitutionsOrDeletionsOperator';
import { GroupByAndSumOperator } from '../operator/GroupByAndSumOperator';
import { MapOperator } from '../operator/MapOperator';
import { RenameFieldOperator } from '../operator/RenameFieldOperator';
import { SortOperator } from '../operator/SortOperator';
import { UserFacingError } from '../preact/components/error-display';
import {
    type LapisFilter,
    type SequenceType,
    type SubstitutionOrDeletionEntry,
    type TemporalGranularity,
} from '../types';
import { Map2dBase, type Map2d } from '../utils/map2d';
import { type Deletion, type Substitution } from '../utils/mutations';
import {
    dateRangeCompare,
    generateAllInRange,
    getMinMaxTemporal,
    parseDateStringToTemporal,
    type Temporal,
} from '../utils/temporal';

export type MutationOverTimeData = {
    date: Temporal;
    mutations: SubstitutionOrDeletionEntry[];
    totalCount: number;
};

export type MutationOverTimeMutationValue = { proportion: number; count: number; totalCount: number };
export type MutationOverTimeDataGroupedByMutation = Map2d<
    Substitution | Deletion,
    Temporal,
    MutationOverTimeMutationValue
>;

const MAX_NUMBER_OF_GRID_COLUMNS = 200;

export async function queryOverallMutationData({
    lapisFilter,
    sequenceType,
    lapis,
    granularity,
    lapisDateField,
    signal,
}: {
    lapisFilter: LapisFilter;
    sequenceType: SequenceType;
    lapis: string;
    granularity: TemporalGranularity;
    lapisDateField: string;
    signal?: AbortSignal;
}) {
    const allDates = await getDatesInDataset(lapisFilter, lapis, granularity, lapisDateField, signal);
    const filter = {
        ...lapisFilter,
        [`${lapisDateField}From`]: allDates[0].firstDay.toString(),
        [`${lapisDateField}To`]: allDates[allDates.length - 1].lastDay.toString(),
    };

    return fetchAndPrepareSubstitutionsOrDeletions(filter, sequenceType).evaluate(lapis, signal);
}

export async function queryMutationsOverTimeData(
    lapisFilter: LapisFilter,
    sequenceType: SequenceType,
    lapis: string,
    lapisDateField: string,
    granularity: TemporalGranularity,
    signal?: AbortSignal,
) {
    const allDates = await getDatesInDataset(lapisFilter, lapis, granularity, lapisDateField, signal);

    if (allDates.length > MAX_NUMBER_OF_GRID_COLUMNS) {
        throw new UserFacingError(
            'Too many dates',
            `The dataset would contain ${allDates.length} date intervals. ` +
                `Please reduce the number to below ${MAX_NUMBER_OF_GRID_COLUMNS} to display the data. ` +
                'You can achieve this by either narrowing the date range in the provided LAPIS filter or by selecting a larger granularity.',
        );
    }

    const subQueries = allDates.map(async (date) => {
        const dateFrom = date.firstDay.toString();
        const dateTo = date.lastDay.toString();

        const filter = {
            ...lapisFilter,
            [`${lapisDateField}From`]: dateFrom,
            [`${lapisDateField}To`]: dateTo,
        };

        const data = await fetchAndPrepareSubstitutionsOrDeletions(filter, sequenceType).evaluate(lapis, signal);
        const totalCountQuery = await getTotalNumberOfSequencesInDateRange(filter).evaluate(lapis, signal);
        return {
            date,
            mutations: data.content,
            totalCount: totalCountQuery.content[0].count,
        };
    });

    const data = await Promise.all(subQueries);

    return groupByMutation(data);
}

async function getDatesInDataset(
    lapisFilter: LapisFilter,
    lapis: string,
    granularity: TemporalGranularity,
    lapisDateField: string,
    signal: AbortSignal | undefined,
) {
    const { content: availableDates } = await queryAvailableDates(
        lapisFilter,
        lapis,
        granularity,
        lapisDateField,
        signal,
    );

    const { dateFrom, dateTo } = getDateRangeFromFilter(lapisFilter, lapisDateField, granularity);
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

function queryAvailableDates(
    lapisFilter: LapisFilter,
    lapis: string,
    granularity: TemporalGranularity,
    lapisDateField: string,
    signal?: AbortSignal,
) {
    return fetchAndPrepareDates(lapisFilter, granularity, lapisDateField).evaluate(lapis, signal);
}

function fetchAndPrepareDates<LapisDateField extends string>(
    filter: LapisFilter,
    granularity: TemporalGranularity,
    lapisDateField: LapisDateField,
) {
    const fetchData = new FetchAggregatedOperator<{ [key in LapisDateField]: string | null }>(filter, [lapisDateField]);
    const dataWithFixedDateKey = new RenameFieldOperator(fetchData, lapisDateField, 'date');
    const mapData = new MapOperator(dataWithFixedDateKey, (data) => mapDateToGranularityRange(data, granularity));
    const groupByData = new GroupByAndSumOperator(mapData, 'dateRange', 'count');
    const sortData = new SortOperator(groupByData, dateRangeCompare);
    return new MapOperator(sortData, (data) => data.dateRange);
}

function fetchAndPrepareSubstitutionsOrDeletions(filter: LapisFilter, sequenceType: SequenceType) {
    return new FetchSubstitutionsOrDeletionsOperator(filter, sequenceType, 0.001);
}

export function groupByMutation(data: MutationOverTimeData[]) {
    const dataArray = new Map2dBase<Substitution | Deletion, Temporal, MutationOverTimeMutationValue>(
        (mutation) => mutation.code,
        (date) => date.toString(),
    );

    data.forEach((mutationData) => {
        mutationData.mutations.forEach((mutationEntry) => {
            dataArray.set(mutationEntry.mutation, mutationData.date, {
                count: mutationEntry.count,
                proportion: mutationEntry.proportion,
                totalCount: mutationData.totalCount,
            });
        });
    });

    addZeroValuesForDatesWithNoMutationData(dataArray, data);

    return dataArray;
}

function addZeroValuesForDatesWithNoMutationData(
    dataArray: Map2dBase<Substitution | Deletion, Temporal, MutationOverTimeMutationValue>,
    data: MutationOverTimeData[],
) {
    if (dataArray.getFirstAxisKeys().length !== 0) {
        const someMutation = dataArray.getFirstAxisKeys()[0];
        data.forEach((mutationData) => {
            if (mutationData.mutations.length === 0) {
                dataArray.set(someMutation, mutationData.date, { count: 0, proportion: 0, totalCount: 0 });
            }
        });
    }
}

function getTotalNumberOfSequencesInDateRange(filter: LapisFilter) {
    return new FetchAggregatedOperator<{ count: number }>(filter);
}

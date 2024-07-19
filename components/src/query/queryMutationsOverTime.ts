import { mapDateToGranularityRange } from './queryAggregatedDataOverTime';
import { FetchAggregatedOperator } from '../operator/FetchAggregatedOperator';
import { FetchSubstitutionsOrDeletionsOperator } from '../operator/FetchSubstitutionsOrDeletionsOperator';
import { GroupByAndSumOperator } from '../operator/GroupByAndSumOperator';
import { MapOperator } from '../operator/MapOperator';
import { RenameFieldOperator } from '../operator/RenameFieldOperator';
import { SortOperator } from '../operator/SortOperator';
import {
    type LapisFilter,
    type SequenceType,
    type SubstitutionOrDeletionEntry,
    type TemporalGranularity,
} from '../types';
import { Map2d } from '../utils/Map2d';
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
};

export type MutationOverTimeMutationValue = number;
export type MutationOverTimeDataGroupedByMutation = Map2d<
    Substitution | Deletion,
    Temporal,
    MutationOverTimeMutationValue
>;

export async function queryMutationsOverTimeData(
    lapisFilter: LapisFilter,
    sequenceType: 'nucleotide' | 'amino acid',
    lapis: string,
    lapisDateField: string,
    granularity: TemporalGranularity,
    signal?: AbortSignal,
) {
    const allDates = await getDatesInDataset(lapisFilter, lapis, granularity, lapisDateField, signal);

    const subQueries = allDates.map(async (date) => {
        const dateFrom = date.firstDay.toString();
        const dateTo = date.lastDay.toString();

        const filter = {
            ...lapisFilter,
            [`${lapisDateField}From`]: dateFrom,
            [`${lapisDateField}To`]: dateTo,
        };

        const data = await fetchAndPrepareSubstitutionsOrDeletions(filter, sequenceType).evaluate(lapis, signal);
        return {
            date,
            mutations: data.content,
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
    const dataArray = new Map2d<Substitution | Deletion, Temporal, number>(
        (mutation) => mutation.code,
        (date) => date.toString(),
    );

    data.forEach((mutationData) => {
        mutationData.mutations.forEach((mutationEntry) => {
            dataArray.set(mutationEntry.mutation, mutationData.date, mutationEntry.proportion);
        });
    });

    addZeroValuesForDatesWithNoMutationData(dataArray, data);

    return dataArray;
}

function addZeroValuesForDatesWithNoMutationData(
    dataArray: Map2d<Substitution | Deletion, Temporal, number>,
    data: MutationOverTimeData[],
) {
    if (dataArray.getFirstAxisKeys().length !== 0) {
        const someMutation = dataArray.getFirstAxisKeys()[0];
        data.forEach((mutationData) => {
            if (mutationData.mutations.length === 0) {
                dataArray.set(someMutation, mutationData.date, 0);
            }
        });
    }
}
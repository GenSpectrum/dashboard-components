import pLimit from 'p-limit';

import { mapDateToGranularityRange } from './queryAggregatedDataOverTime';
import { FetchAggregatedOperator } from '../operator/FetchAggregatedOperator';
import { FetchSubstitutionsOrDeletionsOperator } from '../operator/FetchSubstitutionsOrDeletionsOperator';
import { GroupByAndSumOperator } from '../operator/GroupByAndSumOperator';
import { MapOperator } from '../operator/MapOperator';
import { RenameFieldOperator } from '../operator/RenameFieldOperator';
import { SortOperator } from '../operator/SortOperator';
import { UserFacingError } from '../preact/components/error-display';
import { BaseMutationOverTimeDataMap } from '../preact/mutationsOverTime/MutationOverTimeData';
import {
    type LapisFilter,
    type SequenceType,
    type SubstitutionOrDeletionEntry,
    type TemporalGranularity,
} from '../types';
import { type Deletion, type Substitution } from '../utils/mutations';
import {
    dateRangeCompare,
    generateAllInRange,
    getMinMaxTemporal,
    parseDateStringToTemporal,
    type Temporal,
    type TemporalClass,
} from '../utils/temporalClass';

export type MutationOverTimeData = {
    date: TemporalClass;
    mutations: SubstitutionOrDeletionEntry[];
    totalCount: number;
};

export type MutationOverTimeMutationValue =
    | {
          type: 'value';
          proportion: number;
          count: number;
          totalCount: number;
      }
    | {
          type: 'wastewaterValue';
          proportion: number;
      }
    | {
          type: 'belowThreshold';
          totalCount: number | null;
      }
    | null;

const MAX_NUMBER_OF_GRID_COLUMNS = 200;
export const MUTATIONS_OVER_TIME_MIN_PROPORTION = 0.001;

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

    if (allDates.length === 0) {
        return {
            content: [],
        };
    }

    const filter = {
        ...lapisFilter,
        [`${lapisDateField}From`]: allDates[0].firstDay.toString(),
        [`${lapisDateField}To`]: allDates[allDates.length - 1].lastDay.toString(),
    };

    return fetchAndPrepareSubstitutionsOrDeletions(filter, sequenceType).evaluate(lapis, signal);
}

export type MutationOverTimeQuery = {
    lapisFilter: LapisFilter;
    sequenceType: SequenceType;
    lapis: string;
    lapisDateField: string;
    granularity: TemporalGranularity;
    signal?: AbortSignal;
};

export async function queryMutationsOverTimeData({
    lapisFilter,
    sequenceType,
    lapis,
    lapisDateField,
    granularity,
    signal,
}: MutationOverTimeQuery) {
    const allDates = await getDatesInDataset(lapisFilter, lapis, granularity, lapisDateField, signal);

    if (allDates.length > MAX_NUMBER_OF_GRID_COLUMNS) {
        throw new UserFacingError(
            'Too many dates',
            `The dataset would contain ${allDates.length} date intervals. ` +
                `Please reduce the number to below ${MAX_NUMBER_OF_GRID_COLUMNS} to display the data. ` +
                'You can achieve this by either narrowing the date range in the provided LAPIS filter or by selecting a larger granularity.',
        );
    }

    const overallMutationData = (
        await queryOverallMutationData({
            lapisFilter,
            sequenceType,
            lapis,
            lapisDateField,
            granularity,
        })
    ).content;

    const dateFrom = allDates[0].firstDay.dateString;
    const dateTo = allDates[allDates.length - 1].lastDay.dateString;

    const limit = pLimit(100);

    const subQueries = overallMutationData.map(async (mutation) => {
        return limit(async () => {
            const filter = {
                ...lapisFilter,
                [`${lapisDateField}From`]: dateFrom,
                [`${lapisDateField}To`]: dateTo,
                nucleotideMutations: [mutation.mutation.code],
            };

            const mutationCountPerDate = await fetchMutationCounts(filter, 'date').evaluate(lapis, signal);
            const mapOfDates = new Map<TemporalClass, number>(allDates.map((date) => [date, 0]));
            mutationCountPerDate.content.forEach((countPerDate) => {
                if (countPerDate.date !== null) {
                    const temporal = parseDateStringToTemporal(countPerDate.date, granularity);
                    const mapEntry = mapOfDates.get(temporal);
                    if (mapEntry !== undefined) {
                        mapOfDates.set(temporal, mapEntry + countPerDate.count);
                    } else {
                        mapOfDates.set(temporal, countPerDate.count);
                    }
                }
            });

            return { mutation, mutationCountPerDate: mapOfDates };
        });
    });

    const data = await Promise.all(subQueries);

    return {
        mutationOverTimeData: groupByMutation(data),
        overallMutationData,
    };
}

function fetchMutationCounts<LapisDateField extends string>(filter: LapisFilter, lapisDateField: LapisDateField) {
    const fetchData = new FetchAggregatedOperator<{ [key in LapisDateField]: string | null }>(filter, [lapisDateField]);
    return fetchData;
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
    return new FetchSubstitutionsOrDeletionsOperator(filter, sequenceType, MUTATIONS_OVER_TIME_MIN_PROPORTION);
}

export function serializeSubstitutionOrDeletion(mutation: Substitution | Deletion) {
    return mutation.code;
}

export function serializeTemporal(date: Temporal) {
    return date.dateString;
}

export function groupByMutation(
    data: {
        mutation: SubstitutionOrDeletionEntry;
        mutationCountPerDate: Map<TemporalClass, number>;
    }[],
) {
    const dataArray = new BaseMutationOverTimeDataMap();

    data.forEach((mutationData) => {
        mutationData.mutationCountPerDate.forEach((value, key) => {
            dataArray.set(mutationData.mutation.mutation, key, {
                type: 'value',
                count: value,
                proportion: value,
                totalCount: value,
            });
        });
    });

    return dataArray;
}

import { fetchMutationsOverTime } from '../lapisApi/lapisApi';
import { FetchSubstitutionsOrDeletionsOperator } from '../operator/FetchSubstitutionsOrDeletionsOperator';
import { UserFacingError } from '../preact/components/error-display';
import { BaseMutationOverTimeDataMap } from '../preact/mutationsOverTime/MutationOverTimeData';
import { sortSubstitutionsAndDeletions } from '../preact/shared/sort/sortSubstitutionsAndDeletions';
import {
    type DeletionEntry,
    type LapisFilter,
    type SequenceType,
    type SubstitutionEntry,
    type SubstitutionOrDeletionEntry,
    type TemporalGranularity,
} from '../types';
import { type Map2DContents } from '../utils/map2d';
import {
    type Deletion,
    type Substitution,
    toSubstitutionOrDeletion,
    DeletionClass,
    SubstitutionClass,
} from '../utils/mutations';
import { compareTemporal, type Temporal, type TemporalClass, toTemporal } from '../utils/temporalClass';
import { queryDatesInDataset } from './queryDatesInDataset';

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
          type: 'valueWithCoverage';
          count: number;
          coverage: number;
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

export function getProportion(value: MutationOverTimeMutationValue) {
    switch (value?.type) {
        case 'value':
        case 'wastewaterValue':
            return value.proportion;
        case 'valueWithCoverage':
            return value.count / value.coverage;
        case 'belowThreshold':
            return undefined;
    }
    return undefined;
}

const MAX_NUMBER_OF_GRID_COLUMNS = 200;
export const MUTATIONS_OVER_TIME_MIN_PROPORTION = 0.001;

/**
 * Create SubstitutionOrDeletionEntry for given code with count and proportion 0.
 * @param code a mutation code like G44T or A23-
 */
function codeToEmptyEntry(code: string): SubstitutionOrDeletionEntry | null {
    const maybeDeletion = DeletionClass.parse(code);
    if (maybeDeletion) {
        return {
            type: 'deletion',
            mutation: maybeDeletion,
            count: 0,
            proportion: 0,
        };
    }
    const maybeSubstitution = SubstitutionClass.parse(code);
    if (maybeSubstitution) {
        return {
            type: 'substitution',
            mutation: maybeSubstitution,
            count: 0,
            proportion: 0,
        };
    }
    return null;
}

/**
 * Return counts and proportions for all mutations that match the lapisFilter.
 * If `includeMutations` are given, the result will also be filtered for those.
 * Any mutation that isn't in the result, but is in the `includeMutations` will
 * be in the result with count and proportion as 0.
 */
async function queryOverallMutationData({
    lapisFilter,
    sequenceType,
    lapis,
    granularity,
    lapisDateField,
    includeMutations,
    signal,
}: {
    lapisFilter: LapisFilter;
    sequenceType: SequenceType;
    lapis: string;
    granularity: TemporalGranularity;
    lapisDateField: string;
    includeMutations?: string[];
    signal?: AbortSignal;
}) {
    const requestedDateRanges = await queryDatesInDataset(lapisFilter, lapis, granularity, lapisDateField, signal);

    if (requestedDateRanges.length === 0) {
        if (includeMutations) {
            return {
                content: includeMutations
                    .map(codeToEmptyEntry)
                    .filter((e): e is SubstitutionOrDeletionEntry => e !== null),
            };
        } else {
            return {
                content: [],
            };
        }
    }

    const filter = {
        ...lapisFilter,
        [`${lapisDateField}From`]: requestedDateRanges[0].firstDay.toString(),
        [`${lapisDateField}To`]: requestedDateRanges[requestedDateRanges.length - 1].lastDay.toString(),
    };

    let dataPromise = fetchAndPrepareSubstitutionsOrDeletions(filter, sequenceType).evaluate(lapis, signal);

    if (includeMutations) {
        dataPromise = dataPromise.then((data) => {
            return {
                content: includeMutations
                    .map((code) => {
                        const found = data.content.find((m) => m.mutation.code === code);
                        return found ?? codeToEmptyEntry(code);
                    })
                    .filter((e): e is SubstitutionOrDeletionEntry => e !== null),
            };
        });
    }

    return dataPromise;
}

export type MutationOverTimeQuery = {
    lapisFilter: LapisFilter;
    displayMutations?: string[];
    sequenceType: SequenceType;
    lapis: string;
    lapisDateField: string;
    granularity: TemporalGranularity;
    useNewEndpoint?: boolean; // TODO - can be removed, not needed anymore
    signal?: AbortSignal;
};

export async function queryMutationsOverTimeData(query: MutationOverTimeQuery) {
    const { lapisFilter, displayMutations, sequenceType, lapis, lapisDateField, granularity, signal } = query;

    const requestedDateRanges = await queryDatesInDataset(lapisFilter, lapis, granularity, lapisDateField, signal);

    if (requestedDateRanges.length > MAX_NUMBER_OF_GRID_COLUMNS) {
        throw new UserFacingError(
            'Too many dates',
            `The dataset would contain ${requestedDateRanges.length} date intervals. ` +
                `Please reduce the number to below ${MAX_NUMBER_OF_GRID_COLUMNS} to display the data. ` +
                'You can achieve this by either narrowing the date range in the provided LAPIS filter or by selecting a larger granularity.',
        );
    }

    const overallMutationData = queryOverallMutationData({
        lapisFilter,
        sequenceType,
        lapis,
        lapisDateField,
        includeMutations: displayMutations,
        granularity,
    }).then((r) => r.content);

    return queryMutationsOverTimeDataDirectEndpoint(requestedDateRanges, overallMutationData, query);
}

async function queryMutationsOverTimeDataDirectEndpoint(
    allDates: TemporalClass[],
    overallMutationDataPromise: Promise<SubstitutionOrDeletionEntry[]>,
    { lapisFilter, sequenceType, lapis, lapisDateField, signal }: MutationOverTimeQuery,
): Promise<{
    mutationOverTimeData: BaseMutationOverTimeDataMap;
    overallMutationData: SubstitutionOrDeletionEntry[];
}> {
    const overallMutationData = await overallMutationDataPromise;
    overallMutationData.sort((a, b) => sortSubstitutionsAndDeletions(a.mutation, b.mutation));

    const includeMutations = overallMutationData.map((value) => value.mutation.code);
    const apiResult = await fetchMutationsOverTime(
        lapis,
        {
            filters: lapisFilter,
            dateRanges: allDates.map((date) => ({
                dateFrom: date.firstDay.toString(),
                dateTo: date.lastDay.toString(),
            })),
            includeMutations,
            dateField: lapisDateField,
        },
        sequenceType,
        signal,
    );

    const totalCounts = apiResult.data.totalCountsByDateRange;
    const responseMutations = apiResult.data.mutations.map(parseMutationCode);
    const mutationEntries: SubstitutionOrDeletionEntry[] = responseMutations.map((mutation, i) => {
        const numbers = {
            count: overallMutationData[i].count,
            proportion: overallMutationData[i].proportion,
        };
        if (mutation.type === 'deletion') {
            return {
                type: 'deletion',
                mutation,
                ...numbers,
            };
        } else {
            return {
                type: 'substitution',
                mutation,
                ...numbers,
            };
        }
    });

    const mutationOverTimeData: Map2DContents<Substitution | Deletion, Temporal, MutationOverTimeMutationValue> = {
        keysFirstAxis: new Map(responseMutations.map((mutation) => [mutation.code, mutation])),
        keysSecondAxis: new Map(allDates.map((date) => [date.dateString, date])),
        data: new Map(
            responseMutations.map((mutation, i) => [
                mutation.code,
                new Map(
                    allDates.map((date, j): [string, MutationOverTimeMutationValue] => {
                        if (totalCounts[j] === 0) {
                            return [date.dateString, null];
                        }
                        // 'count' in the API resp. is the number of seqs with the mutation
                        const count = apiResult.data.data[i][j].count;
                        // 'coverage' in the API resp. is the number of seqs. that have a non-ambiguous symbol at position
                        const coverage = apiResult.data.data[i][j].coverage;
                        const totalCount = totalCounts[j];
                        if (coverage === 0) {
                            return [
                                date.dateString,
                                {
                                    type: 'belowThreshold',
                                    totalCount,
                                },
                            ];
                        }
                        return [
                            date.dateString,
                            {
                                type: 'valueWithCoverage',
                                count,
                                coverage,
                                totalCount,
                            },
                        ];
                    }),
                ),
            ]),
        ),
    };

    return {
        mutationOverTimeData: new BaseMutationOverTimeDataMap(mutationOverTimeData),
        overallMutationData: mutationEntries,
    };
}

function parseMutationCode(code: string): SubstitutionClass | DeletionClass {
    const maybeDeletion = DeletionClass.parse(code);
    if (maybeDeletion) {
        return maybeDeletion;
    }
    const maybeSubstitution = SubstitutionClass.parse(code);
    if (maybeSubstitution) {
        return maybeSubstitution;
    }
    throw Error(`Given code is not valid: ${code}`);
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
    data: MutationOverTimeData[],
    overallMutationData: (SubstitutionEntry | DeletionEntry)[],
): BaseMutationOverTimeDataMap {
    const dataArray = new BaseMutationOverTimeDataMap();

    const allDates = data.map((mutationData) => mutationData.date);

    const sortedOverallMutationData = overallMutationData
        .sort((a, b) => sortSubstitutionsAndDeletions(a.mutation, b.mutation))
        .map((entry) => {
            return toSubstitutionOrDeletion(entry.mutation);
        });
    const sortedDates = allDates.sort((a, b) => compareTemporal(a, b)).map((date) => toTemporal(date));

    sortedOverallMutationData.forEach((mutationData) => {
        sortedDates.forEach((date) => {
            dataArray.set(mutationData, date, null);
        });
    });

    data.forEach((mutationData) => {
        if (mutationData.totalCount == 0) {
            return;
        }

        const date = toTemporal(mutationData.date);

        mutationData.mutations.forEach((mutationEntry) => {
            const mutation = toSubstitutionOrDeletion(mutationEntry.mutation);

            if (dataArray.get(mutation, date) !== undefined) {
                dataArray.set(mutation, date, {
                    type: 'value',
                    count: mutationEntry.count,
                    proportion: mutationEntry.proportion,
                    totalCount: mutationData.totalCount,
                });
            }
        });

        for (const firstAxisKey of dataArray.getFirstAxisKeys()) {
            if (dataArray.get(firstAxisKey, date) === null) {
                dataArray.set(firstAxisKey, date, {
                    type: 'belowThreshold',
                    totalCount: mutationData.totalCount,
                });
            }
        }
    });

    return dataArray;
}

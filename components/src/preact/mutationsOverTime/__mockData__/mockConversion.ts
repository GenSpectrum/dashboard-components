import type { MutationOverTimeMutationValue, MutationOverTimeQuery } from '../../../query/queryMutationsOverTime';
import type { SubstitutionOrDeletionEntry } from '../../../types';
import type { Deletion, Substitution } from '../../../utils/mutations';
import type { Temporal } from '../../../utils/temporalClass';

export type MutationOverTimeMockData = {
    query: MutationOverTimeQuery;
    response: {
        overallMutationData: SubstitutionOrDeletionEntry<Substitution, Deletion>[];
        mutationOverTimeSerializedAsArray: {
            keysFirstAxis: [string, Substitution | Deletion][];
            keysSecondAxis: [string, Temporal][];
            data: [string, [string, MutationOverTimeMutationValue][]][];
        };
    };
};

export function getMutationOverTimeMock(mockData: MutationOverTimeMockData) {
    return {
        query: mockData.query,
        response: {
            overallMutationData: mockData.response.overallMutationData,
            mutationOverTimeSerialized: get2dMapFromArray({
                ...mockData.response.mutationOverTimeSerializedAsArray,
            }),
        },
    };
}

function get2dMapFromArray({
    keysFirstAxis,
    keysSecondAxis,
    data,
}: {
    keysFirstAxis: [string, Substitution | Deletion][];
    keysSecondAxis: [string, Temporal][];
    data: [string, [string, MutationOverTimeMutationValue][]][];
}) {
    const keysFirstAxisMap = new Map<string, Substitution | Deletion>(keysFirstAxis);
    const keysSecondAxisMap = new Map<string, Temporal>(keysSecondAxis);

    const dataMapArrays = data.map(([keyFirstAxis, dataMapArray]) => {
        const dataMap = new Map<string, MutationOverTimeMutationValue>(dataMapArray);
        return [keyFirstAxis, dataMap] as [string, Map<string, MutationOverTimeMutationValue>];
    });

    const dataMap = new Map<string, Map<string, MutationOverTimeMutationValue>>(dataMapArrays);

    return {
        keysFirstAxis: keysFirstAxisMap,
        keysSecondAxis: keysSecondAxisMap,
        data: dataMap,
    };
}

import {
    type MutationOverTimeMutationValue,
    type MutationOverTimeQuery,
    queryMutationsOverTimeData,
} from '../../query/queryMutationsOverTime';
import type { SubstitutionOrDeletionEntry } from '../../types';
import { type Map2DContents } from '../../utils/map2d';
import type { Deletion, Substitution } from '../../utils/mutations';
import type { Temporal } from '../../utils/temporalClass';
import { workerFunction } from '../webWorkers/workerFunction';

export type MutationOverTimeWorkerResponse = {
    overallMutationData: SubstitutionOrDeletionEntry<Substitution, Deletion>[];
    mutationOverTimeSerialized: Map2DContents<Substitution | Deletion, Temporal, MutationOverTimeMutationValue>;
};

export async function getMutationOverTimeWorkerFunction(event: MessageEvent<MutationOverTimeQuery>) {
    const mutationOverTimeData = await queryMutationsOverTimeData(event.data);

    const workerResponse: MutationOverTimeWorkerResponse = {
        overallMutationData: mutationOverTimeData.overallMutationData,
        mutationOverTimeSerialized: mutationOverTimeData.mutationOverTimeData.getContents(),
    };
    return workerResponse;
}

self.onmessage = async function (event: MessageEvent<MutationOverTimeQuery>) {
    await workerFunction(() => getMutationOverTimeWorkerFunction(event));
};

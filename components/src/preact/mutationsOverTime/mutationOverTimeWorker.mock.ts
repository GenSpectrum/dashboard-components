import { aminoAcidMutationsByDay } from './__mockData__/aminoAcidMutationsByDay';
import { getMutationOverTimeWorkerFunction, type MutationOverTimeWorkerResponse } from './mutationOverTimeWorker';
import { type MutationOverTimeQuery } from '../../query/queryMutationsOverTime';
import { workerFunction } from '../webWorkers/workerFunction';
import { byWeek } from './__mockData__/byWeek';
import { defaultMockData } from './__mockData__/defaultMockData';
import { getMutationOverTimeMock } from './__mockData__/mockConversion';
import { noDataWhenNoMutationsAreInFilter } from './__mockData__/noDataWhenNoMutationsAreInFilter';
import { showsMessageWhenTooManyMutations } from './__mockData__/showsMessageWhenTooManyMutations';
import { withDisplayMutations } from './__mockData__/withDisplayMutations';

const mockQueries: { query: MutationOverTimeQuery; response: MutationOverTimeWorkerResponse }[] = [
    getMutationOverTimeMock(defaultMockData),
    getMutationOverTimeMock(showsMessageWhenTooManyMutations),
    getMutationOverTimeMock(byWeek),
    getMutationOverTimeMock(withDisplayMutations),
    getMutationOverTimeMock(aminoAcidMutationsByDay),
    getMutationOverTimeMock(noDataWhenNoMutationsAreInFilter),
];

self.onmessage = async function (event: MessageEvent<MutationOverTimeQuery>) {
    await workerFunction(async () => {
        const query = mockQueries.find((mockQuery) => JSON.stringify(mockQuery.query) === JSON.stringify(event.data));

        if (query !== undefined) {
            return query.response;
        }

        return await getMutationOverTimeWorkerFunction(event);
    });
};

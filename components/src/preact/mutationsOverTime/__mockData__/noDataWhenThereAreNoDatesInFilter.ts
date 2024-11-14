import type { MutationOverTimeMockData } from './mockConversion';

export const noDataWhenNoMutationsAreInFilter: MutationOverTimeMockData = {
    query: {
        lapisFilter: {
            dateFrom: '2345-01-01',
            dateTo: '2020-01-02',
        },
        sequenceType: 'nucleotide',
        granularity: 'year',
        lapisDateField: 'date',
        lapis: 'https://lapis.cov-spectrum.org/open/v2',
    },
    response: {
        overallMutationData: [],
        mutationOverTimeSerializedAsArray: {
            keysFirstAxis: [],
            keysSecondAxis: [],
            data: [],
        },
    },
};

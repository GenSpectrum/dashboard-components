import type { MutationOverTimeMockData } from './mockConversion';

export const noDataWhenNoMutationsAreInFilter: MutationOverTimeMockData = {
    query: {
        lapisFilter: {
            dateFrom: '1800-01-01',
            dateTo: '1800-01-02',
        },
        sequenceType: 'nucleotide',
        granularity: 'year',
        lapisDateField: 'date',
        lapis: 'https://lapis.cov-spectrum.org/open/v2',
        useNewEndpoint: false,
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

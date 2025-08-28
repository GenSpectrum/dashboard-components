import { type MutationOverTimeMockData } from './mockConversion';

export const withDisplayMutations: MutationOverTimeMockData = {
    query: {
        lapisFilter: {
            pangoLineage: 'JN.1*',
            dateFrom: '2024-01-15',
            dateTo: '2024-07-10',
        },
        sequenceType: 'nucleotide',
        granularity: 'month',
        lapisDateField: 'date',
        lapis: 'https://lapis.cov-spectrum.org/open/v2',
        displayMutations: ['A19722G', 'G21641T', 'T21653-'],
        useNewEndpoint: false,
    },
    response: {
        overallMutationData: [
            {
                type: 'substitution',
                mutation: {
                    valueAtReference: 'A',
                    substitutionValue: 'G',
                    position: 19722,
                    type: 'substitution',
                    code: 'A19722G',
                },
                count: 10234,
                proportion: 0.09900453714363107,
            },
            {
                type: 'substitution',
                mutation: {
                    valueAtReference: 'G',
                    substitutionValue: 'T',
                    position: 21641,
                    type: 'substitution',
                    code: 'G21641T',
                },
                count: 4485,
                proportion: 0.05001951709139575,
            },
            {
                type: 'deletion',
                mutation: {
                    valueAtReference: 'T',
                    position: 21653,
                    type: 'deletion',
                    code: 'T21653-',
                },
                count: 17169,
                proportion: 0.16814713976514833,
            },
        ],
        mutationOverTimeSerializedAsArray: {
            data: [
                [
                    'A19722G',
                    [
                        [
                            '2024-01',
                            {
                                type: 'belowThreshold',
                                totalCount: 26387,
                            },
                        ],
                        [
                            '2024-02',
                            {
                                type: 'belowThreshold',
                                totalCount: 17340,
                            },
                        ],
                        [
                            '2024-03',
                            {
                                type: 'value',
                                count: 36,
                                proportion: 0.0043859649122807015,
                                totalCount: 8236,
                            },
                        ],
                        [
                            '2024-04',
                            {
                                type: 'value',
                                count: 194,
                                proportion: 0.030082183284230114,
                                totalCount: 6488,
                            },
                        ],
                        [
                            '2024-05',
                            {
                                type: 'value',
                                count: 759,
                                proportion: 0.08675277174534232,
                                totalCount: 8799,
                            },
                        ],
                        [
                            '2024-06',
                            {
                                type: 'value',
                                count: 2921,
                                proportion: 0.19071559153826065,
                                totalCount: 15400,
                            },
                        ],
                        [
                            '2024-07',
                            {
                                type: 'value',
                                count: 6318,
                                proportion: 0.2995448511283899,
                                totalCount: 21234,
                            },
                        ],
                    ],
                ],
                [
                    'G21641T',
                    [
                        [
                            '2024-01',
                            {
                                type: 'value',
                                count: 1625,
                                proportion: 0.07085858806087297,
                                totalCount: 26387,
                            },
                        ],
                        [
                            '2024-02',
                            {
                                type: 'value',
                                count: 419,
                                proportion: 0.027931471235250985,
                                totalCount: 17340,
                            },
                        ],
                        [
                            '2024-03',
                            {
                                type: 'value',
                                count: 228,
                                proportion: 0.03451930355791068,
                                totalCount: 8236,
                            },
                        ],
                        [
                            '2024-04',
                            {
                                type: 'value',
                                count: 545,
                                proportion: 0.10551790900290416,
                                totalCount: 6488,
                            },
                        ],
                        [
                            '2024-05',
                            {
                                type: 'value',
                                count: 666,
                                proportion: 0.09498003422703936,
                                totalCount: 8799,
                            },
                        ],
                        [
                            '2024-06',
                            {
                                type: 'value',
                                count: 732,
                                proportion: 0.05598470363288719,
                                totalCount: 15400,
                            },
                        ],
                        [
                            '2024-07',
                            {
                                type: 'value',
                                count: 270,
                                proportion: 0.013585589212035825,
                                totalCount: 21234,
                            },
                        ],
                    ],
                ],
                [
                    'T21653-',
                    [
                        [
                            '2024-01',
                            {
                                type: 'belowThreshold',
                                totalCount: 26387,
                            },
                        ],
                        [
                            '2024-02',
                            {
                                type: 'belowThreshold',
                                totalCount: 17340,
                            },
                        ],
                        [
                            '2024-03',
                            {
                                type: 'value',
                                count: 40,
                                proportion: 0.004921259842519685,
                                totalCount: 8236,
                            },
                        ],
                        [
                            '2024-04',
                            {
                                type: 'value',
                                count: 228,
                                proportion: 0.03576470588235294,
                                totalCount: 6488,
                            },
                        ],
                        [
                            '2024-05',
                            {
                                type: 'value',
                                count: 1304,
                                proportion: 0.151504589287789,
                                totalCount: 8799,
                            },
                        ],
                        [
                            '2024-06',
                            {
                                type: 'value',
                                count: 4744,
                                proportion: 0.31656212464967304,
                                totalCount: 15400,
                            },
                        ],
                        [
                            '2024-07',
                            {
                                type: 'value',
                                count: 10815,
                                proportion: 0.5221610660486674,
                                totalCount: 21234,
                            },
                        ],
                    ],
                ],
            ],
            keysFirstAxis: [
                [
                    'A19722G',
                    {
                        type: 'substitution',
                        code: 'A19722G',
                        position: 19722,
                        valueAtReference: 'A',
                        substitutionValue: 'G',
                    },
                ],
                [
                    'G21641T',
                    {
                        type: 'substitution',
                        code: 'G21641T',
                        position: 21641,
                        valueAtReference: 'G',
                        substitutionValue: 'T',
                    },
                ],
                [
                    'T21653-',
                    {
                        type: 'deletion',
                        code: 'T21653-',
                        position: 21653,
                        valueAtReference: 'T',
                    },
                ],
            ],
            keysSecondAxis: [
                [
                    '2024-01',
                    {
                        type: 'YearMonth',
                        yearNumber: 2024,
                        monthNumber: 1,
                        dateString: '2024-01',
                    },
                ],
                [
                    '2024-02',
                    {
                        type: 'YearMonth',
                        yearNumber: 2024,
                        monthNumber: 2,
                        dateString: '2024-02',
                    },
                ],
                [
                    '2024-03',
                    {
                        type: 'YearMonth',
                        yearNumber: 2024,
                        monthNumber: 3,
                        dateString: '2024-03',
                    },
                ],
                [
                    '2024-04',
                    {
                        type: 'YearMonth',
                        yearNumber: 2024,
                        monthNumber: 4,
                        dateString: '2024-04',
                    },
                ],
                [
                    '2024-05',
                    {
                        type: 'YearMonth',
                        yearNumber: 2024,
                        monthNumber: 5,
                        dateString: '2024-05',
                    },
                ],
                [
                    '2024-06',
                    {
                        type: 'YearMonth',
                        yearNumber: 2024,
                        monthNumber: 6,
                        dateString: '2024-06',
                    },
                ],
                [
                    '2024-07',
                    {
                        type: 'YearMonth',
                        yearNumber: 2024,
                        monthNumber: 7,
                        dateString: '2024-07',
                    },
                ],
            ],
        },
    },
};

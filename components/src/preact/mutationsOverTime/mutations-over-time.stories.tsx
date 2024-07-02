import { type Meta, type StoryObj } from '@storybook/preact';

import aggregated_date from './__mockData__/aggregated_date.json';
import nucleotideMutation_01 from './__mockData__/nucleotideMutations_2024_01.json';
import nucleotideMutation_02 from './__mockData__/nucleotideMutations_2024_02.json';
import nucleotideMutation_03 from './__mockData__/nucleotideMutations_2024_03.json';
import nucleotideMutation_04 from './__mockData__/nucleotideMutations_2024_04.json';
import nucleotideMutation_05 from './__mockData__/nucleotideMutations_2024_05.json';
import nucleotideMutation_06 from './__mockData__/nucleotideMutations_2024_06.json';
import nucleotideMutation_07 from './__mockData__/nucleotideMutations_2024_07.json';
import { MutationsOverTime, type MutationsOverTimeProps } from './mutations-over-time';
import { AGGREGATED_ENDPOINT, LAPIS_URL, NUCLEOTIDE_MUTATIONS_ENDPOINT } from '../../constants';
import referenceGenome from '../../lapisApi/__mockData__/referenceGenome.json';
import { LapisUrlContext } from '../LapisUrlContext';
import { ReferenceGenomeContext } from '../ReferenceGenomeContext';

const meta: Meta<MutationsOverTimeProps> = {
    title: 'Visualization/Mutation over time',
    component: MutationsOverTime,
    argTypes: {
        lapisFilter: { control: 'object' },
        sequenceType: {
            options: ['nucleotide', 'amino acid'],
            control: { type: 'radio' },
        },
        views: {
            options: ['table', 'grid', 'insertions'],
            control: { type: 'check' },
        },
        width: { control: 'text' },
        height: { control: 'text' },
        granularity: {
            options: ['day', 'week', 'month', 'year'],
            control: { type: 'radio' },
        },
        lapisDateField: { control: 'text' },
    },
};

export default meta;

const Template = {
    render: (args: MutationsOverTimeProps) => (
        <LapisUrlContext.Provider value={LAPIS_URL}>
            <ReferenceGenomeContext.Provider value={referenceGenome}>
                <MutationsOverTime
                    lapisFilter={args.lapisFilter}
                    sequenceType={args.sequenceType}
                    views={args.views}
                    width={args.width}
                    height={args.height}
                    granularity={args.granularity}
                    lapisDateField={args.lapisDateField}
                />
            </ReferenceGenomeContext.Provider>
        </LapisUrlContext.Provider>
    ),
};

export const Default: StoryObj<MutationsOverTimeProps> = {
    ...Template,
    args: {
        lapisFilter: { pangoLineage: 'JN.1*', dateFrom: '2024-01-15', dateTo: '2024-07-10' },
        sequenceType: 'nucleotide',
        views: ['grid'],
        width: '100%',
        height: '700px',
        granularity: 'month',
        lapisDateField: 'date',
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'aggregated_dates',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            dateFrom: '2024-01-15',
                            dateTo: '2024-07-10',
                            fields: ['date'],
                            pangoLineage: 'JN.1*',
                        },
                    },
                    response: {
                        status: 200,
                        body: aggregated_date,
                    },
                },
                {
                    matcher: {
                        name: 'nucleotideMutations_01',
                        url: NUCLEOTIDE_MUTATIONS_ENDPOINT,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-01-01',
                            dateTo: '2024-01-31',
                            minProportion: 0,
                        },
                    },
                    response: {
                        status: 200,
                        body: nucleotideMutation_01,
                    },
                },
                {
                    matcher: {
                        name: 'nucleotideMutations_02',
                        url: NUCLEOTIDE_MUTATIONS_ENDPOINT,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-02-01',
                            dateTo: '2024-02-29',
                            minProportion: 0,
                        },
                    },
                    response: {
                        status: 200,
                        body: nucleotideMutation_02,
                    },
                },
                {
                    matcher: {
                        name: 'nucleotideMutations_03',
                        url: NUCLEOTIDE_MUTATIONS_ENDPOINT,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-03-01',
                            dateTo: '2024-03-31',
                            minProportion: 0,
                        },
                        response: {
                            status: 200,
                            body: nucleotideMutation_03,
                        },
                    },
                },
                {
                    matcher: {
                        name: 'nucleotideMutations_04',
                        url: NUCLEOTIDE_MUTATIONS_ENDPOINT,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-04-01',
                            dateTo: '2024-04-30',
                            minProportion: 0,
                        },
                        response: {
                            status: 200,
                            body: nucleotideMutation_04,
                        },
                    },
                },
                {
                    matcher: {
                        name: 'nucleotideMutations_05',
                        url: NUCLEOTIDE_MUTATIONS_ENDPOINT,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-05-01',
                            dateTo: '2024-05-31',
                            minProportion: 0,
                        },
                        response: {
                            status: 200,
                            body: nucleotideMutation_05,
                        },
                    },
                },
                {
                    matcher: {
                        name: 'nucleotideMutations_06',
                        url: NUCLEOTIDE_MUTATIONS_ENDPOINT,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-06-01',
                            dateTo: '2024-06-30',
                            minProportion: 0,
                        },
                        response: {
                            status: 200,
                            body: nucleotideMutation_06,
                        },
                    },
                },

                {
                    matcher: {
                        name: 'nucleotideMutations_07',
                        url: NUCLEOTIDE_MUTATIONS_ENDPOINT,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-07-01',
                            dateTo: '2024-07-31',
                            minProportion: 0,
                        },
                        response: {
                            status: 200,
                            body: nucleotideMutation_07,
                        },
                    },
                },
            ],
        },
    },
};

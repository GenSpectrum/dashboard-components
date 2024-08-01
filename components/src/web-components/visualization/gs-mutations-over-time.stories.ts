import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './gs-mutations-over-time';
import '../app';
import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import {
    AGGREGATED_ENDPOINT,
    AMINO_ACID_MUTATIONS_ENDPOINT,
    LAPIS_URL,
    NUCLEOTIDE_MUTATIONS_ENDPOINT,
} from '../../constants';
import aggregated_01 from '../../preact/mutationsOverTime/__mockData__/aggregated_2024_01.json';
import aggregated_02 from '../../preact/mutationsOverTime/__mockData__/aggregated_2024_02.json';
import aggregated_03 from '../../preact/mutationsOverTime/__mockData__/aggregated_2024_03.json';
import aggregated_04 from '../../preact/mutationsOverTime/__mockData__/aggregated_2024_04.json';
import aggregated_05 from '../../preact/mutationsOverTime/__mockData__/aggregated_2024_05.json';
import aggregated_06 from '../../preact/mutationsOverTime/__mockData__/aggregated_2024_06.json';
import aggregated_07 from '../../preact/mutationsOverTime/__mockData__/aggregated_2024_07.json';
import aggregated_20_01_2024 from '../../preact/mutationsOverTime/__mockData__/aggregated_20_01_2024.json';
import aggregated_21_01_2024 from '../../preact/mutationsOverTime/__mockData__/aggregated_21_01_2024.json';
import aggregated_22_01_2024 from '../../preact/mutationsOverTime/__mockData__/aggregated_22_01_2024.json';
import aggregated_23_01_2024 from '../../preact/mutationsOverTime/__mockData__/aggregated_23_01_2024.json';
import aggregated_24_01_2024 from '../../preact/mutationsOverTime/__mockData__/aggregated_24_01_2024.json';
import aggregated_25_01_2024 from '../../preact/mutationsOverTime/__mockData__/aggregated_25_01_2024.json';
import aggregated_26_01_2024 from '../../preact/mutationsOverTime/__mockData__/aggregated_26_01_2024.json';
import aggregated_byDay from '../../preact/mutationsOverTime/__mockData__/aggregated_byDay.json';
import aggregated_byWeek from '../../preact/mutationsOverTime/__mockData__/aggregated_byWeek.json';
import aggregated_date from '../../preact/mutationsOverTime/__mockData__/aggregated_date.json';
import aggregated_week3 from '../../preact/mutationsOverTime/__mockData__/aggregated_week3_2024.json';
import aggregated_week4 from '../../preact/mutationsOverTime/__mockData__/aggregated_week4_2024.json';
import aggregated_week5 from '../../preact/mutationsOverTime/__mockData__/aggregated_week5_2024.json';
import aggregated_week6 from '../../preact/mutationsOverTime/__mockData__/aggregated_week6_2024.json';
import aminoAcidMutations_20_01_2024 from '../../preact/mutationsOverTime/__mockData__/aminoAcidMutations_20_01_2024.json';
import aminoAcidMutations_21_01_2024 from '../../preact/mutationsOverTime/__mockData__/aminoAcidMutations_21_01_2024.json';
import aminoAcidMutations_22_01_2024 from '../../preact/mutationsOverTime/__mockData__/aminoAcidMutations_22_01_2024.json';
import aminoAcidMutations_23_01_2024 from '../../preact/mutationsOverTime/__mockData__/aminoAcidMutations_23_01_2024.json';
import aminoAcidMutations_24_01_2024 from '../../preact/mutationsOverTime/__mockData__/aminoAcidMutations_24_01_2024.json';
import aminoAcidMutations_25_01_2024 from '../../preact/mutationsOverTime/__mockData__/aminoAcidMutations_25_01_2024.json';
import aminoAcidMutations_26_01_2024 from '../../preact/mutationsOverTime/__mockData__/aminoAcidMutations_26_01_2024.json';
import aminoAcidMutations_byDayOverall from '../../preact/mutationsOverTime/__mockData__/aminoAcidMutations_byDayOverall.json';
import nucleotideMutation_01 from '../../preact/mutationsOverTime/__mockData__/nucleotideMutations_2024_01.json';
import nucleotideMutation_02 from '../../preact/mutationsOverTime/__mockData__/nucleotideMutations_2024_02.json';
import nucleotideMutation_03 from '../../preact/mutationsOverTime/__mockData__/nucleotideMutations_2024_03.json';
import nucleotideMutation_04 from '../../preact/mutationsOverTime/__mockData__/nucleotideMutations_2024_04.json';
import nucleotideMutation_05 from '../../preact/mutationsOverTime/__mockData__/nucleotideMutations_2024_05.json';
import nucleotideMutation_06 from '../../preact/mutationsOverTime/__mockData__/nucleotideMutations_2024_06.json';
import nucleotideMutation_07 from '../../preact/mutationsOverTime/__mockData__/nucleotideMutations_2024_07.json';
import nucleotideMutations_byMonthOverall from '../../preact/mutationsOverTime/__mockData__/nucleotideMutations_byMonthOverall.json';
import nucleotideMutations_byWeekOverall from '../../preact/mutationsOverTime/__mockData__/nucleotideMutations_byWeekOverall.json';
import nucleotideMutation_week3 from '../../preact/mutationsOverTime/__mockData__/nucleotideMutations_week3_2024.json';
import nucleotideMutation_week4 from '../../preact/mutationsOverTime/__mockData__/nucleotideMutations_week4_2024.json';
import nucleotideMutation_week5 from '../../preact/mutationsOverTime/__mockData__/nucleotideMutations_week5_2024.json';
import nucleotideMutation_week6 from '../../preact/mutationsOverTime/__mockData__/nucleotideMutations_week6_2024.json';
import { type MutationsOverTimeProps } from '../../preact/mutationsOverTime/mutations-over-time';

const codeExample = String.raw`
<gs-mutations-over-time
    lapisFilter='{ "pangoLineage": "JN.1*", "dateFrom": "2024-01-15", "dateTo": "2024-07-10" }'
    sequenceType="nucleotide"
    views='["grid"]'
    width='100%'
    height='700px'
    granularity="month"
    lapisDateField="date"
></gs-mutations-over-time>`;

const meta: Meta<Required<MutationsOverTimeProps>> = {
    title: 'Visualization/Mutations over time',
    component: 'gs-mutations-over-time',
    argTypes: {
        lapisFilter: { control: 'object' },
        sequenceType: {
            options: ['nucleotide', 'amino acid'],
            control: { type: 'radio' },
        },
        views: {
            options: ['grid'],
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
    args: {
        lapisFilter: { pangoLineage: 'JN.1*', dateFrom: '2024-01-15', dateTo: '2024-07-10' },
        sequenceType: 'nucleotide',
        views: ['grid'],
        width: '100%',
        height: '700px',
        granularity: 'month',
        lapisDateField: 'date',
    },
    parameters: withComponentDocs({
        componentDocs: {
            opensShadowDom: true,
            expectsChildren: false,
            codeExample,
        },
    }),
    tags: ['autodocs'],
};

export default meta;

const Template: StoryObj<Required<MutationsOverTimeProps>> = {
    render: (args) => html`
        <gs-app lapis="${LAPIS_URL}">
            <gs-mutations-over-time
                .lapisFilter=${args.lapisFilter}
                .sequenceType=${args.sequenceType}
                .views=${args.views}
                .width=${args.width}
                .height=${args.height}
                .granularity=${args.granularity}
                .lapisDateField=${args.lapisDateField}
            ></gs-mutations-over-time>
        </gs-app>
    `,
};

export const ByMonth: StoryObj<Required<MutationsOverTimeProps>> = {
    ...Template,
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
                        name: 'aggregated_01',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            dateFrom: '2024-01-01',
                            dateTo: '2024-01-31',
                            fields: [],
                            pangoLineage: 'JN.1*',
                        },
                    },
                    response: {
                        status: 200,
                        body: aggregated_01,
                    },
                },
                {
                    matcher: {
                        name: 'aggregated_02',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            dateFrom: '2024-02-01',
                            dateTo: '2024-02-29',
                            fields: [],
                            pangoLineage: 'JN.1*',
                        },
                    },
                    response: {
                        status: 200,
                        body: aggregated_02,
                    },
                },
                {
                    matcher: {
                        name: 'aggregated_03',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            dateFrom: '2024-03-01',
                            dateTo: '2024-03-31',
                            fields: [],
                            pangoLineage: 'JN.1*',
                        },
                    },
                    response: {
                        status: 200,
                        body: aggregated_03,
                    },
                },
                {
                    matcher: {
                        name: 'aggregated_04',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            dateFrom: '2024-04-01',
                            dateTo: '2024-04-30',
                            fields: [],
                            pangoLineage: 'JN.1*',
                        },
                    },
                    response: {
                        status: 200,
                        body: aggregated_04,
                    },
                },
                {
                    matcher: {
                        name: 'aggregated_05',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            dateFrom: '2024-05-01',
                            dateTo: '2024-05-31',
                            fields: [],
                            pangoLineage: 'JN.1*',
                        },
                    },
                    response: {
                        status: 200,
                        body: aggregated_05,
                    },
                },
                {
                    matcher: {
                        name: 'aggregated_06',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            dateFrom: '2024-06-01',
                            dateTo: '2024-06-30',
                            fields: [],
                            pangoLineage: 'JN.1*',
                        },
                    },
                    response: {
                        status: 200,
                        body: aggregated_06,
                    },
                },
                {
                    matcher: {
                        name: 'aggregated_07',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            dateFrom: '2024-07-01',
                            dateTo: '2024-07-31',
                            fields: [],
                            pangoLineage: 'JN.1*',
                        },
                    },
                    response: {
                        status: 200,
                        body: aggregated_07,
                    },
                },
                {
                    matcher: {
                        name: 'nucleotideMutations_overall',
                        url: NUCLEOTIDE_MUTATIONS_ENDPOINT,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-01-15',
                            dateTo: '2024-07-10',
                            minProportion: 0.001,
                        },
                    },
                    response: {
                        status: 200,
                        body: nucleotideMutations_byMonthOverall,
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
                            minProportion: 0.001,
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
                            minProportion: 0.001,
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
                            minProportion: 0.001,
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
                            minProportion: 0.001,
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
                            minProportion: 0.001,
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
                            minProportion: 0.001,
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
                            minProportion: 0.001,
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

export const ByWeek: StoryObj<Required<MutationsOverTimeProps>> = {
    ...Template,
    args: {
        ...Template.args,
        lapisFilter: { pangoLineage: 'JN.1*', dateFrom: '2024-01-15', dateTo: '2024-02-11' },
        granularity: 'week',
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
                            dateTo: '2024-02-11',
                            fields: ['date'],
                            pangoLineage: 'JN.1*',
                        },
                    },
                    response: {
                        status: 200,
                        body: aggregated_byWeek,
                    },
                },
                {
                    matcher: {
                        name: 'aggregated_week3',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            dateFrom: '2024-01-15',
                            dateTo: '2024-01-21',
                            fields: [],
                            pangoLineage: 'JN.1*',
                        },
                    },
                    response: {
                        status: 200,
                        body: aggregated_week3,
                    },
                },
                {
                    matcher: {
                        name: 'aggregated_week4',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            dateFrom: '2024-01-22',
                            dateTo: '2024-01-28',
                            fields: [],
                            pangoLineage: 'JN.1*',
                        },
                    },
                    response: {
                        status: 200,
                        body: aggregated_week4,
                    },
                },
                {
                    matcher: {
                        name: 'aggregated_week5',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            dateFrom: '2024-01-29',
                            dateTo: '2024-02-04',
                            fields: [],
                            pangoLineage: 'JN.1*',
                        },
                    },
                    response: {
                        status: 200,
                        body: aggregated_week5,
                    },
                },
                {
                    matcher: {
                        name: 'aggregated_week6',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            dateFrom: '2024-02-05',
                            dateTo: '2024-02-11',
                            fields: [],
                            pangoLineage: 'JN.1*',
                        },
                    },
                    response: {
                        status: 200,
                        body: aggregated_week6,
                    },
                },
                {
                    matcher: {
                        name: 'nucleotideMutation_overall',
                        url: NUCLEOTIDE_MUTATIONS_ENDPOINT,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-01-15',
                            dateTo: '2024-02-11',
                            minProportion: 0.001,
                        },
                    },
                    response: {
                        status: 200,
                        body: nucleotideMutations_byWeekOverall,
                    },
                },
                {
                    matcher: {
                        name: 'nucleotideMutation_week3',
                        url: NUCLEOTIDE_MUTATIONS_ENDPOINT,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-01-15',
                            dateTo: '2024-01-21',
                            minProportion: 0.001,
                        },
                    },
                    response: {
                        status: 200,
                        body: nucleotideMutation_week3,
                    },
                },
                {
                    matcher: {
                        name: 'nucleotideMutation_week4',
                        url: NUCLEOTIDE_MUTATIONS_ENDPOINT,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-01-22',
                            dateTo: '2024-01-28',
                            minProportion: 0.001,
                        },
                    },
                    response: {
                        status: 200,
                        body: nucleotideMutation_week4,
                    },
                },
                {
                    matcher: {
                        name: 'nucleotideMutation_week5',
                        url: NUCLEOTIDE_MUTATIONS_ENDPOINT,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-01-29',
                            dateTo: '2024-02-04',
                            minProportion: 0.001,
                        },
                    },
                    response: {
                        status: 200,
                        body: nucleotideMutation_week5,
                    },
                },
                {
                    matcher: {
                        name: 'nucleotideMutation_week6',
                        url: NUCLEOTIDE_MUTATIONS_ENDPOINT,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-02-05',
                            dateTo: '2024-02-11',
                            minProportion: 0.001,
                        },
                    },
                    response: {
                        status: 200,
                        body: nucleotideMutation_week6,
                    },
                },
            ],
        },
    },
};

export const AminoAcidMutationsByDay: StoryObj<Required<MutationsOverTimeProps>> = {
    ...Template,
    args: {
        ...Template.args,
        lapisFilter: { pangoLineage: 'JN.1*', dateFrom: '2024-01-20', dateTo: '2024-01-26' },
        granularity: 'day',
        sequenceType: 'amino acid',
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'aggregated_byDay',
                        url: AGGREGATED_ENDPOINT,
                        body: { pangoLineage: 'JN.1*', dateFrom: '2024-01-20', dateTo: '2024-01-26', fields: ['date'] },
                    },
                    response: {
                        status: 200,
                        body: aggregated_byDay,
                    },
                },
                {
                    matcher: {
                        name: 'aggregated_20_01_2024',
                        url: AGGREGATED_ENDPOINT,
                        body: { pangoLineage: 'JN.1*', dateFrom: '2024-01-20', dateTo: '2024-01-20', fields: [] },
                    },
                    response: {
                        status: 200,
                        body: aggregated_20_01_2024,
                    },
                },
                {
                    matcher: {
                        name: 'aggregated_21_01_2024',
                        url: AGGREGATED_ENDPOINT,
                        body: { pangoLineage: 'JN.1*', dateFrom: '2024-01-21', dateTo: '2024-01-21', fields: [] },
                    },
                    response: {
                        status: 200,
                        body: aggregated_21_01_2024,
                    },
                },
                {
                    matcher: {
                        name: 'aggregated_22_01_2024',
                        url: AGGREGATED_ENDPOINT,
                        body: { pangoLineage: 'JN.1*', dateFrom: '2024-01-22', dateTo: '2024-01-22', fields: [] },
                    },
                    response: {
                        status: 200,
                        body: aggregated_22_01_2024,
                    },
                },
                {
                    matcher: {
                        name: 'aggregated_23_01_2024',
                        url: AGGREGATED_ENDPOINT,
                        body: { pangoLineage: 'JN.1*', dateFrom: '2024-01-23', dateTo: '2024-01-23', fields: [] },
                    },
                    response: {
                        status: 200,
                        body: aggregated_23_01_2024,
                    },
                },
                {
                    matcher: {
                        name: 'aggregated_24_01_2024',
                        url: AGGREGATED_ENDPOINT,
                        body: { pangoLineage: 'JN.1*', dateFrom: '2024-01-24', dateTo: '2024-01-24', fields: [] },
                    },
                    response: {
                        status: 200,
                        body: aggregated_24_01_2024,
                    },
                },
                {
                    matcher: {
                        name: 'aggregated_25_01_2024',
                        url: AGGREGATED_ENDPOINT,
                        body: { pangoLineage: 'JN.1*', dateFrom: '2024-01-25', dateTo: '2024-01-25', fields: [] },
                    },
                    response: {
                        status: 200,
                        body: aggregated_25_01_2024,
                    },
                },
                {
                    matcher: {
                        name: 'aggregated_26_01_2024',
                        url: AGGREGATED_ENDPOINT,
                        body: { pangoLineage: 'JN.1*', dateFrom: '2024-01-26', dateTo: '2024-01-26', fields: [] },
                    },
                    response: {
                        status: 200,
                        body: aggregated_26_01_2024,
                    },
                },
                {
                    matcher: {
                        name: 'aminoAcidMutations_overall',
                        url: AMINO_ACID_MUTATIONS_ENDPOINT,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-01-20',
                            dateTo: '2024-01-26',
                            minProportion: 0.001,
                        },
                    },
                    response: {
                        status: 200,
                        body: aminoAcidMutations_byDayOverall,
                    },
                },
                {
                    matcher: {
                        name: 'aminoAcidMutations_20_01_2024',
                        url: AMINO_ACID_MUTATIONS_ENDPOINT,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-01-20',
                            dateTo: '2024-01-20',
                            minProportion: 0.001,
                        },
                    },
                    response: {
                        status: 200,
                        body: aminoAcidMutations_20_01_2024,
                    },
                },
                {
                    matcher: {
                        name: 'aminoAcidMutations_21_01_2024',
                        url: AMINO_ACID_MUTATIONS_ENDPOINT,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-01-21',
                            dateTo: '2024-01-21',
                            minProportion: 0.001,
                        },
                    },
                    response: {
                        status: 200,
                        body: aminoAcidMutations_21_01_2024,
                    },
                },
                {
                    matcher: {
                        name: 'aminoAcidMutations_22_01_2024',
                        url: AMINO_ACID_MUTATIONS_ENDPOINT,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-01-22',
                            dateTo: '2024-01-22',
                            minProportion: 0.001,
                        },
                    },
                    response: {
                        status: 200,
                        body: aminoAcidMutations_22_01_2024,
                    },
                },
                {
                    matcher: {
                        name: 'aminoAcidMutations_23_01_2024',
                        url: AMINO_ACID_MUTATIONS_ENDPOINT,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-01-23',
                            dateTo: '2024-01-23',
                            minProportion: 0.001,
                        },
                    },
                    response: {
                        status: 200,
                        body: aminoAcidMutations_23_01_2024,
                    },
                },
                {
                    matcher: {
                        name: 'aminoAcidMutations_24_01_2024',
                        url: AMINO_ACID_MUTATIONS_ENDPOINT,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-01-24',
                            dateTo: '2024-01-24',
                            minProportion: 0.001,
                        },
                    },
                    response: {
                        status: 200,
                        body: aminoAcidMutations_24_01_2024,
                    },
                },
                {
                    matcher: {
                        name: 'aminoAcidMutations_25_01_2024',
                        url: AMINO_ACID_MUTATIONS_ENDPOINT,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-01-25',
                            dateTo: '2024-01-25',
                            minProportion: 0.001,
                        },
                    },
                    response: {
                        status: 200,
                        body: aminoAcidMutations_25_01_2024,
                    },
                },
                {
                    matcher: {
                        name: 'aminoAcidMutations_26_01_2024',
                        url: AMINO_ACID_MUTATIONS_ENDPOINT,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-01-26',
                            dateTo: '2024-01-26',
                            minProportion: 0.001,
                        },
                    },
                    response: {
                        status: 200,
                        body: aminoAcidMutations_26_01_2024,
                    },
                },
            ],
        },
    },
};

export const HideProportionOnSmallScreen: StoryObj<Required<MutationsOverTimeProps>> = {
    ...ByMonth,
    args: {
        ...ByMonth.args,
        width: '300px',
    },
};

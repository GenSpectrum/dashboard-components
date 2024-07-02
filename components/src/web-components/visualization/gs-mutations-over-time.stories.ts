import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './gs-mutations-over-time';
import '../app';
import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { AGGREGATED_ENDPOINT, LAPIS_URL, NUCLEOTIDE_MUTATIONS_ENDPOINT } from '../../constants';
import aggregated_date from '../../preact/mutationsOverTime/__mockData__/aggregated_date.json';
import nucleotideMutation_01 from '../../preact/mutationsOverTime/__mockData__/nucleotideMutations_2024_01.json';
import nucleotideMutation_02 from '../../preact/mutationsOverTime/__mockData__/nucleotideMutations_2024_02.json';
import nucleotideMutation_03 from '../../preact/mutationsOverTime/__mockData__/nucleotideMutations_2024_03.json';
import nucleotideMutation_04 from '../../preact/mutationsOverTime/__mockData__/nucleotideMutations_2024_04.json';
import nucleotideMutation_05 from '../../preact/mutationsOverTime/__mockData__/nucleotideMutations_2024_05.json';
import nucleotideMutation_06 from '../../preact/mutationsOverTime/__mockData__/nucleotideMutations_2024_06.json';
import nucleotideMutation_07 from '../../preact/mutationsOverTime/__mockData__/nucleotideMutations_2024_07.json';
import { type MutationsOverTimeProps } from '../../preact/mutationsOverTime/mutations-over-time';

const codeExample = String.raw`
<gs-mutations-over-time
    lapisFilter='{ "pangoLineage": "JN.1*", "dateFrom": "2024-01-15", "dateTo": "2024-07-10" }'
    sequenceType="nucleotide"
    views='["grid"]'
    headline="Mutations over time"
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

export const Default: StoryObj<Required<MutationsOverTimeProps>> = {
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

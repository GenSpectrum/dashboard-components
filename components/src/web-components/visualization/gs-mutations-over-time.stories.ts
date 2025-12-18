import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './gs-mutations-over-time';
import '../gs-app';
import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { LAPIS_URL } from '../../constants';
import mockDefaultMutationsOverTime from '../../preact/mutationsOverTime/__mockData__/defaultMockData/mutationsOverTime.json';
import mockDefaultNucleotideMutations from '../../preact/mutationsOverTime/__mockData__/defaultMockData/nucleotideMutations.json';
import mockWithDisplayMutationsMutationsOverTime from '../../preact/mutationsOverTime/__mockData__/withDisplayMutations/mutationsOverTime.json';
import mockByWeekNucleotideMutations from '../../preact/mutationsOverTime/__mockData__/byWeek/nucleotideMutations.json';
import mockByWeekMutationsOverTime from '../../preact/mutationsOverTime/__mockData__/byWeek/mutationsOverTime.json';
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
    displayMutations='["A23403G","C241T"]'
    pageSizes='[5,10]'
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
        displayMutations: { control: 'object' },
        initialMeanProportionInterval: { control: 'object' },
        hideGaps: { control: 'boolean' },
        pageSizes: { control: 'object' },
        customColumns: { control: 'object' },
    },
    args: {
        lapisFilter: { pangoLineage: 'JN.1*', dateFrom: '2024-01-15', dateTo: '2024-07-10' },
        sequenceType: 'nucleotide',
        views: ['grid'],
        width: '100%',
        granularity: 'month',
        lapisDateField: 'date',
        initialMeanProportionInterval: { min: 0.05, max: 0.9 },
        hideGaps: false,
        pageSizes: [10, 20, 30, 40, 50],
    },
    parameters: withComponentDocs({
        componentDocs: {
            opensShadowDom: true,
            expectsChildren: false,
            codeExample,
        },
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        url: `${LAPIS_URL}/sample/nucleotideMutations`,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-01-01',
                            dateTo: '2024-07-31',
                            minProportion: 0.001,
                        },
                        response: {
                            status: 200,
                            body: mockDefaultNucleotideMutations,
                        },
                    },
                },
                {
                    matcher: {
                        url: `${LAPIS_URL}/component/nucleotideMutationsOverTime`,
                        body: {
                            filters: {
                                pangoLineage: 'JN.1*',
                                dateFrom: '2024-01-15',
                                dateTo: '2024-07-10',
                            },
                            dateRanges: [
                                { dateFrom: '2024-01-01', dateTo: '2024-01-31' },
                                { dateFrom: '2024-02-01', dateTo: '2024-02-29' },
                                { dateFrom: '2024-03-01', dateTo: '2024-03-31' },
                                { dateFrom: '2024-04-01', dateTo: '2024-04-30' },
                                { dateFrom: '2024-05-01', dateTo: '2024-05-31' },
                                { dateFrom: '2024-06-01', dateTo: '2024-06-30' },
                                { dateFrom: '2024-07-01', dateTo: '2024-07-31' },
                            ],
                            dateField: 'date',
                        },
                        matchPartialBody: true,
                        response: {
                            status: 200,
                            body: mockDefaultMutationsOverTime,
                        },
                    },
                },
            ],
        },
    }),
    tags: ['autodocs'],
};

export default meta;

const mutationAnnotations = [
    {
        name: 'I am a mutation annotation!',
        description:
            'This describes what is special about these mutations. <a class="link" href="/">And it has a link.</a>',
        symbol: '#',
        nucleotideMutations: ['C44T', 'C774T', 'G24872T', 'T23011-'],
        aminoAcidMutations: ['S:501Y', 'S:S31-', 'ORF1a:S4286C'],
    },
    {
        name: 'I am another mutation annotation!',
        description: 'This describes what is special about these other mutations.',
        symbol: '+',
        nucleotideMutations: ['C44T', 'A13121T'],
        aminoAcidMutations: ['S:501Y', 'S:S31-', 'ORF1a:S4286C'],
    },
];

const mutationLinkTemplate = {
    nucleotideMutation:
        'https://cov-spectrum.org/explore/Switzerland/AllSamples/Past6M/variants?nucMutations={{mutation}}',
    aminoAcidMutation:
        'https://cov-spectrum.org/explore/Switzerland/AllSamples/Past6M/variants?aaMutations={{mutation}}',
};

const Template: StoryObj<Required<MutationsOverTimeProps>> = {
    render: (args) => html`
        <gs-app
            lapis="${LAPIS_URL}"
            .mutationAnnotations=${mutationAnnotations}
            .mutationLinkTemplate=${mutationLinkTemplate}
        >
            <gs-mutations-over-time
                .lapisFilter=${args.lapisFilter}
                .sequenceType=${args.sequenceType}
                .views=${args.views}
                .width=${args.width}
                .height=${args.height}
                .granularity=${args.granularity}
                .lapisDateField=${args.lapisDateField}
                .displayMutations=${args.displayMutations}
                .initialMeanProportionInterval=${args.initialMeanProportionInterval}
                .hideGaps=${args.hideGaps}
                .pageSizes=${args.pageSizes}
                .customColumns=${args.customColumns}
            ></gs-mutations-over-time>
        </gs-app>
    `,
};

export const ByMonth: StoryObj<Required<MutationsOverTimeProps>> = {
    ...Template,
};

export const ByMonthWithFilterOnDisplayedMutations: StoryObj<Required<MutationsOverTimeProps>> = {
    ...Template,
    args: {
        ...Template.args,
        displayMutations: ['A13121T', 'G24872T', 'T21653-'],
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        url: `${LAPIS_URL}/sample/nucleotideMutations`,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-01-01',
                            dateTo: '2024-07-31',
                            minProportion: 0.001,
                        },
                        response: {
                            status: 200,
                            body: mockDefaultNucleotideMutations,
                        },
                    },
                },
                {
                    matcher: {
                        url: `${LAPIS_URL}/component/nucleotideMutationsOverTime`,
                        body: {
                            filters: { pangoLineage: 'JN.1*', dateFrom: '2024-01-15', dateTo: '2024-07-10' },
                            dateRanges: [
                                { dateFrom: '2024-01-01', dateTo: '2024-01-31' },
                                { dateFrom: '2024-02-01', dateTo: '2024-02-29' },
                                { dateFrom: '2024-03-01', dateTo: '2024-03-31' },
                                { dateFrom: '2024-04-01', dateTo: '2024-04-30' },
                                { dateFrom: '2024-05-01', dateTo: '2024-05-31' },
                                { dateFrom: '2024-06-01', dateTo: '2024-06-30' },
                                { dateFrom: '2024-07-01', dateTo: '2024-07-31' },
                            ],
                            includeMutations: ['A13121T', 'T21653-', 'G24872T'],
                            dateField: 'date',
                        },
                        response: {
                            status: 200,
                            body: mockWithDisplayMutationsMutationsOverTime,
                        },
                    },
                },
            ],
        },
    },
};

export const ByMonthWithFilterOnDisplayedMutationsAndGaps: StoryObj<Required<MutationsOverTimeProps>> = {
    ...Template,
    args: {
        ...Template.args,
        displayMutations: ['A13121T', 'G24872T', 'T21653-'],
        hideGaps: true,
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        url: `${LAPIS_URL}/sample/nucleotideMutations`,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-01-01',
                            dateTo: '2024-07-31',
                            minProportion: 0.001,
                        },
                        response: {
                            status: 200,
                            body: mockDefaultNucleotideMutations,
                        },
                    },
                },
                {
                    matcher: {
                        url: `${LAPIS_URL}/component/nucleotideMutationsOverTime`,
                        body: {
                            filters: { pangoLineage: 'JN.1*', dateFrom: '2024-01-15', dateTo: '2024-07-10' },
                            dateRanges: [
                                { dateFrom: '2024-01-01', dateTo: '2024-01-31' },
                                { dateFrom: '2024-02-01', dateTo: '2024-02-29' },
                                { dateFrom: '2024-03-01', dateTo: '2024-03-31' },
                                { dateFrom: '2024-04-01', dateTo: '2024-04-30' },
                                { dateFrom: '2024-05-01', dateTo: '2024-05-31' },
                                { dateFrom: '2024-06-01', dateTo: '2024-06-30' },
                                { dateFrom: '2024-07-01', dateTo: '2024-07-31' },
                            ],
                            includeMutations: ['A13121T', 'T21653-', 'G24872T'],
                            dateField: 'date',
                        },
                        response: {
                            status: 200,
                            body: mockWithDisplayMutationsMutationsOverTime,
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
                        url: `${LAPIS_URL}/sample/nucleotideMutations`,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-01-15',
                            dateTo: '2024-02-11',
                            minProportion: 0.001,
                        },
                        response: {
                            status: 200,
                            body: mockByWeekNucleotideMutations,
                        },
                    },
                },
                {
                    matcher: {
                        url: `${LAPIS_URL}/component/nucleotideMutationsOverTime`,
                        body: {
                            filters: {
                                pangoLineage: 'JN.1*',
                                dateFrom: '2024-01-15',
                                dateTo: '2024-02-11',
                            },
                            dateRanges: [
                                { dateFrom: '2024-01-15', dateTo: '2024-01-21' },
                                { dateFrom: '2024-01-22', dateTo: '2024-01-28' },
                                { dateFrom: '2024-01-29', dateTo: '2024-02-04' },
                                { dateFrom: '2024-02-05', dateTo: '2024-02-11' },
                            ],
                            dateField: 'date',
                        },
                        matchPartialBody: true,
                        response: {
                            status: 200,
                            body: mockByWeekMutationsOverTime,
                        },
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
};

export const HideProportionOnSmallScreen: StoryObj<Required<MutationsOverTimeProps>> = {
    ...ByMonth,
    args: {
        ...ByMonth.args,
        width: '300px',
    },
};

export const WithFixedHeight: StoryObj<Required<MutationsOverTimeProps>> = {
    ...Template,
    args: {
        ...Template,
        height: '700px',
    },
};

export const WithCustomColumns: StoryObj<Required<MutationsOverTimeProps>> = {
    ...Template,
    args: {
        ...Template.args,
        displayMutations: ['A13121T', 'G24872T', 'T21653-'],
        customColumns: [
            {
                header: 'Jaccard Index',
                values: {
                    A13121T: 0.75,
                    G24872T: 0.92,
                    'T21653-': 0.58,
                },
            },
        ],
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        url: `${LAPIS_URL}/sample/nucleotideMutations`,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-01-01',
                            dateTo: '2024-07-31',
                            minProportion: 0.001,
                        },
                        response: {
                            status: 200,
                            body: mockDefaultNucleotideMutations,
                        },
                    },
                },
                {
                    matcher: {
                        url: `${LAPIS_URL}/component/nucleotideMutationsOverTime`,
                        body: {
                            filters: { pangoLineage: 'JN.1*', dateFrom: '2024-01-15', dateTo: '2024-07-10' },
                            dateRanges: [
                                { dateFrom: '2024-01-01', dateTo: '2024-01-31' },
                                { dateFrom: '2024-02-01', dateTo: '2024-02-29' },
                                { dateFrom: '2024-03-01', dateTo: '2024-03-31' },
                                { dateFrom: '2024-04-01', dateTo: '2024-04-30' },
                                { dateFrom: '2024-05-01', dateTo: '2024-05-31' },
                                { dateFrom: '2024-06-01', dateTo: '2024-06-30' },
                                { dateFrom: '2024-07-01', dateTo: '2024-07-31' },
                            ],
                            includeMutations: ['A13121T', 'T21653-', 'G24872T'],
                            dateField: 'date',
                        },
                        response: {
                            status: 200,
                            body: mockWithDisplayMutationsMutationsOverTime,
                        },
                    },
                },
            ],
        },
    },
};

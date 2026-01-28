import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './gs-queries-over-time';
import '../gs-app';
import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { LAPIS_URL } from '../../constants';
import mockDefaultQueriesOverTime from '../../preact/queriesOverTime/__mockData__/defaultMockData/queriesOverTime.json';
import mockWithGapsQueriesOverTime from '../../preact/queriesOverTime/__mockData__/withGaps.json';
import { type QueriesOverTimeProps } from '../../preact/queriesOverTime/queries-over-time';

const codeExample = String.raw`
<gs-queries-over-time
    lapisFilter='{ "pangoLineage": "JN.1*", "dateFrom": "2024-01-15", "dateTo": "2024-04-30" }'
    queries='[
        {
            "displayLabel": "S:F456L (single mutation)",
            "countQuery": "S:456L",
            "coverageQuery": "!S:456N"
        },
        {
            "displayLabel": "R346T + F456L (combination)",
            "countQuery": "S:346T & S:456L",
            "coverageQuery": "!S:346N & !S:456N"
        }
    ]'
    views='["grid"]'
    width='100%'
    height='700px'
    granularity="month"
    lapisDateField="date"
    pageSizes='[5,10]'
></gs-queries-over-time>`;

const meta: Meta<Required<QueriesOverTimeProps>> = {
    title: 'Visualization/Queries over time',
    component: 'gs-queries-over-time',
    argTypes: {
        lapisFilter: { control: 'object' },
        queries: { control: 'object' },
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
        initialMeanProportionInterval: { control: 'object' },
        hideGaps: { control: 'boolean' },
        pageSizes: { control: 'object' },
        customColumns: { control: 'object' },
    },
    args: {
        lapisFilter: { pangoLineage: 'JN.1*', dateFrom: '2024-01-15', dateTo: '2024-04-30' },
        queries: [
            {
                displayLabel: 'S:F456L (single mutation)',
                countQuery: 'S:456L',
                coverageQuery: '!S:456N',
            },
            {
                displayLabel: 'R346T + F456L (combination)',
                countQuery: 'S:346T & S:456L',
                coverageQuery: '!S:346N & !S:456N',
            },
            {
                displayLabel: 'C22916T or T22917G (nucleotide OR)',
                countQuery: 'C22916T | T22917G',
                coverageQuery: '!22916N & !22917N',
            },
        ],
        views: ['grid'],
        width: '100%',
        granularity: 'month',
        lapisDateField: 'date',
        initialMeanProportionInterval: { min: 0, max: 1 },
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
                        url: `${LAPIS_URL}/component/queriesOverTime`,
                        body: {
                            filters: {
                                pangoLineage: 'JN.1*',
                                dateFrom: '2024-01-15',
                                dateTo: '2024-04-30',
                            },
                            queries: [
                                {
                                    displayLabel: 'S:F456L (single mutation)',
                                    countQuery: 'S:456L',
                                    coverageQuery: '!S:456N',
                                },
                                {
                                    displayLabel: 'R346T + F456L (combination)',
                                    countQuery: 'S:346T & S:456L',
                                    coverageQuery: '!S:346N & !S:456N',
                                },
                                {
                                    displayLabel: 'C22916T or T22917G (nucleotide OR)',
                                    countQuery: 'C22916T | T22917G',
                                    coverageQuery: '!22916N & !22917N',
                                },
                            ],
                            dateRanges: [
                                { dateFrom: '2024-01-01', dateTo: '2024-01-31' },
                                { dateFrom: '2024-02-01', dateTo: '2024-02-29' },
                                { dateFrom: '2024-03-01', dateTo: '2024-03-31' },
                                { dateFrom: '2024-04-01', dateTo: '2024-04-30' },
                            ],
                            dateField: 'date',
                        },
                        matchPartialBody: true,
                        response: {
                            status: 200,
                            body: mockDefaultQueriesOverTime,
                        },
                    },
                },
            ],
        },
    }),
    tags: ['autodocs'],
};

export default meta;

const Template: StoryObj<Required<QueriesOverTimeProps>> = {
    render: (args) => html`
        <gs-app lapis="${LAPIS_URL}">
            <gs-queries-over-time
                .lapisFilter=${args.lapisFilter}
                .queries=${args.queries}
                .views=${args.views}
                .width=${args.width}
                .height=${args.height}
                .granularity=${args.granularity}
                .lapisDateField=${args.lapisDateField}
                .initialMeanProportionInterval=${args.initialMeanProportionInterval}
                .hideGaps=${args.hideGaps}
                .pageSizes=${args.pageSizes}
                .customColumns=${args.customColumns}
            ></gs-queries-over-time>
        </gs-app>
    `,
};

export const Default: StoryObj<Required<QueriesOverTimeProps>> = {
    ...Template,
};

export const WithFixedHeight: StoryObj<Required<QueriesOverTimeProps>> = {
    ...Template,
    args: {
        ...Template.args,
        height: '700px',
    },
};

export const ByWeek: StoryObj<Required<QueriesOverTimeProps>> = {
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
                        url: `${LAPIS_URL}/component/queriesOverTime`,
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
                        },
                        matchPartialBody: true,
                        response: {
                            status: 200,
                            body: mockDefaultQueriesOverTime,
                        },
                    },
                },
            ],
        },
    },
};

export const WithCustomColumns: StoryObj<Required<QueriesOverTimeProps>> = {
    ...Template,
    args: {
        ...Template.args,
        customColumns: [
            {
                header: 'Jaccard Index',
                values: {
                    'S:F456L (single mutation)': 0.75,
                    'R346T + F456L (combination)': 0.92,
                    'C22916T or T22917G (nucleotide OR)': 0.58,
                },
            },
        ],
    },
};

export const HideGaps: StoryObj<Required<QueriesOverTimeProps>> = {
    ...Template,
    args: {
        ...Template.args,
        lapisFilter: { pangoLineage: 'JN.1*', dateFrom: '2024-01-15', dateTo: '2024-07-10' },
        queries: [
            {
                displayLabel: 'S:F456L',
                countQuery: 'S:456L',
                coverageQuery: '!S:456N',
            },
            {
                displayLabel: 'S:R346T',
                countQuery: 'S:346T',
                coverageQuery: '!S:346N',
            },
            {
                displayLabel: 'S:Q493E',
                countQuery: 'S:493E',
                coverageQuery: '!S:493N',
            },
        ],
        hideGaps: true,
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        url: `${LAPIS_URL}/component/queriesOverTime`,
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
                        },
                        matchPartialBody: true,
                        response: {
                            status: 200,
                            body: mockWithGapsQueriesOverTime,
                        },
                    },
                },
            ],
        },
    },
};

export const SmallWidth: StoryObj<Required<QueriesOverTimeProps>> = {
    ...Template,
    args: {
        ...Template.args,
        width: '300px',
    },
};

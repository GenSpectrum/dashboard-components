import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './gs-queries-over-time';
import '../gs-app';
import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { LAPIS_URL } from '../../constants';
import mockDefaultQueriesOverTime from '../../preact/queriesOverTime/__mockData__/defaultMockData/queriesOverTime.json';
import { type QueriesOverTimeProps } from '../../preact/queriesOverTime/queries-over-time';

const codeExample = String.raw`
<gs-queries-over-time
    lapisFilter='{ "pangoLineage": "JN.1*", "dateFrom": "2024-01-15", "dateTo": "2024-04-30" }'
    queries='[
        {
            "displayLabel": "BA.1 Lineage",
            "countQuery": "pangoLineage:BA.1*",
            "coverageQuery": ""
        },
        {
            "displayLabel": "BA.2 Lineage",
            "countQuery": "pangoLineage:BA.2*",
            "coverageQuery": ""
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
                displayLabel: 'BA.1 Lineage',
                countQuery: 'pangoLineage:BA.1*',
                coverageQuery: '',
            },
            {
                displayLabel: 'BA.2 Lineage',
                countQuery: 'pangoLineage:BA.2*',
                coverageQuery: '',
            },
            {
                displayLabel: 'XBB Lineage',
                countQuery: 'pangoLineage:XBB*',
                coverageQuery: '',
            },
        ],
        views: ['grid'],
        width: '100%',
        granularity: 'month',
        lapisDateField: 'date',
        initialMeanProportionInterval: { min: 0.05, max: 1 },
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
                                    displayLabel: 'BA.1 Lineage',
                                    countQuery: 'pangoLineage:BA.1*',
                                    coverageQuery: '',
                                },
                                {
                                    displayLabel: 'BA.2 Lineage',
                                    countQuery: 'pangoLineage:BA.2*',
                                    coverageQuery: '',
                                },
                                {
                                    displayLabel: 'XBB Lineage',
                                    countQuery: 'pangoLineage:XBB*',
                                    coverageQuery: '',
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

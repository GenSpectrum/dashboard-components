import { type Meta, type StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import aggregatedData from '../../preact/aggregatedData/__mockData__/aggregated.json';
import type { AggregateProps } from '../../preact/aggregatedData/aggregate';

import './gs-aggregate';
import '../app';

const codeExample = `
<gs-aggregate 
    fields='["division", "host"]'
    filter='{"country": "USA"}'
    views='["table"]'
    width='100%'
    height='700px'
    initialSortField="count"
    initialSortDirection="descending"
    pageSize="10"
></gs-aggregate>`;

const meta: Meta<Required<AggregateProps>> = {
    title: 'Visualization/Aggregate',
    component: 'gs-aggregate',
    argTypes: {
        fields: [{ control: 'object' }],
        views: {
            options: ['table'],
            control: { type: 'check' },
        },
        width: { control: 'text' },
        height: { control: 'text' },
        pageSize: { control: 'object' },
        initialSortField: { control: 'text' },
        initialSortDirection: {
            options: ['ascending', 'descending'],
            control: { type: 'radio' },
        },
    },
    parameters: withComponentDocs({
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'aggregatedData',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            fields: ['division', 'host'],
                            country: 'USA',
                        },
                    },
                    response: {
                        status: 200,
                        body: aggregatedData,
                    },
                },
            ],
        },
        componentDocs: {
            opensShadowDom: true,
            expectsChildren: false,
            codeExample,
        },
    }),
    tags: ['autodocs'],
};

export default meta;

export const Table: StoryObj<Required<AggregateProps>> = {
    render: (args) => html`
        <gs-app lapis="${LAPIS_URL}">
            <gs-aggregate
                .fields=${args.fields}
                .filter=${args.filter}
                .views=${args.views}
                .width=${args.width}
                .height=${args.height}
                .initialSortField=${args.initialSortField}
                .initialSortDirection=${args.initialSortDirection}
                .pageSize=${args.pageSize}
            ></gs-aggregate>
        </gs-app>
    `,
    args: {
        fields: ['division', 'host'],
        views: ['table'],
        filter: {
            country: 'USA',
        },
        width: '100%',
        height: '700px',
        initialSortField: 'count',
        initialSortDirection: 'descending',
        pageSize: 10,
    },
};

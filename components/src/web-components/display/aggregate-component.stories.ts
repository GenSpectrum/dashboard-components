import { type Meta, type StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import aggregatedData from '../../preact/aggregatedData/__mockData__/aggregated.json';
import type { AggregateProps } from '../../preact/aggregatedData/aggregate';

import './aggregate-component';
import '../app';

const meta: Meta<AggregateProps> = {
    title: 'Visualization/Aggregate',
    component: 'gs-aggregate',
    argTypes: {
        fields: [{ control: 'object' }],
        views: {
            options: ['table'],
            control: { type: 'check' },
        },
        size: [{ control: 'object' }],
        headline: { control: 'text' },
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
            codeExample: `<gs-aggregate fields='["division", "host"]' filter='{"country": "USA"}' views='["table"]'></gs-aggregate>`,
        },
    }),
    tags: ['autodocs'],
};

export default meta;

export const Table: StoryObj<AggregateProps> = {
    render: (args) => html`
        <gs-app lapis="${LAPIS_URL}">
            <gs-aggregate
                .fields=${args.fields}
                .filter=${args.filter}
                .views=${args.views}
                .size=${args.size}
                .headline=${args.headline}
            ></gs-aggregate>
        </gs-app>
    `,
    args: {
        fields: ['division', 'host'],
        views: ['table'],
        filter: {
            country: 'USA',
        },
        size: { width: '100%', height: '700px' },
        headline: 'Aggregate',
    },
};

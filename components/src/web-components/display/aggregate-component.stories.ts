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
    component: 'gs-aggregate-component',
    argTypes: {
        fields: [{ control: 'object' }],
        views: {
            options: ['table'],
            control: { type: 'check' },
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
            tag: 'gs-aggregate-component',
            opensShadowDom: true,
            expectsChildren: false,
            codeExample: `<gs-aggregate-component fields='["division", "host"]' filter='{"country": "USA"}' views='["table"]'></gs-aggregate-component>`,
        },
    }),
    tags: ['autodocs'],
};

export default meta;

export const Table: StoryObj<AggregateProps> = {
    render: (args) => html`
        <div class="w-11/12 h-11/12">
            <gs-app lapis="${LAPIS_URL}">
                <gs-aggregate-component
                    .fields=${args.fields}
                    .filter=${args.filter}
                    .views=${args.views}
                ></gs-aggregate-component>
            </gs-app>
        </div>
    `,
    args: {
        fields: ['division', 'host'],
        views: ['table'],
        filter: {
            country: 'USA',
        },
    },
};

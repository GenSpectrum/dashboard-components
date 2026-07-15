import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './gs-mutation-cooccurrence';
import '../gs-app';
import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import mockCooccurrence from '../../preact/mutationCooccurrence/__mockData__/cooccurrence.json';
import { type MutationCooccurrenceProps } from '../../preact/mutationCooccurrence/mutation-cooccurrence';

const codeExample = String.raw`
<gs-mutation-cooccurrence
    lapisFilter='{ "pangoLineage": "JN.1*", "dateFrom": "2024-01-15", "dateTo": "2024-01-31" }'
    positions='["[123]", "[124]", "[126]"]'
    views='["grid"]'
    width='100%'
    granularity="week"
    lapisDateField="date"
    pageSizes='[10, 20, 50]'
></gs-mutation-cooccurrence>`;

const meta: Meta<Required<MutationCooccurrenceProps>> = {
    title: 'Visualization/Mutation Cooccurrence',
    component: 'gs-mutation-cooccurrence',
    argTypes: {
        lapisFilter: { control: 'object' },
        positions: { control: 'object' },
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
    },
    args: {
        lapisFilter: { pangoLineage: 'JN.1*', dateFrom: '2024-01-15', dateTo: '2024-01-31' },
        positions: ['[123]', '[124]', '[126]'],
        views: ['grid'],
        width: '100%',
        granularity: 'week',
        lapisDateField: 'date',
        initialMeanProportionInterval: { min: 0, max: 1 },
        hideGaps: false,
        pageSizes: [10, 20, 50],
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
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-01-15',
                            dateTo: '2024-01-31',
                            fields: ['date', '[123]', '[124]', '[126]'],
                        },
                        matchPartialBody: true,
                        response: {
                            status: 200,
                            body: mockCooccurrence,
                        },
                    },
                },
                {
                    matcher: {
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-01-15',
                            dateTo: '2024-01-31',
                            fields: ['date'],
                        },
                        matchPartialBody: true,
                        response: {
                            status: 200,
                            body: mockCooccurrence,
                        },
                    },
                },
            ],
        },
    }),
    tags: ['autodocs'],
};

export default meta;

const Template: StoryObj<Required<MutationCooccurrenceProps>> = {
    render: (args) => html`
        <gs-app lapis="${LAPIS_URL}">
            <gs-mutation-cooccurrence
                .lapisFilter=${args.lapisFilter}
                .positions=${args.positions}
                .views=${args.views}
                .width=${args.width}
                .height=${args.height}
                .granularity=${args.granularity}
                .lapisDateField=${args.lapisDateField}
                .initialMeanProportionInterval=${args.initialMeanProportionInterval}
                .hideGaps=${args.hideGaps}
                .pageSizes=${args.pageSizes}
            ></gs-mutation-cooccurrence>
        </gs-app>
    `,
};

export const Default: StoryObj<Required<MutationCooccurrenceProps>> = {
    ...Template,
};

export const WithFixedHeight: StoryObj<Required<MutationCooccurrenceProps>> = {
    ...Template,
    args: {
        height: '500px',
    },
};

export const HideGaps: StoryObj<Required<MutationCooccurrenceProps>> = {
    ...Template,
    args: {
        hideGaps: true,
    },
};

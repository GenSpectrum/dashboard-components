import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './gs-relative-growth-advantage';
import '../app';
// eslint-disable-next-line no-duplicate-imports
import { type RelativeGrowthAdvantageComponentProps } from './gs-relative-growth-advantage';
import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import denominatorFilter from '../../preact/relativeGrowthAdvantage/__mockData__/denominatorFilter.json';
import numeratorFilter from '../../preact/relativeGrowthAdvantage/__mockData__/numeratorFilter.json';

const codeExample = String.raw`
<gs-relative-growth-advantage
    numeratorFilter='{ "country": "Switzerland", "pangoLineage": "B.1.1.7", "dateFrom": "2020-12-01" }'
    denominatorFilter='{ "country": "Switzerland", "dateFrom": "2020-12-01" }'
    generationTime="7"
    views='["line"]'
    width='100%'
    height='700px'
    lapisDateField="date"
    yAxisMaxLinear="1"
    yAxisMaxLogarithmic="limitTo1"    
></gs-relative-growth-advantage>`;

const meta: Meta<RelativeGrowthAdvantageComponentProps> = {
    title: 'Visualization/Relative growth advantage',
    component: 'gs-relative-growth-advantage',
    argTypes: {
        numeratorFilter: { control: 'object' },
        denominatorFilter: { control: 'object' },
        generationTime: { control: 'number' },
        views: {
            options: ['line'],
            control: { type: 'check' },
        },
        width: { control: 'text' },
        height: { control: 'text' },
        yAxisMaxLinear: { control: 'object' },
        yAxisMaxLogarithmic: { control: 'object' },
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

const Template: StoryObj<Required<RelativeGrowthAdvantageComponentProps>> = {
    render: (args) => html`
        <gs-app lapis="${LAPIS_URL}">
            <gs-relative-growth-advantage
                .numeratorFilter=${args.numeratorFilter}
                .denominatorFilter=${args.denominatorFilter}
                .generationTime=${args.generationTime}
                .views=${args.views}
                .width=${args.width}
                .height=${args.height}
                .lapisDateField=${args.lapisDateField}
                .yAxisMaxLinear=${args.yAxisMaxLinear}
                .yAxisMaxLogarithmic=${args.yAxisMaxLogarithmic}
            ></gs-relative-growth-advantage>
        </gs-app>
    `,
};

export const Default: StoryObj<Required<RelativeGrowthAdvantageComponentProps>> = {
    ...Template,
    args: {
        numeratorFilter: {
            country: 'Switzerland',
            pangoLineage: 'B.1.1.7',
            dateFrom: '2020-12-01',
            dateTo: '2021-03-01',
        },
        denominatorFilter: { country: 'Switzerland', dateFrom: '2020-12-01', dateTo: '2021-03-01' },
        generationTime: 7,
        views: ['line'],
        width: '100%',
        height: '700px',
        lapisDateField: 'date',
        yAxisMaxLinear: 1,
        yAxisMaxLogarithmic: 'limitTo1',
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'numeratorFilter',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            country: 'Switzerland',
                            pangoLineage: 'B.1.1.7',
                            dateFrom: '2020-12-01',
                            dateTo: '2021-03-01',
                            fields: ['date'],
                        },
                    },
                    response: {
                        status: 200,
                        body: numeratorFilter,
                    },
                },
                {
                    matcher: {
                        name: 'denominatorFilter',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            country: 'Switzerland',
                            dateFrom: '2020-12-01',
                            dateTo: '2021-03-01',
                            fields: ['date'],
                        },
                    },
                    response: {
                        status: 200,
                        body: denominatorFilter,
                    },
                },
            ],
        },
    },
};

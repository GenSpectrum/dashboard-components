import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './gs-relative-growth-advantage';
import '../app';
import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import denominator from '../../preact/relativeGrowthAdvantage/__mockData__/denominator.json';
import numerator from '../../preact/relativeGrowthAdvantage/__mockData__/numerator.json';
import { type RelativeGrowthAdvantageProps } from '../../preact/relativeGrowthAdvantage/relative-growth-advantage';

const codeExample = String.raw`
<gs-relative-growth-advantage
    numerator='{ "country": "Switzerland", "pangoLineage": "B.1.1.7", "dateFrom": "2020-12-01" }'
    denominator='{ "country": "Switzerland", "dateFrom": "2020-12-01" }'
    generationTime="7"
    views='["line"]'
    headline="Relative growth advantage"
></gs-relative-growth-advantage>`;

const meta: Meta<RelativeGrowthAdvantageProps> = {
    title: 'Visualization/Relative growth advantage',
    component: 'gs-relative-growth-advantage',
    argTypes: {
        numerator: { control: 'object' },
        denominator: { control: 'object' },
        generationTime: { control: 'number' },
        views: {
            options: ['line'],
            control: { type: 'check' },
        },
        size: [{ control: 'object' }],
        headline: { control: 'text' },
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

const Template: StoryObj<Required<RelativeGrowthAdvantageProps>> = {
    render: (args) => html`
        <gs-app lapis="${LAPIS_URL}">
            <gs-relative-growth-advantage
                .numerator=${args.numerator}
                .denominator=${args.denominator}
                .generationTime=${args.generationTime}
                .views=${args.views}
                .size=${args.size}
                .headline=${args.headline}
            ></gs-relative-growth-advantage>
        </gs-app>
    `,
};

export const Default: StoryObj<Required<RelativeGrowthAdvantageProps>> = {
    ...Template,
    args: {
        numerator: { country: 'Switzerland', pangoLineage: 'B.1.1.7', dateFrom: '2020-12-01', dateTo: '2021-03-01' },
        denominator: { country: 'Switzerland', dateFrom: '2020-12-01', dateTo: '2021-03-01' },
        generationTime: 7,
        views: ['line'],
        size: { width: '100%', height: '700px' },
        headline: 'Relative growth advantage',
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'numerator',
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
                        body: numerator,
                    },
                },
                {
                    matcher: {
                        name: 'denominator',
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
                        body: denominator,
                    },
                },
            ],
        },
    },
};

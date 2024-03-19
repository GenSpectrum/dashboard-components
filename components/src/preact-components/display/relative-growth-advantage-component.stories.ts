import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './relative-growth-advantage-component';
import '../../components/app';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import numerator from '../../preact/relativeGrowthAdvantage/__mockData__/numerator.json';
import denominator from '../../preact/relativeGrowthAdvantage/__mockData__/denominator.json';
import { RelativeGrowthAdvantageProps } from '../../preact/relativeGrowthAdvantage/relative-growth-advantage';

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
    },
};

export default meta;

const Template: StoryObj<RelativeGrowthAdvantageProps> = {
    render: (args) => html`
        <div class="w-11/12 h-11/12">
            <gs-app lapis="${LAPIS_URL}">
                <gs-relative-growth-advantage
                    .numerator=${args.numerator}
                    .denominator=${args.denominator}
                    .generationTime=${args.generationTime}
                    .views=${args.views}
                ></gs-relative-growth-advantage>
            </gs-app>
        </div>
    `,
};

export const Default = {
    ...Template,
    args: {
        numerator: { country: 'Switzerland', pangoLineage: 'B.1.1.7', dateFrom: '2020-12-01', dateTo: '2021-03-01' },
        denominator: { country: 'Switzerland', dateFrom: '2020-12-01', dateTo: '2021-03-01' },
        generationTime: 7,
        views: ['line'],
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'numerator',
                        url: AGGREGATED_ENDPOINT,
                        query: {
                            country: 'Switzerland',
                            pangoLineage: 'B.1.1.7',
                            dateFrom: '2020-12-01',
                            dateTo: '2021-03-01',
                            fields: 'date',
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
                        query: {
                            country: 'Switzerland',
                            dateFrom: '2020-12-01',
                            dateTo: '2021-03-01',
                            fields: 'date',
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

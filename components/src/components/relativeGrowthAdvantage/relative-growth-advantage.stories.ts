import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import '../app';
import './relative-growth-advantage';
import { RelativeGrowthAdvantageProps } from './relative-growth-advantage';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import numerator from './__mockData__/numerator.json';
import denominator from './__mockData__/denominator.json';

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
        <gs-app lapis="${LAPIS_URL}">
            <gs-relative-growth-advantage
                .numerator=${args.numerator}
                .denominator=${args.denominator}
                .generationTime=${args.generationTime}
                .views=${args.views}
            ></gs-relative-growth-advantage>
        </gs-app>
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

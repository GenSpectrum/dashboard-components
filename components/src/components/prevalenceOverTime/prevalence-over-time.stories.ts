import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import '../app';
import './prevalence-over-time';
// eslint-disable-next-line no-duplicate-imports
import { PrevalenceOverTimeProps } from './prevalence-over-time';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import denominator from './__mockData__/denominator.json';
import numeratorEG from './__mockData__/numeratorEG.json';
import numeratorJN1 from './__mockData__/numeratorJN1.json';
import denominatorOneVariant from './__mockData__/denominatorOneVariant.json';
import numeratorOneVariant from './__mockData__/numeratorOneVariant.json';

const meta: Meta<PrevalenceOverTimeProps> = {
    title: 'Visualization/Prevalence over time',
    component: 'gs-prevalence-over-time',
    argTypes: {
        numerator: { control: 'object' },
        denominator: { control: 'object' },
        granularity: {
            options: ['day', 'week', 'month', 'year'],
            control: { type: 'radio' },
        },
        smoothingWindow: { control: 'number' },
        views: {
            options: ['bar', 'line', 'bubble', 'table'],
            control: { type: 'check' },
        },
    },
};

export default meta;

const Template: StoryObj<PrevalenceOverTimeProps> = {
    render: (args) => html`
        <div class="w-11/12 h-11/12">
            <gs-app lapis="${LAPIS_URL}">
                <gs-prevalence-over-time
                    .numerator=${args.numerator}
                    .denominator=${args.denominator}
                    .granularity=${args.granularity}
                    .smoothingWindow=${args.smoothingWindow}
                    .views=${args.views}
                ></gs-prevalence-over-time>
            </gs-app>
        </div>
    `,
};

export const TwoVariants = {
    ...Template,
    args: {
        numerator: [
            { displayName: 'EG', country: 'USA', pangoLineage: 'EG*', dateFrom: '2023-01-01' },
            { displayName: 'JN.1', country: 'USA', pangoLineage: 'JN.1*', dateFrom: '2023-01-01' },
        ],
        denominator: { country: 'USA', dateFrom: '2023-01-01' },
        granularity: 'month',
        smoothingWindow: 0,
        views: ['bar', 'line', 'bubble', 'table'],
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'numeratorEG',
                        url: AGGREGATED_ENDPOINT,
                        query: {
                            displayName: 'EG',
                            country: 'USA',
                            pangoLineage: 'EG*',
                            dateFrom: '2023-01-01',
                            fields: 'date',
                        },
                    },
                    response: {
                        status: 200,
                        body: numeratorEG,
                    },
                },
                {
                    matcher: {
                        name: 'numeratorJN1',
                        url: AGGREGATED_ENDPOINT,
                        query: {
                            displayName: 'JN.1',
                            country: 'USA',
                            pangoLineage: 'JN.1*',
                            dateFrom: '2023-01-01',
                            fields: 'date',
                        },
                    },
                    response: {
                        status: 200,
                        body: numeratorJN1,
                    },
                },
                {
                    matcher: {
                        name: 'denominator',
                        url: AGGREGATED_ENDPOINT,
                        query: {
                            country: 'USA',
                            dateFrom: '2023-01-01',
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

export const OneVariant = {
    ...Template,
    args: {
        numerator: { displayName: 'EG', country: 'USA', pangoLineage: 'BA.2.86*', dateFrom: '2023-10-01' },
        denominator: { country: 'USA', dateFrom: '2023-10-01' },
        granularity: 'day',
        smoothingWindow: 7,
        views: ['bar', 'line', 'bubble', 'table'],
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'numeratorOneVariant',
                        url: AGGREGATED_ENDPOINT,
                        query: {
                            displayName: 'EG',
                            country: 'USA',
                            pangoLineage: 'BA.2.86*',
                            dateFrom: '2023-10-01',
                            fields: 'date',
                        },
                    },
                    response: {
                        status: 200,
                        body: numeratorOneVariant,
                    },
                },
                {
                    matcher: {
                        name: 'denominatorOneVariant',
                        url: AGGREGATED_ENDPOINT,
                        query: {
                            country: 'USA',
                            dateFrom: '2023-10-01',
                            fields: 'date',
                        },
                    },
                    response: {
                        status: 200,
                        body: denominatorOneVariant,
                    },
                },
            ],
        },
    },
};

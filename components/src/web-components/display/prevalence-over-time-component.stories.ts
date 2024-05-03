import { expect, fireEvent, waitFor } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import '../app';
import './prevalence-over-time-component';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import denominator from '../../preact/prevalenceOverTime/__mockData__/denominator.json';
import denominatorOneVariant from '../../preact/prevalenceOverTime/__mockData__/denominatorOneVariant.json';
import numeratorEG from '../../preact/prevalenceOverTime/__mockData__/numeratorEG.json';
import numeratorJN1 from '../../preact/prevalenceOverTime/__mockData__/numeratorJN1.json';
import numeratorOneVariant from '../../preact/prevalenceOverTime/__mockData__/numeratorOneVariant.json';
import { type PrevalenceOverTimeProps } from '../../preact/prevalenceOverTime/prevalence-over-time';
import { withinShadowRoot } from '../withinShadowRoot.story';

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
        confidenceIntervalMethods: {
            options: ['wilson'],
            control: { type: 'check' },
        },
        size: [{ control: 'object' }],
    },
};

export default meta;

const Template: StoryObj<PrevalenceOverTimeProps> = {
    render: (args) => html`
        <gs-app lapis="${LAPIS_URL}">
            <gs-prevalence-over-time
                .numerator=${args.numerator}
                .denominator=${args.denominator}
                .granularity=${args.granularity}
                .smoothingWindow=${args.smoothingWindow}
                .views=${args.views}
                .confidenceIntervalMethods=${args.confidenceIntervalMethods}
                .size=${args.size}
            ></gs-prevalence-over-time>
        </gs-app>
    `,
};

export const TwoVariants: StoryObj<PrevalenceOverTimeProps> = {
    ...Template,
    args: {
        numerator: [
            { displayName: 'EG', country: 'USA', pangoLineage: 'EG*', dateFrom: '2023-01-01' },
            { displayName: 'JN.1', country: 'USA', pangoLineage: 'JN.1*', dateFrom: '2023-01-01' },
        ],
        denominator: { country: 'USA', dateFrom: '2023-01-01', displayName: 'All' },
        granularity: 'month',
        smoothingWindow: 0,
        views: ['bar', 'line', 'bubble', 'table'],
        confidenceIntervalMethods: ['wilson'],
        size: { width: '100%', height: '700px' },
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'numeratorEG',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            country: 'USA',
                            pangoLineage: 'EG*',
                            dateFrom: '2023-01-01',
                            fields: ['date'],
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
                        body: {
                            country: 'USA',
                            pangoLineage: 'JN.1*',
                            dateFrom: '2023-01-01',
                            fields: ['date'],
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
                        body: {
                            country: 'USA',
                            dateFrom: '2023-01-01',
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

export const OneVariant: StoryObj<PrevalenceOverTimeProps> = {
    ...Template,
    args: {
        numerator: { displayName: 'EG', country: 'USA', pangoLineage: 'BA.2.86*', dateFrom: '2023-10-01' },
        denominator: { country: 'USA', dateFrom: '2023-10-01', displayName: 'All' },
        granularity: 'day',
        smoothingWindow: 7,
        views: ['bar', 'line', 'bubble', 'table'],
        confidenceIntervalMethods: ['wilson'],
        size: { width: '100%', height: '700px' },
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'numeratorOneVariant',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            country: 'USA',
                            pangoLineage: 'BA.2.86*',
                            dateFrom: '2023-10-01',
                            fields: ['date'],
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
                        body: {
                            country: 'USA',
                            dateFrom: '2023-10-01',
                            fields: ['date'],
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

export const OneVariantOnLineTab: StoryObj<PrevalenceOverTimeProps> = {
    ...OneVariant,
    play: async ({ canvasElement }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-prevalence-over-time');

        await waitFor(() => expect(canvas.getByRole('button', { name: 'Line' })).toBeInTheDocument());

        await fireEvent.click(canvas.getByRole('button', { name: 'Line' }));
    },
};

export const OneVariantOnBubbleTab: StoryObj<PrevalenceOverTimeProps> = {
    ...OneVariant,
    play: async ({ canvasElement }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-prevalence-over-time');

        await waitFor(() => expect(canvas.getByRole('button', { name: 'Bubble' })).toBeInTheDocument());

        await fireEvent.click(canvas.getByRole('button', { name: 'Bubble' }));
    },
};

export const OneVariantOnTableTab: StoryObj<PrevalenceOverTimeProps> = {
    ...OneVariant,
    play: async ({ canvasElement }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-prevalence-over-time');

        await waitFor(() => expect(canvas.getByRole('button', { name: 'Table' })).toBeInTheDocument());

        await fireEvent.click(canvas.getByRole('button', { name: 'Table' }));
    },
};

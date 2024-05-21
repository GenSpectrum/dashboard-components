import { expect, fireEvent, waitFor } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import '../app';
import './gs-prevalence-over-time';
import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import denominator from '../../preact/prevalenceOverTime/__mockData__/denominator.json';
import denominatorOneVariant from '../../preact/prevalenceOverTime/__mockData__/denominatorOneVariant.json';
import numeratorEG from '../../preact/prevalenceOverTime/__mockData__/numeratorEG.json';
import numeratorJN1 from '../../preact/prevalenceOverTime/__mockData__/numeratorJN1.json';
import numeratorOneVariant from '../../preact/prevalenceOverTime/__mockData__/numeratorOneVariant.json';
import { type PrevalenceOverTimeProps } from '../../preact/prevalenceOverTime/prevalence-over-time';
import { withinShadowRoot } from '../withinShadowRoot.story';

const codeExample = String.raw`
<gs-prevalence-over-time
    numerator='[{ "displayName": "EG", "lapisFilter": { "country": "USA", "pangoLineage": "EG*" }}, { "displayName": "JN.1", "lapisFilter": { "country": "USA", "pangoLineage": "JN.1*" }}]'
    denominator='{ "country": "USA"}'
    granularity="month"
    smoothingWindow="0"
    views='["bar", "line", "bubble", "table"]'
    confidenceIntervalMethods='["wilson"]'
    headline="Prevalence over time"
    width='100%'
    height='700px'
></gs-prevalence-over-time>`;

const meta: Meta<Required<PrevalenceOverTimeProps>> = {
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
        width: { control: 'text' },
        height: { control: 'text' },
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

const Template: StoryObj<Required<PrevalenceOverTimeProps>> = {
    render: (args) => html`
        <gs-app lapis="${LAPIS_URL}">
            <gs-prevalence-over-time
                .numerator=${args.numerator}
                .denominator=${args.denominator}
                .granularity=${args.granularity}
                .smoothingWindow=${args.smoothingWindow}
                .views=${args.views}
                .confidenceIntervalMethods=${args.confidenceIntervalMethods}
                .width=${args.width}
                .height=${args.height}
                .headline=${args.headline}
            ></gs-prevalence-over-time>
        </gs-app>
    `,
};

export const TwoVariants: StoryObj<Required<PrevalenceOverTimeProps>> = {
    ...Template,
    args: {
        numerator: [
            { displayName: 'EG', lapisFilter: { country: 'USA', pangoLineage: 'EG*', dateFrom: '2023-01-01' } },
            { displayName: 'JN.1', lapisFilter: { country: 'USA', pangoLineage: 'JN.1*', dateFrom: '2023-01-01' } },
        ],
        denominator: { country: 'USA', dateFrom: '2023-01-01' },
        granularity: 'month',
        smoothingWindow: 0,
        views: ['bar', 'line', 'bubble', 'table'],
        confidenceIntervalMethods: ['wilson'],
        width: '100%',
        height: '700px',
        headline: 'Prevalence over time',
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

export const OneVariant: StoryObj<Required<PrevalenceOverTimeProps>> = {
    ...Template,
    args: {
        numerator: {
            displayName: 'EG',
            lapisFilter: { country: 'USA', pangoLineage: 'BA.2.86*', dateFrom: '2023-10-01' },
        },
        denominator: { country: 'USA', dateFrom: '2023-10-01' },
        granularity: 'day',
        smoothingWindow: 7,
        views: ['bar', 'line', 'bubble', 'table'],
        confidenceIntervalMethods: ['wilson'],
        width: '100%',
        height: '700px',
        headline: 'Prevalence over time',
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

export const OneVariantOnLineTab: StoryObj<Required<PrevalenceOverTimeProps>> = {
    ...OneVariant,
    play: async ({ canvasElement }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-prevalence-over-time');

        await waitFor(() => expect(canvas.getByRole('button', { name: 'Line' })).toBeInTheDocument());

        await fireEvent.click(canvas.getByRole('button', { name: 'Line' }));
    },
};

export const OneVariantOnBubbleTab: StoryObj<Required<PrevalenceOverTimeProps>> = {
    ...OneVariant,
    play: async ({ canvasElement }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-prevalence-over-time');

        await waitFor(() => expect(canvas.getByRole('button', { name: 'Bubble' })).toBeInTheDocument());

        await fireEvent.click(canvas.getByRole('button', { name: 'Bubble' }));
    },
};

export const OneVariantOnTableTab: StoryObj<Required<PrevalenceOverTimeProps>> = {
    ...OneVariant,
    play: async ({ canvasElement }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-prevalence-over-time');

        await waitFor(() => expect(canvas.getByRole('button', { name: 'Table' })).toBeInTheDocument());

        await fireEvent.click(canvas.getByRole('button', { name: 'Table' }));
    },
};

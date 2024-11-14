import type { StoryObj } from '@storybook/preact';
import { expect, waitFor } from '@storybook/test';

import { LapisUrlContext } from '../LapisUrlContext';
import denominatorFilter from './__mockData__/denominatorFilter.json';
import denominatorOneDataset from './__mockData__/denominatorFilterOneDataset.json';
import numeratorFilterEG from './__mockData__/numeratorFilterEG.json';
import numeratorFilterJN1 from './__mockData__/numeratorFilterJN1.json';
import numeratorFilterNoData from './__mockData__/numeratorFilterNoData.json';
import numeratorOneDataset from './__mockData__/numeratorFilterOneDataset.json';
import { PrevalenceOverTime, type PrevalenceOverTimeProps } from './prevalence-over-time';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';

export default {
    title: 'Visualization/PrevalenceOverTime',
    component: PrevalenceOverTime,
    parameters: {
        fetchMock: {},
    },
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
        pageSize: { control: 'object' },
        yAxisMaxConfig: { control: 'object' },
        lapisDateField: { control: 'text' },
    },
};

const Template = {
    render: (args: PrevalenceOverTimeProps) => (
        <LapisUrlContext.Provider value={LAPIS_URL}>
            <PrevalenceOverTime
                numeratorFilter={args.numeratorFilter}
                denominatorFilter={args.denominatorFilter}
                granularity={args.granularity}
                smoothingWindow={args.smoothingWindow}
                views={args.views}
                confidenceIntervalMethods={args.confidenceIntervalMethods}
                width={args.width}
                height={args.height}
                lapisDateField={args.lapisDateField}
                pageSize={args.pageSize}
                yAxisMaxLinear={args.yAxisMaxLinear}
                yAxisMaxLogarithmic={args.yAxisMaxLogarithmic}
            />
        </LapisUrlContext.Provider>
    ),
};

export const TwoVariants: StoryObj<PrevalenceOverTimeProps> = {
    ...Template,
    args: {
        numeratorFilter: [
            { displayName: 'EG', lapisFilter: { country: 'USA', pangoLineage: 'EG*', dateFrom: '2023-01-01' } },
            { displayName: 'JN.1', lapisFilter: { country: 'USA', pangoLineage: 'JN.1*', dateFrom: '2023-01-01' } },
        ],
        denominatorFilter: { country: 'USA', dateFrom: '2023-01-01' },
        granularity: 'month',
        smoothingWindow: 0,
        views: ['bar', 'line', 'bubble', 'table'],
        confidenceIntervalMethods: ['wilson'],
        width: '100%',
        height: '700px',
        lapisDateField: 'date',
        pageSize: 10,
        yAxisMaxLinear: 1,
        yAxisMaxLogarithmic: 1,
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
                        body: numeratorFilterEG,
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
                        body: numeratorFilterJN1,
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
                        body: denominatorFilter,
                    },
                },
            ],
        },
    },
};

export const OneVariant: StoryObj<PrevalenceOverTimeProps> = {
    ...Template,
    args: {
        numeratorFilter: {
            displayName: 'EG',
            lapisFilter: { country: 'USA', pangoLineage: 'BA.2.86*', dateFrom: '2023-10-01' },
        },
        denominatorFilter: { country: 'USA', dateFrom: '2023-10-01' },
        granularity: 'day',
        smoothingWindow: 7,
        views: ['bar', 'line', 'bubble', 'table'],
        confidenceIntervalMethods: ['wilson'],
        width: '100%',
        height: '700px',
        lapisDateField: 'date',
        pageSize: 10,
        yAxisMaxLinear: 1,
        yAxisMaxLogarithmic: 1,
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
                        body: numeratorOneDataset,
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
                        body: denominatorOneDataset,
                    },
                },
            ],
        },
    },
};

export const ShowsNoDataBanner: StoryObj<PrevalenceOverTimeProps> = {
    ...Template,
    args: {
        numeratorFilter: {
            displayName: 'EG',
            lapisFilter: { country: 'USA', pangoLineage: 'BA.2.86*', dateFrom: '2023-10-01' },
        },
        denominatorFilter: { country: 'USA', dateFrom: '2023-10-01' },
        granularity: 'day',
        smoothingWindow: 7,
        views: ['bar', 'line', 'bubble', 'table'],
        confidenceIntervalMethods: ['wilson'],
        width: '100%',
        height: '700px',
        lapisDateField: 'date',
        pageSize: 10,
        yAxisMaxLinear: 1,
        yAxisMaxLogarithmic: 1,
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
                        body: numeratorFilterNoData,
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
                        body: numeratorFilterNoData,
                    },
                },
            ],
        },
    },
    play: async ({ canvas }) => {
        await waitFor(() => expect(canvas.getByText('No data available.', { exact: false })).toBeVisible(), {
            timeout: 10000,
        });
    },
};

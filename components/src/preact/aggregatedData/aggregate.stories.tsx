import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, waitFor, within } from '@storybook/test';

import aggregatedData from './__mockData__/aggregated.json';
import { Aggregate, type AggregateProps } from './aggregate';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import { LapisUrlContext } from '../LapisUrlContext';
import { expectInvalidAttributesErrorMessage } from '../shared/stories/expectErrorMessage';

const meta: Meta<AggregateProps> = {
    title: 'Visualization/Aggregate',
    component: Aggregate,
    argTypes: {
        fields: [{ control: 'object' }],
        width: { control: 'text' },
        height: { control: 'text' },
        initialSortField: { control: 'text' },
        initialSortDirection: { control: 'radio', options: ['ascending', 'descending'] },
        pageSize: { control: 'object' },
    },
    parameters: {
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
    },
};

export default meta;

export const Default: StoryObj<AggregateProps> = {
    render: (args) => (
        <LapisUrlContext.Provider value={LAPIS_URL}>
            <Aggregate {...args} />
        </LapisUrlContext.Provider>
    ),
    args: {
        fields: ['division', 'host'],
        views: ['table'],
        lapisFilter: {
            country: 'USA',
        },
        width: '100%',
        height: '700px',
        initialSortField: 'count',
        initialSortDirection: 'descending',
        pageSize: 10,
        maxNumberOfBars: 20,
    },
};

export const FailsLoadingData: StoryObj<AggregateProps> = {
    ...Default,
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'aggregatedData',
                        url: AGGREGATED_ENDPOINT,
                    },
                    response: {
                        status: 400,
                        body: {
                            error: {
                                title: 'Bad Request',
                                detail: 'Test error',
                                status: 400,
                            },
                        },
                    },
                },
            ],
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(async () => {
            await expect(canvas.getByText('Error - Failed fetching aggregated data from LAPIS')).toBeInTheDocument();
            await expect(canvas.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
        });
    },
};

export const WithEmptyFieldString: StoryObj<AggregateProps> = {
    ...Default,
    args: {
        ...Default.args,
        fields: [''],
    },
    play: async ({ canvasElement, step }) => {
        step('expect error message', async () => {
            await expectInvalidAttributesErrorMessage(canvasElement, 'String must contain at least 1 character(s)');
        });
    },
};

export const BarChartWithNoFields: StoryObj<AggregateProps> = {
    ...Default,
    args: {
        ...Default.args,
        views: ['bar', 'table'],
        fields: [],
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'aggregatedData',
                        url: AGGREGATED_ENDPOINT,
                    },
                    response: {
                        status: 200,
                        body: aggregatedData,
                    },
                },
            ],
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(async () => {
            await expect(
                canvas.getByText('Cannot display a bar chart when there are no fields given', {
                    exact: false,
                }),
            ).toBeVisible();
        });
    },
};

export const BarChartWithMoreThan2Fields: StoryObj<AggregateProps> = {
    ...Default,
    args: {
        ...Default.args,
        views: ['bar', 'table'],
        fields: ['division', 'host', 'country'],
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'aggregatedData',
                        url: AGGREGATED_ENDPOINT,
                    },
                    response: {
                        status: 200,
                        body: aggregatedData,
                    },
                },
            ],
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(async () => {
            await expect(
                canvas.getByText('Cannot display a bar chart when there are more than two fields given', {
                    exact: false,
                }),
            ).toBeVisible();
        });
    },
};

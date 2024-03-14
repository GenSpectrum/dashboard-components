import type { Meta, StoryObj } from '@storybook/web-components';
import { withActions } from '@storybook/addon-actions/decorator';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';

import { html } from 'lit';
import '../app';
import './location-filter';
import data from './__mockData__/aggregated.json';
import { withinShadowRoot } from '../../storybook/withinShadowRoot.story';
import { expect, waitFor } from '@storybook/test';

const meta: Meta<{}> = {
    title: 'Input/Location filter',
    component: 'gs-location-filter',
    parameters: {
        actions: {
            handles: ['gs-location-changed'],
        },
    },
    decorators: [withActions],
};

export default meta;

const Template: StoryObj<{ fields: string[] }> = {
    render: (args) => {
        return html` <gs-app lapis="${LAPIS_URL}">
            <gs-location-filter .fields=${args.fields}></gs-location-filter>
        </gs-app>`;
    },
    args: {
        fields: ['region', 'country', 'division', 'location'],
    },
};

const aggregatedEndpointMatcher = {
    name: 'numeratorEG',
    url: AGGREGATED_ENDPOINT,
    query: {
        fields: 'region,country,division,location',
    },
};

export const LocationFilter: StoryObj<{ fields: string[] }> = {
    ...Template,
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: aggregatedEndpointMatcher,
                    response: {
                        status: 200,
                        body: data,
                    },
                },
            ],
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-location-filter');
        await waitFor(() => {
            return expect(canvas.getByRole('combobox')).toBeEnabled();
        });
    },
};

export const DelayToShowLoadingState: StoryObj<{ fields: string[] }> = {
    ...Template,
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: aggregatedEndpointMatcher,
                    response: {
                        status: 200,
                        body: data,
                    },
                    options: {
                        delay: 5000,
                    },
                },
            ],
        },
    },
};

export const FetchingLocationsFails: StoryObj<{ fields: string[] }> = {
    ...Template,
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: aggregatedEndpointMatcher,
                    response: {
                        status: 500,
                        body: { error: 'no data' },
                    },
                },
            ],
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-location-filter');

        await waitFor(() => expect(canvas.getByText('Error: TypeError', { exact: false })).toBeInTheDocument());
    },
};

import { expect, fn, userEvent, waitFor } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { previewHandles } from '../../../.storybook/preview';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import '../app';
import './gs-location-filter';
import data from '../../preact/locationFilter/__mockData__/aggregated.json';
import { type LocationFilterProps } from '../../preact/locationFilter/location-filter';
import { withinShadowRoot } from '../withinShadowRoot.story';

const codeExample = String.raw`
<gs-location-filter
    fields='["region", "country"]'
    initialValue='Europe / Switzerland'
    width="100%"
    placeholderText="Enter a location"
></gs-location-filter>`;

const meta: Meta = {
    title: 'Input/Location filter',
    component: 'gs-location-filter',
    parameters: withComponentDocs({
        actions: {
            handles: ['gs-location-changed', ...previewHandles],
        },
        componentDocs: {
            opensShadowDom: true,
            expectsChildren: false,
            codeExample,
        },
    }),
    argTypes: {
        fields: {
            control: {
                type: 'object',
            },
        },
        initialValue: {
            control: {
                type: 'text',
            },
        },
        width: {
            control: {
                type: 'text',
            },
        },
        placeholderText: {
            control: {
                type: 'text',
            },
        },
    },
    tags: ['autodocs'],
};

export default meta;

const Template: StoryObj<LocationFilterProps> = {
    render: (args) => {
        return html` <gs-app lapis="${LAPIS_URL}">
            <div class="max-w-screen-lg">
                <gs-location-filter
                    .fields=${args.fields}
                    initialValue=${ifDefined(args.initialValue)}
                    .width=${args.width}
                    placeholderText=${ifDefined(args.placeholderText)}
                ></gs-location-filter>
            </div>
        </gs-app>`;
    },
    args: {
        fields: ['region', 'country', 'division', 'location'],
        initialValue: '',
        width: '100%',
        placeholderText: 'Enter a location',
    },
};

const aggregatedEndpointMatcher = {
    name: 'numeratorEG',
    url: AGGREGATED_ENDPOINT,
    body: {
        fields: ['region', 'country', 'division', 'location'],
    },
};

export const LocationFilter: StoryObj<LocationFilterProps> = {
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
        await waitFor(() => {
            return expect(canvas.getByPlaceholderText('Enter a location')).toBeInTheDocument();
        });
    },
};

export const DelayToShowLoadingState: StoryObj<LocationFilterProps> = {
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

export const FetchingLocationsFails: StoryObj<LocationFilterProps> = {
    ...Template,
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: aggregatedEndpointMatcher,
                    response: {
                        status: 400,
                        body: {
                            error: { status: 400, detail: 'Dummy error message from mock LAPIS', type: 'about:blank' },
                        },
                    },
                },
            ],
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-location-filter');

        await waitFor(() =>
            expect(canvas.getByText('Oops! Something went wrong.', { exact: false })).toBeInTheDocument(),
        );
    },
};

export const FiresEvent: StoryObj<LocationFilterProps> = {
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
    play: async ({ canvasElement, step }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-location-filter');

        const inputField = () => canvas.getByRole('combobox');

        const listenerMock = fn();
        await step('Setup event listener mock', async () => {
            canvasElement.addEventListener('gs-location-changed', listenerMock);
        });

        await step('wait until data is loaded', async () => {
            await waitFor(() => {
                return expect(inputField()).toBeEnabled();
            });
        });

        await step('Input invalid location', async () => {
            await userEvent.type(inputField(), 'Not / A / Location');
            await expect(listenerMock).not.toHaveBeenCalled();
        });

        await step('Empty input', async () => {
            await userEvent.type(inputField(), '{backspace>18/}');
            await expect(listenerMock.mock.calls.at(-1)[0].detail).toStrictEqual({
                region: undefined,
                country: undefined,
                division: undefined,
                location: undefined,
            });
        });

        await step('Select Asia', async () => {
            await userEvent.type(inputField(), 'Asia');
            await expect(listenerMock.mock.calls.at(-1)[0].detail).toStrictEqual({
                region: 'Asia',
                country: undefined,
                division: undefined,
                location: undefined,
            });
        });

        await step('Select Asia / Bangladesh / Rajshahi / Chapainawabgonj', async () => {
            await userEvent.type(inputField(), ' / Bangladesh / Rajshahi / Chapainawabgonj');
            await expect(listenerMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: {
                        region: 'Asia',
                        country: 'Bangladesh',
                        division: 'Rajshahi',
                        location: 'Chapainawabgonj',
                    },
                }),
            );
        });
    },
};

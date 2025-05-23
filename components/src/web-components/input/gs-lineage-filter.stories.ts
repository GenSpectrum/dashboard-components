import { expect, fn, userEvent, waitFor } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { previewHandles } from '../../../.storybook/preview';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import '../gs-app';
import './gs-lineage-filter';
import { lineageDefinitionEndpoint } from '../../lapisApi/lapisApi';
import aggregatedData from '../../preact/lineageFilter/__mockData__/aggregated.json';
import lineageDefinition from '../../preact/lineageFilter/__mockData__/lineageDefinition.json';
import { type LineageFilterProps } from '../../preact/lineageFilter/lineage-filter';
import { gsEventNames } from '../../utils/gsEventNames';
import { withinShadowRoot } from '../withinShadowRoot.story';

const codeExample = String.raw`
<gs-lineage-filter 
    lapisField="pangoLineage"
    lapisFilter='{"counrty": "Germany"}'
    placeholderText="Enter lineage"
    value="B.1.1.7"
    width="50%">
</gs-lineage-filter>`;

const meta: Meta<Required<LineageFilterProps>> = {
    title: 'Input/Lineage filter',
    component: 'gs-lineage-filter',
    parameters: withComponentDocs({
        actions: {
            handles: [gsEventNames.lineageFilterChanged, ...previewHandles],
        },
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'pangoLineage',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            fields: ['pangoLineage'],
                            country: 'Germany',
                        },
                    },
                    response: {
                        status: 200,
                        body: aggregatedData,
                    },
                },
                {
                    matcher: {
                        name: 'lineageDefinition',
                        url: lineageDefinitionEndpoint(LAPIS_URL, 'pangoLineage'),
                    },
                    response: {
                        status: 200,
                        body: lineageDefinition,
                    },
                },
            ],
        },
        componentDocs: {
            opensShadowDom: true,
            expectsChildren: false,
            codeExample,
        },
    }),
    tags: ['autodocs'],
    argTypes: {
        lapisField: {
            control: {
                type: 'select',
            },
            options: ['host'],
        },
        placeholderText: {
            control: {
                type: 'text',
            },
        },
        value: {
            control: {
                type: 'text',
            },
        },
        width: {
            control: {
                type: 'text',
            },
        },
        lapisFilter: {
            control: {
                type: 'object',
            },
        },
    },
};

export default meta;

const Template: StoryObj<Required<LineageFilterProps>> = {
    render: (args) => {
        return html` <gs-app lapis="${LAPIS_URL}">
            <div class="max-w-(--breakpoint-lg)">
                <gs-lineage-filter
                    .lapisField=${args.lapisField}
                    .lapisFilter=${args.lapisFilter}
                    .placeholderText=${args.placeholderText}
                    .value=${args.value}
                    .width=${args.width}
                ></gs-lineage-filter>
            </div>
        </gs-app>`;
    },
    args: {
        lapisField: 'pangoLineage',
        lapisFilter: {
            country: 'Germany',
        },
        placeholderText: 'Enter a lineage',
        value: 'B.1.1.7',
        width: '100%',
    },
};

const aggregatedEndpointMatcher = {
    name: 'pangoLineage',
    url: AGGREGATED_ENDPOINT,
    body: {
        fields: ['pangoLineage'],
        country: 'Germany',
    },
};

export const LineageFilter: StoryObj<Required<LineageFilterProps>> = {
    ...Template,
    play: async ({ canvasElement }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-lineage-filter');
        await waitFor(() => {
            return expect(canvas.getByPlaceholderText('Enter a lineage')).toBeVisible();
        });
    },
};

export const DelayToShowLoadingState: StoryObj<Required<LineageFilterProps>> = {
    ...Template,
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: aggregatedEndpointMatcher,
                    response: {
                        status: 200,
                        body: aggregatedData,
                    },
                    options: {
                        delay: 5000,
                    },
                },
            ],
        },
    },
};

export const FetchingLocationsFails: StoryObj<Required<LineageFilterProps>> = {
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
        const canvas = await withinShadowRoot(canvasElement, 'gs-lineage-filter');

        await waitFor(() =>
            expect(canvas.getByText('Oops! Something went wrong.', { exact: false })).toBeInTheDocument(),
        );
    },
};

export const FiresEvent: StoryObj<Required<LineageFilterProps>> = {
    ...LineageFilter,
    play: async ({ canvasElement, step }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-lineage-filter');

        const inputField = () => canvas.getByPlaceholderText('Enter a lineage');
        const listenerMock = fn();
        await step('Setup event listener mock', () => {
            canvasElement.addEventListener(gsEventNames.lineageFilterChanged, listenerMock);
        });

        await step('wait until data is loaded', async () => {
            await waitFor(() => {
                return expect(inputField()).toBeEnabled();
            });
        });

        await step('Enters an invalid lineage value', async () => {
            await userEvent.type(inputField(), 'notInList');
            await expect(listenerMock).not.toHaveBeenCalled();
        });

        await step('Empty input', async () => {
            await userEvent.type(inputField(), '{backspace>9/}');
            await userEvent.click(canvas.getByLabelText('toggle menu'));

            await waitFor(() => {
                return expect(listenerMock.mock.calls.at(-1)![0].detail).toStrictEqual({
                    pangoLineage: undefined,
                });
            });
        });

        await step('Enter a valid lineage value', async () => {
            await userEvent.type(inputField(), 'B.1.1.7*');
            await userEvent.click(canvas.getByRole('option', { name: 'B.1.1.7*(677146)' }));

            await waitFor(() => {
                return expect(listenerMock.mock.calls.at(-1)![0].detail).toStrictEqual({
                    pangoLineage: 'B.1.1.7*',
                });
            });
        });
    },
    args: {
        ...LineageFilter.args,
        value: '',
    },
};

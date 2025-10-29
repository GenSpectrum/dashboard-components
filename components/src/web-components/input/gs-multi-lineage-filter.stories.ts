import { expect, fn, userEvent, waitFor } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { previewHandles } from '../../../.storybook/preview';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import '../gs-app';
import './gs-multi-lineage-filter';
import { lineageDefinitionEndpoint } from '../../lapisApi/lapisApi';
import aggregatedData from '../../preact/lineageFilter/__mockData__/aggregated.json';
import lineageDefinition from '../../preact/lineageFilter/__mockData__/lineageDefinition.json';
import { type MultiLineageFilterProps } from '../../preact/lineageFilter/multi-lineage-filter';
import { gsEventNames } from '../../utils/gsEventNames';
import { withinShadowRoot } from '../withinShadowRoot.story';

const codeExample = String.raw`
<gs-multi-lineage-filter
    lapisField="pangoLineage"
    lapisFilter='{"country": "Germany"}'
    placeholderText="Select lineages"
    .value='["B.1.1.7", "BA.5"]'
    width="50%">
</gs-multi-lineage-filter>`;

const meta: Meta<Required<MultiLineageFilterProps>> = {
    title: 'Input/Multi-lineage filter',
    component: 'gs-multi-lineage-filter',
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
                type: 'object',
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
        hideCounts: {
            control: {
                type: 'boolean',
            },
        },
    },
};

export default meta;

const Template: StoryObj<Required<MultiLineageFilterProps>> = {
    render: (args) => {
        return html` <gs-app lapis="${LAPIS_URL}">
            <div class="max-w-(--breakpoint-lg)">
                <gs-multi-lineage-filter
                    .lapisField=${args.lapisField}
                    .lapisFilter=${args.lapisFilter}
                    .placeholderText=${args.placeholderText}
                    .hideCounts=${args.hideCounts}
                    .value=${args.value}
                    .width=${args.width}
                ></gs-multi-lineage-filter>
            </div>
        </gs-app>`;
    },
    args: {
        lapisField: 'pangoLineage',
        lapisFilter: {
            country: 'Germany',
        },
        placeholderText: 'Select lineages',
        value: ['B.1.1.7', 'BA.5'],
        width: '100%',
        hideCounts: false,
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

export const MultiLineageFilter: StoryObj<Required<MultiLineageFilterProps>> = {
    ...Template,
    play: async ({ canvasElement }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-multi-lineage-filter');
        await waitFor(() => {
            return expect(canvas.getByPlaceholderText('Select lineages')).toBeVisible();
        });
    },
};

export const DelayToShowLoadingState: StoryObj<Required<MultiLineageFilterProps>> = {
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

export const FetchingLineagesFails: StoryObj<Required<MultiLineageFilterProps>> = {
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
        const canvas = await withinShadowRoot(canvasElement, 'gs-multi-lineage-filter');

        await waitFor(() =>
            expect(canvas.getByText('Oops! Something went wrong.', { exact: false })).toBeInTheDocument(),
        );
    },
};

export const FiresEvent: StoryObj<Required<MultiLineageFilterProps>> = {
    ...MultiLineageFilter,
    args: {
        ...MultiLineageFilter.args,
        value: ['A.1'],
    },
    play: async ({ canvasElement, step }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-multi-lineage-filter');

        const inputField = () => canvas.getByPlaceholderText('Select lineages');
        const listenerMock = fn();
        await step('Setup event listener mock', () => {
            canvasElement.addEventListener(gsEventNames.lineageFilterChanged, listenerMock);
        });

        await step('wait until data is loaded', async () => {
            await waitFor(() => {
                return expect(inputField()).toBeEnabled();
            });
        });

        await step('verify initial selection', async () => {
            await waitFor(() => {
                return expect(canvas.getByLabelText('remove A.1')).toBeVisible();
            });
        });

        await step('add another lineage', async () => {
            await userEvent.type(inputField(), 'B.1');
            await userEvent.click(canvas.getByRole('option', { name: 'B.1(53,802)' }));

            await waitFor(() => {
                return expect(listenerMock.mock.calls.at(-1)![0].detail).toStrictEqual({
                    pangoLineage: ['A.1', 'B.1'],
                });
            });
        });

        await step('remove first lineage', async () => {
            await userEvent.click(canvas.getByLabelText('remove A.1'));

            await waitFor(() => {
                return expect(listenerMock.mock.calls.at(-1)![0].detail).toStrictEqual({
                    pangoLineage: ['B.1'],
                });
            });
        });

        await step('clear all selections', async () => {
            await userEvent.click(canvas.getByLabelText('clear all selections'));

            await waitFor(() => {
                return expect(listenerMock.mock.calls.at(-1)![0].detail).toStrictEqual({
                    pangoLineage: undefined,
                });
            });
        });
    },
};

export const WithCommaSeparatedStringValue: StoryObj<Required<MultiLineageFilterProps>> = {
    ...Template,
    args: {
        ...Template.args,
        value: 'B.1.1.7,BA.5,C.1' as any,
    },
    play: async ({ canvasElement }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-multi-lineage-filter');

        await waitFor(() => {
            expect(canvas.getByLabelText('remove B.1.1.7')).toBeVisible();
            expect(canvas.getByLabelText('remove BA.5')).toBeVisible();
            expect(canvas.getByLabelText('remove C.1')).toBeVisible();
        });
    },
};

export const EmptyState: StoryObj<Required<MultiLineageFilterProps>> = {
    ...Template,
    args: {
        ...Template.args,
        value: [],
    },
    play: async ({ canvasElement }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-multi-lineage-filter');

        await waitFor(() => {
            expect(canvas.getByPlaceholderText('Select lineages')).toBeVisible();
        });

        expect(canvas.queryByLabelText('clear all selections')).not.toBeInTheDocument();
    },
};

export const WithHideCountsTrue: StoryObj<Required<MultiLineageFilterProps>> = {
    ...Template,
    args: {
        ...Template.args,
        hideCounts: true,
    },
    play: async ({ canvasElement }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-multi-lineage-filter');

        await waitFor(() => {
            const chip = canvas.getByLabelText('remove B.1.1.7');
            // Check that counts are not shown in the chip text
            expect(chip.parentElement?.textContent).not.toMatch(/\(\d/);
        });
    },
};

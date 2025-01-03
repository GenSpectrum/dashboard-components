import { expect, fn, userEvent, waitFor } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { previewHandles } from '../../../.storybook/preview';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import '../app';
import './gs-lineage-filter';
import aggregatedData from '../../preact/lineageFilter/__mockData__/aggregated.json';
import { type LineageFilterProps } from '../../preact/lineageFilter/lineage-filter';
import { withinShadowRoot } from '../withinShadowRoot.story';

const codeExample = String.raw`
<gs-lineage-filter 
    lapisField="pangoLineage"
    lapisFilter={{}}
    placeholderText="Enter lineage"
    initialValue="B.1.1.7"
    width="50%">
</gs-lineage-filter>`;

const meta: Meta<Required<LineageFilterProps>> = {
    title: 'Input/Lineage filter',
    component: 'gs-lineage-filter',
    parameters: withComponentDocs({
        actions: {
            handles: ['gs-lineage-filter-changed', ...previewHandles],
        },
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'pangoLineage',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            fields: ['pangoLineage'],
                        },
                    },
                    response: {
                        status: 200,
                        body: aggregatedData,
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
};

export default meta;

export const Default: StoryObj<Required<LineageFilterProps>> = {
    render: (args) => {
        return html` <gs-app lapis="${LAPIS_URL}">
            <div class="max-w-screen-lg">
                <gs-lineage-filter
                    .lapisField=${args.lapisField}
                    .lapisFilter=${args.lapisFilter}
                    .placeholderText=${args.placeholderText}
                    .initialValue=${args.initialValue}
                    .width=${args.width}
                ></gs-lineage-filter>
            </div>
        </gs-app>`;
    },
    args: {
        lapisField: 'pangoLineage',
        lapisFilter: {},
        placeholderText: 'Enter lineage',
        initialValue: 'B.1.1.7',
        width: '100%',
    },
};

export const FiresEvent: StoryObj<Required<LineageFilterProps>> = {
    ...Default,
    play: async ({ canvasElement, step }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-lineage-filter');

        const inputField = () => canvas.getByPlaceholderText('Enter lineage');
        const listenerMock = fn();
        await step('Setup event listener mock', async () => {
            canvasElement.addEventListener('gs-lineage-filter-changed', listenerMock);
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
            await expect(listenerMock.mock.calls.at(-1)![0].detail).toStrictEqual({
                pangoLineage: undefined,
            });
        });

        await step('Enter a valid lineage value', async () => {
            await userEvent.type(inputField(), 'B.1.1.7');

            await expect(listenerMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: {
                        pangoLineage: 'B.1.1.7',
                    },
                }),
            );
        });

        await step('Enter a valid lineage value', async () => {
            await userEvent.type(inputField(), '{backspace>9/}');
            await userEvent.type(inputField(), 'B.1.1.7*');

            await expect(listenerMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: {
                        pangoLineage: 'B.1.1.7*',
                    },
                }),
            );
        });
    },
    args: {
        ...Default.args,
        initialValue: '',
    },
};

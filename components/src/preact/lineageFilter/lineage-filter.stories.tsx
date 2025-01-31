import { type Meta, type PreactRenderer, type StoryObj } from '@storybook/preact';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import type { StepFunction } from '@storybook/types';

import { LineageFilter, type LineageFilterProps } from './lineage-filter';
import { previewHandles } from '../../../.storybook/preview';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import aggregatedData from '../../preact/lineageFilter/__mockData__/aggregated.json';
import { LapisUrlContextProvider } from '../LapisUrlContext';
import { expectInvalidAttributesErrorMessage } from '../shared/stories/expectErrorMessage';

const meta: Meta = {
    title: 'Input/LineageFilter',
    component: LineageFilter,
    parameters: {
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
                            country: 'Germany',
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
    argTypes: {
        lapisField: {
            control: {
                type: 'text',
            },
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

    args: {
        lapisField: 'pangoLineage',
        lapisFilter: {
            country: 'Germany',
        },
        placeholderText: 'Enter a lineage',
        value: 'A.1',
        width: '100%',
    },
};

export default meta;

export const Default: StoryObj<LineageFilterProps> = {
    render: (args) => (
        <LapisUrlContextProvider value={LAPIS_URL}>
            <LineageFilter {...args} />
        </LapisUrlContextProvider>
    ),
    play: async ({ canvasElement, step }) => {
        const { canvas, lineageChangedListenerMock } = await prepare(canvasElement, step);

        step('change lineage filter value fires event', async () => {
            const input = await inputField(canvas);
            await userEvent.clear(input);
            await userEvent.type(input, 'B.1');
            await userEvent.click(canvas.getByRole('option', { name: 'B.1' }));

            await waitFor(() => {
                return expect(lineageChangedListenerMock.mock.calls.at(-1)![0].detail).toStrictEqual({
                    pangoLineage: 'B.1',
                });
            });
        });
    },
};

export const ClearSelection: StoryObj<LineageFilterProps> = {
    ...Default,
    play: async ({ canvasElement, step }) => {
        const { canvas, lineageChangedListenerMock } = await prepare(canvasElement, step);

        step('clear selection fires event with empty filter', async () => {
            const clearSelectionButton = await canvas.findByLabelText('clear selection');
            await userEvent.click(clearSelectionButton);

            await waitFor(() => {
                return expect(lineageChangedListenerMock.mock.calls.at(-1)![0].detail).toStrictEqual({
                    pangoLineage: undefined,
                });
            });
        });
    },
};

export const OnBlurInput: StoryObj<LineageFilterProps> = {
    ...Default,
    play: async ({ canvasElement, step }) => {
        const { canvas, lineageChangedListenerMock } = await prepare(canvasElement, step);

        step('after cleared selection by hand and then blur fires event with empty filter', async () => {
            const input = await inputField(canvas);
            await userEvent.clear(input);
            await userEvent.click(canvas.getByLabelText('toggle menu'));

            await waitFor(() => {
                return expect(lineageChangedListenerMock.mock.calls.at(-1)![0].detail).toStrictEqual({
                    pangoLineage: undefined,
                });
            });
        });
    },
};

export const WithNoLapisField: StoryObj<LineageFilterProps> = {
    ...Default,
    args: {
        ...Default.args,
        lapisField: '',
    },
    play: async ({ canvasElement, step }) => {
        step('expect error message', async () => {
            await expectInvalidAttributesErrorMessage(canvasElement, 'String must contain at least 1 character(s)');
        });
    },
};

async function prepare(canvasElement: HTMLElement, step: StepFunction<PreactRenderer, unknown>) {
    const canvas = within(canvasElement);

    const lineageChangedListenerMock = fn();
    step('Setup event listener mock', () => {
        canvasElement.addEventListener('gs-lineage-filter-changed', lineageChangedListenerMock);
    });

    step('location filter is rendered with value', async () => {
        await waitFor(async () => {
            return expect(await inputField(canvas)).toHaveValue('A.1');
        });
    });

    return { canvas, lineageChangedListenerMock };
}

const inputField = (canvas: ReturnType<typeof within>) => canvas.findByPlaceholderText('Enter a lineage');

import { type Meta, type PreactRenderer, type StoryObj } from '@storybook/preact';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import type { StepFunction } from '@storybook/types';

import { LineageFilter, type LineageFilterProps } from './lineage-filter';
import { previewHandles } from '../../../.storybook/preview';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import lineageDefinition from './__mockData__/lineageDefinition.json';
import { lineageDefinitionEndpoint } from '../../lapisApi/lapisApi';
import aggregatedData from '../../preact/lineageFilter/__mockData__/aggregated.json';
import { gsEventNames } from '../../utils/gsEventNames';
import { LapisUrlContextProvider } from '../LapisUrlContext';
import { expectInvalidAttributesErrorMessage } from '../shared/stories/expectErrorMessage';

const meta: Meta = {
    title: 'Input/LineageFilter',
    component: LineageFilter,
    parameters: {
        actions: {
            handles: [gsEventNames.lineageFilterChanged, gsEventNames.lineageFilterMultiChanged, ...previewHandles],
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
        hideCounts: {
            control: {
                type: 'boolean',
            },
        },
        multiSelect: {
            control: {
                type: 'boolean',
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
        hideCounts: false,
        multiSelect: false,
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

        await step('change lineage filter value fires event', async () => {
            const input = await inputField(canvas);
            await userEvent.clear(input);
            await userEvent.type(input, 'B.1');
            await userEvent.click(canvas.getByRole('option', { name: 'B.1(53,802)' }));

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

        await step('clear selection fires event with empty filter', async () => {
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

        await step('after cleared selection by hand and then blur fires event with empty filter', async () => {
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
        await step('expect error message', async () => {
            await expectInvalidAttributesErrorMessage(canvasElement, 'String must contain at least 1 character(s)');
        });
    },
};

export const WithStringValueInMultiSelectMode: StoryObj<LineageFilterProps> = {
    ...Default,
    args: {
        ...Default.args,
        multiSelect: true,
        value: 'A.1',
    },
    play: async ({ canvasElement, step }) => {
        await step('expect error message', async () => {
            await expectInvalidAttributesErrorMessage(
                canvasElement,
                'When multiSelect is true, value must be an array of strings',
            );
        });
    },
};

export const WithArrayValueInSingleSelectMode: StoryObj<LineageFilterProps> = {
    ...Default,
    args: {
        ...Default.args,
        multiSelect: false,
        value: ['A.1', 'B.1'],
    },
    play: async ({ canvasElement, step }) => {
        await step('expect error message', async () => {
            await expectInvalidAttributesErrorMessage(
                canvasElement,
                'When multiSelect is false or undefined, value must be a string',
            );
        });
    },
};

export const WithHideCountsTrue: StoryObj<LineageFilterProps> = {
    ...Default,
    args: {
        ...Default.args,
        hideCounts: true,
    },
    play: async ({ canvasElement, step }) => {
        const { canvas } = await prepare(canvasElement, step);

        await step('visible without counts', async () => {
            const input = await inputField(canvas);
            await userEvent.clear(input);
            await userEvent.type(input, 'B.1');
            await expect(canvas.getByRole('option', { name: 'B.1' })).toBeVisible();
        });
    },
};

export const EnterAndClearMultipleTimes: StoryObj<LineageFilterProps> = {
    ...Default,
    play: async ({ canvasElement, step }) => {
        const { canvas, lineageChangedListenerMock } = await prepare(canvasElement, step);
        const input = await inputField(canvas);
        const inputContainer = canvas.getByRole('combobox').parentElement;
        const clearSelectionButton = await canvas.findByLabelText('clear selection');

        await step('clear field initially', async () => {
            await userEvent.clear(input);
        });

        await step('enter F in the input field', async () => {
            await userEvent.type(input, 'F');
        });

        await step('clear selection using clear button', async () => {
            await userEvent.click(clearSelectionButton);

            await waitFor(() => {
                return expect(lineageChangedListenerMock.mock.calls.at(-1)![0].detail).toStrictEqual({
                    pangoLineage: undefined,
                });
            });
        });

        await step('verify input field is empty after clearing', async () => {
            await expect(input).toHaveValue('');
        });

        await step('verify no red border after clearing', async () => {
            await expect(inputContainer).not.toHaveClass('input-error');
        });

        // do it again

        await step('enter F in the input field again', async () => {
            await userEvent.type(input, 'F');
        });

        await step('clear selection using clear button again', async () => {
            await userEvent.click(clearSelectionButton);

            await waitFor(() => {
                return expect(lineageChangedListenerMock.mock.calls.at(-1)![0].detail).toStrictEqual({
                    pangoLineage: undefined,
                });
            });
        });

        await step('verify input field is empty after clearing again', async () => {
            await expect(input).toHaveValue('');
        });
    },
};

export const MultiSelectDefault: StoryObj<LineageFilterProps> = {
    render: (args) => (
        <LapisUrlContextProvider value={LAPIS_URL}>
            <LineageFilter {...args} />
        </LapisUrlContextProvider>
    ),
    args: {
        ...Default.args,
        multiSelect: true,
        value: ['A.1', 'B.1'],
        placeholderText: 'Select lineages',
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        const lineageChangedListenerMock = fn();

        await step('Setup event listener mock', () => {
            canvasElement.addEventListener(gsEventNames.lineageFilterMultiChanged, lineageChangedListenerMock);
        });

        await step('multi-select filter is rendered with initial values', async () => {
            await waitFor(async () => {
                await expect(canvas.getByText('A.1')).toBeVisible();
                await expect(canvas.getByText('B.1')).toBeVisible();
            });
        });

        await step('add another lineage', async () => {
            const input = await canvas.findByPlaceholderText('Select lineages');
            await userEvent.type(input, 'C.1');
            await userEvent.click(canvas.getByRole('option', { name: 'C.1(23)' }));

            await waitFor(() => {
                return expect(lineageChangedListenerMock.mock.calls.at(-1)![0].detail).toStrictEqual({
                    pangoLineage: ['A.1', 'B.1', 'C.1'],
                });
            });
        });

        await step('verify all three lineages are displayed', async () => {
            await expect(canvas.getByText('A.1')).toBeVisible();
            await expect(canvas.getByText('B.1')).toBeVisible();
            await expect(canvas.getByText('C.1')).toBeVisible();
        });
    },
};

export const MultiSelectRemoveItem: StoryObj<LineageFilterProps> = {
    render: (args) => (
        <LapisUrlContextProvider value={LAPIS_URL}>
            <LineageFilter {...args} />
        </LapisUrlContextProvider>
    ),
    args: {
        ...Default.args,
        multiSelect: true,
        value: ['A.1', 'B.1', 'C.1'],
        placeholderText: 'Select lineages',
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        const lineageChangedListenerMock = fn();

        await step('Setup event listener mock', () => {
            canvasElement.addEventListener(gsEventNames.lineageFilterMultiChanged, lineageChangedListenerMock);
        });

        await step('multi-select filter is rendered with three values', async () => {
            await waitFor(async () => {
                await expect(canvas.getByText('A.1')).toBeVisible();
                await expect(canvas.getByText('B.1')).toBeVisible();
                await expect(canvas.getByText('C.1')).toBeVisible();
            });
        });

        await step('remove B.1 lineage', async () => {
            const removeButton = canvas.getByLabelText('remove B.1');
            await userEvent.click(removeButton);

            await waitFor(() => {
                return expect(lineageChangedListenerMock.mock.calls.at(-1)![0].detail).toStrictEqual({
                    pangoLineage: ['A.1', 'C.1'],
                });
            });
        });

        await step('verify B.1 is removed', async () => {
            await expect(canvas.queryByText('B.1')).not.toBeVisible();
            await expect(canvas.getByText('A.1')).toBeVisible();
            await expect(canvas.getByText('C.1')).toBeVisible();
        });
    },
};

export const MultiSelectClearAll: StoryObj<LineageFilterProps> = {
    render: (args) => (
        <LapisUrlContextProvider value={LAPIS_URL}>
            <LineageFilter {...args} />
        </LapisUrlContextProvider>
    ),
    args: {
        ...Default.args,
        multiSelect: true,
        value: ['A.1', 'B.1'],
        placeholderText: 'Select lineages',
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        const lineageChangedListenerMock = fn();

        await step('Setup event listener mock', () => {
            canvasElement.addEventListener(gsEventNames.lineageFilterMultiChanged, lineageChangedListenerMock);
        });

        await step('multi-select filter is rendered with values', async () => {
            await waitFor(async () => {
                await expect(canvas.getByText('A.1')).toBeVisible();
                await expect(canvas.getByText('B.1')).toBeVisible();
            });
        });

        await step('clear all selections', async () => {
            const clearButton = canvas.getByLabelText('clear selection');
            await userEvent.click(clearButton);

            await waitFor(() => {
                return expect(lineageChangedListenerMock.mock.calls.at(-1)![0].detail).toStrictEqual({
                    pangoLineage: undefined,
                });
            });
        });

        await step('verify all chips are removed', async () => {
            await expect(canvas.queryByText('A.1')).not.toBeVisible();
            await expect(canvas.queryByText('B.1')).not.toBeVisible();
        });
    },
};

async function prepare(canvasElement: HTMLElement, step: StepFunction<PreactRenderer, unknown>) {
    const canvas = within(canvasElement);

    const lineageChangedListenerMock = fn();
    await step('Setup event listener mock', () => {
        canvasElement.addEventListener(gsEventNames.lineageFilterChanged, lineageChangedListenerMock);
    });

    await step('location filter is rendered with value', async () => {
        await waitFor(async () => {
            return expect(await inputField(canvas)).toHaveValue('A.1');
        });
    });

    return { canvas, lineageChangedListenerMock };
}

const inputField = (canvas: ReturnType<typeof within>) => canvas.findByPlaceholderText('Enter a lineage');

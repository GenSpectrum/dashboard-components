import { type Meta, type PreactRenderer, type StoryObj } from '@storybook/preact';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import type { StepFunction } from '@storybook/types';

import { MultiLineageFilter, type MultiLineageFilterProps } from './lineage-filter-multi';
import { previewHandles } from '../../../.storybook/preview';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import lineageDefinition from './__mockData__/lineageDefinition.json';
import { lineageDefinitionEndpoint } from '../../lapisApi/lapisApi';
import aggregatedData from '../../preact/lineageFilter/__mockData__/aggregated.json';
import { gsEventNames } from '../../utils/gsEventNames';
import { LapisUrlContextProvider } from '../LapisUrlContext';
import { expectInvalidAttributesErrorMessage } from '../shared/stories/expectErrorMessage';

const meta: Meta = {
    title: 'Input/MultiLineageFilter',
    component: MultiLineageFilter,
    parameters: {
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
    },

    args: {
        lapisField: 'pangoLineage',
        lapisFilter: {
            country: 'Germany',
        },
        placeholderText: 'Select lineages',
        value: ['A.1', 'B.1'],
        width: '100%',
        hideCounts: false,
    },
};

export default meta;

export const Default: StoryObj<MultiLineageFilterProps> = {
    render: (args) => (
        <LapisUrlContextProvider value={LAPIS_URL}>
            <MultiLineageFilter {...args} />
        </LapisUrlContextProvider>
    ),
    play: async ({ canvasElement, step }) => {
        const { canvas, lineageChangedListenerMock } = await prepare(canvasElement, step);

        await step('add another lineage to filter', async () => {
            const input = await inputField(canvas);
            await userEvent.type(input, 'C.1');
            await userEvent.click(canvas.getByRole('option', { name: 'C.1(1)' }));

            await waitFor(() => {
                return expect(lineageChangedListenerMock.mock.calls.at(-1)![0].detail).toStrictEqual({
                    pangoLineage: ['A.1', 'B.1', 'C.1'],
                });
            });
        });
    },
};

export const RemoveSingleSelection: StoryObj<MultiLineageFilterProps> = {
    ...Default,
    play: async ({ canvasElement, step }) => {
        const { canvas, lineageChangedListenerMock } = await prepare(canvasElement, step);

        await step('remove B.1 from selections', async () => {
            const removeButton = await canvas.findByLabelText('remove B.1');
            await userEvent.click(removeButton);

            await waitFor(() => {
                return expect(lineageChangedListenerMock.mock.calls.at(-1)![0].detail).toStrictEqual({
                    pangoLineage: ['A.1'],
                });
            });
        });
    },
};

export const ClearAllSelections: StoryObj<MultiLineageFilterProps> = {
    ...Default,
    play: async ({ canvasElement, step }) => {
        const { canvas, lineageChangedListenerMock } = await prepare(canvasElement, step);

        await step('clear all selections', async () => {
            const clearAllButton = await canvas.findByLabelText('clear all selections');
            await userEvent.click(clearAllButton);

            await waitFor(() => {
                return expect(lineageChangedListenerMock.mock.calls.at(-1)![0].detail).toStrictEqual({
                    pangoLineage: undefined,
                });
            });
        });
    },
};

export const AddMultipleLineages: StoryObj<MultiLineageFilterProps> = {
    ...Default,
    args: {
        ...Default.args,
        value: [],
    },
    play: async ({ canvasElement, step }) => {
        const { canvas, lineageChangedListenerMock } = await prepareEmpty(canvasElement, step);

        await step('add first lineage', async () => {
            const input = await inputField(canvas);
            await userEvent.type(input, 'A.1');
            await userEvent.click(canvas.getByRole('option', { name: 'A.1(77,939)' }));

            await waitFor(() => {
                return expect(lineageChangedListenerMock.mock.calls.at(-1)![0].detail).toStrictEqual({
                    pangoLineage: ['A.1'],
                });
            });
        });

        await step('add second lineage', async () => {
            const input = await inputField(canvas);
            await userEvent.type(input, 'B.1');
            await userEvent.click(canvas.getByRole('option', { name: 'B.1(53,802)' }));

            await waitFor(() => {
                return expect(lineageChangedListenerMock.mock.calls.at(-1)![0].detail).toStrictEqual({
                    pangoLineage: ['A.1', 'B.1'],
                });
            });
        });

        await step('add third lineage', async () => {
            const input = await inputField(canvas);
            await userEvent.type(input, 'C');
            await userEvent.click(canvas.getByRole('option', { name: 'C.1(1)' }));

            await waitFor(() => {
                return expect(lineageChangedListenerMock.mock.calls.at(-1)![0].detail).toStrictEqual({
                    pangoLineage: ['A.1', 'B.1', 'C.1'],
                });
            });
        });
    },
};

export const WithCommaSeparatedStringValue: StoryObj<MultiLineageFilterProps> = {
    ...Default,
    args: {
        ...Default.args,
        value: 'A.1,B.1,C.1',
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        await step('renders with comma-separated string value', async () => {
            await waitFor(async () => {
                expect(await canvas.findByLabelText('remove A.1')).toBeVisible();
                expect(await canvas.findByLabelText('remove B.1')).toBeVisible();
                expect(await canvas.findByLabelText('remove C.1')).toBeVisible();
            });
        });
    },
};

export const WithNoLapisField: StoryObj<MultiLineageFilterProps> = {
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

export const WithHideCountsTrue: StoryObj<MultiLineageFilterProps> = {
    ...Default,
    args: {
        ...Default.args,
        hideCounts: true,
    },
    play: async ({ canvasElement, step }) => {
        const { canvas } = await prepare(canvasElement, step);

        await step('selected items visible without counts', async () => {
            const a1Chip = await canvas.findByLabelText('remove A.1');
            expect(a1Chip.parentElement?.textContent).toBe('A.1×');
        });

        await step('dropdown items visible without counts', async () => {
            const input = await inputField(canvas);
            await userEvent.type(input, 'C.1');
            await expect(canvas.getByRole('option', { name: 'C.1' })).toBeVisible();
        });
    },
};

export const FilteringBehavior: StoryObj<MultiLineageFilterProps> = {
    ...Default,
    args: {
        ...Default.args,
        value: ['A.1'],
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        const lineageChangedListenerMock = fn();
        await step('Setup event listener mock', () => {
            canvasElement.addEventListener(gsEventNames.lineageFilterChanged, lineageChangedListenerMock);
        });

        await step('filter renders with A.1 selected', async () => {
            await waitFor(async () => {
                expect(await canvas.findByLabelText('remove A.1')).toBeVisible();
            });
        });

        await step('A.1 is not shown in dropdown when already selected', async () => {
            const input = await inputField(canvas);
            await userEvent.type(input, 'A');

            await waitFor(async () => {
                const options = canvas.queryAllByRole('option');
                const optionTexts = options.map((opt) => opt.textContent);
                expect(optionTexts).not.toContain('A.1');
            });
        });

        await step('can still select other A.* lineages', async () => {
            const options = canvas.getAllByRole('option');
            expect(options.length).toBeGreaterThan(0);
        });
    },
};

export const EmptyState: StoryObj<MultiLineageFilterProps> = {
    ...Default,
    args: {
        ...Default.args,
        value: [],
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        await step('renders empty with placeholder', async () => {
            await waitFor(async () => {
                const input = await inputField(canvas);
                expect(input).toHaveAttribute('placeholder', 'Select lineages');
            });
        });

        await step('no clear all button when empty', async () => {
            expect(canvas.queryByLabelText('clear all selections')).not.toBeInTheDocument();
        });
    },
};

async function prepare(canvasElement: HTMLElement, step: StepFunction<PreactRenderer, unknown>) {
    const canvas = within(canvasElement);

    const lineageChangedListenerMock = fn();
    await step('Setup event listener mock', () => {
        canvasElement.addEventListener(gsEventNames.lineageFilterChanged, lineageChangedListenerMock);
    });

    await step('multi-lineage filter is rendered with values', async () => {
        await waitFor(async () => {
            expect(await canvas.findByLabelText('remove A.1')).toBeVisible();
            expect(await canvas.findByLabelText('remove B.1')).toBeVisible();
        });
    });

    return { canvas, lineageChangedListenerMock };
}

async function prepareEmpty(canvasElement: HTMLElement, step: StepFunction<PreactRenderer, unknown>) {
    const canvas = within(canvasElement);

    const lineageChangedListenerMock = fn();
    await step('Setup event listener mock', () => {
        canvasElement.addEventListener(gsEventNames.lineageFilterChanged, lineageChangedListenerMock);
    });

    await step('multi-lineage filter is rendered empty', async () => {
        await waitFor(async () => {
            expect(await inputField(canvas)).toBeVisible();
        });
    });

    return { canvas, lineageChangedListenerMock };
}

const inputField = (canvas: ReturnType<typeof within>) => canvas.findByPlaceholderText('Select lineages');

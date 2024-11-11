import { type Meta, type PreactRenderer, type StoryObj } from '@storybook/preact';
import { expect, fireEvent, fn, userEvent, waitFor, within } from '@storybook/test';
import { type StepFunction } from '@storybook/types';

import { MutationFilter, type MutationFilterProps } from './mutation-filter';
import { previewHandles } from '../../../.storybook/preview';
import { LAPIS_URL } from '../../constants';
import referenceGenome from '../../lapisApi/__mockData__/referenceGenome.json';
import { LapisUrlContext } from '../LapisUrlContext';
import { ReferenceGenomeContext } from '../ReferenceGenomeContext';

const meta: Meta<MutationFilterProps> = {
    title: 'Input/MutationFilter',
    component: MutationFilter,
    parameters: {
        actions: {
            handles: ['gs-mutation-filter-changed', 'gs-mutation-filter-on-blur', ...previewHandles],
        },
        fetchMock: {},
    },
    argTypes: {
        width: { control: 'text' },
        initialValue: {
            control: {
                type: 'object',
            },
        },
    },
};

export default meta;

export const Default: StoryObj<MutationFilterProps> = {
    render: (args) => (
        <LapisUrlContext.Provider value={LAPIS_URL}>
            <ReferenceGenomeContext.Provider value={referenceGenome}>
                <MutationFilter width={args.width} initialValue={args.initialValue} />
            </ReferenceGenomeContext.Provider>
        </LapisUrlContext.Provider>
    ),
    args: {
        width: '100%',
    },
};

export const FiresFilterChangedEvents: StoryObj<MutationFilterProps> = {
    ...Default,
    play: async ({ canvasElement, step }) => {
        const { canvas, changedListenerMock } = await prepare(canvasElement, step);

        await step('Enters an invalid mutation', async () => {
            await testNoOptionsExist(canvas, 'notAMutation');
            await expect(changedListenerMock).not.toHaveBeenCalled();

            await userEvent.type(inputField(canvas), '{backspace>12/}');
        });

        await step('Enter a valid mutation', async () => {
            await submitMutation(canvas, 'A123T');

            await waitFor(() =>
                expect(changedListenerMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        detail: {
                            nucleotideMutations: ['A123T'],
                            aminoAcidMutations: [],
                            nucleotideInsertions: [],
                            aminoAcidInsertions: [],
                        },
                    }),
                ),
            );
        });

        await step('Enter a second valid nucleotide mutation', async () => {
            await submitMutation(canvas, 'A234-');

            await expect(changedListenerMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: {
                        nucleotideMutations: ['A123T', 'A234-'],
                        aminoAcidMutations: [],
                        nucleotideInsertions: [],
                        aminoAcidInsertions: [],
                    },
                }),
            );
        });

        await step('Enter another valid mutation', async () => {
            await submitMutation(canvas, 'ins_123:AA');

            await expect(changedListenerMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: {
                        nucleotideMutations: ['A123T', 'A234-'],
                        aminoAcidMutations: [],
                        nucleotideInsertions: ['ins_123:AA'],
                        aminoAcidInsertions: [],
                    },
                }),
            );
        });

        await step('Remove the first mutation', async () => {
            const firstMutationDeleteButton = canvas.getAllByRole('button', { name: '✕' })[1];
            await waitFor(() => fireEvent.click(firstMutationDeleteButton));

            await expect(changedListenerMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: {
                        nucleotideMutations: ['A234-'],
                        aminoAcidMutations: [],
                        nucleotideInsertions: ['ins_123:AA'],
                        aminoAcidInsertions: [],
                    },
                }),
            );
        });
    },
};

export const FiresFilterOnBlurEvent: StoryObj<MutationFilterProps> = {
    ...Default,
    play: async ({ canvasElement, step }) => {
        const { canvas, onBlurListenerMock } = await prepare(canvasElement, step);

        await step('Move outside of input', async () => {
            await submitMutation(canvas, 'A234T');
            await submitMutation(canvas, 'S:A123G');
            await submitMutation(canvas, 'ins_123:AAA');
            await submitMutation(canvas, 'ins_S:123:AAA');
            await userEvent.tab();

            await expect(onBlurListenerMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: {
                        nucleotideMutations: ['A234T'],
                        aminoAcidMutations: ['S:A123G'],
                        nucleotideInsertions: ['ins_123:AAA'],
                        aminoAcidInsertions: ['ins_S:123:AAA'],
                    },
                }),
            );
        });
    },
};

export const WithInitialValue: StoryObj<MutationFilterProps> = {
    render: (args) => (
        <LapisUrlContext.Provider value={LAPIS_URL}>
            <ReferenceGenomeContext.Provider value={referenceGenome}>
                <MutationFilter initialValue={args.initialValue} width={args.width} />
            </ReferenceGenomeContext.Provider>
        </LapisUrlContext.Provider>
    ),
    args: {
        initialValue: {
            nucleotideMutations: ['A234T'],
            aminoAcidMutations: ['S:A123G'],
            nucleotideInsertions: ['ins_123:AAA'],
            aminoAcidInsertions: ['ins_S:123:AAA'],
        },
        width: '100%',
    },
    play: async ({ canvasElement, step }) => {
        const { canvas, onBlurListenerMock } = await prepare(canvasElement, step);

        await step('Move outside of input', async () => {
            await submitMutation(canvas, 'G500T');
            await userEvent.tab();

            await expect(onBlurListenerMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: {
                        nucleotideMutations: ['A234T', 'G500T'],
                        aminoAcidMutations: ['S:A123G'],
                        nucleotideInsertions: ['ins_123:AAA'],
                        aminoAcidInsertions: ['ins_S:123:AAA'],
                    },
                }),
            );
        });
    },
};

async function prepare(canvasElement: HTMLElement, step: StepFunction<PreactRenderer, unknown>) {
    const canvas = within(canvasElement);

    const onBlurListenerMock = fn();
    const changedListenerMock = fn();
    await step('Setup event listener mock', async () => {
        canvasElement.addEventListener('gs-mutation-filter-on-blur', onBlurListenerMock);
        canvasElement.addEventListener('gs-mutation-filter-changed', changedListenerMock);
    });

    await step('wait until data is loaded', async () => {
        await waitFor(() => {
            return expect(inputField(canvas)).toBeEnabled();
        });
    });

    return { canvas, onBlurListenerMock, changedListenerMock };
}

const submitMutation = async (canvas: ReturnType<typeof within>, mutation: string) => {
    await userEvent.type(inputField(canvas), mutation);
    const firstOption = await canvas.findByRole('option', { name: /.*\S.*/ });
    await userEvent.click(firstOption);
};

const testNoOptionsExist = async (canvas: ReturnType<typeof within>, mutation: string) => {
    await userEvent.type(inputField(canvas), mutation);
    const options = canvas.queryAllByRole('option');

    expect(options).toHaveLength(0);
};

const inputField = (canvas: ReturnType<typeof within>) =>
    canvas.getByRole('combobox');
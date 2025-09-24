import { type Meta, type PreactRenderer, type StoryObj } from '@storybook/preact';
import { expect, fireEvent, fn, userEvent, waitFor, within } from '@storybook/test';
import { type StepFunction } from '@storybook/types';

import { MutationFilter, type MutationFilterProps } from './mutation-filter';
import { previewHandles } from '../../../.storybook/preview';
import { LAPIS_URL } from '../../constants';
import referenceGenome from '../../lapisApi/__mockData__/referenceGenome.json';
import { mutationType } from '../../types';
import { gsEventNames } from '../../utils/gsEventNames';
import { LapisUrlContextProvider } from '../LapisUrlContext';
import { ReferenceGenomeContext } from '../ReferenceGenomeContext';
import { playThatExpectsErrorMessage } from '../shared/stories/expectErrorMessage';

const meta: Meta<MutationFilterProps> = {
    title: 'Input/MutationFilter',
    component: MutationFilter,
    parameters: {
        actions: {
            handles: [gsEventNames.mutationFilterChanged, ...previewHandles],
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
        enabledMutationTypes: {
            control: {
                type: 'object',
            },
        },
    },
};

export default meta;

export const Default: StoryObj<MutationFilterProps> = {
    render: (args) => (
        <LapisUrlContextProvider value={LAPIS_URL}>
            <ReferenceGenomeContext.Provider value={referenceGenome}>
                <MutationFilter
                    width={args.width}
                    initialValue={args.initialValue}
                    enabledMutationTypes={args.enabledMutationTypes}
                />
            </ReferenceGenomeContext.Provider>
        </LapisUrlContextProvider>
    ),
    args: {
        width: '100%',
    },
};

export const EnterSingleMutationByClick: StoryObj<MutationFilterProps> = {
    ...Default,
    play: async ({ canvasElement, step }) => {
        const { canvas, changedListenerMock } = await prepare(canvasElement, step);

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
    },
};

export const EnterSingleMutationByEnter: StoryObj<MutationFilterProps> = {
    ...Default,
    play: async ({ canvasElement, step }) => {
        const { canvas, changedListenerMock } = await prepare(canvasElement, step);

        await step('Enter a valid mutation', async () => {
            await submitMutation(canvas, 'A123T', 'enter');

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
    },
};

export const IgnoreDuplicates: StoryObj<MutationFilterProps> = {
    ...Default,
    play: async ({ canvasElement, step }) => {
        const { canvas } = await prepare(canvasElement, step);

        await step('Enter duplicate', async () => {
            await userEvent.type(inputField(canvas), 'A123T', INPUT_DELAY);
        });

        await step('Should not show duplicate', async () => {
            const options = await canvas.findAllByRole('option');
            expect(options.length === 1);

            const firstOption = await canvas.findByRole('option', { name: 'A123' });
            await expect(firstOption).toBeVisible();
        });
    },
    args: {
        ...Default.args,
        initialValue: {
            nucleotideMutations: ['A123T'],
            aminoAcidMutations: [],
            nucleotideInsertions: [],
            aminoAcidInsertions: [],
        },
    },
};

export const RemoveMutationByClick: StoryObj<MutationFilterProps> = {
    ...Default,
    args: {
        ...Default.args,
        initialValue: {
            nucleotideMutations: ['A234T'],
            aminoAcidMutations: ['S:A123G'],
            nucleotideInsertions: ['ins_123:AAA'],
            aminoAcidInsertions: ['ins_S:123:AAA'],
        },
    },
    play: async ({ canvasElement, step }) => {
        const { canvas, changedListenerMock } = await prepare(canvasElement, step);

        await step('Remove a mutation', async () => {
            await fireEvent.click(canvas.getByRole('button', { name: 'remove mutation filter A234T' }));

            await waitFor(() =>
                expect(changedListenerMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        detail: {
                            nucleotideMutations: [],
                            aminoAcidMutations: ['S:A123G'],
                            nucleotideInsertions: ['ins_123:AAA'],
                            aminoAcidInsertions: ['ins_S:123:AAA'],
                        },
                    }),
                ),
            );
        });
    },
};

export const PasteCommaSeparatedList: StoryObj<MutationFilterProps> = {
    ...Default,
    play: async ({ canvasElement, step }) => {
        const { canvas, changedListenerMock } = await prepare(canvasElement, step);

        await step('Enter a comma separated list of valid and invalid mutations', async () => {
            await pasteMutations(canvas, 'A123T, error_insX, A234T, notAMutation, ins_123:AA');

            await waitFor(() =>
                expect(changedListenerMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        detail: {
                            nucleotideMutations: ['A123T', 'A234T'],
                            aminoAcidMutations: [],
                            nucleotideInsertions: ['ins_123:AA'],
                            aminoAcidInsertions: [],
                        },
                    }),
                ),
            );
            await expect(canvas.queryByText('A123T')).toBeVisible();
            await expect(canvas.queryByText('A234T')).toBeVisible();
            await expect(inputField(canvas)).toHaveValue('error_insX,notAMutation');
        });
    },
};

export const IgnoresDuplicatesOnPasteCommaSeparatedList: StoryObj<MutationFilterProps> = {
    ...Default,
    play: async ({ canvasElement, step }) => {
        const { canvas, changedListenerMock } = await prepare(canvasElement, step);

        await step('Enter a comma separated list with duplicates', async () => {
            await pasteMutations(canvas, 'A123T, error_insX, A234T, A234T');

            await waitFor(() =>
                expect(changedListenerMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        detail: {
                            nucleotideMutations: ['A123T', 'A234T'],
                            aminoAcidMutations: [],
                            nucleotideInsertions: [],
                            aminoAcidInsertions: [],
                        },
                    }),
                ),
            );
            await expect(canvas.queryByText('A123T')).toBeVisible();
            await expect(canvas.queryByText('A234T')).toBeVisible();
            await expect(inputField(canvas)).toHaveValue('error_insX');
        });
    },
    args: {
        ...Default.args,
        initialValue: {
            nucleotideMutations: ['A123T'],
            aminoAcidMutations: [],
            nucleotideInsertions: [],
            aminoAcidInsertions: [],
        },
    },
};

export const FiltersOutDisabledMutationTypes: StoryObj<MutationFilterProps> = {
    ...Default,
    args: {
        ...Default.args,
        enabledMutationTypes: [mutationType.nucleotideMutations],
    },
    play: async ({ canvasElement, step }) => {
        const { canvas, changedListenerMock } = await prepare(canvasElement, step);

        await step('Enters an invalid insertion mutation', async () => {
            await testNoOptionsExist(canvas, 'ins_23:T');
            await expect(changedListenerMock).not.toHaveBeenCalled();

            await userEvent.type(inputField(canvas), '{backspace>12/}', INPUT_DELAY);
        });

        await step('Enters an invalid amino acid mutation', async () => {
            await testNoOptionsExist(canvas, 'S:A1234T');
            await expect(changedListenerMock).not.toHaveBeenCalled();

            await userEvent.type(inputField(canvas), '{backspace>12/}', INPUT_DELAY);
        });

        await step('Enter a comma separated list of invalid mutations', async () => {
            await pasteMutations(canvas, 'insX, ins_123:AA');

            await waitFor(() =>
                expect(changedListenerMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        detail: {
                            nucleotideMutations: [],
                            aminoAcidMutations: [],
                            nucleotideInsertions: [],
                            aminoAcidInsertions: [],
                        },
                    }),
                ),
            );

            await userEvent.type(inputField(canvas), '{backspace>24/}', INPUT_DELAY);
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
    },
};

export const FiresFilterChangedEvents: StoryObj<MutationFilterProps> = {
    ...Default,
    play: async ({ canvasElement, step }) => {
        const { canvas, changedListenerMock } = await prepare(canvasElement, step);

        await step('Enters an invalid mutation', async () => {
            await testNoOptionsExist(canvas, 'notAMutation');
            await expect(changedListenerMock).not.toHaveBeenCalled();

            await userEvent.type(inputField(canvas), '{backspace>12/}', INPUT_DELAY);
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

            await waitFor(() =>
                expect(changedListenerMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        detail: {
                            nucleotideMutations: ['A123T', 'A234-'],
                            aminoAcidMutations: [],
                            nucleotideInsertions: [],
                            aminoAcidInsertions: [],
                        },
                    }),
                ),
            );
        });

        await step('Enter another valid mutation', async () => {
            await submitMutation(canvas, 'ins_123:AA', 'enter');

            await waitFor(() =>
                expect(changedListenerMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        detail: {
                            nucleotideMutations: ['A123T', 'A234-'],
                            aminoAcidMutations: [],
                            nucleotideInsertions: ['ins_123:AA'],
                            aminoAcidInsertions: [],
                        },
                    }),
                ),
            );
        });

        await step('Remove the first mutation', async () => {
            await fireEvent.click(canvas.getByRole('button', { name: 'remove mutation filter A234-' }));

            await waitFor(() =>
                expect(changedListenerMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        detail: {
                            nucleotideMutations: ['A123T'],
                            aminoAcidMutations: [],
                            nucleotideInsertions: ['ins_123:AA'],
                            aminoAcidInsertions: [],
                        },
                    }),
                ),
            );
        });
    },
};

export const WithInitialValue: StoryObj<MutationFilterProps> = {
    render: (args) => (
        <LapisUrlContextProvider value={LAPIS_URL}>
            <ReferenceGenomeContext.Provider value={referenceGenome}>
                <MutationFilter initialValue={args.initialValue} width={args.width} />
            </ReferenceGenomeContext.Provider>
        </LapisUrlContextProvider>
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
        const { canvas, changedListenerMock } = await prepare(canvasElement, step);

        await step('Add input to initial value', async () => {
            await submitMutation(canvas, 'G500T');

            await waitFor(() =>
                expect(changedListenerMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        detail: {
                            nucleotideMutations: ['A234T', 'G500T'],
                            aminoAcidMutations: ['S:A123G'],
                            nucleotideInsertions: ['ins_123:AAA'],
                            aminoAcidInsertions: ['ins_S:123:AAA'],
                        },
                    }),
                ),
            );
        });
    },
};

export const WithNoReferenceSequencesDefined: StoryObj<MutationFilterProps> = {
    ...Default,
    render: (args) => (
        <LapisUrlContextProvider value={LAPIS_URL}>
            <ReferenceGenomeContext.Provider value={{ nucleotideSequences: [], genes: [] }}>
                <MutationFilter {...args} />
            </ReferenceGenomeContext.Provider>
        </LapisUrlContextProvider>
    ),
    play: playThatExpectsErrorMessage(
        'Error - No reference sequences available',
        'This organism has neither nucleotide nor amino acid sequences',
    ),
};

async function prepare(canvasElement: HTMLElement, step: StepFunction<PreactRenderer, unknown>) {
    const canvas = within(canvasElement);

    const changedListenerMock = fn();
    await step('Setup event listener mock', () => {
        canvasElement.addEventListener(gsEventNames.mutationFilterChanged, changedListenerMock);
    });

    await step('wait until data is loaded', async () => {
        await waitFor(() => {
            return expect(inputField(canvas)).toBeEnabled();
        });
    });

    return { canvas, changedListenerMock };
}

export type SubmissionMethod = 'click' | 'enter';

const INPUT_DELAY = { delay: 50 };

const submitMutation = async (
    canvas: ReturnType<typeof within>,
    mutation: string,
    submissionMethod: SubmissionMethod = 'click',
) => {
    await userEvent.type(inputField(canvas), mutation, INPUT_DELAY);
    const firstOption = await canvas.findByRole('option', { name: mutation });
    if (submissionMethod === 'click') {
        await userEvent.click(firstOption);
    }
    if (submissionMethod === 'enter') {
        await userEvent.keyboard('{enter}');
    }
};

const pasteMutations = async (canvas: ReturnType<typeof within>, mutation: string) => {
    await userEvent.click(inputField(canvas));
    await userEvent.paste(mutation);
};

const testNoOptionsExist = async (canvas: ReturnType<typeof within>, mutation: string) => {
    await userEvent.type(inputField(canvas), mutation, INPUT_DELAY);
    const options = canvas.queryAllByRole('option');

    await expect(options).toHaveLength(0);
};

const inputField = (canvas: ReturnType<typeof within>): HTMLElement =>
    canvas.getByPlaceholderText('Enter a mutation', { exact: false });

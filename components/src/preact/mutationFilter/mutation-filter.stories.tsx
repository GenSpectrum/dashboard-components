import { withActions } from '@storybook/addon-actions/decorator';
import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, fireEvent, fn, userEvent, waitFor, within } from '@storybook/test';

import { MutationFilter, type MutationFilterProps } from './mutation-filter';
import { LAPIS_URL } from '../../constants';
import referenceGenome from '../../lapisApi/__mockData__/referenceGenome.json';
import { LapisUrlContext } from '../LapisUrlContext';
import { ReferenceGenomeContext } from '../ReferenceGenomeContext';

const meta: Meta<MutationFilterProps> = {
    title: 'Input/MutationFilter',
    component: MutationFilter,
    parameters: {
        actions: {
            handles: ['gs-mutation-filter-changed', 'gs-mutation-filter-on-blur'],
        },
        fetchMock: {},
    },
    decorators: [withActions],
};

export default meta;

export const Default: StoryObj<MutationFilterProps> = {
    render: () => (
        <LapisUrlContext.Provider value={LAPIS_URL}>
            <ReferenceGenomeContext.Provider value={referenceGenome}>
                <MutationFilter />
            </ReferenceGenomeContext.Provider>
        </LapisUrlContext.Provider>
    ),
};

export const FiresFilterChangedEvents: StoryObj<MutationFilterProps> = {
    ...Default,
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        const inputField = () => canvas.getByPlaceholderText('Enter a mutation');
        const submitButton = () => canvas.getByRole('button', { name: '+' });
        const listenerMock = fn();
        await step('Setup event listener mock', async () => {
            canvasElement.addEventListener('gs-mutation-filter-changed', listenerMock);
        });

        await step('wait until data is loaded', async () => {
            await waitFor(() => {
                return expect(inputField()).toBeEnabled();
            });
        });

        await step('Enters an invalid mutation', async () => {
            await userEvent.type(inputField(), 'notAMutation');
            await waitFor(() => submitButton().click());
            await expect(listenerMock).not.toHaveBeenCalled();

            await userEvent.type(inputField(), '{backspace>12/}');
        });

        await step('Enter a valid mutation', async () => {
            await userEvent.type(inputField(), 'A123T');

            await waitFor(() => fireEvent.click(submitButton()));

            await waitFor(() =>
                expect(listenerMock).toHaveBeenCalledWith(
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
            await userEvent.type(inputField(), 'A234-');

            await waitFor(() => fireEvent.click(submitButton()));

            await expect(listenerMock).toHaveBeenCalledWith(
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
            await userEvent.type(inputField(), 'ins_123:AA');

            await waitFor(() => fireEvent.click(submitButton()));

            await expect(listenerMock).toHaveBeenCalledWith(
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
            const firstMutationDeleteButton = canvas.getAllByRole('button')[0];
            await waitFor(() => fireEvent.click(firstMutationDeleteButton));

            await expect(listenerMock).toHaveBeenCalledWith(
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
        const canvas = within(canvasElement);

        const inputField = () => canvas.getByPlaceholderText('Enter a mutation');
        const listenerMock = fn();
        await step('Setup event listener mock', async () => {
            canvasElement.addEventListener('gs-mutation-filter-on-blur', listenerMock);
        });

        await step('wait until data is loaded', async () => {
            await waitFor(() => {
                return expect(inputField()).toBeEnabled();
            });
        });

        await step('Move outside of input', async () => {
            await userEvent.type(inputField(), 'A123T');
            await userEvent.tab();

            await expect(listenerMock).toHaveBeenCalled();
        });
    },
};

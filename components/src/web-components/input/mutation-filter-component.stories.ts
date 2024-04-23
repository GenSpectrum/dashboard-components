import { withActions } from '@storybook/addon-actions/decorator';
import { expect, fn, userEvent, waitFor } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { LAPIS_URL } from '../../constants';
import '../app';
import { withinShadowRoot } from '../withinShadowRoot.story';
import './mutation-filter-component';

const meta: Meta = {
    title: 'Input/Mutation filter',
    component: 'gs-mutation-filter',
    parameters: {
        actions: {
            handles: ['gs-mutation-filter-changed', 'gs-mutation-filter-on-blur'],
        },
        fetchMock: {},
    },
    decorators: [withActions],
};

export default meta;

export const Default: StoryObj<{ lapisField: string; placeholderText: string }> = {
    render: () => {
        return html` <gs-app lapis="${LAPIS_URL}">
            <div class="max-w-screen-lg">
                <gs-mutation-filter></gs-mutation-filter>
            </div>
        </gs-app>`;
    },
};

export const FiresFilterChangedEvent: StoryObj<{ lapisField: string; placeholderText: string }> = {
    ...Default,
    play: async ({ canvasElement, step }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-mutation-filter');

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

        await step('Enter a valid mutation', async () => {
            await userEvent.type(inputField(), 'A123T');
            await waitFor(() => submitButton().click());

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
    },
};

export const FiresFilterOnBlurEvent: StoryObj<{ lapisField: string; placeholderText: string }> = {
    ...Default,
    play: async ({ canvasElement, step }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-mutation-filter');

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

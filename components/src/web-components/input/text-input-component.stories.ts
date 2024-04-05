import type { Meta, StoryObj } from '@storybook/web-components';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';

import { html } from 'lit';
import '../app';
import './text-input-component';
import { withinShadowRoot } from '../withinShadowRoot.story';
import { expect, fn, userEvent, waitFor } from '@storybook/test';
import data from '../../preact/textInput/__mockData__/aggregated_hosts.json';

const meta: Meta = {
    title: 'Input/Text input',
    component: 'gs-text-input',
    parameters: {
        actions: {
            handles: ['gs-text-input-changed'],
        },
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'hosts',
                        url: AGGREGATED_ENDPOINT,
                        query: {
                            fields: 'host',
                        },
                    },
                    response: {
                        status: 200,
                        body: data,
                    },
                },
            ],
        },
    },
};

export default meta;

export const Default: StoryObj<{ lapisField: string; placeholderText: string }> = {
    render: (args) => {
        return html` <gs-app lapis="${LAPIS_URL}">
            <div class="max-w-screen-lg">
                <gs-text-input .lapisField=${args.lapisField} .placeholderText=${args.placeholderText}></gs-text-input>
            </div>
        </gs-app>`;
    },
    args: {
        lapisField: 'host',
        placeholderText: 'Enter host name',
    },
};

export const FiresEvent: StoryObj<{ lapisField: string; placeholderText: string }> = {
    ...Default,
    play: async ({ canvasElement, step }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-text-input');

        const inputField = () => canvas.getByPlaceholderText('Enter host name');
        const listenerMock = fn();
        await step('Setup event listener mock', async () => {
            canvasElement.addEventListener('gs-text-input-changed', listenerMock);
        });

        await step('wait until data is loaded', async () => {
            await waitFor(() => {
                return expect(inputField()).toBeEnabled();
            });
        });

        await step('Enters an invalid host name', async () => {
            await userEvent.type(inputField(), 'notInList');
            await expect(listenerMock).not.toHaveBeenCalled();
            await userEvent.type(inputField(), '{backspace>9/}');
        });

        await step('Enter a valid host name', async () => {
            await userEvent.type(inputField(), 'Homo');

            await expect(listenerMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: {
                        host: 'Homo',
                    },
                }),
            );
        });
    },
};

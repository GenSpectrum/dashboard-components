import { withActions } from '@storybook/addon-actions/decorator';
import { expect, fn, userEvent, waitFor } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import '../app';
import './text-input-component';
import data from '../../preact/textInput/__mockData__/aggregated_hosts.json';
import type { TextInputProps } from '../../preact/textInput/text-input';
import { withinShadowRoot } from '../withinShadowRoot.story';

const codeExample = String.raw`
<gs-text-input lapisField="host" placeholderText="Enter host name" initialValue="Homo sapiens"></gs-text-input>`;

const meta: Meta<TextInputProps> = {
    title: 'Input/Text input',
    component: 'gs-text-input',
    parameters: withComponentDocs({
        actions: {
            handles: ['gs-text-input-changed'],
        },
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'hosts',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            fields: ['host'],
                        },
                    },
                    response: {
                        status: 200,
                        body: data,
                    },
                },
            ],
        },
        componentDocs: {
            tag: 'gs-text-input',
            opensShadowDom: true,
            expectsChildren: false,
            codeExample,
        },
    }),
    decorators: [withActions],
    tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj<TextInputProps> = {
    render: (args) => {
        return html` <gs-app lapis="${LAPIS_URL}">
            <div class="max-w-screen-lg">
                <gs-text-input
                    .lapisField=${args.lapisField}
                    .placeholderText=${args.placeholderText}
                    .initialValue=${args.initialValue}
                ></gs-text-input>
            </div>
        </gs-app>`;
    },
    args: {
        lapisField: 'host',
        placeholderText: 'Enter host name',
        initialValue: 'Homo sapiens',
    },
};

export const FiresEvent: StoryObj<TextInputProps> = {
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
    args: {
        ...Default.args,
        initialValue: '',
    },
};

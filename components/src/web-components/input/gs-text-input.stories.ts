import { expect, fireEvent, fn, userEvent, waitFor } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { previewHandles } from '../../../.storybook/preview';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import '../app';
import './gs-text-input';
import data from '../../preact/textInput/__mockData__/aggregated_hosts.json';
import type { TextInputProps } from '../../preact/textInput/text-input';
import { withinShadowRoot } from '../withinShadowRoot.story';

const codeExample = String.raw`
<gs-text-input 
    lapisField="host"
    placeholderText="Enter host name"
    value="Homo sapiens"
    width="50%">
</gs-text-input>`;

const meta: Meta<Required<TextInputProps>> = {
    title: 'Input/Text input',
    component: 'gs-text-input',
    parameters: withComponentDocs({
        actions: {
            handles: ['gs-text-input-changed', ...previewHandles],
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
            opensShadowDom: true,
            expectsChildren: false,
            codeExample,
        },
    }),
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
    },
    tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj<Required<TextInputProps>> = {
    render: (args) => {
        return html` <gs-app lapis="${LAPIS_URL}">
            <div class="max-w-screen-lg">
                <gs-text-input
                    .lapisField=${args.lapisField}
                    .placeholderText=${args.placeholderText}
                    .value=${args.value}
                    .width=${args.width}
                ></gs-text-input>
            </div>
        </gs-app>`;
    },
    args: {
        lapisField: 'host',
        placeholderText: 'Enter host name',
        value: 'Homo sapiens',
        width: '100%',
    },
};

export const FiresEvents: StoryObj<Required<TextInputProps>> = {
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
        });

        await step('Empty input', async () => {
            await userEvent.type(inputField(), '{backspace>9/}');
        });

        await step('Enter a valid host name', async () => {
            await userEvent.type(inputField(), 'Homo s');

            const dropdownOption = await canvas.findByText('Homo sapiens');
            await userEvent.click(dropdownOption);
        });

        await step('Verify event is fired with correct detail', async () => {
            await waitFor(() => {
                expect(listenerMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        detail: {
                            host: 'Homo sapiens',
                        },
                    }),
                );
            });
        });

        await step('Remove initial value', async () => {
            await fireEvent.click(canvas.getByRole('button', { name: 'clear selection' }));

            await expect(listenerMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: {
                        host: undefined,
                    },
                }),
            );
        });

        await step('Empty input', async () => {
            inputField().blur();
            await expect(listenerMock.mock.calls.at(-1)![0].detail).toStrictEqual({
                host: undefined,
            });
        });
    },
    args: {
        ...Default.args,
        value: '',
    },
};

import { expect, fn, userEvent, waitFor } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { previewHandles } from '../../../.storybook/preview';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import '../gs-app';
import './gs-text-filter';
import data from '../../preact/textFilter/__mockData__/aggregated_hosts.json';
import type { TextFilterProps } from '../../preact/textFilter/text-filter';
import { gsEventNames } from '../../utils/gsEventNames';
import { withinShadowRoot } from '../withinShadowRoot.story';

const codeExample = String.raw`
<gs-text-filter 
    lapisField="host"
    lapisFilter='{"country": "Germany"}'
    placeholderText="Enter host name"
    value="Homo sapiens"
    width="50%"
></gs-text-filter>`;

const meta: Meta<Required<TextFilterProps>> = {
    title: 'Input/Text filter',
    component: 'gs-text-filter',
    parameters: withComponentDocs({
        actions: {
            handles: [gsEventNames.textFilterChanged, ...previewHandles],
        },
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'hosts',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            fields: ['host'],
                            country: 'Germany',
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
        hideCounts: {
            control: {
                type: 'boolean',
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
    tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj<Required<TextFilterProps>> = {
    render: (args) => {
        return html` <gs-app lapis="${LAPIS_URL}">
            <div class="max-w-(--breakpoint-lg)">
                <gs-text-filter
                    .lapisField=${args.lapisField}
                    .lapisFilter=${args.lapisFilter}
                    .placeholderText=${args.placeholderText}
                    .hideCounts=${args.hideCounts}
                    .value=${args.value}
                    .width=${args.width}
                ></gs-text-filter>
            </div>
        </gs-app>`;
    },
    args: {
        lapisField: 'host',
        lapisFilter: { country: 'Germany' },
        placeholderText: 'Enter host name',
        hideCounts: false,
        value: 'Homo sapiens',
        width: '100%',
    },
};

export const FiresEvents: StoryObj<Required<TextFilterProps>> = {
    ...Default,
    play: async ({ canvasElement, step }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-text-filter');

        const inputField = () => canvas.getByPlaceholderText('Enter host name');
        const listenerMock = fn();
        await step('Setup event listener mock', () => {
            canvasElement.addEventListener(gsEventNames.textFilterChanged, listenerMock);
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
            await waitFor(async () => {
                await expect(listenerMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        detail: {
                            host: 'Homo sapiens',
                        },
                    }),
                );
            });
        });

        await step('Remove initial value', async () => {
            await userEvent.click(canvas.getByRole('button', { name: 'clear selection' }));

            await expect(listenerMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    detail: {
                        host: undefined,
                    },
                }),
            );
        });
    },
    args: {
        ...Default.args,
        value: '',
    },
};

import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, fireEvent, fn, userEvent, waitFor, within } from '@storybook/test';

import data from './__mockData__/aggregated_hosts.json';
import { TextFilter, type TextFilterProps } from './text-filter';
import { previewHandles } from '../../../.storybook/preview';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import { LapisUrlContextProvider } from '../LapisUrlContext';
import { expectInvalidAttributesErrorMessage } from '../shared/stories/expectErrorMessage';

const meta: Meta<TextFilterProps> = {
    title: 'Input/TextFilter',
    component: TextFilter,
    parameters: {
        actions: {
            handles: ['gs-text-filter-changed', ...previewHandles],
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
    },
};

export default meta;

export const Default: StoryObj<TextFilterProps> = {
    render: (args) => (
        <LapisUrlContextProvider value={LAPIS_URL}>
            <TextFilter {...args} />
        </LapisUrlContextProvider>
    ),
    args: {
        lapisField: 'host',
        placeholderText: 'Enter a host name',
        value: '',
        width: '100%',
        lapisFilter: {
            country: 'Germany',
        },
    },
};

export const RemoveInitialValue: StoryObj<TextFilterProps> = {
    ...Default,
    args: {
        ...Default.args,
        value: 'Homo sapiens',
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        const changedListenerMock = fn();
        await step('Setup event listener mock', () => {
            canvasElement.addEventListener('gs-text-filter-changed', changedListenerMock);
        });

        await waitFor(async () => {
            const input = canvas.getByPlaceholderText('Enter a host name', { exact: false });
            await expect(input).toHaveValue('Homo sapiens');
        });

        await step('Remove initial value', async () => {
            await fireEvent.click(canvas.getByRole('button', { name: 'clear selection' }));

            await waitFor(async () => {
                await expect(changedListenerMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        detail: {
                            host: undefined,
                        },
                    }),
                );
            });
        });
    },
};

export const KeepsPartialInputInInputField: StoryObj<TextFilterProps> = {
    ...Default,
    render: (args) => (
        <>
            <button data-testid='focusHelper'>Focus helper</button>
            <LapisUrlContextProvider value={LAPIS_URL}>
                <TextFilter {...args} />
            </LapisUrlContextProvider>
        </>
    ),
    args: {
        ...Default.args,
        value: '',
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        const changedListenerMock = fn();
        await step('Setup event listener mock', () => {
            canvasElement.addEventListener('gs-text-filter-changed', changedListenerMock);
        });
        const inputField = () => canvas.getByPlaceholderText('Enter a host name', { exact: false });
        async function typeAndBlur(input: string) {
            await userEvent.click(inputField());
            await userEvent.type(inputField(), input);
            await userEvent.click(canvas.getByTestId('focusHelper'));
        }

        await waitFor(async () => {
            await expect(inputField()).toHaveValue('');
        });

        await step('Type a value that it not valid yet and focus out', async () => {
            await typeAndBlur('Homo sapi');
            await waitFor(async () => {
                await expect(inputField()).toHaveValue('Homo sapi');
            });
            await expect(changedListenerMock).not.toHaveBeenCalled();
        });

        await step('Complete the input value and expect an event', async () => {
            await typeAndBlur('ens');
            await waitFor(async () => {
                await expect(inputField()).toHaveValue('Homo sapiens');
            });
            await waitFor(async () => {
                await expect(changedListenerMock).toHaveBeenLastCalledWith(
                    expect.objectContaining({
                        detail: {
                            host: 'Homo sapiens',
                        },
                    }),
                );
            });
        });
    },
};

export const WithNoLapisField: StoryObj<TextFilterProps> = {
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

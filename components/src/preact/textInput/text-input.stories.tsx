import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, waitFor, within } from '@storybook/test';

import data from './__mockData__/aggregated_hosts.json';
import { TextInput, type TextInputProps } from './text-input';
import { previewHandles } from '../../../.storybook/preview';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import { LapisUrlContext } from '../LapisUrlContext';
import { expectInvalidAttributesErrorMessage } from '../shared/stories/expectInvalidAttributesErrorMessage';

const meta: Meta<TextInputProps> = {
    title: 'Input/TextInput',
    component: TextInput,
    parameters: {
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
    },
    argTypes: {
        lapisField: {
            control: {
                type: 'select',
            },
            options: ['host'],
        },
        placeholderText: {
            control: {
                type: 'text',
            },
        },
        initialValue: {
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
};

export default meta;

export const Default: StoryObj<TextInputProps> = {
    render: (args) => (
        <LapisUrlContext.Provider value={LAPIS_URL}>
            <TextInput
                lapisField={args.lapisField}
                placeholderText={args.placeholderText}
                initialValue={args.initialValue}
                width={args.width}
            />
        </LapisUrlContext.Provider>
    ),
    args: {
        lapisField: 'host',
        placeholderText: 'Enter a host name',
        initialValue: '',
        width: '100%',
    },
};

export const WithInitialValue: StoryObj<TextInputProps> = {
    ...Default,
    args: {
        ...Default.args,
        initialValue: 'Homo sapiens',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => {
            const input = canvas.getByPlaceholderText('Enter a host name', { exact: false });
            expect(input).toHaveValue('Homo sapiens');
        });
    },
};

export const WithNoLapisField: StoryObj<TextInputProps> = {
    ...Default,
    args: {
        ...Default.args,
        lapisField: '',
    },
    play: async ({ canvasElement, step }) => {
        step('expect error message', async () => {
            await expectInvalidAttributesErrorMessage(canvasElement, 'String must contain at least 1 character(s)');
        });
    },
};

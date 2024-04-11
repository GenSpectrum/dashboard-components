import { withActions } from '@storybook/addon-actions/decorator';
import { type Meta, type StoryObj } from '@storybook/preact';

import data from './__mockData__/aggregated_hosts.json';
import { TextInput, type TextInputProps } from './text-input';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import { LapisUrlContext } from '../LapisUrlContext';

const meta: Meta<TextInputProps> = {
    title: 'Input/TextInput',
    component: TextInput,
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
    decorators: [withActions],
};

export default meta;

export const Default: StoryObj<TextInputProps> = {
    render: (args) => (
        <LapisUrlContext.Provider value={LAPIS_URL}>
            <TextInput lapisField={args.lapisField} placeholderText={args.placeholderText} />
        </LapisUrlContext.Provider>
    ),
    args: {
        lapisField: 'host',
        placeholderText: 'Enter a host name',
    },
};

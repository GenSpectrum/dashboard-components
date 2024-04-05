import { Meta, StoryObj } from '@storybook/preact';
import { TextInput, TextInputProps } from './text-input';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import { LapisUrlContext } from '../LapisUrlContext';
import data from './__mockData__/aggregated_hosts.json';

const meta: Meta<TextInputProps> = {
    title: 'Input/TextInput',
    component: TextInput,
    parameters: {
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

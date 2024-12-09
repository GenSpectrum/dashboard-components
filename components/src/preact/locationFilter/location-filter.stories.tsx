import { type Meta, type StoryObj } from '@storybook/preact';

import data from './__mockData__/aggregated.json';
import { LocationFilter, type LocationFilterProps } from './location-filter';
import { previewHandles } from '../../../.storybook/preview';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import { LapisUrlContext } from '../LapisUrlContext';
import { expectInvalidAttributesErrorMessage } from '../shared/stories/expectInvalidAttributesErrorMessage';

const meta: Meta<LocationFilterProps> = {
    title: 'Input/LocationFilter',
    component: LocationFilter,
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'numeratorEG',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            fields: ['region', 'country', 'division', 'location'],
                        },
                    },
                    response: {
                        status: 200,
                        body: data,
                    },
                },
            ],
        },
        actions: {
            handles: ['gs-location-changed', ...previewHandles],
        },
    },
    args: {
        width: '100%',
        fields: ['region', 'country', 'division', 'location'],
        initialValue: 'Europe',
        placeholderText: 'Enter a location',
    },
    argTypes: {
        fields: {
            control: {
                type: 'object',
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
        placeholderText: {
            control: {
                type: 'text',
            },
        },
    },
};

export default meta;

export const Primary: StoryObj<LocationFilterProps> = {
    render: (args) => (
        <LapisUrlContext.Provider value={LAPIS_URL}>
            <LocationFilter
                fields={args.fields}
                initialValue={args.initialValue}
                width={args.width}
                placeholderText={args.placeholderText}
            />
        </LapisUrlContext.Provider>
    ),
};

export const WithNoFields: StoryObj<LocationFilterProps> = {
    ...Primary,
    args: {
        ...Primary.args,
        fields: [],
    },
    play: async ({ canvasElement, step }) => {
        step('expect error message', async () => {
            await expectInvalidAttributesErrorMessage(canvasElement, 'Array must contain at least 1 element(s)');
        });
    },
};

import { type Meta, type StoryObj } from '@storybook/preact';

import data from './__mockData__/aggregated.json';
import { LocationFilter, type LocationFilterProps } from './location-filter';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import { LapisUrlContext } from '../LapisUrlContext';

const meta: Meta<typeof LocationFilter> = {
    title: 'Input/LocationFilter',
    component: LocationFilter,
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'numeratorEG',
                        url: AGGREGATED_ENDPOINT,
                        query: {
                            fields: 'region,country,division,location',
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
            handles: ['gs-location-changed .div', 'mouseover'],
        },
    },
    args: {
        fields: ['region', 'country', 'division', 'location'],
    },
};

export default meta;

export const Primary: StoryObj<LocationFilterProps> = {
    render: (args) => (
        <div class='max-w-screen-lg'>
            <LapisUrlContext.Provider value={LAPIS_URL}>
                <LocationFilter fields={args.fields} />
            </LapisUrlContext.Provider>
        </div>
    ),
};

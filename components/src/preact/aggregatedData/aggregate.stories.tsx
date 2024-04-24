import { type Meta, type StoryObj } from '@storybook/preact';

import aggregatedData from './__mockData__/aggregated.json';
import { Aggregate, type AggregateProps } from './aggregate';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import { LapisUrlContext } from '../LapisUrlContext';

const meta: Meta<AggregateProps> = {
    title: 'Visualization/Aggregate',
    component: Aggregate,
    argTypes: {
        fields: [{ control: 'object' }],
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'aggregatedData',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            fields: ['division', 'host'],
                            country: 'USA',
                        },
                    },
                    response: {
                        status: 200,
                        body: aggregatedData,
                    },
                },
            ],
        },
    },
};

export default meta;

export const Default: StoryObj<AggregateProps> = {
    render: (args) => (
        <div class='max-w-screen-lg'>
            <LapisUrlContext.Provider value={LAPIS_URL}>
                <Aggregate {...args} />
            </LapisUrlContext.Provider>
        </div>
    ),
    args: {
        fields: ['division', 'host'],
        views: ['table'],
        filter: {
            country: 'USA',
        },
    },
};

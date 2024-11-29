import { type Meta, type StoryObj } from '@storybook/preact';

import { LAPIS_URL } from '../../constants';
import { LapisUrlContext } from '../LapisUrlContext';
import { Map, type MapProps } from './map';

const meta: Meta<MapProps> = {
    title: 'Visualization/Map',
    component: Map,
    argTypes: {
        country: { control: 'select', options: ['us', 'de', 'uk'] },
    },
    parameters: {
        fetchMock: {},
    },
};

export default meta;

export const Default: StoryObj<MapProps> = {
    render: (args) => (
        <LapisUrlContext.Provider value={LAPIS_URL}>
            <Map {...args} />
        </LapisUrlContext.Provider>
    ),
    args: {
        country: 'us',
    },
};

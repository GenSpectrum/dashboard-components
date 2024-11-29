import { type Meta, type StoryObj } from '@storybook/preact';

import { LAPIS_URL } from '../../constants';
import { LapisUrlContext } from '../LapisUrlContext';
import { Map, type MapProps } from './map';

const meta: Meta<MapProps> = {
    title: 'Visualization/Map',
    component: Map,
    argTypes: {
        fields: [{ control: 'object' }],
        width: { control: 'text' },
        height: { control: 'text' },
        initialSortField: { control: 'text' },
        initialSortDirection: { control: 'radio', options: ['ascending', 'descending'] },
        pageSize: { control: 'object' },
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
    args: {},
};

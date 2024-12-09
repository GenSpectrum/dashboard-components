import { type Meta, type StoryObj } from '@storybook/preact';

import worldAtlas from './__mockData__/worldAtlas.json';
import { LAPIS_URL } from '../../constants';
import { LapisUrlContext } from '../LapisUrlContext';
import { Map, type MapProps } from './map';

import 'leaflet/dist/leaflet.css';
import './leafletStyleModifications.css';

const meta: Meta<MapProps> = {
    title: 'Visualization/Map',
    component: Map,
    argTypes: {
        // country: { control: 'select', options: ['us', 'de', 'uk'] },
    },
};

export default meta;

const worldMapUrl = 'https://mock.map.data/world.topo.json';

export const Default: StoryObj<MapProps> = {
    render: (args) => (
        <LapisUrlContext.Provider value={LAPIS_URL}>
            <Map {...args} />
        </LapisUrlContext.Provider>
    ),
    args: {
        lapisFilter: { dateFrom: '2022-01-01', dateTo: '2022-04-01' },
        lapisLocationField: 'country',
        mapSource: {
            type: 'topojson',
            url: worldMapUrl,
            topologyObjectsKey: 'countries',
        },
        enableMapNavigation: false,
        width: '1100px',
        height: '800px',
        views: ['map'],
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'worldMap',
                        url: worldMapUrl,
                    },
                    response: {
                        status: 200,
                        body: worldAtlas,
                    },
                },
            ],
        },
    },
};

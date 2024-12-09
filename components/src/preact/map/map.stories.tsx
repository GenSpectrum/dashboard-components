import { type Meta, type StoryObj } from '@storybook/preact';

import worldAtlas from './__mockData__/worldAtlas.json';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import { LapisUrlContext } from '../LapisUrlContext';
import aggregatedWorld from './__mockData__/aggregatedWorld.json';
import { Map, type MapProps } from './map';

import 'leaflet/dist/leaflet.css';
import './leafletStyleModifications.css';

const meta: Meta<MapProps> = {
    title: 'Visualization/Map',
    component: Map,
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
                {
                    matcher: {
                        name: 'aggregatedData',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            fields: ['country'],
                            dateFrom: '2022-01-01',
                            dateTo: '2022-04-01',
                        },
                    },
                    response: {
                        status: 200,
                        body: aggregatedWorld,
                    },
                },
            ],
        },
    },
};

import { type Meta, type StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import aggregatedData from '../../preact/aggregatedData/__mockData__/aggregated.json';
import aggregatedGermany from '../../preact/map/__mockData__/aggregatedGermany.json';
import aggregatedWorld from '../../preact/map/__mockData__/aggregatedWorld.json';
import mapOfGermany from '../../preact/map/__mockData__/germanyMap.json';
import worldAtlas from '../../preact/map/__mockData__/worldAtlas.json';
import { type SequencesByLocationProps } from '../../preact/map/sequences-by-location';

import './gs-sequences-by-location';
import '../app';

const codeExample = `<gs-sequences-by-location
    lapisFilter='{"dateFrom":"2022-01-01","dateTo":"2022-04-01"}'
    lapisLocationField='country'
    mapSource='{"type":"topojson","url":"https://mock.map.data/topo.json","topologyObjectsKey":"countries"}'
    enableMapNavigation='false'
    width='1100px'
    height='800px'
    views='["map"]'
    zoom='2'
    offsetX='0'
    offsetY='10'
/>`;

const meta: Meta<Required<SequencesByLocationProps>> = {
    title: 'Visualization/Sequences by location',
    component: 'gs-sequences-by-location',
    argTypes: {},
    parameters: withComponentDocs({
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
        componentDocs: {
            opensShadowDom: true,
            expectsChildren: false,
            codeExample,
        },
    }),
    tags: ['autodocs'],
};

export default meta;

const mockMapUrl = 'https://mock.map.data/topo.json';

const Template: StoryObj<SequencesByLocationProps> = {
    render: (args) => html`
        <gs-app lapis="${LAPIS_URL}">
            <gs-sequences-by-location
                .lapisFilter=${args.lapisFilter}
                .lapisLocationField=${args.lapisLocationField}
                .mapSource=${args.mapSource}
                .enableMapNavigation=${args.enableMapNavigation}
                .width=${args.width}
                .height=${args.height}
                .views=${args.views}
                .zoom=${args.zoom}
                .offsetX=${args.offsetX}
                .offsetY=${args.offsetY}
            ></gs-sequences-by-location>
        </gs-app>
    `,
};

export const WorldMap: StoryObj<SequencesByLocationProps> = {
    ...Template,
    args: {
        lapisFilter: { dateFrom: '2022-01-01', dateTo: '2022-04-01' },
        lapisLocationField: 'country',
        mapSource: {
            type: 'topojson',
            url: mockMapUrl,
            topologyObjectsKey: 'countries',
        },
        enableMapNavigation: false,
        width: '1100px',
        height: '800px',
        views: ['map'],
        zoom: 2,
        offsetX: 0,
        offsetY: 10,
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'worldMap',
                        url: mockMapUrl,
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

export const Germany: StoryObj<SequencesByLocationProps> = {
    ...Template,
    args: {
        lapisFilter: { dateFrom: '2022-01-01', dateTo: '2022-04-01', country: 'Germany' },
        lapisLocationField: 'division',
        mapSource: {
            type: 'topojson',
            url: mockMapUrl,
            topologyObjectsKey: 'deu',
        },
        enableMapNavigation: false,
        width: '1100px',
        height: '800px',
        views: ['map'],
        zoom: 6.3,
        offsetX: 10,
        offsetY: 51.4,
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'worldMap',
                        url: mockMapUrl,
                    },
                    response: {
                        status: 200,
                        body: mapOfGermany,
                    },
                },
                {
                    matcher: {
                        name: 'aggregatedData',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            fields: ['division'],
                            dateFrom: '2022-01-01',
                            dateTo: '2022-04-01',
                            country: 'Germany',
                        },
                    },
                    response: {
                        status: 200,
                        body: aggregatedGermany,
                    },
                },
            ],
        },
    },
};

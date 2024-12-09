import { type Meta, type StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import aggregatedData from '../../preact/aggregatedData/__mockData__/aggregated.json';
import type { AggregateProps } from '../../preact/aggregatedData/aggregate';
import worldAtlas from '../../preact/map/__mockData__/worldAtlas.json';
import { type MapProps } from '../../preact/map/map';

import './gs-map';
import '../app';

const codeExample = `TODO!`; // TODO

const meta: Meta<Required<AggregateProps>> = {
    title: 'Visualization/Map',
    component: 'gs-map',
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

const worldMapUrl = 'https://mock.map.data/world.topo.json';

export const Default: StoryObj<MapProps> = {
    render: (args) => html`
        <gs-app lapis="${LAPIS_URL}">
            <gs-map
                .lapisFilter=${args.lapisFilter}
                .lapisLocationField=${args.lapisLocationField}
                .mapSource=${args.mapSource}
                .enableMapNavigation=${args.enableMapNavigation}
                .width=${args.width}
                .height=${args.height}
            ></gs-map>
        </gs-app>
    `,
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

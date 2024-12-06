import Leaflet, { type LayerGroup } from 'leaflet';
import type { FunctionComponent } from 'preact';
import { useContext, useEffect, useRef } from 'preact/hooks';
import * as topojson from 'topojson-client';
import { type GeometryCollection, type Topology } from 'topojson-specification';
import z from 'zod';

import germany from './germany.json';
import uk from './uk.topo.json';
import us from './us.topo.json';
import { queryAggregateData } from '../../query/queryAggregateData';
import { LapisUrlContext } from '../LapisUrlContext';
import { ErrorBoundary } from '../components/error-boundary';
import { LoadingDisplay } from '../components/loading-display';
import { ResizeContainer } from '../components/resize-container';
import { formatProportion } from '../shared/table/formatProportion';
import { useQuery } from '../useQuery';

import 'leaflet/dist/leaflet.css';

const mapSourceSchema = z.object({
    type: z.literal('topojson'),
    url: z.string(),
    topologyObjectsKey: z.string(),
});

export type MapSource = z.infer<typeof mapSourceSchema>;

const mapPropsSchema = z.object({
    mapSource: mapSourceSchema,
});

export type MapProps = z.infer<typeof mapPropsSchema>;

function getColor(d: number) {
    return d > 0.5
        ? '#800026'
        : d > 0.4
          ? '#BD0026'
          : d > 0.3
            ? '#E31A1C'
            : d > 0.2
              ? '#FC4E2A'
              : d > 0.1
                ? '#FD8D3C'
                : d > 0.05
                  ? '#FEB24C'
                  : d > 0.02
                    ? '#FED976'
                    : d > 0.01
                      ? '#FFEDA0'
                      : d > 0.005
                        ? '#FFF7BC'
                        : d > 0.002
                          ? '#FFFFCC'
                          : d > 0
                            ? '#FFFFE5'
                            : '#FFFFFF';
}
type GeoColl = GeometryCollection<{
    name: string;
}>;

const countryConfig = {
    de: [germany, germany.objects.states, [51.1657, 10.4515], 6],
    uk: [uk, uk.objects.subunits, [55.3781, -5], 5],
    us: [us, us.objects.usa, [40, -100], 4],
} as const;

export const Map: FunctionComponent<MapProps> = (componentProps) => {
    // const { width, height } = componentProps;
    const width = '1000px';
    const height = '800px';
    const size = { height, width };

    return (
        <ErrorBoundary size={size}>
            <ResizeContainer size={size}>
                <MapInner {...componentProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

const MapInner: FunctionComponent<MapProps> = ({ mapSource }) => {
    const ref = useRef<HTMLDivElement>(null);

    const lapis = useContext(LapisUrlContext);
    const { isLoading: isLoadingMap, geojsonData } = useGeoJsonMap(mapSource);
    const {
        data,
        error,
        isLoading: isLoadingLapisData,
    } = useQuery(
        async () => queryAggregateData({ dateFrom: '2022-01-01', dateTo: '2022-04-01' }, ['country'], lapis),
        [lapis],
    );

    useEffect(() => {
        if (!ref.current || geojsonData === undefined || data === undefined) {
            return;
        }

        const dataByCountry = data.reduce(
            (acc, row) => ({
                ...acc,
                [row.country as string]: row,
            }),
            {} as Record<string, { count: number; proportion: number }>,
        );
        console.log(dataByCountry);

        const found = [];

        const countries = geojsonData.features.map((feature) => {
            const name = feature.properties.name;

            if (!(name in dataByCountry)) {
                // console.log(name);
            } else {
                found.push(name);
            }

            const data2 = dataByCountry[name] || { count: 0, proportion: 0 };

            return {
                ...feature,
                properties: {
                    ...feature.properties,
                    ...data2,
                },
            };
        });

        const notFound = Object.keys(dataByCountry).filter((name) => !found.includes(name));
        console.warn('notFound', notFound);

        const leafletMap = Leaflet.map(ref.current, {
            // scrollWheelZoom: false,
            zoomControl: false,
            keyboard: false,
            // dragging: false,
        });
        leafletMap.setView([10, 0], 1.5);

        Leaflet.geoJson(countries, {
            style: (feature) => ({
                fillColor: getColor(feature?.properties.proportion),
                fillOpacity: 0.5,
                color: 'black',
                weight: 1,
            }),
        })
            .bindTooltip((a) => {
                const feature = (a as LayerGroup<{ name: string; proportion: number; count: number }>).feature;
                if (feature === undefined || feature.type !== 'Feature') {
                    return '';
                }
                const properties = feature.properties;
                return `${properties.name}: ${properties.count.toLocaleString('en-us')} (${formatProportion(properties.proportion)})`;
            })
            .addTo(leafletMap);

        return () => {
            leafletMap.remove();
        };
    }, [ref, data, geojsonData]);

    if (isLoadingMap || isLoadingLapisData) {
        return <LoadingDisplay />;
    }

    if (error) {
        throw error;
    }

    return (
        <div className='border-2 p-4'>
            <div ref={ref} className='w-[1000px] h-[800px]  bg-white' />
        </div>
    );
};

function useGeoJsonMap(mapSource: MapSource) {
    if (mapSource.type !== 'topojson') {
        throw new Error('Unknown map source type');
    }

    const {
        data: geojsonData,
        error,
        isLoading,
    } = useQuery(async () => {
        const response = await fetch(mapSource.url);
        const topology = (await response.json()) as Topology;
        return topojson.feature(
            topology,
            topology.objects[mapSource.topologyObjectsKey] as GeometryCollection<{
                name: string;
            }>,
        );
    }, [mapSource.url]);

    if (isLoading) {
        return { isLoading };
    }

    if (error) {
        throw error;
    }

    return { geojsonData, isLoading: false as const };
}

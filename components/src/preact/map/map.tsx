import type { Feature, GeometryObject } from 'geojson';
import Leaflet, { type LayerGroup } from 'leaflet';
import type { FunctionComponent } from 'preact';
import { useContext, useEffect, useRef } from 'preact/hooks';
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
import { useGeoJsonMap } from './useGeoJsonMap';
import { lapisFilterSchema } from '../../types';

import 'leaflet/dist/leaflet.css';

const mapSourceSchema = z.object({
    type: z.literal('topojson'),
    url: z.string().min(1),
    topologyObjectsKey: z.string().min(1),
});

export type MapSource = z.infer<typeof mapSourceSchema>;

const mapPropsSchema = z.object({
    lapisFilter: lapisFilterSchema,
    lapisLocationField: z.string().min(1),
    mapSource: mapSourceSchema,
    enableMapNavigation: z.boolean(),
    width: z.string(),
    height: z.string(),
});

export type MapProps = z.infer<typeof mapPropsSchema>;

function getColor(value: number | undefined) {
    if (value === undefined) {
        return 'lightgrey';
    }

    return value > 0.5
        ? '#800026'
        : value > 0.4
          ? '#BD0026'
          : value > 0.3
            ? '#E31A1C'
            : value > 0.2
              ? '#FC4E2A'
              : value > 0.1
                ? '#FD8D3C'
                : value > 0.05
                  ? '#FEB24C'
                  : value > 0.02
                    ? '#FED976'
                    : value > 0.01
                      ? '#FFEDA0'
                      : value > 0.005
                        ? '#FFF7BC'
                        : value > 0.002
                          ? '#FFFFCC'
                          : value > 0
                            ? '#FFFFE5'
                            : '#FFFFFF';
}

const countryConfig = {
    de: [germany, germany.objects.states, [51.1657, 10.4515], 6],
    uk: [uk, uk.objects.subunits, [55.3781, -5], 5],
    us: [us, us.objects.usa, [40, -100], 4],
} as const;

export const Map: FunctionComponent<MapProps> = (componentProps) => {
    const { width, height } = componentProps;
    const size = { height, width };

    return (
        <ErrorBoundary size={size} componentProps={componentProps} schema={mapPropsSchema}>
            <ResizeContainer size={size}>
                <MapInner {...componentProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

type GeoJsonFeatureProperties = { name: string; data: { proportion: number; count: number } | null };

const MapInner: FunctionComponent<MapProps> = ({ lapisFilter, lapisLocationField, mapSource, enableMapNavigation }) => {
    const ref = useRef<HTMLDivElement>(null);

    const lapis = useContext(LapisUrlContext);
    const { isLoading: isLoadingMap, geojsonData } = useGeoJsonMap(mapSource);
    const {
        data,
        error,
        isLoading: isLoadingLapisData,
    } = useQuery(async () => queryAggregateData(lapisFilter, [lapisLocationField], lapis), [lapis]);

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

        const found: string[] = [];

        const locations: Feature<GeometryObject, GeoJsonFeatureProperties>[] = geojsonData.features.map((feature) => {
            const name = feature.properties.name;

            if (name in dataByCountry) {
                found.push(name);
            }

            return {
                ...feature,
                properties: {
                    ...feature.properties,
                    data: dataByCountry[name] || null,
                },
            };
        });

        const notFound = Object.keys(dataByCountry).filter((name) => !found.includes(name));
        const unmatchedLocationsWarning = `Found data from LAPIS that could not be matched on locations on the given map: ${notFound.join(', ')}`;
        console.warn(unmatchedLocationsWarning); // eslint-disable-line no-console -- We should give some feedback about unmatched location data.

        const leafletMap = Leaflet.map(ref.current, {
            scrollWheelZoom: enableMapNavigation,
            zoomControl: enableMapNavigation,
            keyboard: enableMapNavigation,
            dragging: enableMapNavigation,
        });
        leafletMap.setView([10, 0], 1.5);

        Leaflet.geoJson(locations, {
            style: (feature: Feature<GeometryObject, GeoJsonFeatureProperties> | undefined) => ({
                fillColor: getColor(feature?.properties.data?.proportion),
                fillOpacity: 0.5,
                color: 'black',
                weight: 1,
            }),
        })
            .bindTooltip((layer) => {
                const feature = (layer as LayerGroup<GeoJsonFeatureProperties>).feature;
                if (feature === undefined || feature.type !== 'Feature') {
                    return '';
                }
                const properties = feature.properties;
                const value =
                    properties.data === null
                        ? 'No data'
                        : `${properties.data.count.toLocaleString('en-us')} (${formatProportion(properties.data.proportion)})`;
                return `${properties.name}: ${value}`;
            })
            .addTo(leafletMap);

        return () => {
            leafletMap.remove();
        };
    }, [ref, data, geojsonData, enableMapNavigation]);

    if (isLoadingMap || isLoadingLapisData) {
        return <LoadingDisplay />;
    }

    if (error) {
        throw error;
    }

    return (
        <div className='border-2 p-4 h-full '>
            <div className='overflow-hidden h-full'>
                <div ref={ref} className='h-full bg-white' />
            </div>
        </div>
    );
};

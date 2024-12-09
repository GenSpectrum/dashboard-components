import type * as GeoJSON from 'geojson';
import type { Feature, GeometryObject } from 'geojson';
import Leaflet, { type Layer, type LayerGroup } from 'leaflet';
import type { FunctionComponent } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

import { type GeoJsonFeatureProperties } from './useGeoJsonMap';
import { type AggregateData } from '../../query/queryAggregateData';
import { formatProportion } from '../shared/table/formatProportion';

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

type EnhancedGeoJsonFeatureProperties = GeoJsonFeatureProperties & {
    data: { proportion: number; count: number } | null;
};

type MapViewProps = {
    geojsonData: GeoJSON.FeatureCollection<GeometryObject, GeoJsonFeatureProperties>;
    data: AggregateData;
    enableMapNavigation: boolean;
};

export const MapComponentMapView: FunctionComponent<MapViewProps> = ({ geojsonData, data, enableMapNavigation }) => {
    const ref = useRef<HTMLDivElement>(null);

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

        const locations: Feature<GeometryObject, EnhancedGeoJsonFeatureProperties>[] = geojsonData.features.map(
            (feature) => {
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
            },
        );

        const unmatchedLocations = Object.keys(dataByCountry).filter((name) => !found.includes(name));
        if (unmatchedLocations.length > 0) {
            const unmatchedLocationsWarning = `gs-map: Found data from LAPIS that could not be matched on locations on the given map: ${unmatchedLocations.join(', ')}`;
            console.warn(unmatchedLocationsWarning); // eslint-disable-line no-console -- We should give some feedback about unmatched location data.
        }

        const leafletMap = Leaflet.map(ref.current, {
            scrollWheelZoom: enableMapNavigation,
            zoomControl: enableMapNavigation,
            keyboard: enableMapNavigation,
            dragging: enableMapNavigation,
        });
        leafletMap.setView([10, 0], 1.5);

        Leaflet.geoJson(locations, {
            style: (feature: Feature<GeometryObject, EnhancedGeoJsonFeatureProperties> | undefined) => ({
                fillColor: getColor(feature?.properties.data?.proportion),
                fillOpacity: 1,
                color: 'grey',
                weight: 1,
            }),
        })
            .bindTooltip(createTooltip)
            .addTo(leafletMap);

        return () => {
            leafletMap.remove();
        };
    }, [ref, data, geojsonData, enableMapNavigation]);

    return (
        <div className='overflow-hidden h-full'>
            <div ref={ref} className='h-full bg-white' />
        </div>
    );
};

function createTooltip(layer: Layer) {
    const feature = (layer as LayerGroup<EnhancedGeoJsonFeatureProperties>).feature;
    if (feature === undefined || feature.type !== 'Feature') {
        return '';
    }
    const properties = feature.properties;

    const div = document.createElement('div');
    div.appendChild(p({ innerText: properties.name, className: 'font-bold' }));
    if (properties.data !== null) {
        div.appendChild(
            p({
                innerText: `Count: ${properties.data.count.toLocaleString('en-us')}`,
                className: 'text-sm',
            }),
        );
        div.appendChild(
            p({
                innerText: `Proportion: ${formatProportion(properties.data.proportion)}`,
                className: 'text-sm',
            }),
        );
    } else {
        div.appendChild(p({ innerText: 'No data', className: 'text-sm' }));
    }
    return div;
}

function p({ innerText, className }: { innerText: string; className: string }) {
    const headline = document.createElement('p');
    headline.innerText = innerText;
    headline.className = className;
    return headline;
}

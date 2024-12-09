import type * as GeoJSON from 'geojson';
import type { Feature, GeometryObject } from 'geojson';
import Leaflet, { type Layer, type LayerGroup } from 'leaflet';
import type { FunctionComponent } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

import { type GeoJsonFeatureProperties } from './useGeoJsonMap';
import { type AggregateData } from '../../query/queryAggregateData';
import { formatProportion } from '../shared/table/formatProportion';

type FeatureData = { proportion: number; count: number };

type EnhancedGeoJsonFeatureProperties = GeoJsonFeatureProperties & {
    data: FeatureData | null;
};
type MapViewProps = {
    geojsonData: GeoJSON.FeatureCollection<GeometryObject, GeoJsonFeatureProperties>;
    locationData: AggregateData;
    enableMapNavigation: boolean;
    lapisLocationField: string;
};

export const MapComponentMapView: FunctionComponent<MapViewProps> = ({
    geojsonData,
    locationData,
    enableMapNavigation,
    lapisLocationField,
}) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current || geojsonData === undefined || locationData === undefined) {
            return;
        }

        const countAndProportionByCountry = buildLookupByLocationField(locationData, lapisLocationField);
        const locations = matchLocationDataAndGeoJsonFeatures(geojsonData, countAndProportionByCountry);

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
    }, [ref, locationData, geojsonData, enableMapNavigation, lapisLocationField]);

    return <div ref={ref} className='h-full' />;
};

function buildLookupByLocationField(locationData: AggregateData, lapisLocationField: string) {
    return new Map<string, FeatureData>(
        locationData
            .filter((row) => typeof row[lapisLocationField] === 'string')
            .map((row) => [row[lapisLocationField] as string, row]),
    );
}

function matchLocationDataAndGeoJsonFeatures(
    geojsonData: GeoJSON.FeatureCollection<GeometryObject, GeoJsonFeatureProperties>,
    countAndProportionByCountry: Map<string, FeatureData>,
) {
    const matchedLocations: string[] = [];

    const locations: Feature<GeometryObject, EnhancedGeoJsonFeatureProperties>[] = geojsonData.features.map(
        (feature) => {
            const name = feature.properties.name;

            if (countAndProportionByCountry.has(name)) {
                matchedLocations.push(name);
            }

            return {
                ...feature,
                properties: {
                    ...feature.properties,
                    data: countAndProportionByCountry.get(name) || null,
                },
            };
        },
    );

    const unmatchedLocations = Object.keys(countAndProportionByCountry).filter(
        (name) => !matchedLocations.includes(name),
    );
    if (unmatchedLocations.length > 0) {
        const unmatchedLocationsWarning = `gs-map: Found data from LAPIS that could not be matched on locations on the given map: ${unmatchedLocations.join(', ')}`;
        console.warn(unmatchedLocationsWarning); // eslint-disable-line no-console -- We should give some feedback about unmatched location data.
    }

    return locations;
}

function getColor(value: number | undefined): string {
    if (value === undefined) {
        return 'lightgrey';
    }

    const thresholds = [
        { limit: 0.5, color: '#800026' },
        { limit: 0.4, color: '#BD0026' },
        { limit: 0.3, color: '#E31A1C' },
        { limit: 0.2, color: '#FC4E2A' },
        { limit: 0.1, color: '#FD8D3C' },
        { limit: 0.05, color: '#FEB24C' },
        { limit: 0.02, color: '#FED976' },
        { limit: 0.01, color: '#FFEDA0' },
        { limit: 0.005, color: '#FFF7BC' },
        { limit: 0.002, color: '#FFFFCC' },
    ];

    for (const { limit, color } of thresholds) {
        if (value > limit) {
            return color;
        }
    }

    return '#FFFFE5';
}
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
            }),
        );
        div.appendChild(
            p({
                innerText: `Proportion: ${formatProportion(properties.data.proportion)}`,
            }),
        );
    } else {
        div.appendChild(p({ innerText: 'No data', className: 'text-sm' }));
    }
    return div;
}

function p({ innerText, className = '' }: { innerText: string; className?: string }) {
    const headline = document.createElement('p');
    headline.innerText = innerText;
    headline.className = className;
    return headline;
}

import type { Feature, FeatureCollection, GeometryObject } from 'geojson';
import Leaflet, { type Layer, type LayerGroup } from 'leaflet';
import type { FunctionComponent } from 'preact';
import { useEffect, useMemo, useRef } from 'preact/hooks';

import { type GeoJsonFeatureProperties, type MapSource, useGeoJsonMap } from './useGeoJsonMap';
import { type AggregateData } from '../../query/queryAggregateData';
import { InfoHeadline1, InfoParagraph } from '../components/info';
import { LoadingDisplay } from '../components/loading-display';
import { Modal, useModalRef } from '../components/modal';
import { formatProportion } from '../shared/table/formatProportion';

type FeatureData = { proportion: number; count: number };

type EnhancedGeoJsonFeatureProperties = GeoJsonFeatureProperties & {
    data: FeatureData | null;
};

type SequencesByLocationMapProps = {
    mapSource: MapSource;
    locationData: AggregateData;
    enableMapNavigation: boolean;
    lapisLocationField: string;
    zoom: number;
    offsetX: number;
    offsetY: number;
    hasTableView: boolean;
};

export const SequencesByLocationMap: FunctionComponent<SequencesByLocationMapProps> = ({
    mapSource,
    ...otherProps
}) => {
    const { isLoading: isLoadingMap, geojsonData } = useGeoJsonMap(mapSource);

    if (isLoadingMap) {
        return <LoadingDisplay />;
    }

    return <SequencesByLocationMapInner geojsonData={geojsonData} {...otherProps} />;
};

type SequencesByLocationMapInnerProps = Omit<SequencesByLocationMapProps, 'mapSource'> & {
    geojsonData: FeatureCollection<GeometryObject, GeoJsonFeatureProperties>;
};

export const SequencesByLocationMapInner: FunctionComponent<SequencesByLocationMapInnerProps> = ({
    geojsonData,
    locationData,
    enableMapNavigation,
    lapisLocationField,
    zoom,
    offsetX,
    offsetY,
    hasTableView,
}) => {
    const ref = useRef<HTMLDivElement>(null);

    const { locations, totalCount, countOfMatchedLocationData, unmatchedLocations } = useMemo(() => {
        const countAndProportionByCountry = buildLookupByLocationField(locationData, lapisLocationField);
        const { locations, unmatchedLocations } = matchLocationDataAndGeoJsonFeatures(
            geojsonData,
            countAndProportionByCountry,
            lapisLocationField,
        );

        const totalCount = locationData.map((value) => value.count).reduce((sum, b) => sum + b, 0);
        const countOfMatchedLocationData = locations
            .map((location) => location.properties.data?.count ?? 0)
            .reduce((sum, b) => sum + b, 0);

        return { locations, totalCount, countOfMatchedLocationData, unmatchedLocations };
    }, [geojsonData, locationData, lapisLocationField]);

    useEffect(() => {
        if (!ref.current) {
            return;
        }

        const leafletMap = Leaflet.map(ref.current, {
            scrollWheelZoom: enableMapNavigation,
            zoomControl: enableMapNavigation,
            keyboard: enableMapNavigation,
            dragging: enableMapNavigation,
            zoomSnap: 0,
            zoom,
            center: [offsetY, offsetX],
        });

        Leaflet.geoJson(locations, {
            style: (feature: Feature<GeometryObject, EnhancedGeoJsonFeatureProperties> | undefined) => ({
                fillColor: getColor(feature?.properties.data?.proportion),
                fillOpacity: 1,
                color: '#666666',
                weight: 1,
            }),
        })
            .bindTooltip(createTooltip)
            .addTo(leafletMap);

        return () => {
            leafletMap.remove();
        };
    }, [ref, locations, enableMapNavigation, lapisLocationField, zoom, offsetX, offsetY]);

    const nullCount = locationData.find((row) => row[lapisLocationField] === null)?.count ?? 0;

    return (
        <div className='h-full'>
            <div ref={ref} className='h-full' />
            <div className='relative'>
                <DataMatchInformation
                    totalCount={totalCount}
                    countOfMatchedLocationData={countOfMatchedLocationData}
                    unmatchedLocations={unmatchedLocations}
                    nullCount={nullCount}
                    hasTableView={hasTableView}
                />
            </div>
        </div>
    );
};

type DataMatchInformationProps = {
    totalCount: number;
    countOfMatchedLocationData: number;
    unmatchedLocations: string[];
    nullCount: number;
    hasTableView: boolean;
};

const DataMatchInformation: FunctionComponent<DataMatchInformationProps> = ({
    totalCount,
    countOfMatchedLocationData,
    unmatchedLocations,
    nullCount,
    hasTableView,
}) => {
    const modalRef = useModalRef();

    const proportion = formatProportion(countOfMatchedLocationData / totalCount);

    return (
        <>
            <button
                onClick={() => modalRef.current?.showModal()}
                className='text-sm absolute bottom-0 px-1 z-[1001] bg-white rounded border cursor-pointer tooltip'
                data-tip='Click for detailed information'
            >
                This map shows {proportion} of the data.
            </button>
            <Modal modalRef={modalRef}>
                <InfoHeadline1>Sequences By Location - Map View</InfoHeadline1>
                <InfoParagraph>
                    The current filter has matched {totalCount.toLocaleString('en-us')} sequences. From these sequences,
                    we were able to match {countOfMatchedLocationData.toLocaleString('en-us')} ({proportion}) on
                    locations on the map.
                </InfoParagraph>
                <InfoParagraph>
                    {unmatchedLocations.length > 0 && (
                        <>
                            The following locations from the data could not be matched on the map:{' '}
                            {unmatchedLocations.map((it) => `"${it}"`).join(', ')}.{' '}
                        </>
                    )}
                    {nullCount > 0 &&
                        `${nullCount.toLocaleString('en-us')} matching sequences have no location information. `}
                    {hasTableView && 'You can check the table view for more detailed information.'}
                </InfoParagraph>
            </Modal>
        </>
    );
};

function buildLookupByLocationField(locationData: AggregateData, lapisLocationField: string) {
    return new Map<string, FeatureData>(
        locationData
            .filter((row) => typeof row[lapisLocationField] === 'string')
            .map((row) => [row[lapisLocationField] as string, row]),
    );
}

function matchLocationDataAndGeoJsonFeatures(
    geojsonData: FeatureCollection<GeometryObject, GeoJsonFeatureProperties>,
    countAndProportionByCountry: Map<string, FeatureData>,
    lapisLocationField: string,
) {
    const matchedLocations: string[] = [];

    const locations: Feature<GeometryObject, EnhancedGeoJsonFeatureProperties>[] = geojsonData.features.map(
        (feature) => {
            const name = feature?.properties?.name;
            if (typeof name !== 'string') {
                throw new Error(
                    `GeoJSON feature with id '${feature.id}' does not have 'properties.name' of type string, was: '${name}'`,
                );
            }

            const data = countAndProportionByCountry.get(name) ?? null;
            if (data !== null) {
                matchedLocations.push(name);
            }
            return {
                ...feature,
                properties: {
                    ...feature.properties,
                    data,
                },
            };
        },
    );

    const unmatchedLocations = [...countAndProportionByCountry.keys()].filter(
        (name) => !matchedLocations.includes(name),
    );
    if (unmatchedLocations.length > 0) {
        const unmatchedLocationsWarning = `gs-map: Found location data from LAPIS (aggregated by "${lapisLocationField}") that could not be matched on locations on the given map. Unmatched location names are: ${unmatchedLocations.map((it) => `"${it}"`).join(', ')}`;
        console.warn(unmatchedLocationsWarning); // eslint-disable-line no-console -- We should give some feedback about unmatched location data.
    }

    return { locations, unmatchedLocations };
}

function getColor(value: number | undefined): string {
    if (value === undefined) {
        return '#DDDDDD';
    }

    const thresholds = [
        { limit: 0.4, color: '#662506' },
        { limit: 0.3, color: '#993404' },
        { limit: 0.2, color: '#CC4C02' },
        { limit: 0.1, color: '#EC7014' },
        { limit: 0.05, color: '#FB9A29' },
        { limit: 0.02, color: '#FEC44F' },
        { limit: 0.01, color: '#FEE391' },
        { limit: 0.005, color: '#FFF7BC' },
        { limit: 0.002, color: '#FFFFE5' },
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
        div.appendChild(p({ innerText: 'No data' }));
    }
    return div;
}

function p({ innerText, className = '' }: { innerText: string; className?: string }) {
    const headline = document.createElement('p');
    headline.innerText = innerText;
    headline.className = className;
    return headline;
}

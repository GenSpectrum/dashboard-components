import type * as GeoJSON from 'geojson';
import type { GeometryObject } from 'geojson';
import type { FunctionComponent } from 'preact';
import { useContext } from 'preact/hooks';
import z from 'zod';

import germany from './germany.json';
import { MapComponentMapView } from './map-component-map-view';
import uk from './uk.topo.json';
import us from './us.topo.json';
import { type AggregateData, queryAggregateData } from '../../query/queryAggregateData';
import { LapisUrlContext } from '../LapisUrlContext';
import { ErrorBoundary } from '../components/error-boundary';
import { Fullscreen } from '../components/fullscreen';
import Info, { InfoComponentCode, InfoHeadline1, InfoParagraph } from '../components/info';
import { LoadingDisplay } from '../components/loading-display';
import { ResizeContainer } from '../components/resize-container';
import { useQuery } from '../useQuery';
import { type GeoJsonFeatureProperties, useGeoJsonMap } from './useGeoJsonMap';
import { lapisFilterSchema, type MapView, mapViewSchema, views } from '../../types';
import Tabs from '../components/tabs';

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
    views: z.array(mapViewSchema),
});

export type MapProps = z.infer<typeof mapPropsSchema>;

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

const MapInner: FunctionComponent<MapProps> = (props) => {
    const { lapisFilter, lapisLocationField, mapSource } = props;

    const lapis = useContext(LapisUrlContext);
    const { isLoading: isLoadingMap, geojsonData } = useGeoJsonMap(mapSource);
    const {
        data,
        error,
        isLoading: isLoadingLapisData,
    } = useQuery(async () => queryAggregateData(lapisFilter, [lapisLocationField], lapis), [lapis]);

    if (isLoadingMap || isLoadingLapisData) {
        return <LoadingDisplay />;
    }

    if (error) {
        throw error;
    }

    return <MapTabs geojsonData={geojsonData} data={data} originalComponentProps={props} />;
};

type MapTabsProps = {
    originalComponentProps: MapProps;
    geojsonData: GeoJSON.FeatureCollection<GeometryObject, GeoJsonFeatureProperties>;
    data: AggregateData;
};

const MapTabs: FunctionComponent<MapTabsProps> = ({ originalComponentProps, geojsonData, data }) => {
    const getTab = (view: MapView) => {
        switch (view) {
            case views.map:
                return {
                    title: 'Map',
                    content: (
                        <MapComponentMapView
                            locationData={data}
                            geojsonData={geojsonData}
                            enableMapNavigation={originalComponentProps.enableMapNavigation}
                            lapisLocationField={originalComponentProps.lapisLocationField}
                        />
                    ),
                };
        }
    };

    const tabs = originalComponentProps.views.map((view) => getTab(view));

    return <Tabs tabs={tabs} toolbar={<Toolbar originalComponentProps={originalComponentProps} />} />;
};

type ToolbarProps = {
    originalComponentProps: MapProps;
};

const Toolbar: FunctionComponent<ToolbarProps> = ({ originalComponentProps }) => {
    return (
        <div class='flex flex-row'>
            <MapInfo originalComponentProps={originalComponentProps} />
            <Fullscreen />
        </div>
    );
};

type MapInfoProps = {
    originalComponentProps: MapProps;
};

const MapInfo: FunctionComponent<MapInfoProps> = ({ originalComponentProps }) => {
    const lapis = useContext(LapisUrlContext);
    return (
        <Info>
            <InfoHeadline1>Map</InfoHeadline1>
            <InfoParagraph>TODO: Add description</InfoParagraph>
            <InfoComponentCode componentName='map' params={originalComponentProps} lapisUrl={lapis} />
        </Info>
    );
};

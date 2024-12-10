import type * as GeoJSON from 'geojson';
import type { GeometryObject } from 'geojson';
import type { FunctionComponent } from 'preact';
import { useContext } from 'preact/hooks';
import z from 'zod';

import { PrevalenceByLocationMap } from './prevalence-by-location-map';
import { type AggregateData, queryAggregateData } from '../../query/queryAggregateData';
import { LapisUrlContext } from '../LapisUrlContext';
import { ErrorBoundary } from '../components/error-boundary';
import { Fullscreen } from '../components/fullscreen';
import Info, { InfoComponentCode, InfoHeadline1, InfoParagraph } from '../components/info';
import { LoadingDisplay } from '../components/loading-display';
import { ResizeContainer } from '../components/resize-container';
import { useQuery } from '../useQuery';
import { type GeoJsonFeatureProperties, useGeoJsonMap } from './useGeoJsonMap';
import { lapisFilterSchema, views } from '../../types';
import Tabs from '../components/tabs';

export const prevalenceByLocationViewSchema = z.literal(views.map);
export type PrevalenceByLocationView = z.infer<typeof prevalenceByLocationViewSchema>;

const mapSourceSchema = z.object({
    type: z.literal('topojson'),
    url: z.string().min(1),
    topologyObjectsKey: z.string().min(1),
});

export type MapSource = z.infer<typeof mapSourceSchema>;

const prevalenceByLocationPropsSchema = z.object({
    lapisFilter: lapisFilterSchema,
    lapisLocationField: z.string().min(1),
    mapSource: mapSourceSchema,
    enableMapNavigation: z.boolean(),
    width: z.string(),
    height: z.string(),
    views: z.array(prevalenceByLocationViewSchema),
    zoom: z.number(),
    offsetX: z.number(),
    offsetY: z.number(),
});

export type PrevalenceByLocationProps = z.infer<typeof prevalenceByLocationPropsSchema>;

export const PrevalenceByLocation: FunctionComponent<PrevalenceByLocationProps> = (componentProps) => {
    const { width, height } = componentProps;
    const size = { height, width };

    return (
        <ErrorBoundary size={size} componentProps={componentProps} schema={prevalenceByLocationPropsSchema}>
            <ResizeContainer size={size}>
                <PrevalenceByLocationInner {...componentProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

const PrevalenceByLocationInner: FunctionComponent<PrevalenceByLocationProps> = (props) => {
    const { lapisFilter, lapisLocationField, mapSource } = props;

    const lapis = useContext(LapisUrlContext);
    const { isLoading: isLoadingMap, geojsonData } = useGeoJsonMap(mapSource);
    const {
        data,
        error,
        isLoading: isLoadingLapisData,
    } = useQuery(
        async () => queryAggregateData(lapisFilter, [lapisLocationField], lapis),
        [lapisFilter, lapisLocationField, lapis],
    );

    if (isLoadingMap || isLoadingLapisData) {
        return <LoadingDisplay />;
    }

    if (error) {
        throw error;
    }

    return <PrevalenceByLocationTabs geojsonData={geojsonData} data={data} originalComponentProps={props} />;
};

type PrevalenceByLocationTabsProps = {
    originalComponentProps: PrevalenceByLocationProps;
    geojsonData: GeoJSON.FeatureCollection<GeometryObject, GeoJsonFeatureProperties>;
    data: AggregateData;
};

const PrevalenceByLocationTabs: FunctionComponent<PrevalenceByLocationTabsProps> = ({
    originalComponentProps,
    geojsonData,
    data,
}) => {
    const getTab = (view: PrevalenceByLocationView) => {
        switch (view) {
            case views.map:
                return {
                    title: 'Map',
                    content: (
                        <PrevalenceByLocationMap
                            locationData={data}
                            geojsonData={geojsonData}
                            enableMapNavigation={originalComponentProps.enableMapNavigation}
                            lapisLocationField={originalComponentProps.lapisLocationField}
                            zoom={originalComponentProps.zoom}
                            offsetX={originalComponentProps.offsetX}
                            offsetY={originalComponentProps.offsetY}
                        />
                    ),
                };
        }
    };

    const tabs = originalComponentProps.views.map((view) => getTab(view));

    return <Tabs tabs={tabs} toolbar={<Toolbar originalComponentProps={originalComponentProps} />} />;
};

type ToolbarProps = {
    originalComponentProps: PrevalenceByLocationProps;
};

const Toolbar: FunctionComponent<ToolbarProps> = ({ originalComponentProps }) => {
    return (
        <div class='flex flex-row'>
            <PrevalenceByLocationInfo originalComponentProps={originalComponentProps} />
            <Fullscreen />
        </div>
    );
};

type PrevalenceByLocationInfoProps = {
    originalComponentProps: PrevalenceByLocationProps;
};

const PrevalenceByLocationInfo: FunctionComponent<PrevalenceByLocationInfoProps> = ({ originalComponentProps }) => {
    const lapis = useContext(LapisUrlContext);
    return (
        <Info>
            <InfoHeadline1>Prevalence By Location</InfoHeadline1>
            <InfoParagraph>
                TODO: Add description https://github.com/GenSpectrum/dashboard-components/issues/598
            </InfoParagraph>
            <InfoComponentCode
                componentName='prevalence-by-location'
                params={originalComponentProps}
                lapisUrl={lapis}
            />
        </Info>
    );
};

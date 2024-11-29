import type * as GeoJSON from 'geojson';
import type { GeometryObject } from 'geojson';
import type { FunctionComponent } from 'preact';
import { useContext } from 'preact/hooks';
import z from 'zod';

import { SequencesByLocationMap } from './sequences-by-location-map';
import { type AggregateData, queryAggregateData } from '../../query/queryAggregateData';
import { LapisUrlContext } from '../LapisUrlContext';
import { ErrorBoundary } from '../components/error-boundary';
import { Fullscreen } from '../components/fullscreen';
import Info, { InfoComponentCode, InfoHeadline1, InfoParagraph } from '../components/info';
import { LoadingDisplay } from '../components/loading-display';
import { ResizeContainer } from '../components/resize-container';
import { useQuery } from '../useQuery';
import { type GeoJsonFeatureProperties, mapSourceSchema, useGeoJsonMap } from './useGeoJsonMap';
import { lapisFilterSchema, views } from '../../types';
import Tabs from '../components/tabs';

export const sequencesByLocationViewSchema = z.literal(views.map);
export type SequencesByLocationMapView = z.infer<typeof sequencesByLocationViewSchema>;

const sequencesByLocationPropsSchema = z.object({
    lapisFilter: lapisFilterSchema,
    lapisLocationField: z.string().min(1),
    mapSource: mapSourceSchema,
    enableMapNavigation: z.boolean(),
    width: z.string(),
    height: z.string(),
    views: z.array(sequencesByLocationViewSchema),
    zoom: z.number(),
    offsetX: z.number(),
    offsetY: z.number(),
});

export type SequencesByLocationProps = z.infer<typeof sequencesByLocationPropsSchema>;

export const SequencesByLocation: FunctionComponent<SequencesByLocationProps> = (componentProps) => {
    const { width, height } = componentProps;
    const size = { height, width };

    return (
        <ErrorBoundary size={size} componentProps={componentProps} schema={sequencesByLocationPropsSchema}>
            <ResizeContainer size={size}>
                <SequencesByLocationMapInner {...componentProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

const SequencesByLocationMapInner: FunctionComponent<SequencesByLocationProps> = (props) => {
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

    return <SequencesByLocationMapTabs geojsonData={geojsonData} data={data} originalComponentProps={props} />;
};

type SequencesByLocationMapTabsProps = {
    originalComponentProps: SequencesByLocationProps;
    geojsonData: GeoJSON.FeatureCollection<GeometryObject, GeoJsonFeatureProperties>;
    data: AggregateData;
};

const SequencesByLocationMapTabs: FunctionComponent<SequencesByLocationMapTabsProps> = ({
    originalComponentProps,
    geojsonData,
    data,
}) => {
    const getTab = (view: SequencesByLocationMapView) => {
        switch (view) {
            case views.map:
                return {
                    title: 'Map',
                    content: (
                        <SequencesByLocationMap
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
    originalComponentProps: SequencesByLocationProps;
};

const Toolbar: FunctionComponent<ToolbarProps> = ({ originalComponentProps }) => {
    return (
        <div class='flex flex-row'>
            <SequencesByLocationMapInfo originalComponentProps={originalComponentProps} />
            <Fullscreen />
        </div>
    );
};

type SequencesByLocationMapInfoProps = {
    originalComponentProps: SequencesByLocationProps;
};

const SequencesByLocationMapInfo: FunctionComponent<SequencesByLocationMapInfoProps> = ({ originalComponentProps }) => {
    const lapis = useContext(LapisUrlContext);
    return (
        <Info>
            <InfoHeadline1>Prevalence by location</InfoHeadline1>
            <InfoParagraph>
                TODO: Add description https://github.com/GenSpectrum/dashboard-components/issues/598
            </InfoParagraph>
            <InfoComponentCode componentName='sequences-by-location' params={originalComponentProps} lapisUrl={lapis} />
        </Info>
    );
};

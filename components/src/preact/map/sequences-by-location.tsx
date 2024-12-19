import type { FeatureCollection, GeometryObject } from 'geojson';
import type { FunctionComponent } from 'preact';
import { useContext, useMemo } from 'preact/hooks';
import z from 'zod';

import { SequencesByLocationMap } from './sequences-by-location-map';
import { SequencesByLocationTable } from './sequences-by-location-table';
import { type AggregateData, queryAggregateData } from '../../query/queryAggregateData';
import { LapisUrlContext } from '../LapisUrlContext';
import { computeMapLocationData } from './computeMapLocationData';
import { getSequencesByLocationTableData } from './getSequencesByLocationTableData';
import { ErrorBoundary } from '../components/error-boundary';
import { Fullscreen } from '../components/fullscreen';
import Info, { InfoComponentCode, InfoHeadline1, InfoParagraph } from '../components/info';
import { LoadingDisplay } from '../components/loading-display';
import { ResizeContainer } from '../components/resize-container';
import { useQuery } from '../useQuery';
import { type GeoJsonFeatureProperties, loadMapSource, mapSourceSchema } from './loadMapSource';
import { lapisFilterSchema, views } from '../../types';
import Tabs from '../components/tabs';

export const sequencesByLocationViewSchema = z.union([z.literal(views.map), z.literal(views.table)]);
export type SequencesByLocationMapView = z.infer<typeof sequencesByLocationViewSchema>;

const sequencesByLocationPropsSchema = z.object({
    lapisFilter: lapisFilterSchema,
    lapisLocationField: z.string().min(1),
    mapSource: mapSourceSchema.optional(),
    enableMapNavigation: z.boolean(),
    width: z.string(),
    height: z.string(),
    views: z.array(sequencesByLocationViewSchema),
    zoom: z.number(),
    offsetX: z.number(),
    offsetY: z.number(),
    pageSize: z.union([z.boolean(), z.number()]),
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
    const {
        data,
        error,
        isLoading: isLoadingLapisData,
    } = useQuery(async () => {
        const [locationData, geojsonData] = await Promise.all([
            queryAggregateData(lapisFilter, [lapisLocationField], lapis),
            mapSource !== undefined ? loadMapSource(mapSource) : undefined,
        ]);
        return { locationData, geojsonData };
    }, [lapisFilter, lapisLocationField, lapis, mapSource]);

    if (isLoadingLapisData) {
        return <LoadingDisplay />;
    }

    if (error) {
        throw error;
    }

    return (
        <SequencesByLocationMapTabs
            locationData={data.locationData}
            geojsonData={data.geojsonData}
            originalComponentProps={props}
        />
    );
};

type SequencesByLocationMapTabsProps = {
    originalComponentProps: SequencesByLocationProps;
    locationData: AggregateData;
    geojsonData: FeatureCollection<GeometryObject, GeoJsonFeatureProperties> | undefined;
};

const SequencesByLocationMapTabs: FunctionComponent<SequencesByLocationMapTabsProps> = ({
    originalComponentProps,
    locationData,
    geojsonData,
}) => {
    const { lapisLocationField } = originalComponentProps;

    const mapLocationData = useMemo(
        () => computeMapLocationData(locationData, geojsonData, lapisLocationField),
        [geojsonData, locationData, lapisLocationField],
    );

    const tableData = useMemo(
        () => getSequencesByLocationTableData(locationData, mapLocationData?.unmatchedLocations, lapisLocationField),
        [locationData, mapLocationData?.unmatchedLocations, lapisLocationField],
    );

    const getTab = (view: SequencesByLocationMapView) => {
        switch (view) {
            case views.map:
                if (mapLocationData === undefined) {
                    throw new Error('mapSource is required when using the map view');
                }
                return {
                    title: 'Map',
                    content: (
                        <SequencesByLocationMap
                            {...mapLocationData}
                            enableMapNavigation={originalComponentProps.enableMapNavigation}
                            lapisLocationField={lapisLocationField}
                            zoom={originalComponentProps.zoom}
                            offsetX={originalComponentProps.offsetX}
                            offsetY={originalComponentProps.offsetY}
                            hasTableView={originalComponentProps.views.includes(views.table)}
                        />
                    ),
                };
            case views.table:
                return {
                    title: 'Table',
                    content: (
                        <SequencesByLocationTable
                            tableData={tableData}
                            lapisLocationField={lapisLocationField}
                            pageSize={originalComponentProps.pageSize}
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

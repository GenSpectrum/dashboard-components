import { type FunctionComponent } from 'preact';
import { type Dispatch, type StateUpdater, useState } from 'preact/hooks';
import z from 'zod';

import { computeWastewaterMutationsOverTimeDataPerLocation } from './computeWastewaterMutationsOverTimeDataPerLocation';
import { lapisFilterSchema, sequenceTypeSchema } from '../../../types';
import { Map2dView } from '../../../utils/map2d';
import { useLapisUrl } from '../../LapisUrlContext';
import { type ColorScale } from '../../components/color-scale-selector';
import { ColorScaleSelectorDropdown } from '../../components/color-scale-selector-dropdown';
import { ErrorBoundary } from '../../components/error-boundary';
import { Fullscreen } from '../../components/fullscreen';
import Info, { InfoComponentCode, InfoHeadline1, InfoParagraph } from '../../components/info';
import { LoadingDisplay } from '../../components/loading-display';
import { NoDataDisplay } from '../../components/no-data-display';
import { ResizeContainer } from '../../components/resize-container';
import { type DisplayedSegment, SegmentSelector } from '../../components/segment-selector';
import Tabs from '../../components/tabs';
import { type MutationOverTimeDataMap } from '../../mutationsOverTime/MutationOverTimeData';
import MutationsOverTimeGrid from '../../mutationsOverTime/mutations-over-time-grid';
import { pageSizesSchema } from '../../shared/tanstackTable/pagination';
import { useQuery } from '../../useQuery';

const wastewaterMutationOverTimeSchema = z.object({
    lapisFilter: lapisFilterSchema,
    sequenceType: sequenceTypeSchema,
    width: z.string(),
    height: z.string().optional(),
    pageSizes: pageSizesSchema,
});

export type WastewaterMutationsOverTimeProps = z.infer<typeof wastewaterMutationOverTimeSchema>;

export const WastewaterMutationsOverTime: FunctionComponent<WastewaterMutationsOverTimeProps> = (componentProps) => {
    const { width, height } = componentProps;
    const size = { height, width };

    return (
        <ErrorBoundary size={size} schema={wastewaterMutationOverTimeSchema} componentProps={componentProps}>
            <ResizeContainer size={size}>
                <WastewaterMutationsOverTimeInner {...componentProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

export const WastewaterMutationsOverTimeInner: FunctionComponent<WastewaterMutationsOverTimeProps> = (
    componentProps,
) => {
    const lapis = useLapisUrl();

    const {
        data: mutationOverTimeDataPerLocation,
        error,
        isLoading,
    } = useQuery(
        () =>
            computeWastewaterMutationsOverTimeDataPerLocation(
                lapis,
                componentProps.lapisFilter,
                componentProps.sequenceType,
            ),
        [componentProps.lapisFilter, componentProps.sequenceType],
    );

    if (isLoading) {
        return <LoadingDisplay />;
    }

    if (error !== null) {
        throw error;
    }

    if (mutationOverTimeDataPerLocation.length === 0) {
        return <NoDataDisplay />;
    }

    return (
        <MutationsOverTimeTabs
            mutationOverTimeDataPerLocation={mutationOverTimeDataPerLocation}
            originalComponentProps={componentProps}
        />
    );
};

type MutationOverTimeDataPerLocation = {
    location: string;
    data: MutationOverTimeDataMap;
}[];

export function useDisplayedSegments(mutations: MutationOverTimeDataPerLocation) {
    const unique = [
        ...new Set(mutations.flatMap(({ data }) => data.getFirstAxisKeys().map((mutation) => mutation.segment || ''))),
    ];

    return useState<DisplayedSegment[]>(unique.map((segment) => ({ segment, label: segment, checked: true })));
}

type MutationOverTimeTabsProps = {
    mutationOverTimeDataPerLocation: MutationOverTimeDataPerLocation;
    originalComponentProps: WastewaterMutationsOverTimeProps;
};

export function getFilteredMutationOverTimeData({
    data,
    displayedSegments,
}: {
    data: MutationOverTimeDataMap;
    displayedSegments: DisplayedSegment[];
}): MutationOverTimeDataMap {
    const filteredData = new Map2dView(data);

    const mutationsToFilterOut = data.getFirstAxisKeys().filter((entry) => {
        return displayedSegments.some((segment) => segment.segment === entry.segment && !segment.checked);
    });

    mutationsToFilterOut.forEach((entry) => {
        filteredData.deleteRow(entry);
    });

    return filteredData;
}

const MutationsOverTimeTabs: FunctionComponent<MutationOverTimeTabsProps> = ({
    mutationOverTimeDataPerLocation,
    originalComponentProps,
}) => {
    const [colorScale, setColorScale] = useState<ColorScale>({ min: 0, max: 1, color: 'indigo' });
    const [displayedSegments, setDisplayedSegments] = useDisplayedSegments(mutationOverTimeDataPerLocation);

    const tabs = mutationOverTimeDataPerLocation.map(({ location, data }) => ({
        title: location,
        content: (
            <MutationsOverTimeGrid
                data={getFilteredMutationOverTimeData({ data, displayedSegments })}
                colorScale={colorScale}
                pageSizes={originalComponentProps.pageSizes}
                sequenceType={originalComponentProps.sequenceType}
            />
        ),
    }));

    const toolbar = (
        <Toolbar
            colorScale={colorScale}
            setColorScale={setColorScale}
            originalComponentProps={originalComponentProps}
            data={mutationOverTimeDataPerLocation}
            displayedSegments={displayedSegments}
            setDisplayedSegments={setDisplayedSegments}
        />
    );

    return <Tabs tabs={tabs} toolbar={toolbar} />;
};

type ToolbarProps = {
    colorScale: ColorScale;
    setColorScale: Dispatch<StateUpdater<ColorScale>>;
    originalComponentProps: WastewaterMutationsOverTimeProps;
    data: MutationOverTimeDataPerLocation;
    displayedSegments: DisplayedSegment[];
    setDisplayedSegments: (segments: DisplayedSegment[]) => void;
};

const Toolbar: FunctionComponent<ToolbarProps> = ({
    colorScale,
    setColorScale,
    originalComponentProps,
    displayedSegments,
    setDisplayedSegments,
}) => {
    return (
        <>
            <ColorScaleSelectorDropdown colorScale={colorScale} setColorScale={setColorScale} />
            <SegmentSelector displayedSegments={displayedSegments} setDisplayedSegments={setDisplayedSegments} />
            <WastewaterMutationsOverTimeInfo originalComponentProps={originalComponentProps} />
            <Fullscreen />
        </>
    );
};

type WastewaterMutationsOverTimeInfoProps = {
    originalComponentProps: WastewaterMutationsOverTimeProps;
};

const WastewaterMutationsOverTimeInfo: FunctionComponent<WastewaterMutationsOverTimeInfoProps> = ({
    originalComponentProps,
}) => {
    const lapis = useLapisUrl();
    return (
        <Info>
            <InfoHeadline1>Info for mutations over time</InfoHeadline1>
            <InfoParagraph>
                <slot name='infoText' />
            </InfoParagraph>
            <InfoComponentCode
                componentName='wastewater-mutations-over-time'
                params={originalComponentProps}
                lapisUrl={lapis}
            />
        </Info>
    );
};

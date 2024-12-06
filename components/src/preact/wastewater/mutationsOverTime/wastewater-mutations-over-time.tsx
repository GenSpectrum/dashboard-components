import { type FunctionComponent } from 'preact';
import { type Dispatch, type StateUpdater, useContext, useState } from 'preact/hooks';

import { queryWastewaterData } from '../../../query/queryWastewaterData';
import { type LapisFilter, type SequenceType } from '../../../types';
import { LapisUrlContext } from '../../LapisUrlContext';
import { type ColorScale } from '../../components/color-scale-selector';
import { ColorScaleSelectorDropdown } from '../../components/color-scale-selector-dropdown';
import { CsvDownloadButton } from '../../components/csv-download-button';
import { ErrorBoundary } from '../../components/error-boundary';
import { Fullscreen } from '../../components/fullscreen';
import Info, { InfoComponentCode, InfoHeadline1, InfoParagraph } from '../../components/info';
import { LoadingDisplay } from '../../components/loading-display';
import { NoDataDisplay } from '../../components/no-data-display';
import { ResizeContainer } from '../../components/resize-container';
import Tabs from '../../components/tabs';
import {
    BaseMutationOverTimeDataMap,
    type MutationOverTimeDataMap,
} from '../../mutationsOverTime/MutationOverTimeData';
import MutationsOverTimeGrid from '../../mutationsOverTime/mutations-over-time-grid';
import { useQuery } from '../../useQuery';

export interface WastewaterMutationsOverTimeProps {
    width: string;
    height: string;
    lapisFilter: LapisFilter;
    sequenceType: SequenceType;
}

export const WastewaterMutationsOverTime: FunctionComponent<WastewaterMutationsOverTimeProps> = (componentProps) => {
    const { width, height } = componentProps;
    const size = { height, width };

    return (
        <ErrorBoundary size={size}>
            <ResizeContainer size={size}>
                <WastewaterMutationsOverTimeInner {...componentProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

export const WastewaterMutationsOverTimeInner: FunctionComponent<WastewaterMutationsOverTimeProps> = (
    componentProps,
) => {
    const lapis = useContext(LapisUrlContext);

    const { data, error, isLoading } = useQuery(() => queryWastewaterData(lapis, componentProps.lapisFilter), []);

    if (isLoading) {
        return <LoadingDisplay />;
    }

    if (error !== null) {
        throw error;
    }

    if (data === null || data === undefined) {
        return <NoDataDisplay />;
    }

    const locationMap = new Map<string, MutationOverTimeDataMap>();
    for (const row of data) {
        if (!locationMap.has(row.location)) {
            locationMap.set(row.location, new BaseMutationOverTimeDataMap());
        }
        const map = locationMap.get(row.location)!;
        for (const mutation of componentProps.sequenceType === 'nucleotide'
            ? row.nucleotideMutationFrequency
            : row.aminoAcidMutationFrequency) {
            map.set(mutation.mutation, row.date, { proportion: mutation.proportion, count: NaN, totalCount: NaN });
        }
    }
    const mutationOverTimeDataPerLocation = [...locationMap.entries()].map(([location, data]) => ({ location, data }));

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

type MutationOverTimeTabsProps = {
    mutationOverTimeDataPerLocation: MutationOverTimeDataPerLocation;
    originalComponentProps: WastewaterMutationsOverTimeProps;
};

const MutationsOverTimeTabs: FunctionComponent<MutationOverTimeTabsProps> = ({
    mutationOverTimeDataPerLocation,
    originalComponentProps,
}) => {
    const [colorScale, setColorScale] = useState<ColorScale>({ min: 0, max: 1, color: 'indigo' });

    const tabs = mutationOverTimeDataPerLocation.map(({ location, data }) => ({
        title: location,
        content: <MutationsOverTimeGrid data={data} colorScale={colorScale} />,
    }));

    const toolbar = (activeTab: string) => (
        <Toolbar
            activeTab={activeTab}
            colorScale={colorScale}
            setColorScale={setColorScale}
            originalComponentProps={originalComponentProps}
            data={mutationOverTimeDataPerLocation}
        />
    );

    return <Tabs tabs={tabs} toolbar={toolbar} />;
};

type ToolbarProps = {
    activeTab: string;
    colorScale: ColorScale;
    setColorScale: Dispatch<StateUpdater<ColorScale>>;
    originalComponentProps: WastewaterMutationsOverTimeProps;
    data: MutationOverTimeDataPerLocation;
};

const Toolbar: FunctionComponent<ToolbarProps> = ({
    activeTab,
    colorScale,
    setColorScale,
    originalComponentProps,
    data,
}) => {
    return (
        <>
            {activeTab === 'Grid' && (
                <ColorScaleSelectorDropdown colorScale={colorScale} setColorScale={setColorScale} />
            )}
            <CsvDownloadButton
                className='mx-1 btn btn-xs'
                getData={() => getDownloadData(data)}
                filename='wastewater_mutations_over_time.csv'
            />
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
    const lapis = useContext(LapisUrlContext);
    return (
        <Info>
            <InfoHeadline1>Info for mutations over time</InfoHeadline1>
            <InfoParagraph>TODO: Ask for text</InfoParagraph>
            <InfoComponentCode componentName='mutations-over-time' params={originalComponentProps} lapisUrl={lapis} />
        </Info>
    );
};

function getDownloadData(data: MutationOverTimeDataPerLocation) {
    // TODO
    return [];
}

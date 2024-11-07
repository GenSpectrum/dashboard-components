import { type FunctionComponent } from 'preact';
import { type Dispatch, type StateUpdater, useContext, useMemo, useState } from 'preact/hooks';

// @ts-expect-error -- uses subpath imports and vite worker import
import MutationOverTimeWorker from '#mutationOverTime?worker&inline';
import { BaseMutationOverTimeDataMap, type MutationOverTimeDataMap } from './MutationOverTimeData';
import { getFilteredMutationOverTimeData } from './getFilteredMutationsOverTimeData';
import { type MutationOverTimeWorkerResponse } from './mutationOverTimeWorker';
import MutationsOverTimeGrid from './mutations-over-time-grid';
import { type MutationOverTimeQuery } from '../../query/queryMutationsOverTime';
import {
    type LapisFilter,
    type SequenceType,
    type SubstitutionOrDeletionEntry,
    type TemporalGranularity,
} from '../../types';
import { type Deletion, type Substitution } from '../../utils/mutations';
import { toTemporalClass } from '../../utils/temporalClass';
import { LapisUrlContext } from '../LapisUrlContext';
import { type ColorScale } from '../components/color-scale-selector';
import { ColorScaleSelectorDropdown } from '../components/color-scale-selector-dropdown';
import { CsvDownloadButton } from '../components/csv-download-button';
import { ErrorBoundary } from '../components/error-boundary';
import { ErrorDisplay } from '../components/error-display';
import { Fullscreen } from '../components/fullscreen';
import Info, { InfoComponentCode, InfoHeadline1, InfoParagraph } from '../components/info';
import { LoadingDisplay } from '../components/loading-display';
import { type DisplayedMutationType, MutationTypeSelector } from '../components/mutation-type-selector';
import { NoDataDisplay } from '../components/no-data-display';
import type { ProportionInterval } from '../components/proportion-selector';
import { ProportionSelectorDropdown } from '../components/proportion-selector-dropdown';
import { ResizeContainer } from '../components/resize-container';
import { type DisplayedSegment, SegmentSelector, useDisplayedSegments } from '../components/segment-selector';
import Tabs from '../components/tabs';
import { useWebWorker } from '../webWorkers/useWebWorker';

export type View = 'grid';

export interface MutationsOverTimeProps {
    width: string;
    height: string;
    lapisFilter: LapisFilter;
    sequenceType: SequenceType;
    views: View[];
    granularity: TemporalGranularity;
    lapisDateField: string;
}

export const MutationsOverTime: FunctionComponent<MutationsOverTimeProps> = (componentProps) => {
    const { width, height } = componentProps;
    const size = { height, width };

    return (
        <ErrorBoundary size={size}>
            <ResizeContainer size={size}>
                <MutationsOverTimeInner {...componentProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

export const MutationsOverTimeInner: FunctionComponent<MutationsOverTimeProps> = (componentProps) => {
    const lapis = useContext(LapisUrlContext);
    const { lapisFilter, sequenceType, granularity, lapisDateField } = componentProps;

    const { data, error, isLoading } = useWebWorker<MutationOverTimeQuery, MutationOverTimeWorkerResponse>(
        {
            lapisFilter,
            sequenceType,
            granularity,
            lapisDateField,
            lapis,
        },
        new MutationOverTimeWorker() as Worker,
    );

    if (isLoading) {
        return <LoadingDisplay />;
    }

    if (error !== undefined) {
        return <ErrorDisplay error={error} />;
    }

    if (data === null || data === undefined) {
        return <NoDataDisplay />;
    }

    const { overallMutationData, mutationOverTimeSerialized } = data;
    const mutationOverTimeData = new BaseMutationOverTimeDataMap(mutationOverTimeSerialized);
    return (
        <MutationsOverTimeTabs
            overallMutationData={overallMutationData}
            mutationOverTimeData={mutationOverTimeData}
            originalComponentProps={componentProps}
        />
    );
};

type MutationOverTimeTabsProps = {
    mutationOverTimeData: BaseMutationOverTimeDataMap;
    originalComponentProps: MutationsOverTimeProps;
    overallMutationData: SubstitutionOrDeletionEntry<Substitution, Deletion>[];
};

const MutationsOverTimeTabs: FunctionComponent<MutationOverTimeTabsProps> = ({
    mutationOverTimeData,
    originalComponentProps,
    overallMutationData,
}) => {
    const [proportionInterval, setProportionInterval] = useState({ min: 0.05, max: 0.9 });
    const [colorScale, setColorScale] = useState<ColorScale>({ min: 0, max: 1, color: 'indigo' });

    const [displayedSegments, setDisplayedSegments] = useDisplayedSegments(originalComponentProps.sequenceType);
    const [displayedMutationTypes, setDisplayedMutationTypes] = useState<DisplayedMutationType[]>([
        { label: 'Substitutions', checked: true, type: 'substitution' },
        { label: 'Deletions', checked: true, type: 'deletion' },
    ]);

    const filteredData = useMemo(() => {
        return getFilteredMutationOverTimeData(
            mutationOverTimeData,
            overallMutationData,
            displayedSegments,
            displayedMutationTypes,
            proportionInterval,
        );
    }, [mutationOverTimeData, overallMutationData, displayedSegments, displayedMutationTypes, proportionInterval]);

    const getTab = (view: View) => {
        if (filteredData === undefined) {
            return {
                title: 'Calculating',
                content: <LoadingDisplay />,
            };
        }
        switch (view) {
            case 'grid':
                return {
                    title: 'Grid',
                    content: <MutationsOverTimeGrid data={filteredData} colorScale={colorScale} />,
                };
        }
    };

    const tabs = originalComponentProps.views.map((view) => getTab(view));

    const toolbar = (activeTab: string) => (
        <Toolbar
            activeTab={activeTab}
            displayedSegments={displayedSegments}
            setDisplayedSegments={setDisplayedSegments}
            displayedMutationTypes={displayedMutationTypes}
            setDisplayedMutationTypes={setDisplayedMutationTypes}
            proportionInterval={proportionInterval}
            setProportionInterval={setProportionInterval}
            filteredData={filteredData}
            colorScale={colorScale}
            setColorScale={setColorScale}
            originalComponentProps={originalComponentProps}
        />
    );

    return <Tabs tabs={tabs} toolbar={toolbar} />;
};

type ToolbarProps = {
    activeTab: string;
    displayedSegments: DisplayedSegment[];
    setDisplayedSegments: (segments: DisplayedSegment[]) => void;
    displayedMutationTypes: DisplayedMutationType[];
    setDisplayedMutationTypes: (types: DisplayedMutationType[]) => void;
    proportionInterval: ProportionInterval;
    setProportionInterval: Dispatch<StateUpdater<ProportionInterval>>;
    filteredData: MutationOverTimeDataMap;
    colorScale: ColorScale;
    setColorScale: Dispatch<StateUpdater<ColorScale>>;
    originalComponentProps: MutationsOverTimeProps;
};

const Toolbar: FunctionComponent<ToolbarProps> = ({
    activeTab,
    displayedSegments,
    setDisplayedSegments,
    displayedMutationTypes,
    setDisplayedMutationTypes,
    proportionInterval,
    setProportionInterval,
    filteredData,
    colorScale,
    setColorScale,
    originalComponentProps,
}) => {
    return (
        <>
            {activeTab === 'Grid' && (
                <ColorScaleSelectorDropdown colorScale={colorScale} setColorScale={setColorScale} />
            )}
            <SegmentSelector displayedSegments={displayedSegments} setDisplayedSegments={setDisplayedSegments} />
            <MutationTypeSelector
                setDisplayedMutationTypes={setDisplayedMutationTypes}
                displayedMutationTypes={displayedMutationTypes}
            />
            <ProportionSelectorDropdown
                proportionInterval={proportionInterval}
                setMinProportion={(min) => setProportionInterval((prev) => ({ ...prev, min }))}
                setMaxProportion={(max) => setProportionInterval((prev) => ({ ...prev, max }))}
                labelPrefix='Mean proportion'
            />
            <CsvDownloadButton
                className='mx-1 btn btn-xs'
                getData={() => getDownloadData(filteredData)}
                filename='mutations_over_time.csv'
            />
            <MutationsOverTimeInfo originalComponentProps={originalComponentProps} />
            <Fullscreen />
        </>
    );
};

type MutationsOverTimeInfoProps = {
    originalComponentProps: MutationsOverTimeProps;
};

const MutationsOverTimeInfo: FunctionComponent<MutationsOverTimeInfoProps> = ({ originalComponentProps }) => {
    const lapis = useContext(LapisUrlContext);
    return (
        <Info>
            <InfoHeadline1>Info for mutations over time</InfoHeadline1>
            <InfoParagraph>TODO: https://github.com/GenSpectrum/dashboard-components/issues/441</InfoParagraph>
            <InfoComponentCode componentName='mutations-over-time' params={originalComponentProps} lapisUrl={lapis} />
        </Info>
    );
};

function getDownloadData(filteredData: MutationOverTimeDataMap) {
    const dates = filteredData.getSecondAxisKeys().map((date) => toTemporalClass(date));

    return filteredData.getFirstAxisKeys().map((mutation) => {
        return dates.reduce(
            (accumulated, date) => {
                const proportion = filteredData.get(mutation, date)?.proportion ?? 0;
                return {
                    ...accumulated,
                    [date.dateString]: proportion,
                };
            },
            { mutation: mutation.code },
        );
    });
}

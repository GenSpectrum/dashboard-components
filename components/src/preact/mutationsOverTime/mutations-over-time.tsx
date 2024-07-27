import { type FunctionComponent } from 'preact';
import { type Dispatch, type StateUpdater, useContext, useMemo, useState } from 'preact/hooks';

import { getFilteredMutationOverTimeData } from './getFilteredMutationsOverTimeData';
import MutationsOverTimeGrid from './mutations-over-time-grid';
import {
    type MutationOverTimeDataGroupedByMutation,
    queryMutationsOverTimeData,
} from '../../query/queryMutationsOverTime';
import { type LapisFilter, type SequenceType, type TemporalGranularity } from '../../types';
import { compareTemporal } from '../../utils/temporal';
import { LapisUrlContext } from '../LapisUrlContext';
import { type DisplayedSegment, SegmentSelector, useDisplayedSegments } from '../components/SegmentSelector';
import { type ColorScale } from '../components/color-scale-selector';
import { ColorScaleSelectorDropdown } from '../components/color-scale-selector-dropdown';
import { CsvDownloadButton } from '../components/csv-download-button';
import { ErrorBoundary } from '../components/error-boundary';
import { ErrorDisplay } from '../components/error-display';
import { Fullscreen } from '../components/fullscreen';
import Info from '../components/info';
import { LoadingDisplay } from '../components/loading-display';
import { type DisplayedMutationType, MutationTypeSelector } from '../components/mutation-type-selector';
import { NoDataDisplay } from '../components/no-data-display';
import type { ProportionInterval } from '../components/proportion-selector';
import { ProportionSelectorDropdown } from '../components/proportion-selector-dropdown';
import { ResizeContainer } from '../components/resize-container';
import Tabs from '../components/tabs';
import { sortSubstitutionsAndDeletions } from '../shared/sort/sortSubstitutionsAndDeletions';
import { useQuery } from '../useQuery';

export type View = 'grid';

export interface MutationsOverTimeInnerProps {
    lapisFilter: LapisFilter;
    sequenceType: SequenceType;
    views: View[];
    granularity: TemporalGranularity;
    lapisDateField: string;
}

export interface MutationsOverTimeProps extends MutationsOverTimeInnerProps {
    width: string;
    height: string;
}

export const MutationsOverTime: FunctionComponent<MutationsOverTimeProps> = ({ width, height, ...innerProps }) => {
    const size = { height, width };

    return (
        <ErrorBoundary size={size}>
            <ResizeContainer size={size}>
                <MutationsOverTimeInner {...innerProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

export const MutationsOverTimeInner: FunctionComponent<MutationsOverTimeInnerProps> = ({
    lapisFilter,
    sequenceType,
    views,
    granularity,
    lapisDateField,
}) => {
    const lapis = useContext(LapisUrlContext);
    const { data, error, isLoading } = useQuery(async () => {
        return queryMutationsOverTimeData(lapisFilter, sequenceType, lapis, lapisDateField, granularity);
    }, [lapisFilter, sequenceType, lapis, granularity, lapisDateField]);

    if (isLoading) {
        return <LoadingDisplay />;
    }

    if (error !== null) {
        return <ErrorDisplay error={error} />;
    }

    if (data === null) {
        return <NoDataDisplay />;
    }

    return <MutationsOverTimeTabs mutationOverTimeData={data} sequenceType={sequenceType} views={views} />;
};

type MutationOverTimeTabsProps = {
    mutationOverTimeData: MutationOverTimeDataGroupedByMutation;
    sequenceType: SequenceType;
    views: View[];
};

const MutationsOverTimeTabs: FunctionComponent<MutationOverTimeTabsProps> = ({
    mutationOverTimeData,
    sequenceType,
    views,
}) => {
    const [proportionInterval, setProportionInterval] = useState({ min: 0.05, max: 0.9 });
    const [colorScale, setColorScale] = useState<ColorScale>({ min: 0, max: 1, color: 'indigo' });

    const [displayedSegments, setDisplayedSegments] = useDisplayedSegments(sequenceType);
    const [displayedMutationTypes, setDisplayedMutationTypes] = useState<DisplayedMutationType[]>([
        { label: 'Substitutions', checked: true, type: 'substitution' },
        { label: 'Deletions', checked: true, type: 'deletion' },
    ]);

    const filteredData = useMemo(
        () =>
            getFilteredMutationOverTimeData(
                mutationOverTimeData,
                displayedSegments,
                displayedMutationTypes,
                proportionInterval,
            ),
        [mutationOverTimeData, displayedSegments, displayedMutationTypes, proportionInterval],
    );

    const getTab = (view: View) => {
        switch (view) {
            case 'grid':
                return {
                    title: 'Grid',
                    content: <MutationsOverTimeGrid data={filteredData} colorScale={colorScale} />,
                };
        }
    };

    const tabs = views.map((view) => getTab(view));

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
    filteredData: MutationOverTimeDataGroupedByMutation;
    colorScale: ColorScale;
    setColorScale: Dispatch<StateUpdater<ColorScale>>;
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
            />
            <CsvDownloadButton
                className='mx-1 btn btn-xs'
                getData={() => getDownloadData(filteredData)}
                filename='mutations_over_time.csv'
            />
            <Info>Info for mutations over time</Info>
            <Fullscreen />
        </>
    );
};

function getDownloadData(filteredData: MutationOverTimeDataGroupedByMutation) {
    const dates = filteredData.getSecondAxisKeys().sort((a, b) => compareTemporal(a, b));

    return filteredData
        .getFirstAxisKeys()
        .sort(sortSubstitutionsAndDeletions)
        .map((mutation) => {
            return dates.reduce(
                (accumulated, date) => {
                    const proportion = filteredData.get(mutation, date)?.proportion ?? 0;
                    return {
                        ...accumulated,
                        [date.toString()]: proportion,
                    };
                },
                { mutation: mutation.toString() },
            );
        });
}

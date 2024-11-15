import { type FunctionComponent } from 'preact';
import { type Dispatch, type StateUpdater, useContext, useMemo, useState } from 'preact/hooks';

import { getMutationComparisonTableData } from './getMutationComparisonTableData';
import { MutationComparisonTable } from './mutation-comparison-table';
import { MutationComparisonVenn } from './mutation-comparison-venn';
import { filterMutationData, type MutationData, queryMutationData } from './queryMutationData';
import { type NamedLapisFilter, type SequenceType } from '../../types';
import { LapisUrlContext } from '../LapisUrlContext';
import { CsvDownloadButton } from '../components/csv-download-button';
import { ErrorBoundary } from '../components/error-boundary';
import { Fullscreen } from '../components/fullscreen';
import Info, { InfoComponentCode, InfoHeadline1, InfoParagraph } from '../components/info';
import { LoadingDisplay } from '../components/loading-display';
import { type DisplayedMutationType, MutationTypeSelector } from '../components/mutation-type-selector';
import { NoDataDisplay } from '../components/no-data-display';
import { type ProportionInterval } from '../components/proportion-selector';
import { ProportionSelectorDropdown } from '../components/proportion-selector-dropdown';
import { ResizeContainer } from '../components/resize-container';
import { type DisplayedSegment, SegmentSelector, useDisplayedSegments } from '../components/segment-selector';
import Tabs from '../components/tabs';
import { useQuery } from '../useQuery';

export type View = 'table' | 'venn';

export interface MutationComparisonProps {
    width: string;
    height: string;
    lapisFilters: NamedLapisFilter[];
    sequenceType: SequenceType;
    views: View[];
    pageSize: boolean | number;
}

export const MutationComparison: FunctionComponent<MutationComparisonProps> = (componentProps) => {
    const { width, height } = componentProps;
    const size = { height, width };

    return (
        <ErrorBoundary size={size}>
            <ResizeContainer size={size}>
                <MutationComparisonInner {...componentProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

export const MutationComparisonInner: FunctionComponent<MutationComparisonProps> = (componentProps) => {
    const { lapisFilters, sequenceType } = componentProps;
    const lapis = useContext(LapisUrlContext);

    const { data, error, isLoading } = useQuery(async () => {
        return queryMutationData(lapisFilters, sequenceType, lapis);
    }, [lapisFilters, sequenceType, lapis]);

    if (isLoading) {
        return <LoadingDisplay />;
    }

    if (error !== null) {
        throw error;
    }

    if (data === null) {
        return <NoDataDisplay />;
    }

    return <MutationComparisonTabs data={data.mutationData} originalComponentProps={componentProps} />;
};

type MutationComparisonTabsProps = {
    data: MutationData[];
    originalComponentProps: MutationComparisonProps;
};

const MutationComparisonTabs: FunctionComponent<MutationComparisonTabsProps> = ({ data, originalComponentProps }) => {
    const [proportionInterval, setProportionInterval] = useState({ min: 0.5, max: 1 });
    const [displayedMutationTypes, setDisplayedMutationTypes] = useState<DisplayedMutationType[]>([
        { label: 'Substitutions', checked: true, type: 'substitution' },
        { label: 'Deletions', checked: true, type: 'deletion' },
    ]);
    const [displayedSegments, setDisplayedSegments] = useDisplayedSegments(originalComponentProps.sequenceType);

    const filteredData = useMemo(
        () => filterMutationData(data, displayedSegments, displayedMutationTypes),
        [data, displayedSegments, displayedMutationTypes],
    );

    const getTab = (view: View) => {
        switch (view) {
            case 'table':
                return {
                    title: 'Table',
                    content: (
                        <MutationComparisonTable
                            data={{ content: filteredData }}
                            proportionInterval={proportionInterval}
                            pageSize={originalComponentProps.pageSize}
                        />
                    ),
                };
            case 'venn':
                return {
                    title: 'Venn',
                    content: (
                        <MutationComparisonVenn
                            data={{ content: filteredData }}
                            proportionInterval={proportionInterval}
                        />
                    ),
                };
        }
    };

    const tabs = originalComponentProps.views.map((view) => getTab(view));

    return (
        <Tabs
            tabs={tabs}
            toolbar={
                <Toolbar
                    displayedSegments={displayedSegments}
                    setDisplayedSegments={setDisplayedSegments}
                    displayedMutationTypes={displayedMutationTypes}
                    setDisplayedMutationTypes={setDisplayedMutationTypes}
                    filteredData={filteredData}
                    proportionInterval={proportionInterval}
                    setProportionInterval={setProportionInterval}
                    originalComponentProps={originalComponentProps}
                />
            }
        />
    );
};

type ToolbarProps = {
    displayedSegments: DisplayedSegment[];
    setDisplayedSegments: (segments: DisplayedSegment[]) => void;
    displayedMutationTypes: DisplayedMutationType[];
    setDisplayedMutationTypes: (types: DisplayedMutationType[]) => void;
    filteredData: MutationData[];
    proportionInterval: ProportionInterval;
    setProportionInterval: Dispatch<StateUpdater<ProportionInterval>>;
    originalComponentProps: MutationComparisonProps;
};

const Toolbar: FunctionComponent<ToolbarProps> = ({
    displayedSegments,
    setDisplayedSegments,
    displayedMutationTypes,
    setDisplayedMutationTypes,
    filteredData,
    proportionInterval,
    setProportionInterval,
    originalComponentProps,
}) => {
    return (
        <>
            <ProportionSelectorDropdown
                proportionInterval={proportionInterval}
                setMinProportion={(min) => setProportionInterval((prev) => ({ ...prev, min }))}
                setMaxProportion={(max) => setProportionInterval((prev) => ({ ...prev, max }))}
            />
            <SegmentSelector displayedSegments={displayedSegments} setDisplayedSegments={setDisplayedSegments} />
            <MutationTypeSelector
                displayedMutationTypes={displayedMutationTypes}
                setDisplayedMutationTypes={setDisplayedMutationTypes}
            />
            <CsvDownloadButton
                className='mx-1 btn btn-xs'
                getData={() => getMutationComparisonTableData({ content: filteredData }, proportionInterval)}
                filename='mutation_comparison.csv'
            />
            <MutationComparisonInfo originalComponentProps={originalComponentProps} />
            <Fullscreen />
        </>
    );
};

type MutationComparisonInfoProps = {
    originalComponentProps: MutationComparisonProps;
};

const MutationComparisonInfo: FunctionComponent<MutationComparisonInfoProps> = ({ originalComponentProps }) => {
    const lapis = useContext(LapisUrlContext);
    return (
        <Info>
            <InfoHeadline1>Info for mutation comparison</InfoHeadline1>
            <InfoParagraph>TODO: https://github.com/GenSpectrum/dashboard-components/issues/465</InfoParagraph>
            <InfoComponentCode componentName='mutation-comparison' params={originalComponentProps} lapisUrl={lapis} />
        </Info>
    );
};

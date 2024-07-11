import { type FunctionComponent } from 'preact';
import { type Dispatch, type StateUpdater, useContext, useMemo, useState } from 'preact/hooks';

import { getMutationComparisonTableData } from './getMutationComparisonTableData';
import { MutationComparisonTable } from './mutation-comparison-table';
import { MutationComparisonVenn } from './mutation-comparison-venn';
import { filterMutationData, type MutationData, queryMutationData } from './queryMutationData';
import { type NamedLapisFilter, type SequenceType } from '../../types';
import { LapisUrlContext } from '../LapisUrlContext';
import { type DisplayedSegment, SegmentSelector, useDisplayedSegments } from '../components/SegmentSelector';
import { CsvDownloadButton } from '../components/csv-download-button';
import { ErrorBoundary } from '../components/error-boundary';
import { ErrorDisplay } from '../components/error-display';
import Headline from '../components/headline';
import Info from '../components/info';
import { LoadingDisplay } from '../components/loading-display';
import { type DisplayedMutationType, MutationTypeSelector } from '../components/mutation-type-selector';
import { NoDataDisplay } from '../components/no-data-display';
import { type ProportionInterval } from '../components/proportion-selector';
import { ProportionSelectorDropdown } from '../components/proportion-selector-dropdown';
import { ResizeContainer } from '../components/resize-container';
import Tabs from '../components/tabs';
import { useQuery } from '../useQuery';

export type View = 'table' | 'venn';

export interface MutationComparisonProps extends MutationComparisonInnerProps {
    width: string;
    height: string;
    headline?: string;
}

export interface MutationComparisonInnerProps {
    lapisFilters: NamedLapisFilter[];
    sequenceType: SequenceType;
    views: View[];
    pageSize: boolean | number;
}

export const MutationComparison: FunctionComponent<MutationComparisonProps> = ({
    width,
    height,
    headline = 'Mutation comparison',
    ...innerProps
}) => {
    const size = { height, width };

    return (
        <ErrorBoundary size={size} headline={headline}>
            <ResizeContainer size={size}>
                <Headline heading={headline}>
                    <MutationComparisonInner {...innerProps} />
                </Headline>
            </ResizeContainer>
        </ErrorBoundary>
    );
};

export const MutationComparisonInner: FunctionComponent<MutationComparisonInnerProps> = ({
    lapisFilters,
    sequenceType,
    views,
    pageSize,
}) => {
    const lapis = useContext(LapisUrlContext);

    const { data, error, isLoading } = useQuery(async () => {
        return queryMutationData(lapisFilters, sequenceType, lapis);
    }, [lapisFilters, sequenceType, lapis]);

    if (isLoading) {
        return <LoadingDisplay />;
    }

    if (error !== null) {
        return <ErrorDisplay error={error} />;
    }

    if (data === null) {
        return <NoDataDisplay />;
    }

    return (
        <MutationComparisonTabs
            data={data.mutationData}
            sequenceType={sequenceType}
            views={views}
            pageSize={pageSize}
        />
    );
};

type MutationComparisonTabsProps = {
    data: MutationData[];
    views: View[];
    sequenceType: SequenceType;
    pageSize: boolean | number;
};

const MutationComparisonTabs: FunctionComponent<MutationComparisonTabsProps> = ({
    data,
    views,
    sequenceType,
    pageSize,
}) => {
    const [proportionInterval, setProportionInterval] = useState({ min: 0.5, max: 1 });
    const [displayedMutationTypes, setDisplayedMutationTypes] = useState<DisplayedMutationType[]>([
        { label: 'Substitutions', checked: true, type: 'substitution' },
        { label: 'Deletions', checked: true, type: 'deletion' },
    ]);
    const [displayedSegments, setDisplayedSegments] = useDisplayedSegments(sequenceType);

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
                            pageSize={pageSize}
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

    const tabs = views.map((view) => getTab(view));

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
};

const Toolbar: FunctionComponent<ToolbarProps> = ({
    displayedSegments,
    setDisplayedSegments,
    displayedMutationTypes,
    setDisplayedMutationTypes,
    filteredData,
    proportionInterval,
    setProportionInterval,
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
            <Info height={'100px'}>Info for mutation comparison</Info>
        </>
    );
};

import { type FunctionComponent } from 'preact';
import { type Dispatch, type StateUpdater, useContext, useState } from 'preact/hooks';

import { getInsertionsTableData } from './getInsertionsTableData';
import { getMutationsTableData } from './getMutationsTableData';
import { MutationsGrid } from './mutations-grid';
import { InsertionsTable } from './mutations-insertions-table';
import MutationsTable from './mutations-table';
import { filterMutationsData, queryMutationsData } from './queryMutations';
import {
    type InsertionEntry,
    type LapisFilter,
    type SequenceType,
    type SubstitutionOrDeletionEntry,
} from '../../types';
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
import type { ProportionInterval } from '../components/proportion-selector';
import { ProportionSelectorDropdown } from '../components/proportion-selector-dropdown';
import { ResizeContainer } from '../components/resize-container';
import Tabs from '../components/tabs';
import { useQuery } from '../useQuery';

export type View = 'table' | 'grid' | 'insertions';

export interface MutationsInnerProps {
    variant: LapisFilter;
    sequenceType: SequenceType;
    views: View[];
}

export interface MutationsProps extends MutationsInnerProps {
    width: string;
    height: string;
    headline?: string;
}

export const Mutations: FunctionComponent<MutationsProps> = ({
    variant,
    sequenceType,
    views,
    width,
    height,
    headline = 'Mutations',
}) => {
    const size = { height, width };

    return (
        <ErrorBoundary size={size} headline={headline}>
            <ResizeContainer size={size}>
                <Headline heading={headline}>
                    <MutationsInner variant={variant} sequenceType={sequenceType} views={views} />
                </Headline>
            </ResizeContainer>
        </ErrorBoundary>
    );
};

export const MutationsInner: FunctionComponent<MutationsInnerProps> = ({ variant, sequenceType, views }) => {
    const lapis = useContext(LapisUrlContext);
    const { data, error, isLoading } = useQuery(async () => {
        return queryMutationsData(variant, sequenceType, lapis);
    }, [variant, sequenceType, lapis]);

    if (isLoading) {
        return <LoadingDisplay />;
    }

    if (error !== null) {
        return <ErrorDisplay error={error} />;
    }

    if (data === null) {
        return <NoDataDisplay />;
    }

    return <MutationsTabs mutationsData={data} sequenceType={sequenceType} views={views} />;
};

type MutationTabsProps = {
    mutationsData: { insertions: InsertionEntry[]; substitutionsOrDeletions: SubstitutionOrDeletionEntry[] };
    sequenceType: SequenceType;
    views: View[];
};

const MutationsTabs: FunctionComponent<MutationTabsProps> = ({ mutationsData, sequenceType, views }) => {
    const [proportionInterval, setProportionInterval] = useState({ min: 0.05, max: 1 });

    const [displayedSegments, setDisplayedSegments] = useDisplayedSegments(sequenceType);
    const [displayedMutationTypes, setDisplayedMutationTypes] = useState<DisplayedMutationType[]>([
        { label: 'Substitutions', checked: true, type: 'substitution' },
        { label: 'Deletions', checked: true, type: 'deletion' },
    ]);

    const filteredData = filterMutationsData(mutationsData, displayedSegments, displayedMutationTypes);

    const getTab = (view: View) => {
        switch (view) {
            case 'table':
                return {
                    title: 'Table',
                    content: <MutationsTable data={filteredData.tableData} proportionInterval={proportionInterval} />,
                };
            case 'grid':
                return {
                    title: 'Grid',
                    content: (
                        <MutationsGrid
                            data={filteredData.gridData}
                            sequenceType={sequenceType}
                            proportionInterval={proportionInterval}
                        />
                    ),
                };
            case 'insertions':
                return {
                    title: 'Insertions',
                    content: <InsertionsTable data={filteredData.insertions} />,
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
            filteredData={filteredData}
            proportionInterval={proportionInterval}
            setProportionInterval={setProportionInterval}
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
    filteredData: { tableData: SubstitutionOrDeletionEntry[]; insertions: InsertionEntry[] };
    proportionInterval: ProportionInterval;
    setProportionInterval: Dispatch<StateUpdater<ProportionInterval>>;
};

const Toolbar: FunctionComponent<ToolbarProps> = ({
    activeTab,
    displayedSegments,
    setDisplayedSegments,
    displayedMutationTypes,
    setDisplayedMutationTypes,
    filteredData,
    proportionInterval,
    setProportionInterval,
}) => {
    return (
        <div class='flex flex-row'>
            <SegmentSelector displayedSegments={displayedSegments} setDisplayedSegments={setDisplayedSegments} />
            {activeTab === 'Table' && (
                <MutationTypeSelector
                    setDisplayedMutationTypes={setDisplayedMutationTypes}
                    displayedMutationTypes={displayedMutationTypes}
                />
            )}
            {(activeTab === 'Table' || activeTab === 'Grid') && (
                <>
                    <ProportionSelectorDropdown
                        proportionInterval={proportionInterval}
                        setMinProportion={(min) => setProportionInterval((prev) => ({ ...prev, min }))}
                        setMaxProportion={(max) => setProportionInterval((prev) => ({ ...prev, max }))}
                        openDirection={'left'}
                    />
                    <CsvDownloadButton
                        className='mx-1 btn btn-xs'
                        getData={() => getMutationsTableData(filteredData.tableData, proportionInterval)}
                        filename='substitutionsAndDeletions.csv'
                    />
                </>
            )}
            {activeTab === 'Insertions' && (
                <CsvDownloadButton
                    className='mx-1 btn btn-xs'
                    getData={() =>
                        getInsertionsTableData(filteredData.insertions).map((row) => {
                            return {
                                insertion: row.insertion.toString(),
                                count: row.count,
                            };
                        })
                    }
                    filename='insertions.csv'
                />
            )}
            <Info height={'100px'}>Info for mutations</Info>
        </div>
    );
};

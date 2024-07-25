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
import { Fullscreen } from '../components/fullscreen';
import Info, { InfoHeadline1, InfoHeadline2, InfoLink, InfoParagraph } from '../components/info';
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
    lapisFilter: LapisFilter;
    sequenceType: SequenceType;
    views: View[];
    pageSize: boolean | number;
}

export interface MutationsProps extends MutationsInnerProps {
    width: string;
    height: string;
}

export const Mutations: FunctionComponent<MutationsProps> = ({ width, height, ...innerProps }) => {
    const size = { height, width };

    return (
        <ErrorBoundary size={size}>
            <ResizeContainer size={size}>
                <MutationsInner {...innerProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

export const MutationsInner: FunctionComponent<MutationsInnerProps> = ({
    lapisFilter,
    sequenceType,
    views,
    pageSize,
}) => {
    const lapis = useContext(LapisUrlContext);
    const { data, error, isLoading } = useQuery(async () => {
        return queryMutationsData(lapisFilter, sequenceType, lapis);
    }, [lapisFilter, sequenceType, lapis]);

    if (isLoading) {
        return <LoadingDisplay />;
    }

    if (error !== null) {
        return <ErrorDisplay error={error} />;
    }

    if (data === null) {
        return <NoDataDisplay />;
    }

    return <MutationsTabs mutationsData={data} sequenceType={sequenceType} views={views} pageSize={pageSize} />;
};

type MutationTabsProps = {
    mutationsData: { insertions: InsertionEntry[]; substitutionsOrDeletions: SubstitutionOrDeletionEntry[] };
    sequenceType: SequenceType;
    views: View[];
    pageSize: boolean | number;
};

const MutationsTabs: FunctionComponent<MutationTabsProps> = ({ mutationsData, sequenceType, views, pageSize }) => {
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
                    content: (
                        <MutationsTable
                            data={filteredData.tableData}
                            proportionInterval={proportionInterval}
                            pageSize={pageSize}
                        />
                    ),
                };
            case 'grid':
                return {
                    title: 'Grid',
                    content: (
                        <MutationsGrid
                            data={filteredData.gridData}
                            sequenceType={sequenceType}
                            proportionInterval={proportionInterval}
                            pageSize={pageSize}
                        />
                    ),
                };
            case 'insertions':
                return {
                    title: 'Insertions',
                    content: <InsertionsTable data={filteredData.insertions} pageSize={pageSize} />,
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
        <>
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
                    />
                    <CsvDownloadButton
                        className='mx-1 btn btn-xs'
                        getData={() => getMutationsTableData(filteredData.tableData, proportionInterval)}
                        filename='substitutions_and_deletions.csv'
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
            <MutationsInfo />
            <Fullscreen />
        </>
    );
};

const MutationsInfo = () => (
    <Info>
        <InfoHeadline1>Mutations</InfoHeadline1>
        <InfoParagraph>
            This shows mutations of a variant. There are three types of mutations:{' '}
            <InfoLink href='https://www.genome.gov/genetics-glossary/Substitution'>substitutions</InfoLink>,{' '}
            <InfoLink href='https://www.genome.gov/genetics-glossary/Deletion'>deletions</InfoLink> and{' '}
            <InfoLink href='https://www.genome.gov/genetics-glossary/Insertion'>insertions</InfoLink>.
        </InfoParagraph>
        <InfoHeadline2>Proportion calculation</InfoHeadline2>
        <InfoParagraph>
            The proportion of a mutation is calculated by dividing the number of sequences with the mutation by the
            total number of sequences with a non-ambiguous symbol at the position.
        </InfoParagraph>
        <InfoParagraph>
            <b>Example:</b> Assume we look at nucleotide mutations at position 5 where the reference has a T and assume
            there are 10 sequences in total:
            <ul className='list-disc list-inside ml-2'>
                <li>3 sequences have a C,</li>
                <li>2 sequences have a T,</li>
                <li>1 sequence has a G,</li>
                <li>3 sequences have an N,</li>
                <li>1 sequence has a Y (which means T or C),</li>
            </ul>
            then the proportion of the T5C mutation is 50%. The 4 sequences that have an N or Y are excluded from the
            calculation.
        </InfoParagraph>
    </Info>
);

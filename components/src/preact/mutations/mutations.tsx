import { type FunctionComponent } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';

import { getInsertionsTableData } from './getInsertionsTableData';
import { getMutationsTableData } from './getMutationsTableData';
import { MutationsGrid } from './mutations-grid';
import { InsertionsTable } from './mutations-insertions-table';
import MutationsTable from './mutations-table';
import { queryInsertions } from '../../query/queryInsertions';
import { querySubstitutionsOrDeletions } from '../../query/querySubstitutionsOrDeletions';
import {
    type InsertionEntry,
    type LapisFilter,
    type MutationEntry,
    type SequenceType,
    type SubstitutionOrDeletionEntry,
} from '../../types';
import { LapisUrlContext } from '../LapisUrlContext';
import { type DisplayedSegment, SegmentSelector } from '../components/SegmentSelector';
import { CsvDownloadButton } from '../components/csv-download-button';
import { ErrorDisplay } from '../components/error-display';
import Headline from '../components/headline';
import Info from '../components/info';
import { LoadingDisplay } from '../components/loading-display';
import { NoDataDisplay } from '../components/no-data-display';
import { ProportionSelectorDropdown } from '../components/proportion-selector-dropdown';
import Tabs from '../components/tabs';
import { useQuery } from '../useQuery';

export type View = 'table' | 'grid' | 'insertions';

export interface MutationsProps {
    variant: LapisFilter;
    sequenceType: SequenceType;
    views: View[];
}

export const Mutations: FunctionComponent<MutationsProps> = ({ variant, sequenceType, views }) => {
    const lapis = useContext(LapisUrlContext);

    const [minProportion, setMinProportion] = useState(0.05);
    const [maxProportion, setMaxProportion] = useState(1);

    const { data, error, isLoading } = useQuery(async () => {
        const substitutionsOrDeletions = await querySubstitutionsOrDeletions(variant, sequenceType, lapis);
        const insertions = await queryInsertions(variant, sequenceType, lapis);

        const mutationSegments = substitutionsOrDeletions.content
            .map((mutationEntry) => mutationEntry.mutation.segment)
            .filter((segment): segment is string => segment !== undefined);

        const segments = [...new Set(mutationSegments)];

        return {
            data: { substitutionsOrDeletions: substitutionsOrDeletions.content, insertions: insertions.content },
            segments,
        };
    }, [variant, sequenceType, lapis]);

    const [displayedSegments, setDisplayedSegments] = useState<DisplayedSegment[]>([]);
    useEffect(() => {
        if (data !== null) {
            setDisplayedSegments(
                data.segments.map((segment) => ({
                    segment,
                    label: segment,
                    checked: true,
                })),
            );
        }
    }, [data]);

    const headline = 'Mutations';
    if (isLoading) {
        return (
            <Headline heading={headline}>
                <LoadingDisplay />
            </Headline>
        );
    }

    if (error !== null) {
        return (
            <Headline heading={headline}>
                <ErrorDisplay error={error} />
            </Headline>
        );
    }

    if (data === null) {
        return (
            <Headline heading={headline}>
                <NoDataDisplay />
            </Headline>
        );
    }

    function bySelectedSegments<Mutation extends MutationEntry>(mutationEntry: Mutation) {
        if (mutationEntry.mutation.segment === undefined) {
            return true;
        }
        return displayedSegments.some(
            (displayedSegment) =>
                displayedSegment.segment === mutationEntry.mutation.segment && displayedSegment.checked,
        );
    }

    const byProportion = (mutationEntry: SubstitutionOrDeletionEntry) => {
        return mutationEntry.proportion >= minProportion && mutationEntry.proportion <= maxProportion;
    };

    const getTab = (
        view: View,
        data: { substitutionsOrDeletions: SubstitutionOrDeletionEntry[]; insertions: InsertionEntry[] },
    ) => {
        switch (view) {
            case 'table':
                return {
                    title: 'Table',
                    content: (
                        <MutationsTable
                            data={data.substitutionsOrDeletions.filter(byProportion).filter(bySelectedSegments)}
                        />
                    ),
                };
            case 'grid':
                return {
                    title: 'Grid',
                    content: (
                        <MutationsGrid
                            data={data.substitutionsOrDeletions.filter(byProportion).filter(bySelectedSegments)}
                            sequenceType={sequenceType}
                        />
                    ),
                };
            case 'insertions':
                return {
                    title: 'Insertions',
                    content: <InsertionsTable data={data.insertions.filter(bySelectedSegments)} />,
                };
        }
    };

    const tabs = views.map((view) => {
        return getTab(view, data.data);
    });

    const toolbar = (activeTab: string) => (
        <div class='flex flex-row'>
            <SegmentSelector displayedSegments={displayedSegments} setDisplayedSegments={setDisplayedSegments} />
            {(activeTab === 'Table' || activeTab === 'Grid') && (
                <>
                    <ProportionSelectorDropdown
                        minProportion={minProportion}
                        maxProportion={maxProportion}
                        setMinProportion={setMinProportion}
                        setMaxProportion={setMaxProportion}
                        openDirection={'left'}
                    />
                    <CsvDownloadButton
                        className='mx-1 btn btn-xs'
                        getData={() => getMutationsTableData(data.data.substitutionsOrDeletions)}
                        filename='substitutionsAndDeletions.csv'
                    />
                </>
            )}
            {activeTab === 'Insertions' && (
                <CsvDownloadButton
                    className='mx-1 btn btn-xs'
                    getData={() => getInsertionsTableData(data.data.insertions)}
                    filename='insertions.csv'
                />
            )}
            <Info className='mx-1' content='Info for mutations' />
        </div>
    );

    return (
        <Headline heading={headline}>
            <Tabs tabs={tabs} toolbar={toolbar} />
        </Headline>
    );
};

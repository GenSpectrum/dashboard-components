import { type FunctionComponent } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';

import { MutationsGrid } from './mutations-grid';
import MutationsTable from './mutations-table';
import { type Dataset } from '../../operator/Dataset';
import { type MutationEntry } from '../../operator/FetchMutationsOperator';
import { queryMutations } from '../../query/queryMutations';
import { type LapisFilter, type SequenceType } from '../../types';
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

export type View = 'table' | 'grid';

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
        const fetchedData = await queryMutations(variant, sequenceType, lapis);

        const mutationSegments = fetchedData.content
            .map((mutationEntry) => mutationEntry.mutation.segment)
            .filter((segment): segment is string => segment !== undefined);

        const segments = [...new Set(mutationSegments)];

        return { data: fetchedData, segments };
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

    const bySelectedSegments = (mutationEntry: MutationEntry) => {
        if (mutationEntry.mutation.segment === undefined) {
            return true;
        }
        return displayedSegments.some(
            (displayedSegment) =>
                displayedSegment.segment === mutationEntry.mutation.segment && displayedSegment.checked,
        );
    };

    const byProportion = (mutationEntry: MutationEntry) => {
        if (mutationEntry.type === 'insertion') {
            return true;
        }
        return mutationEntry.proportion >= minProportion && mutationEntry.proportion <= maxProportion;
    };

    const getTab = (view: View, data: Dataset<MutationEntry>) => {
        switch (view) {
            case 'table':
                return { title: 'Table', content: <MutationsTable data={data} /> };
            case 'grid':
                return { title: 'Grid', content: <MutationsGrid data={data} sequenceType={sequenceType} /> };
        }
    };

    const tabs = views.map((view) => {
        return getTab(view, { content: data.data.content.filter(byProportion).filter(bySelectedSegments) });
    });

    const toolbar = (
        <div class='flex flex-row'>
            <ProportionSelectorDropdown
                minProportion={minProportion}
                maxProportion={maxProportion}
                setMinProportion={setMinProportion}
                setMaxProportion={setMaxProportion}
                openDirection={'left'}
            />
            <SegmentSelector displayedSegments={displayedSegments} setDisplayedSegments={setDisplayedSegments} />
            <CsvDownloadButton
                className='mx-1 btn btn-xs'
                getData={() => {
                    return data?.data.content.map((mutationEntry) => {
                        return {
                            type: mutationEntry.type,
                            mutation: mutationEntry.mutation.toString(),
                            count: mutationEntry.count,
                            proportion: mutationEntry.type === 'insertion' ? '' : mutationEntry.proportion,
                        };
                    });
                }}
                filename='mutations.csv'
            />
            <Info className='mx-1' content='Info for mutations' />
        </div>
    );

    return (
        <Headline heading={headline}>
            <Tabs tabs={tabs} toolbar={toolbar} />
        </Headline>
    );
};

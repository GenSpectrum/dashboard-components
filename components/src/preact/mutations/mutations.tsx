import { FunctionComponent } from 'preact';
import { LapisFilter, SequenceType } from '../../types';
import { useQuery } from '../useQuery';
import { queryMutations } from '../../query/queryMutations';
import { useContext, useEffect, useState } from 'preact/hooks';
import { LapisUrlContext } from '../LapisUrlContext';
import Headline from '../components/headline';
import { LoadingDisplay } from '../components/loading-display';
import { ErrorDisplay } from '../components/error-display';
import { NoDataDisplay } from '../components/no-data-display';
import { Dataset } from '../../operator/Dataset';
import { MutationEntry } from '../../operator/FetchMutationsOperator';
import MutationsTable from './mutations-table';
import { MutationsGrid } from './mutations-grid';
import Info from '../components/info';
import Tabs from '../components/tabs';
import { CheckboxSelector } from '../components/checkbox-selector';
import { CsvDownloadButton } from '../components/csv-download-button';
import { ProportionSelectorDropdown } from '../components/proportion-selector-dropdown';

export type View = 'table' | 'grid';

export interface MutationsProps {
    variant: LapisFilter;
    sequenceType: SequenceType;
    views: View[];
}

type DisplayedSegment = {
    segment: string;
    checked: boolean;
};

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

    const getSegmentSelectorLabel = (segments: string[], prefix: string) => {
        const allSegmentsSelected = displayedSegments
            .filter((segment) => segment.checked)
            .map((segment) => segment.segment);

        if (segments.length === allSegmentsSelected.length) {
            return `${prefix}all`;
        }
        if (segments.length === 0) {
            return `${prefix}none`;
        }
        return prefix + allSegmentsSelected.join(', ');
    };

    const segmentSelector = (
        <CheckboxSelector
            items={displayedSegments.map((segment) => ({
                label: segment.segment,
                checked: segment.checked,
            }))}
            label={getSegmentSelectorLabel(data.segments, 'Segments: ')}
            setItems={(items) =>
                setDisplayedSegments(
                    items.map((item, index) => ({
                        segment: displayedSegments[index].segment,
                        checked: item.checked,
                    })),
                )
            }
        />
    );

    const filterBySelectedSegments = (mutationEntries: MutationEntry[]) => {
        return mutationEntries.filter((mutationEntry) => {
            if (mutationEntry.mutation.segment === undefined) {
                return true;
            }
            return displayedSegments.some(
                (displayedSegment) =>
                    displayedSegment.segment === mutationEntry.mutation.segment && displayedSegment.checked,
            );
        });
    };

    const filterByProportion = (mutationEntries: MutationEntry[]) => {
        return mutationEntries.filter((mutationEntry) => {
            if (mutationEntry.type === 'insertion') {
                return true;
            }
            return mutationEntry.proportion >= minProportion && mutationEntry.proportion <= maxProportion;
        });
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
        return getTab(view, { content: filterBySelectedSegments(filterByProportion(data.data.content)) });
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
            {data.segments.length > 0 ? segmentSelector : null}
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

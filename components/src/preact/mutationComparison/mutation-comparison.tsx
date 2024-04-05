import { type FunctionComponent } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';

import { getMutationComparisonTableData } from './getMutationComparisonTableData';
import { MutationComparisonTable } from './mutation-comparison-table';
import { MutationComparisonVenn } from './mutation-comparison-venn';
import { type MutationEntry } from '../../operator/FetchMutationsOperator';
import { queryMutations } from '../../query/queryMutations';
import { type LapisFilter, type SequenceType } from '../../types';
import { LapisUrlContext } from '../LapisUrlContext';
import { CheckboxSelector } from '../components/checkbox-selector';
import { CsvDownloadButton } from '../components/csv-download-button';
import { ErrorDisplay } from '../components/error-display';
import Headline from '../components/headline';
import Info from '../components/info';
import { LoadingDisplay } from '../components/loading-display';
import { NoDataDisplay } from '../components/no-data-display';
import Tabs from '../components/tabs';
import { useQuery } from '../useQuery';

export type View = 'table' | 'venn';

export interface MutationComparisonVariant {
    lapisFilter: LapisFilter;
    displayName: string;
}

export interface MutationComparisonProps {
    variants: MutationComparisonVariant[];
    sequenceType: SequenceType;
    views: View[];
}

type DisplayedSegment = {
    segment: string;
    checked: boolean;
};

export type MutationData = {
    displayName: string;
    data: MutationEntry[];
};

export const MutationComparison: FunctionComponent<MutationComparisonProps> = ({ variants, sequenceType, views }) => {
    const lapis = useContext(LapisUrlContext);

    const { data, error, isLoading } = useQuery(async () => {
        const mutationData = await Promise.all(
            variants.map(async (variant) => {
                return {
                    displayName: variant.displayName,
                    content: (await queryMutations(variant.lapisFilter, sequenceType, lapis)).content,
                };
            }),
        );

        const mutationSegments = mutationData[0].content
            .map((mutationEntry) => mutationEntry.mutation.segment)
            .filter((segment): segment is string => segment !== undefined);

        const segments = [...new Set(mutationSegments)];
        return { mutationData, segments };
    }, [variants, sequenceType, lapis]);

    const headline = 'Mutation comparison';

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

    const filteredData = data.mutationData.map((mutationEntry) => {
        return {
            displayName: mutationEntry.displayName,
            data: mutationEntry.content.filter((mutationEntry) => {
                if (mutationEntry.mutation.segment === undefined) {
                    return true;
                }
                return displayedSegments.some(
                    (displayedSegment) =>
                        displayedSegment.segment === mutationEntry.mutation.segment && displayedSegment.checked,
                );
            }),
        };
    });

    const getTab = (view: View) => {
        switch (view) {
            case 'table':
                return {
                    title: 'Table',
                    content: <MutationComparisonTable data={{ content: filteredData }} />,
                };
            case 'venn':
                return {
                    title: 'Venn',
                    content: <MutationComparisonVenn data={{ content: filteredData }} />,
                };
        }
    };

    const tabs = views.map((view) => getTab(view));

    const toolbar = (
        <div class='flex flex-row'>
            {data.segments.length > 0 ? segmentSelector : null}
            <CsvDownloadButton
                className='mx-1 btn btn-xs'
                getData={() => getMutationComparisonTableData({ content: filteredData })}
                filename='mutation_comparison.csv'
            />
            <Info className='mx-1' content='Info for mutation comparison' />
        </div>
    );

    return (
        <Headline heading={headline}>
            <Tabs tabs={tabs} toolbar={toolbar} />
        </Headline>
    );
};

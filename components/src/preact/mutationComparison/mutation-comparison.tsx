import { type FunctionComponent } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';

import { getMutationComparisonTableData } from './getMutationComparisonTableData';
import { MutationComparisonTable } from './mutation-comparison-table';
import { MutationComparisonVenn } from './mutation-comparison-venn';
import { type MutationEntry, type SubstitutionOrDeletion } from '../../operator/FetchMutationsOperator';
import { queryMutations } from '../../query/queryMutations';
import { type LapisFilter, type SequenceType } from '../../types';
import { LapisUrlContext } from '../LapisUrlContext';
import { type DisplayedSegment, SegmentSelector } from '../components/SegmentSelector';
import { type CheckboxItem, CheckboxSelector } from '../components/checkbox-selector';
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

export type MutationData = {
    displayName: string;
    data: MutationEntry[];
};

type DisplayedMutationType = CheckboxItem & {
    type: SubstitutionOrDeletion;
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

    const [displayedMutationTypes, setDisplayedMutationTypes] = useState<DisplayedMutationType[]>([
        { label: 'Substitutions', checked: true, type: 'substitution' },
        { label: 'Deletions', checked: true, type: 'deletion' },
    ]);
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

    const byDisplayedSegments = (mutationEntry: MutationEntry) => {
        if (mutationEntry.mutation.segment === undefined) {
            return true;
        }
        return displayedSegments.some(
            (displayedSegment) =>
                displayedSegment.segment === mutationEntry.mutation.segment && displayedSegment.checked,
        );
    };
    const byDisplayedMutationTypes = (mutationEntry: MutationEntry) => {
        return displayedMutationTypes.some(
            (displayedMutationType) =>
                displayedMutationType.checked && displayedMutationType.type === mutationEntry.type,
        );
    };
    const filteredData = data.mutationData.map((mutationEntry) => {
        return {
            displayName: mutationEntry.displayName,
            data: mutationEntry.content.filter(byDisplayedSegments).filter(byDisplayedMutationTypes),
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

    const checkedLabels = displayedMutationTypes.filter((type) => type.checked).map((type) => type.label);
    const mutationTypesSelectorLabel = `Types: ${checkedLabels.length > 0 ? checkedLabels.join(', ') : 'None'}`;

    const toolbar = (
        <div class='flex flex-row'>
            <SegmentSelector displayedSegments={displayedSegments} setDisplayedSegments={setDisplayedSegments} />
            <CheckboxSelector
                className='mx-1'
                items={displayedMutationTypes}
                label={mutationTypesSelectorLabel}
                setItems={(items) => setDisplayedMutationTypes(items)}
            />
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

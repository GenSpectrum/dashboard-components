import { type FunctionComponent } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';

import { getMutationComparisonTableData } from './getMutationComparisonTableData';
import { MutationComparisonTable } from './mutation-comparison-table';
import { MutationComparisonVenn } from './mutation-comparison-venn';
import { filterMutationData, type MutationData, queryMutationData } from './queryMutationData';
import { type LapisFilter, type SequenceType, type SubstitutionOrDeletion } from '../../types';
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

export type DisplayedMutationType = CheckboxItem & {
    type: SubstitutionOrDeletion;
};

export const MutationComparison: FunctionComponent<MutationComparisonProps> = ({ variants, sequenceType, views }) => {
    const lapis = useContext(LapisUrlContext);

    const { data, error, isLoading } = useQuery(async () => {
        return queryMutationData(variants, sequenceType, lapis);
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

    return (
        <Headline heading={headline}>
            <MutationComparisonTabs
                displayedSegments={displayedSegments}
                setDisplayedSegments={setDisplayedSegments}
                displayedMutationTypes={displayedMutationTypes}
                setDisplayedMutationTypes={setDisplayedMutationTypes}
                data={data.mutationData}
                views={views}
            />
        </Headline>
    );
};

type MutationComparisonTabsProps = {
    displayedSegments: DisplayedSegment[];
    setDisplayedSegments: (segments: DisplayedSegment[]) => void;
    displayedMutationTypes: DisplayedMutationType[];
    setDisplayedMutationTypes: (types: DisplayedMutationType[]) => void;
    data: MutationData[];
    views: View[];
};

const MutationComparisonTabs: FunctionComponent<MutationComparisonTabsProps> = ({
    displayedSegments,
    setDisplayedSegments,
    displayedMutationTypes,
    setDisplayedMutationTypes,
    data,
    views,
}) => {
    const filteredData = filterMutationData(data, displayedSegments, displayedMutationTypes);

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
};

const Toolbar: FunctionComponent<ToolbarProps> = ({
    displayedSegments,
    setDisplayedSegments,
    displayedMutationTypes,
    setDisplayedMutationTypes,
    filteredData,
}) => {
    const checkedLabels = displayedMutationTypes.filter((type) => type.checked).map((type) => type.label);
    const mutationTypesSelectorLabel = `Types: ${checkedLabels.length > 0 ? checkedLabels.join(', ') : 'None'}`;

    return (
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
};

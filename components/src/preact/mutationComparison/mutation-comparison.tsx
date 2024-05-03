import { type FunctionComponent } from 'preact';
import { type Dispatch, type StateUpdater, useContext, useMemo, useState } from 'preact/hooks';

import { getMutationComparisonTableData } from './getMutationComparisonTableData';
import { MutationComparisonTable } from './mutation-comparison-table';
import { MutationComparisonVenn } from './mutation-comparison-venn';
import { filterMutationData, type MutationData, queryMutationData } from './queryMutationData';
import { type LapisFilter, type SequenceType } from '../../types';
import { LapisUrlContext } from '../LapisUrlContext';
import { type DisplayedSegment, SegmentSelector, useDisplayedSegments } from '../components/SegmentSelector';
import { CsvDownloadButton } from '../components/csv-download-button';
import { ErrorDisplay } from '../components/error-display';
import Headline from '../components/headline';
import Info from '../components/info';
import { LoadingDisplay } from '../components/loading-display';
import { type DisplayedMutationType, MutationTypeSelector } from '../components/mutation-type-selector';
import { NoDataDisplay } from '../components/no-data-display';
import { type ProportionInterval } from '../components/proportion-selector';
import { ProportionSelectorDropdown } from '../components/proportion-selector-dropdown';
import { ResizeContainer, type Size } from '../components/resize-container';
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
    size?: Size;
}

export const MutationComparison: FunctionComponent<MutationComparisonProps> = ({
    variants,
    sequenceType,
    views,
    size,
}) => {
    const lapis = useContext(LapisUrlContext);

    const { data, error, isLoading } = useQuery(async () => {
        return queryMutationData(variants, sequenceType, lapis);
    }, [variants, sequenceType, lapis]);

    const headline = 'Mutation comparison';

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
        <ResizeContainer size={size} defaultSize={{ height: '700px', width: '100%' }}>
            <Headline heading={headline}>
                <MutationComparisonTabs data={data.mutationData} sequenceType={sequenceType} views={views} />
            </Headline>
        </ResizeContainer>
    );
};

type MutationComparisonTabsProps = {
    data: MutationData[];
    views: View[];
    sequenceType: SequenceType;
};

const MutationComparisonTabs: FunctionComponent<MutationComparisonTabsProps> = ({ data, views, sequenceType }) => {
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
        <div class='flex flex-row'>
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
            <Info className='mx-1' content='Info for mutation comparison' />
        </div>
    );
};

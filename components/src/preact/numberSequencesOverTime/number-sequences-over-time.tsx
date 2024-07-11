import { useContext } from 'preact/hooks';

import { NumberSequencesOverTimeBarChart } from './number-sequences-over-time-bar-chart';
import { NumberSequencesOverTimeTable } from './number-sequences-over-time-table';
import {
    type NumberOfSequencesDatasets,
    queryNumberOfSequencesOverTime,
} from '../../query/queryNumberOfSequencesOverTime';
import type { NamedLapisFilter, TemporalGranularity } from '../../types';
import { LapisUrlContext } from '../LapisUrlContext';
import { ErrorBoundary } from '../components/error-boundary';
import { ErrorDisplay } from '../components/error-display';
import Headline from '../components/headline';
import { LoadingDisplay } from '../components/loading-display';
import { NoDataDisplay } from '../components/no-data-display';
import { ResizeContainer } from '../components/resize-container';
import Tabs from '../components/tabs';
import { useQuery } from '../useQuery';

type NumberSequencesOverTimeView = 'bar' | 'line' | 'table';

export interface NumberSequencesOverTimeProps extends NumberSequencesOverTimeInnerProps {
    width: string;
    height: string;
    headline: string;
}

interface NumberSequencesOverTimeInnerProps {
    lapisFilter: NamedLapisFilter | NamedLapisFilter[];
    lapisDateField: string;
    views: NumberSequencesOverTimeView[];
    granularity: TemporalGranularity;
    smoothingWindow: number;
    pageSize: boolean | number;
}

export const NumberSequencesOverTime = ({ width, height, headline, ...innerProps }: NumberSequencesOverTimeProps) => {
    const size = { height, width };

    return (
        <ErrorBoundary size={size} headline={headline}>
            <ResizeContainer size={size}>
                <Headline heading={headline}>
                    <NumberSequencesOverTimeInner {...innerProps} />
                </Headline>
            </ResizeContainer>
        </ErrorBoundary>
    );
};

const NumberSequencesOverTimeInner = ({
    lapisFilter,
    granularity,
    smoothingWindow,
    lapisDateField,
    views,
    pageSize,
}: NumberSequencesOverTimeInnerProps) => {
    const lapis = useContext(LapisUrlContext);

    const { data, error, isLoading } = useQuery(() =>
        queryNumberOfSequencesOverTime(lapis, lapisFilter, lapisDateField, granularity, smoothingWindow),
    );

    if (isLoading) {
        return <LoadingDisplay />;
    }

    if (error !== null) {
        return <ErrorDisplay error={error} />;
    }

    if (data === null) {
        return <NoDataDisplay />;
    }

    return <NumberSequencesOverTimeTabs views={views} data={data} granularity={granularity} pageSize={pageSize} />;
};

interface NumberSequencesOverTimeTabsProps {
    views: NumberSequencesOverTimeView[];
    data: NumberOfSequencesDatasets;
    granularity: TemporalGranularity;
    pageSize: boolean | number;
}

const NumberSequencesOverTimeTabs = ({ views, data, granularity, pageSize }: NumberSequencesOverTimeTabsProps) => {
    const getTab = (view: NumberSequencesOverTimeView) => {
        switch (view) {
            case 'bar':
                return { title: 'Bar', content: <NumberSequencesOverTimeBarChart data={data} /> };
            case 'line':
                return { title: 'Line', content: <div>not implemented, TODO #317</div> };
            case 'table':
                return {
                    title: 'Table',
                    content: <NumberSequencesOverTimeTable data={data} granularity={granularity} pageSize={pageSize} />,
                };
            default:
                throw new Error(`Unknown view: ${view}`);
        }
    };

    return <Tabs tabs={views.map((view) => getTab(view))} />;
};

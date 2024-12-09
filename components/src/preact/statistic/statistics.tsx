import { type FunctionComponent } from 'preact';
import { useContext } from 'preact/hooks';

import { queryGeneralStatistics } from '../../query/queryGeneralStatistics';
import { type LapisFilter } from '../../types';
import { LapisUrlContext } from '../LapisUrlContext';
import { ErrorBoundary } from '../components/error-boundary';
import { LoadingDisplay } from '../components/loading-display';
import { NoDataDisplay } from '../components/no-data-display';
import { ResizeContainer } from '../components/resize-container';
import { formatProportion } from '../shared/table/formatProportion';
import { useQuery } from '../useQuery';

export type StatisticsProps = {
    width: string;
    height: string;
    numeratorFilter: LapisFilter;
    denominatorFilter: LapisFilter;
};

export const Statistics: FunctionComponent<StatisticsProps> = (componentProps) => {
    const { width, height } = componentProps;
    const size = { height, width };

    return (
        <ErrorBoundary size={size}>
            <ResizeContainer size={size}>
                <StatisticsInner {...componentProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

export const StatisticsInner: FunctionComponent<StatisticsProps> = (componentProps) => {
    const { numeratorFilter, denominatorFilter } = componentProps;
    const lapis = useContext(LapisUrlContext);

    const { data, error, isLoading } = useQuery(async () => {
        return queryGeneralStatistics(numeratorFilter, denominatorFilter, lapis);
    }, [numeratorFilter, denominatorFilter, lapis]);

    if (isLoading) {
        return <LoadingDisplay />;
    }

    if (error !== null) {
        throw error;
    }

    if (data === null) {
        return <NoDataDisplay />;
    }

    return <MetricDataTabs data={data} />;
};

type MetricDataTabsProps = {
    data: { count: number; proportion: number };
};

const MetricDataTabs: FunctionComponent<MetricDataTabsProps> = ({ data }) => {
    const { count, proportion } = data;
    return (
        <div className='flex flex-col sm:flex-row rounded-md border-2 border-gray-100'>
            <div className='stat'>
                <div className='stat-title'>Sequences</div>
                <div className='stat-value text-2xl sm:text-4xl'>{count.toLocaleString('en-us')}</div>
                <div className='stat-desc'>The total number of sequenced samples</div>
            </div>

            <div className='stat'>
                <div className='stat-title'>Overall proportion</div>
                <div className='stat-value text-2xl sm:text-4xl'>{formatProportion(proportion)}</div>
                <div className='stat-desc'>The proportion among all sequenced samples</div>
            </div>
        </div>
    );
};
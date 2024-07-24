import { useContext, useState } from 'preact/hooks';

import { getNumberOfSequencesOverTimeTableData } from './getNumberOfSequencesOverTimeTableData';
import { NumberSequencesOverTimeBarChart } from './number-sequences-over-time-bar-chart';
import { NumberSequencesOverTimeLineChart } from './number-sequences-over-time-line-chart';
import { NumberSequencesOverTimeTable } from './number-sequences-over-time-table';
import {
    type NumberOfSequencesDatasets,
    queryNumberOfSequencesOverTime,
} from '../../query/queryNumberOfSequencesOverTime';
import type { NamedLapisFilter, TemporalGranularity } from '../../types';
import { LapisUrlContext } from '../LapisUrlContext';
import { CsvDownloadButton } from '../components/csv-download-button';
import { ErrorBoundary } from '../components/error-boundary';
import { ErrorDisplay } from '../components/error-display';
import Info, { InfoHeadline1, InfoParagraph } from '../components/info';
import { LoadingDisplay } from '../components/loading-display';
import { NoDataDisplay } from '../components/no-data-display';
import { ResizeContainer } from '../components/resize-container';
import { ScalingSelector } from '../components/scaling-selector';
import Tabs from '../components/tabs';
import type { ScaleType } from '../shared/charts/getYAxisScale';
import { useQuery } from '../useQuery';

type NumberSequencesOverTimeView = 'bar' | 'line' | 'table';

export interface NumberSequencesOverTimeProps extends NumberSequencesOverTimeInnerProps {
    width: string;
    height: string;
}

interface NumberSequencesOverTimeInnerProps {
    lapisFilter: NamedLapisFilter | NamedLapisFilter[];
    lapisDateField: string;
    views: NumberSequencesOverTimeView[];
    granularity: TemporalGranularity;
    smoothingWindow: number;
    pageSize: boolean | number;
}

export const NumberSequencesOverTime = ({ width, height, ...innerProps }: NumberSequencesOverTimeProps) => {
    const size = { height, width };

    return (
        <ErrorBoundary size={size}>
            <ResizeContainer size={size}>
                <NumberSequencesOverTimeInner {...innerProps} />
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
    const [yAxisScaleType, setYAxisScaleType] = useState<ScaleType>('linear');

    const getTab = (view: NumberSequencesOverTimeView) => {
        switch (view) {
            case 'bar':
                return {
                    title: 'Bar',
                    content: <NumberSequencesOverTimeBarChart data={data} yAxisScaleType={yAxisScaleType} />,
                };
            case 'line':
                return {
                    title: 'Line',
                    content: <NumberSequencesOverTimeLineChart data={data} yAxisScaleType={yAxisScaleType} />,
                };
            case 'table':
                return {
                    title: 'Table',
                    content: <NumberSequencesOverTimeTable data={data} granularity={granularity} pageSize={pageSize} />,
                };
            default:
                throw new Error(`Unknown view: ${view}`);
        }
    };

    return (
        <Tabs
            tabs={views.map((view) => getTab(view))}
            toolbar={(activeTab) => (
                <Toolbar
                    activeTab={activeTab}
                    data={data}
                    granularity={granularity}
                    yAxisScaleType={yAxisScaleType}
                    setYAxisScaleType={setYAxisScaleType}
                />
            )}
        />
    );
};

interface ToolbarProps {
    activeTab: string;
    data: NumberOfSequencesDatasets;
    granularity: TemporalGranularity;
    yAxisScaleType: ScaleType;
    setYAxisScaleType: (scaleType: ScaleType) => void;
}

const Toolbar = ({ activeTab, data, granularity, yAxisScaleType, setYAxisScaleType }: ToolbarProps) => {
    return (
        <>
            {activeTab !== 'Table' && (
                <ScalingSelector
                    yAxisScaleType={yAxisScaleType}
                    setYAxisScaleType={setYAxisScaleType}
                    enabledTypes={['linear', 'logarithmic']}
                />
            )}
            <CsvDownloadButton
                className='mx-1 btn btn-xs'
                getData={() => getNumberOfSequencesOverTimeTableData(data, granularity)}
                filename='number_of_sequences_over_time.csv'
            />
            <NumberSequencesOverTimeInfo />
        </>
    );
};

const NumberSequencesOverTimeInfo = () => (
    <Info>
        <InfoHeadline1>Number of sequences over time</InfoHeadline1>
        <InfoParagraph>
            <a href='https://github.com/GenSpectrum/dashboard-components/issues/315'>TODO</a>
        </InfoParagraph>
    </Info>
);

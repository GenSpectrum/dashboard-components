import { type FunctionComponent } from 'preact';
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
import { Fullscreen } from '../components/fullscreen';
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

    const { data, error, isLoading } = useQuery(
        () => queryNumberOfSequencesOverTime(lapis, lapisFilter, lapisDateField, granularity, smoothingWindow),
        [lapis, lapisFilter, lapisDateField, granularity, smoothingWindow],
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

    return (
        <NumberSequencesOverTimeTabs
            views={views}
            data={data}
            granularity={granularity}
            smoothingWindow={smoothingWindow}
            pageSize={pageSize}
        />
    );
};

interface NumberSequencesOverTimeTabsProps {
    views: NumberSequencesOverTimeView[];
    data: NumberOfSequencesDatasets;
    granularity: TemporalGranularity;
    smoothingWindow: number;
    pageSize: boolean | number;
}

const NumberSequencesOverTimeTabs = ({
    views,
    data,
    granularity,
    smoothingWindow,
    pageSize,
}: NumberSequencesOverTimeTabsProps) => {
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
                    smoothingWindow={smoothingWindow}
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
    smoothingWindow: number;
}

const Toolbar = ({
    activeTab,
    data,
    granularity,
    yAxisScaleType,
    setYAxisScaleType,
    smoothingWindow,
}: ToolbarProps) => {
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
            <NumberSequencesOverTimeInfo granularity={granularity} smoothingWindow={smoothingWindow} />
            <Fullscreen />
        </>
    );
};

type NumberSequencesOverTimeInfoProps = {
    granularity: TemporalGranularity;
    smoothingWindow: number;
};

const NumberSequencesOverTimeInfo: FunctionComponent<NumberSequencesOverTimeInfoProps> = ({
    granularity,
    smoothingWindow,
}) => (
    <Info>
        <InfoHeadline1>Number of sequences over time</InfoHeadline1>
        <InfoParagraph>
            This presents the number of available sequences of a variant per <b>{granularity}</b>
            {smoothingWindow > 0 && `, smoothed using a ${smoothingWindow}-${granularity} sliding window`}.
        </InfoParagraph>
    </Info>
);

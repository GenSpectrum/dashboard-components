import { type FunctionComponent } from 'preact';
import { useContext, useState } from 'preact/hooks';

import { getPrevalenceOverTimeTableData } from './getPrevalenceOverTimeTableData';
import PrevalenceOverTimeBarChart from './prevalence-over-time-bar-chart';
import PrevalenceOverTimeBubbleChart from './prevalence-over-time-bubble-chart';
import PrevalenceOverTimeLineChart from './prevalence-over-time-line-chart';
import PrevalenceOverTimeTable from './prevalence-over-time-table';
import { type PrevalenceOverTimeData, queryPrevalenceOverTime } from '../../query/queryPrevalenceOverTime';
import { type LapisFilter, type NamedLapisFilter, type TemporalGranularity } from '../../types';
import { LapisUrlContext } from '../LapisUrlContext';
import { ConfidenceIntervalSelector } from '../components/confidence-interval-selector';
import { CsvDownloadButton } from '../components/csv-download-button';
import { ErrorBoundary } from '../components/error-boundary';
import { ErrorDisplay } from '../components/error-display';
import Headline from '../components/headline';
import Info, { InfoHeadline1, InfoParagraph } from '../components/info';
import { LoadingDisplay } from '../components/loading-display';
import { NoDataDisplay } from '../components/no-data-display';
import { ResizeContainer } from '../components/resize-container';
import { ScalingSelector } from '../components/scaling-selector';
import Tabs from '../components/tabs';
import { type ConfidenceIntervalMethod } from '../shared/charts/confideceInterval';
import type { YAxisMaxConfig } from '../shared/charts/getYAxisMax';
import { type ScaleType } from '../shared/charts/getYAxisScale';
import { useQuery } from '../useQuery';

export type View = 'bar' | 'line' | 'bubble' | 'table';

export interface PrevalenceOverTimeProps extends PrevalenceOverTimeInnerProps {
    width: string;
    height: string;
    headline?: string;
}

export interface PrevalenceOverTimeInnerProps {
    numeratorFilter: NamedLapisFilter | NamedLapisFilter[];
    denominatorFilter: LapisFilter;
    granularity: TemporalGranularity;
    smoothingWindow: number;
    views: View[];
    confidenceIntervalMethods: ConfidenceIntervalMethod[];
    lapisDateField: string;
    pageSize: boolean | number;
    yAxisMaxConfig: YAxisMaxConfig;
}

export const PrevalenceOverTime: FunctionComponent<PrevalenceOverTimeProps> = ({
    width,
    height,
    headline = 'Prevalence over time',
    ...innerProps
}) => {
    const size = { height, width };

    return (
        <ErrorBoundary size={size} headline={headline}>
            <ResizeContainer size={size}>
                <Headline heading={headline}>
                    <PrevalenceOverTimeInner {...innerProps} />
                </Headline>
            </ResizeContainer>
        </ErrorBoundary>
    );
};

export const PrevalenceOverTimeInner: FunctionComponent<PrevalenceOverTimeInnerProps> = ({
    numeratorFilter,
    denominatorFilter,
    granularity,
    smoothingWindow,
    views,
    confidenceIntervalMethods,
    lapisDateField,
    pageSize,
    yAxisMaxConfig,
}) => {
    const lapis = useContext(LapisUrlContext);

    const { data, error, isLoading } = useQuery(
        () =>
            queryPrevalenceOverTime(
                numeratorFilter,
                denominatorFilter,
                granularity,
                smoothingWindow,
                lapis,
                lapisDateField,
            ),
        [lapis, numeratorFilter, denominatorFilter, granularity, smoothingWindow],
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
        <PrevalenceOverTimeTabs
            views={views}
            data={data}
            granularity={granularity}
            confidenceIntervalMethods={confidenceIntervalMethods}
            pageSize={pageSize}
            yAxisMaxConfig={yAxisMaxConfig}
        />
    );
};

type PrevalenceOverTimeTabsProps = {
    views: View[];
    data: PrevalenceOverTimeData;
    granularity: TemporalGranularity;
    confidenceIntervalMethods: ConfidenceIntervalMethod[];
    pageSize: boolean | number;
    yAxisMaxConfig: YAxisMaxConfig;
};

const PrevalenceOverTimeTabs: FunctionComponent<PrevalenceOverTimeTabsProps> = ({
    views,
    data,
    granularity,
    confidenceIntervalMethods,
    pageSize,
    yAxisMaxConfig,
}) => {
    const [yAxisScaleType, setYAxisScaleType] = useState<ScaleType>('linear');
    const [confidenceIntervalMethod, setConfidenceIntervalMethod] = useState<ConfidenceIntervalMethod>(
        confidenceIntervalMethods.length > 0 ? confidenceIntervalMethods[0] : 'none',
    );

    const getTab = (view: View) => {
        switch (view) {
            case 'bar':
                return {
                    title: 'Bar',
                    content: (
                        <PrevalenceOverTimeBarChart
                            data={data}
                            yAxisScaleType={yAxisScaleType}
                            confidenceIntervalMethod={confidenceIntervalMethod}
                            yAxisMaxConfig={yAxisMaxConfig}
                        />
                    ),
                };
            case 'line':
                return {
                    title: 'Line',
                    content: (
                        <PrevalenceOverTimeLineChart
                            data={data}
                            yAxisScaleType={yAxisScaleType}
                            confidenceIntervalMethod={confidenceIntervalMethod}
                            yAxisMaxConfig={yAxisMaxConfig}
                        />
                    ),
                };
            case 'bubble':
                return {
                    title: 'Bubble',
                    content: (
                        <PrevalenceOverTimeBubbleChart
                            data={data}
                            yAxisScaleType={yAxisScaleType}
                            yAxisMaxConfig={yAxisMaxConfig}
                        />
                    ),
                };
            case 'table':
                return {
                    title: 'Table',
                    content: <PrevalenceOverTimeTable data={data} granularity={granularity} pageSize={pageSize} />,
                };
        }
    };

    const tabs = views.map((view) => getTab(view));

    const toolbar = (activeTab: string) => (
        <Toolbar
            activeTab={activeTab}
            yAxisScaleType={yAxisScaleType}
            setYAxisScaleType={setYAxisScaleType}
            data={data}
            granularity={granularity}
            confidenceIntervalMethods={confidenceIntervalMethods}
            confidenceIntervalMethod={confidenceIntervalMethod}
            setConfidenceIntervalMethod={setConfidenceIntervalMethod}
        />
    );

    return <Tabs tabs={tabs} toolbar={toolbar} />;
};

type ToolbarProps = {
    activeTab: string;
    data: PrevalenceOverTimeData;
    granularity: TemporalGranularity;
    yAxisScaleType: ScaleType;
    setYAxisScaleType: (scaleType: ScaleType) => void;
    confidenceIntervalMethods: ConfidenceIntervalMethod[];
    confidenceIntervalMethod: ConfidenceIntervalMethod;
    setConfidenceIntervalMethod: (confidenceIntervalMethod: ConfidenceIntervalMethod) => void;
};

const Toolbar: FunctionComponent<ToolbarProps> = ({
    activeTab,
    yAxisScaleType,
    setYAxisScaleType,
    confidenceIntervalMethods,
    confidenceIntervalMethod,
    setConfidenceIntervalMethod,
    data,
    granularity,
}) => {
    return (
        <>
            {activeTab !== 'Table' && (
                <ScalingSelector yAxisScaleType={yAxisScaleType} setYAxisScaleType={setYAxisScaleType} />
            )}
            {(activeTab === 'Bar' || activeTab === 'Line') && (
                <ConfidenceIntervalSelector
                    confidenceIntervalMethods={confidenceIntervalMethods}
                    confidenceIntervalMethod={confidenceIntervalMethod}
                    setConfidenceIntervalMethod={setConfidenceIntervalMethod}
                />
            )}
            <CsvDownloadButton
                className='mx-1 btn btn-xs'
                getData={() => getPrevalenceOverTimeTableData(data, granularity)}
                filename='prevalence_over_time.csv'
            />

            <PrevalenceOverTimeInfo />
        </>
    );
};

const PrevalenceOverTimeInfo: FunctionComponent = () => {
    return (
        <Info height={'100px'}>
            <InfoHeadline1>Prevalence over time</InfoHeadline1>
            <InfoParagraph>Prevalence over time info.</InfoParagraph>
        </Info>
    );
};

export const maxInData = (data: PrevalenceOverTimeData) =>
    Math.max(...data.flatMap((variant) => variant.content.map((dataPoint) => dataPoint.prevalence)));

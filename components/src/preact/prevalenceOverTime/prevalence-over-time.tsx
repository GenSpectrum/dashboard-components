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
import { Fullscreen } from '../components/fullscreen';
import Info, { InfoComponentCode, InfoHeadline1, InfoHeadline2, InfoParagraph } from '../components/info';
import { LoadingDisplay } from '../components/loading-display';
import { NoDataDisplay } from '../components/no-data-display';
import { ResizeContainer } from '../components/resize-container';
import { ScalingSelector } from '../components/scaling-selector';
import Tabs from '../components/tabs';
import { type ConfidenceIntervalMethod } from '../shared/charts/confideceInterval';
import { type AxisMax } from '../shared/charts/getYAxisMax';
import { type ScaleType } from '../shared/charts/getYAxisScale';
import { useQuery } from '../useQuery';

export type View = 'bar' | 'line' | 'bubble' | 'table';

export interface PrevalenceOverTimeProps {
    width: string;
    height: string;
    numeratorFilter: NamedLapisFilter | NamedLapisFilter[];
    denominatorFilter: LapisFilter;
    granularity: TemporalGranularity;
    smoothingWindow: number;
    views: View[];
    confidenceIntervalMethods: ConfidenceIntervalMethod[];
    lapisDateField: string;
    pageSize: boolean | number;
    yAxisMaxLinear?: AxisMax;
    yAxisMaxLogarithmic?: AxisMax;
}

export const PrevalenceOverTime: FunctionComponent<PrevalenceOverTimeProps> = (componentProps) => {
    const { width, height } = componentProps;
    const size = { height, width };

    return (
        <ErrorBoundary size={size}>
            <ResizeContainer size={size}>
                <PrevalenceOverTimeInner {...componentProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

export const PrevalenceOverTimeInner: FunctionComponent<PrevalenceOverTimeProps> = (componentProps) => {
    const { numeratorFilter, denominatorFilter, granularity, smoothingWindow, lapisDateField } = componentProps;
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

    return <PrevalenceOverTimeTabs data={data} {...componentProps} />;
};

type PrevalenceOverTimeTabsProps = PrevalenceOverTimeProps & {
    data: PrevalenceOverTimeData;
};

const PrevalenceOverTimeTabs: FunctionComponent<PrevalenceOverTimeTabsProps> = ({ data, ...componentProps }) => {
    const { views, granularity, confidenceIntervalMethods, pageSize, yAxisMaxLinear, yAxisMaxLogarithmic } =
        componentProps;
    const [yAxisScaleType, setYAxisScaleType] = useState<ScaleType>('linear');
    const [confidenceIntervalMethod, setConfidenceIntervalMethod] = useState<ConfidenceIntervalMethod>(
        confidenceIntervalMethods.length > 0 ? confidenceIntervalMethods[0] : 'none',
    );
    const yAxisMaxConfig = { linear: yAxisMaxLinear, logarithmic: yAxisMaxLogarithmic };

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
            confidenceIntervalMethod={confidenceIntervalMethod}
            setConfidenceIntervalMethod={setConfidenceIntervalMethod}
            {...componentProps}
        />
    );

    return <Tabs tabs={tabs} toolbar={toolbar} />;
};

type ToolbarProps = PrevalenceOverTimeProps & {
    activeTab: string;
    data: PrevalenceOverTimeData;
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
    confidenceIntervalMethod,
    setConfidenceIntervalMethod,
    data,
    ...componentProps
}) => {
    const { confidenceIntervalMethods, granularity } = componentProps;
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

            <PrevalenceOverTimeInfo {...componentProps} />
            <Fullscreen />
        </>
    );
};

const PrevalenceOverTimeInfo: FunctionComponent<PrevalenceOverTimeProps> = (componentProps) => {
    const { granularity, smoothingWindow, views } = componentProps;
    const lapis = useContext(LapisUrlContext);
    return (
        <Info>
            <InfoHeadline1>Prevalence over time</InfoHeadline1>
            <InfoParagraph>
                This presents the proportion of one or more variants per <b>{granularity}</b>
                {smoothingWindow > 0 && `, smoothed using a ${smoothingWindow}-${granularity} sliding window`}. The
                proportion is calculated as the number of sequences of the variant(s) divided by the number of sequences
                that match the <code>denominatorFilter</code> (see below).
            </InfoParagraph>
            <InfoParagraph>
                Sequences that have no assigned date will not be shown in the line and bubble chart. They will show up
                in the bar and table view with date "unknown".
            </InfoParagraph>
            {views.includes('bubble') && (
                <>
                    <InfoHeadline2>Bubble chart</InfoHeadline2>
                    <InfoParagraph>
                        The size of the bubble scales with the total number of available sequences from the{' '}
                        {granularity}.
                    </InfoParagraph>
                </>
            )}
            <InfoComponentCode componentName='prevalence-over-time' params={componentProps} lapisUrl={lapis} />
        </Info>
    );
};

export const maxInData = (data: PrevalenceOverTimeData) =>
    Math.max(...data.flatMap((variant) => variant.content.map((dataPoint) => dataPoint.prevalence)));

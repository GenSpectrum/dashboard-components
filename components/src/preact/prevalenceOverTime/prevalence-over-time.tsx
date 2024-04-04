import { useContext, useState } from 'preact/hooks';
import { queryPrevalenceOverTime } from '../../query/queryPrevalenceOverTime';
import PrevalenceOverTimeLineBarChart from './prevalence-over-time-line-bar-chart';
import PrevalenceOverTimeBubbleChart from './prevalence-over-time-bubble-chart';
import PrevalenceOverTimeTable from './prevalence-over-time-table';
import { NamedLapisFilter, TemporalGranularity } from '../../types';
import { LapisUrlContext } from '../LapisUrlContext';
import { ScaleType } from '../shared/charts/getYAxisScale';
import Headline from '../components/headline';
import Tabs from '../components/tabs';
import { useQuery } from '../useQuery';
import Info from '../components/info';
import { ScalingSelector } from '../components/scaling-selector';
import { FunctionComponent } from 'preact';
import { ErrorDisplay } from '../components/error-display';
import { LoadingDisplay } from '../components/loading-display';
import { NoDataDisplay } from '../components/no-data-display';
import { CsvDownloadButton } from '../components/csv-download-button';
import { getPrevalenceOverTimeTableData } from './getPrevalenceOverTimeTableData';

export type View = 'bar' | 'line' | 'bubble' | 'table';

export interface PrevalenceOverTimeProps {
    numerator: NamedLapisFilter | NamedLapisFilter[];
    denominator: NamedLapisFilter;
    granularity: TemporalGranularity;
    smoothingWindow: number;
    views: View[];
}

export const PrevalenceOverTime: FunctionComponent<PrevalenceOverTimeProps> = ({
    numerator,
    denominator,
    granularity,
    smoothingWindow,
    views,
}) => {
    const lapis = useContext(LapisUrlContext);
    const [yAxisScaleType, setYAxisScaleType] = useState<ScaleType>('linear');

    const { data, error, isLoading } = useQuery(
        () => queryPrevalenceOverTime(numerator, denominator, granularity, smoothingWindow, lapis),
        [lapis, numerator, denominator, granularity, smoothingWindow],
    );

    const headline = 'Prevalence over time';

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

    const getTab = (view: View) => {
        switch (view) {
            case 'bar':
                return {
                    title: 'Bar',
                    content: <PrevalenceOverTimeLineBarChart data={data} type={view} yAxisScaleType={yAxisScaleType} />,
                };
            case 'line':
                return {
                    title: 'Line',
                    content: <PrevalenceOverTimeLineBarChart data={data} type={view} yAxisScaleType={yAxisScaleType} />,
                };
            case 'bubble':
                return {
                    title: 'Bubble',
                    content: <PrevalenceOverTimeBubbleChart data={data} yAxisScaleType={yAxisScaleType} />,
                };
            case 'table':
                return { title: 'Table', content: <PrevalenceOverTimeTable data={data} granularity={granularity} /> };
        }
    };

    const tabs = views.map((view) => getTab(view));

    const toolbar = (activeTab: string) => (
        <div class='flex'>
            {activeTab !== 'Table' && (
                <ScalingSelector yAxisScaleType={yAxisScaleType} setYAxisScaleType={setYAxisScaleType} />
            )}
            <CsvDownloadButton
                className='mx-1 btn btn-xs'
                getData={() => getPrevalenceOverTimeTableData(data, granularity)}
                filename='prevalence-over-time.csv'
            />
            <Info className='ml-1' content='Info for prevalence over time' />
        </div>
    );

    return (
        <Headline heading={headline}>
            <Tabs tabs={tabs} toolbar={toolbar} />
        </Headline>
    );
};

export default PrevalenceOverTime;

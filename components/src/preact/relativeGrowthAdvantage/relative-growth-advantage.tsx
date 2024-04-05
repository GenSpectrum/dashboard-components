import { type FunctionComponent } from 'preact';
import { useContext, useState } from 'preact/hooks';

import RelativeGrowthAdvantageChart from './relative-growth-advantage-chart';
import {
    queryRelativeGrowthAdvantage,
    type RelativeGrowthAdvantageData,
} from '../../query/queryRelativeGrowthAdvantage';
import { type LapisFilter } from '../../types';
import { LapisUrlContext } from '../LapisUrlContext';
import { ErrorDisplay } from '../components/error-display';
import Headline from '../components/headline';
import Info from '../components/info';
import { LoadingDisplay } from '../components/loading-display';
import { NoDataDisplay } from '../components/no-data-display';
import { ScalingSelector } from '../components/scaling-selector';
import Tabs from '../components/tabs';
import { type ScaleType } from '../shared/charts/getYAxisScale';
import { useQuery } from '../useQuery';

export type View = 'line';

export interface RelativeGrowthAdvantageProps {
    numerator: LapisFilter;
    denominator: LapisFilter;
    generationTime: number;
    views: View[];
}

export const RelativeGrowthAdvantage: FunctionComponent<RelativeGrowthAdvantageProps> = ({
    numerator,
    denominator,
    generationTime,
    views,
}) => {
    const lapis = useContext(LapisUrlContext);
    const [yAxisScaleType, setYAxisScaleType] = useState<ScaleType>('linear');

    const { data, error, isLoading } = useQuery(
        () => queryRelativeGrowthAdvantage(numerator, denominator, generationTime, lapis),
        [lapis, numerator, denominator, generationTime, views],
    );

    const headline = 'Relative growth advantage';
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

    const getViewTitle = (view: View) => {
        switch (view) {
            case 'line':
                return 'Line';
        }
    };

    const getLineChartView = (data: NonNullable<RelativeGrowthAdvantageData>) => {
        return (
            <>
                <RelativeGrowthAdvantageChart
                    data={{
                        ...data.estimatedProportions,
                        observed: data.observedProportions,
                    }}
                    yAxisScaleType={yAxisScaleType}
                />
                <div>
                    Advantage: {(data.params.fd.value * 100).toFixed(2)}% ({(data.params.fd.ciLower * 100).toFixed(2)}%
                    - {(data.params.fd.ciUpper * 100).toFixed(2)}%)
                </div>
            </>
        );
    };

    const getViewContent = (view: View, data: NonNullable<RelativeGrowthAdvantageData>) => {
        switch (view) {
            case 'line':
                return getLineChartView(data);
        }
    };

    const tabs = views.map((view) => ({
        title: getViewTitle(view),
        content: getViewContent(view, data),
    }));

    const toolbar = (
        <div class='flex'>
            <ScalingSelector yAxisScaleType={yAxisScaleType} setYAxisScaleType={setYAxisScaleType} />
            <Info className='ml-1' content='Line chart' />
        </div>
    );

    return (
        <Headline heading={headline}>
            <Tabs tabs={tabs} toolbar={toolbar} />
        </Headline>
    );
};

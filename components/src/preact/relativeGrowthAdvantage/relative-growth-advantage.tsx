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

    return (
        <Headline heading={headline}>
            <RelativeGrowthAdvantageTabs
                data={data}
                yAxisScaleType={yAxisScaleType}
                setYAxisScaleType={setYAxisScaleType}
                views={views}
            />
        </Headline>
    );
};

type RelativeGrowthAdvantageTabsProps = {
    data: NonNullable<RelativeGrowthAdvantageData>;
    yAxisScaleType: ScaleType;
    setYAxisScaleType: (scaleType: ScaleType) => void;
    views: View[];
};

const RelativeGrowthAdvantageTabs: FunctionComponent<RelativeGrowthAdvantageTabsProps> = ({
    data,
    yAxisScaleType,
    setYAxisScaleType,
    views,
}) => {
    const getTab = (view: View) => {
        switch (view) {
            case 'line':
                return {
                    title: 'Line',
                    content: (
                        <RelativeGrowthAdvantageChart
                            data={{
                                ...data.estimatedProportions,
                                observed: data.observedProportions,
                                params: data.params,
                            }}
                            yAxisScaleType={yAxisScaleType}
                        />
                    ),
                };
        }
    };

    const tabs = views.map((view) => getTab(view));
    const toolbar = () => (
        <RelativeGrowthAdvantageToolbar yAxisScaleType={yAxisScaleType} setYAxisScaleType={setYAxisScaleType} />
    );

    return <Tabs tabs={tabs} toolbar={toolbar} />;
};

type RelativeGrowthAdvantageToolbarProps = {
    yAxisScaleType: ScaleType;
    setYAxisScaleType: (scaleType: ScaleType) => void;
};

const RelativeGrowthAdvantageToolbar: FunctionComponent<RelativeGrowthAdvantageToolbarProps> = ({
    yAxisScaleType,
    setYAxisScaleType,
}) => {
    return (
        <div class='flex'>
            <ScalingSelector yAxisScaleType={yAxisScaleType} setYAxisScaleType={setYAxisScaleType} />
            <Info className='ml-1' content='Line chart' />
        </div>
    );
};

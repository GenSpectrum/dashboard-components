import { useContext, useState } from 'preact/hooks';
import { LapisUrlContext } from '../LapisUrlContext';
import { queryRelativeGrowthAdvantage, RelativeGrowthAdvantageData } from '../../query/queryRelativeGrowthAdvantage';
import { useQuery } from '../useQuery';
import Headline from '../components/headline';
import { FunctionComponent } from 'preact';
import { LapisFilter } from '../../types';
import RelativeGrowthAdvantageChart from './relative-growth-advantage-chart';
import ComponentTabs from '../components/tabs';
import { Select } from '../components/select';
import Info from '../components/info';
import { type ScaleType } from '../../components/charts/getYAxisScale';

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

    if (isLoading) {
        return (
            <Headline heading={'Relative growth advantage'}>
                <div> Loading...</div>
            </Headline>
        );
    }

    if (error) {
        return (
            <Headline heading={'Relative growth advantage'}>
                <div>
                    Error: {error.message} {JSON.stringify(error)} {error.toString()}
                </div>
            </Headline>
        );
    }

    if (!data) {
        return (
            <Headline heading='Relative growth advantage'>
                <div>No data available.</div>
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
        <Headline heading='Relative growth advantage'>
            <ComponentTabs tabs={tabs} toolbar={toolbar} />
        </Headline>
    );
};

export type ScalingSelectorProps = {
    yAxisScaleType: ScaleType;
    setYAxisScaleType: (scaleType: ScaleType) => void;
    className?: string;
};

const ScalingSelector: FunctionComponent<ScalingSelectorProps> = ({ yAxisScaleType, setYAxisScaleType, className }) => {
    return (
        <Select
            items={[
                { label: 'Linear', value: 'linear' },
                { label: 'Logarithmic', value: 'logarithmic' },
                { label: 'Logit', value: 'logit' },
            ]}
            selected={yAxisScaleType}
            onChange={(event: Event) => {
                const select = event.target as HTMLSelectElement;
                const value = select.value as ScaleType;
                setYAxisScaleType(value);
            }}
            selectStyle={`${className} select-xs select-bordered`}
        />
    );
};

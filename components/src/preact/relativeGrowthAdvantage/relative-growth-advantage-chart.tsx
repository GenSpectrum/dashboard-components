import { Chart, type ChartConfiguration, registerables } from 'chart.js';

import { type YearMonthDay } from '../../utils/temporal';
import GsChart from '../components/chart';
import { LogitScale } from '../shared/charts/LogitScale';
import { getYAxisScale, type ScaleType } from '../shared/charts/getYAxisScale';

interface RelativeGrowthAdvantageChartData {
    t: YearMonthDay[];
    proportion: number[];
    ciLower: number[];
    ciUpper: number[];
    observed: number[];
}

interface RelativeGrowthAdvantageChartProps {
    data: RelativeGrowthAdvantageChartData;
    yAxisScaleType: ScaleType;
}

Chart.register(...registerables, LogitScale);

const RelativeGrowthAdvantageChart = ({ data, yAxisScaleType }: RelativeGrowthAdvantageChartProps) => {
    const config: ChartConfiguration = {
        type: 'line',
        data: {
            labels: data.t,
            datasets: [
                {
                    type: 'line',
                    label: 'Prevalence',
                    data: data.proportion,
                    borderWidth: 1,
                    pointRadius: 0,
                },
                {
                    type: 'line',
                    label: 'CI Lower',
                    data: data.ciLower,
                    borderWidth: 1,
                    pointRadius: 0,
                },
                {
                    type: 'line',
                    label: 'CI Upper',
                    data: data.ciUpper,
                    borderWidth: 1,
                    pointRadius: 0,
                },
                {
                    type: 'scatter',
                    label: 'Observed',
                    data: data.observed,
                    pointRadius: 1,
                },
            ],
        },
        options: {
            animation: false,
            scales: {
                y: getYAxisScale(yAxisScaleType),
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                },
            },
        },
    };

    return <GsChart configuration={config} />;
};

export default RelativeGrowthAdvantageChart;

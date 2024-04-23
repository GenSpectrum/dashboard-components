import { Chart, type ChartConfiguration, registerables, type TooltipItem } from 'chart.js';

import { type YearMonthDay } from '../../utils/temporal';
import GsChart from '../components/chart';
import { LogitScale } from '../shared/charts/LogitScale';
import { singleGraphColorRGBByName } from '../shared/charts/colors';
import { confidenceIntervalDataLabel } from '../shared/charts/confideceInterval';
import { getYAxisScale, type ScaleType } from '../shared/charts/getYAxisScale';

interface RelativeGrowthAdvantageChartData {
    t: YearMonthDay[];
    proportion: number[];
    ciLower: number[];
    ciUpper: number[];
    observed: number[];
    params: {
        fd: {
            value: number;
            ciLower: number;
            ciUpper: number;
        };
    };
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
            datasets: datasets(data),
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
                tooltip: tooltip(),
            },
        },
    };

    return (
        <>
            <GsChart configuration={config} />
            <div>
                Advantage: {(data.params.fd.value * 100).toFixed(2)}% ({(data.params.fd.ciLower * 100).toFixed(2)}% -{' '}
                {(data.params.fd.ciUpper * 100).toFixed(2)}%)
            </div>
        </>
    );
};

const datasets = (data: RelativeGrowthAdvantageChartData) => {
    return [
        {
            type: 'line' as const,
            label: 'Prevalence',
            data: data.proportion,
            borderWidth: 1,
            pointRadius: 0,
            borderColor: singleGraphColorRGBByName('indigo'),
            backgroundColor: singleGraphColorRGBByName('indigo'),
        },
        {
            type: 'line' as const,
            label: 'CI Lower',
            data: data.ciLower,
            borderWidth: 1,
            pointRadius: 0,
            fill: '+1',
            backgroundColor: singleGraphColorRGBByName('indigo', 0.3),
        },
        {
            type: 'line' as const,
            label: 'CI Upper',
            data: data.ciUpper,
            borderWidth: 1,
            pointRadius: 0,
            fill: '-1',
            backgroundColor: singleGraphColorRGBByName('indigo', 0.3),
        },
        {
            type: 'scatter' as const,
            label: 'Observed',
            data: data.observed,
            pointBackgroundColor: singleGraphColorRGBByName('green'),
            pointRadius: 2,
        },
    ];
};

const tooltip = () => {
    return {
        mode: 'index' as const,
        intersect: false,
        filter: ({ datasetIndex }: TooltipItem<'line'>) => {
            return datasetIndex !== 1 && datasetIndex !== 2;
        },
        callbacks: {
            label: (context: TooltipItem<'line'>) => {
                switch (context.datasetIndex) {
                    case 0: {
                        const value = context.dataset.data[context.dataIndex];
                        const ciLower = context.dataset.data[context.dataIndex + 1];
                        const ciUpper = context.dataset.data[context.dataIndex + 2];
                        if (typeof value !== 'number' || typeof ciLower !== 'number' || typeof ciUpper !== 'number') {
                            return '';
                        }
                        return confidenceIntervalDataLabel(value, ciLower, ciUpper, context.dataset.label);
                    }

                    case 3: {
                        const value = context.dataset.data[context.dataIndex];
                        if (typeof value !== 'number') {
                            return '';
                        }
                        return `Observed: ${value.toFixed(3)}`;
                    }
                    default:
                        return '';
                }
            },
        },
    };
};

export default RelativeGrowthAdvantageChart;

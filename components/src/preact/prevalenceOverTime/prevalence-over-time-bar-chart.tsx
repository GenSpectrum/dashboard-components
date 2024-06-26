import { Chart, type ChartConfiguration, registerables, type TooltipItem } from 'chart.js';
import { BarWithErrorBar, BarWithErrorBarsController } from 'chartjs-chart-error-bars';

import { maxInData } from './prevalence-over-time';
import { type PrevalenceOverTimeData, type PrevalenceOverTimeVariantData } from '../../query/queryPrevalenceOverTime';
import type { Temporal } from '../../utils/temporal';
import GsChart from '../components/chart';
import { LogitScale } from '../shared/charts/LogitScale';
import { singleGraphColorRGBAById } from '../shared/charts/colors';
import { type ConfidenceIntervalMethod, wilson95PercentConfidenceInterval } from '../shared/charts/confideceInterval';
import { getYAxisMax, type YAxisMaxConfig } from '../shared/charts/getYAxisMax';
import { getYAxisScale, type ScaleType } from '../shared/charts/getYAxisScale';

interface PrevalenceOverTimeBarChartProps {
    data: PrevalenceOverTimeData;
    yAxisScaleType: ScaleType;
    confidenceIntervalMethod: ConfidenceIntervalMethod;
    yAxisMaxConfig: YAxisMaxConfig;
}

Chart.register(...registerables, LogitScale, BarWithErrorBarsController, BarWithErrorBar);

const PrevalenceOverTimeBarChart = ({
    data,
    yAxisScaleType,
    confidenceIntervalMethod,
    yAxisMaxConfig,
}: PrevalenceOverTimeBarChartProps) => {
    const nullFirstData = data.map((variantData) => {
        return {
            content: variantData.content.sort(sortNullToBeginningThenByDate),
            displayName: variantData.displayName,
        };
    });

    const datasets = nullFirstData.map((graphData, index) => getDataset(graphData, index, confidenceIntervalMethod));

    const maxY =
        yAxisScaleType !== 'logit'
            ? getYAxisMax(maxInData(nullFirstData), yAxisMaxConfig?.[yAxisScaleType])
            : undefined;

    const config: ChartConfiguration = {
        type: BarWithErrorBarsController.id,
        data: {
            datasets,
        },
        options: {
            maintainAspectRatio: false,
            animation: false,
            scales: {
                y: { ...getYAxisScale(yAxisScaleType), max: maxY },
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: tooltip(confidenceIntervalMethod),
            },
        },
    };

    return <GsChart configuration={config} />;
};

function sortNullToBeginningThenByDate(
    a: { count: number; prevalence: number; total: number; dateRange: Temporal | null },
    b: {
        count: number;
        prevalence: number;
        total: number;
        dateRange: Temporal | null;
    },
) {
    return a.dateRange === null
        ? -1
        : b.dateRange === null
          ? 1
          : a.dateRange.toString().localeCompare(b.dateRange.toString());
}

const getDataset = (
    prevalenceOverTimeVariant: PrevalenceOverTimeVariantData,
    index: number,
    confidenceIntervalMethod: ConfidenceIntervalMethod,
) => {
    const generalConfig = {
        borderWidth: 1,
        pointRadius: 0,
        label: prevalenceOverTimeVariant.displayName,
        backgroundColor: singleGraphColorRGBAById(index, 0.3),
        borderColor: singleGraphColorRGBAById(index),
    };

    switch (confidenceIntervalMethod) {
        case 'wilson':
            return {
                ...generalConfig,
                data: prevalenceOverTimeVariant.content.map((dataPoint) => ({
                    y: dataPoint.prevalence,
                    yMin: wilson95PercentConfidenceInterval(dataPoint.count, dataPoint.total).lowerLimit,
                    yMax: wilson95PercentConfidenceInterval(dataPoint.count, dataPoint.total).upperLimit,
                    x: dataPoint.dateRange?.toString() ?? 'Unknown',
                })),
            };
        default:
            return {
                ...generalConfig,
                data: prevalenceOverTimeVariant.content.map((dataPoint) => {
                    return { y: dataPoint.prevalence, x: dataPoint.dateRange };
                }),
            };
    }
};

const tooltip = (confidenceIntervalMethod: ConfidenceIntervalMethod) => {
    const generalConfig = {
        mode: 'index' as const,
        intersect: false,
    };

    switch (confidenceIntervalMethod) {
        case 'wilson':
            return {
                ...generalConfig,
                callbacks: {
                    label: (context: TooltipItem<'barWithErrorBars'>) => {
                        const value = context.dataset.data[context.dataIndex] as {
                            y: number;
                            yMin: number;
                            yMax: number;
                        };

                        return `${context.dataset.label}: ${value.y.toFixed(3)} (${value.yMin.toFixed(3)} - ${value.yMax.toFixed(3)})`;
                    },
                },
            };
        default:
            return generalConfig;
    }
};

export default PrevalenceOverTimeBarChart;

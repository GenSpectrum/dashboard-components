import { Chart, type ChartConfiguration, registerables } from 'chart.js';
import { type TooltipItem } from 'chart.js/dist/types';

import { type PrevalenceOverTimeData, type PrevalenceOverTimeVariantData } from '../../query/queryPrevalenceOverTime';
import GsChart from '../components/chart';
import { LogitScale } from '../shared/charts/LogitScale';
import { singleGraphColorRGBA } from '../shared/charts/colors';
import { type ConfidenceIntervalMethod, wilson95PercentConfidenceInterval } from '../shared/charts/confideceInterval';
import { getYAxisScale, type ScaleType } from '../shared/charts/getYAxisScale';

interface PrevalenceOverTimeLineChartProps {
    data: PrevalenceOverTimeData;
    yAxisScaleType: ScaleType;
    confidenceIntervalMethod: ConfidenceIntervalMethod;
}

Chart.register(...registerables, LogitScale);

const PrevalenceOverTimeLineChart = ({
    data,
    yAxisScaleType,
    confidenceIntervalMethod,
}: PrevalenceOverTimeLineChartProps) => {
    const datasets = data.map((graphData, index) => getDataset(graphData, index, confidenceIntervalMethod)).flat();
    const labels = data[0]?.content.map((dateRange) => dateRange.dateRange?.toString() ?? 'Unknown') || [];

    const config: ChartConfiguration = {
        type: 'line',
        data: {
            labels,
            datasets,
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
                tooltip: tooltip(confidenceIntervalMethod),
            },
        },
    };

    return <GsChart configuration={config} />;
};

const getDataset = (
    prevalenceOverTimeVariant: PrevalenceOverTimeVariantData,
    dataIndex: number,
    confidenceIntervalMethod: ConfidenceIntervalMethod,
) => {
    switch (confidenceIntervalMethod) {
        case 'wilson':
            return [
                getDatasetCIUpper(prevalenceOverTimeVariant, dataIndex),
                getDatasetLine(prevalenceOverTimeVariant, dataIndex),
                getDatasetCILower(prevalenceOverTimeVariant, dataIndex),
            ].flat();
        default:
            return getDatasetLine(prevalenceOverTimeVariant, dataIndex);
    }
};

const getDatasetCIUpper = (prevalenceOverTimeVariant: PrevalenceOverTimeVariantData, dataIndex: number) => ({
    label: `${prevalenceOverTimeVariant.displayName} CI upper`,
    data: prevalenceOverTimeVariant.content.map(
        (dataPoint) => wilson95PercentConfidenceInterval(dataPoint.count, dataPoint.total).upperLimit,
    ),
    borderWidth: 0,
    pointRadius: 0,
    fill: '+1',
    backgroundColor: singleGraphColorRGBA(dataIndex, 0.3),
});

const getDatasetCILower = (prevalenceOverTimeVariant: PrevalenceOverTimeVariantData, dataIndex: number) => ({
    label: `${prevalenceOverTimeVariant.displayName} CI lower`,
    data: prevalenceOverTimeVariant.content.map(
        (dataPoint) => wilson95PercentConfidenceInterval(dataPoint.count, dataPoint.total).lowerLimit,
    ),
    borderWidth: 0,
    pointRadius: 0,
    fill: '-1',
    backgroundColor: singleGraphColorRGBA(dataIndex, 0.3),
});

const getDatasetLine = (prevalenceOverTimeVariant: PrevalenceOverTimeVariantData, dataIndex: number) => ({
    label: prevalenceOverTimeVariant.displayName,
    data: prevalenceOverTimeVariant.content.map((dataPoint) => dataPoint.prevalence),
    borderWidth: 1,
    pointRadius: 0,
    borderColor: singleGraphColorRGBA(dataIndex),
    backgroundColor: singleGraphColorRGBA(dataIndex),
});

const tooltip = (confidenceIntervalMethod?: ConfidenceIntervalMethod) => {
    const generalConfig = {
        mode: 'index' as const,
        intersect: false,
    };

    switch (confidenceIntervalMethod) {
        case 'wilson':
            return {
                ...generalConfig,
                filter: ({ datasetIndex }: TooltipItem<'line'>) => {
                    return datasetIndex % 3 === 1;
                },
                callbacks: {
                    label: (context: TooltipItem<'line'>) => {
                        if (context.datasetIndex % 3 === 1) {
                            const value = context.dataset.data[context.dataIndex];
                            const ciLower = context.dataset.data[context.dataIndex - 1];
                            const ciUpper = context.dataset.data[context.dataIndex + 1];

                            if (
                                typeof value !== 'number' ||
                                typeof ciLower !== 'number' ||
                                typeof ciUpper !== 'number'
                            ) {
                                return '';
                            }

                            return `${context.dataset.label}: ${value?.toFixed(3)} (${ciLower.toFixed(3)} - ${ciUpper.toFixed(3)})`;
                        }
                        return context.dataset.label;
                    },
                },
            };
        default:
            return generalConfig;
    }
};

export default PrevalenceOverTimeLineChart;
import { Chart, type ChartConfiguration, registerables } from 'chart.js';

import { maxInData } from './prevalence-over-time';
import { type PrevalenceOverTimeData } from '../../query/queryPrevalenceOverTime';
import { addUnit, minusTemporal } from '../../utils/temporalClass';
import { getMinMaxNumber } from '../../utils/utils';
import GsChart from '../components/chart';
import { LogitScale } from '../shared/charts/LogitScale';
import { singleGraphColorRGBAById } from '../shared/charts/colors';
import { getYAxisMax, type YAxisMaxConfig } from '../shared/charts/getYAxisMax';
import { getYAxisScale, type ScaleType } from '../shared/charts/getYAxisScale';

interface PrevalenceOverTimeBubbleChartProps {
    data: PrevalenceOverTimeData;
    yAxisScaleType: ScaleType;
    yAxisMaxConfig: YAxisMaxConfig;
}

Chart.register(...registerables, LogitScale);

const PrevalenceOverTimeBubbleChart = ({
    data,
    yAxisScaleType,
    yAxisMaxConfig,
}: PrevalenceOverTimeBubbleChartProps) => {
    const nonNullDateRangeData = data.map((variantData) => {
        return {
            content: variantData.content.filter((dataPoint) => dataPoint.dateRange !== null),
            displayName: variantData.displayName,
        };
    });

    const firstDate = nonNullDateRangeData[0].content[0].dateRange!;
    const total = nonNullDateRangeData.map((graphData) => graphData.content.map((dataPoint) => dataPoint.total)).flat();
    const [minTotal, maxTotal] = getMinMaxNumber(total)!;
    const scaleBubble = (value: number) => {
        return ((value - minTotal) / (maxTotal - minTotal)) * 4.5 + 0.5;
    };

    const maxY =
        yAxisScaleType !== 'logit'
            ? getYAxisMax(maxInData(nonNullDateRangeData), yAxisMaxConfig?.[yAxisScaleType])
            : undefined;

    const config: ChartConfiguration = {
        type: 'bubble',
        data: {
            datasets: nonNullDateRangeData.map((graphData, index) => ({
                label: graphData.displayName,
                data: graphData.content
                    .filter((dataPoint) => dataPoint.dateRange !== null)
                    .map((dataPoint) => ({
                        x: minusTemporal(dataPoint.dateRange!, firstDate),
                        y: dataPoint.prevalence,
                        r: scaleBubble(dataPoint.total),
                    })),
                borderWidth: 1,
                pointRadius: 0,
                backgroundColor: singleGraphColorRGBAById(index, 0.3),
                borderColor: singleGraphColorRGBAById(index),
            })),
        },
        options: {
            animation: false,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: {
                        callback: (value) => addUnit(firstDate, value as number).toString(),
                    },
                },
                y: { ...getYAxisScale(yAxisScaleType), max: maxY },
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        title: (context) => {
                            const dataset = nonNullDateRangeData[context[0].datasetIndex!];
                            const dataPoint = dataset.content[context[0].dataIndex!];
                            return dataPoint.dateRange?.toString();
                        },
                        label: (context) => {
                            const dataset = nonNullDateRangeData[context.datasetIndex!];
                            const dataPoint = dataset.content[context.dataIndex!];

                            const percentage = (dataPoint.prevalence * 100).toFixed(2);
                            const count = dataPoint.count.toFixed(0);
                            const total = dataPoint.total.toFixed(0);

                            return `${dataset.displayName}: ${percentage}%, ${count}/${total} samples`;
                        },
                    },
                },
            },
        },
    };

    return <GsChart configuration={config} />;
};

export default PrevalenceOverTimeBubbleChart;

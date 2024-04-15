import { Chart, type ChartConfiguration, registerables } from 'chart.js';

import { type PrevalenceOverTimeData } from '../../query/queryPrevalenceOverTime';
import { addUnit, minusTemporal } from '../../utils/temporal';
import { getMinMaxNumber } from '../../utils/utils';
import GsChart from '../components/chart';
import { LogitScale } from '../shared/charts/LogitScale';
import { singleGraphColorRGBA } from '../shared/charts/colors';
import { getYAxisScale, type ScaleType } from '../shared/charts/getYAxisScale';

interface PrevalenceOverTimeBubbleChartProps {
    data: PrevalenceOverTimeData;
    yAxisScaleType: ScaleType;
}

Chart.register(...registerables, LogitScale);

const PrevalenceOverTimeBubbleChart = ({ data, yAxisScaleType }: PrevalenceOverTimeBubbleChartProps) => {
    const firstDate = data[0].content[0].dateRange!;
    const total = data.map((graphData) => graphData.content.map((dataPoint) => dataPoint.total)).flat();
    const [minTotal, maxTotal] = getMinMaxNumber(total)!;
    const scaleBubble = (value: number) => {
        return ((value - minTotal) / (maxTotal - minTotal)) * 4.5 + 0.5;
    };

    const config: ChartConfiguration = {
        type: 'bubble',
        data: {
            datasets: data.map((graphData, index) => ({
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
                backgroundColor: singleGraphColorRGBA(index, 0.3),
                borderColor: singleGraphColorRGBA(index),
            })),
        },
        options: {
            animation: false,
            scales: {
                x: {
                    ticks: {
                        callback: (value) => addUnit(firstDate, value as number).toString(),
                    },
                },
                // @ts-expect-error-next-line -- chart.js typings are not complete with custom scales
                y: getYAxisScale(yAxisScaleType),
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
                            const dataset = data[context[0].datasetIndex!];
                            const dataPoint = dataset.content[context[0].dataIndex!];
                            return dataPoint.dateRange?.toString();
                        },
                        label: (context) => {
                            const dataset = data[context.datasetIndex!];
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

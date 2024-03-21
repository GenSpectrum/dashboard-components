import { ChartConfiguration } from 'chart.js';
import { PrevalenceOverTimeData } from '../../query/queryPrevalenceOverTime';
import { getYAxisScale, ScaleType } from '../../components/charts/getYAxisScale';
import GsChart from '../components/chart';

interface PrevalenceOverTimeLineBarChartProps {
    data: PrevalenceOverTimeData;
    type: 'line' | 'bar';
    yAxisScaleType: ScaleType;
}

const PrevalenceOverTimeLineBarChart = ({ data, type, yAxisScaleType }: PrevalenceOverTimeLineBarChartProps) => {
    const config: ChartConfiguration = {
        type,
        data: {
            labels: data[0]?.content.map((dateRange) => dateRange.dateRange?.toString() ?? 'Unknown') || [],
            datasets: data.map((graphData) => ({
                label: graphData.displayName,
                data: graphData.content.map((dataPoint) => dataPoint.prevalence),
                borderWidth: 1,
                pointRadius: 0,
            })),
        },
        options: {
            animation: false,
            scales: {
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
                },
            },
        },
    };

    return <GsChart configuration={config} yAxisScaleType={yAxisScaleType} />;
};

export default PrevalenceOverTimeLineBarChart;

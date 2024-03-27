import { Meta, StoryObj } from '@storybook/preact';
import GsChart, { GsChartProps } from './chart';
import { getYAxisScale } from '../shared/charts/getYAxisScale';
import { Chart, registerables } from 'chart.js';
import { LogitScale } from '../shared/charts/LogitScale';

const meta: Meta<GsChartProps> = {
    title: 'Component/Chart',
    component: GsChart,
    parameters: { fetchMock: {} },
};

export default meta;

Chart.register(...registerables, LogitScale);

export const ChartStory: StoryObj<GsChartProps> = {
    render: (args) => {
        return <GsChart configuration={args.configuration} />;
    },
    args: {
        configuration: {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Dataset 1',
                        data: [1, 2, 3, 4, 5],
                    },
                ],
                labels: ['A', 'B', 'C', 'D', 'E'],
            },
            options: {
                animation: false,
                scales: {
                    // @ts-expect-error-next-line -- chart.js typings are not complete with custom scales
                    y: getYAxisScale('logarithmic'),
                },
            },
        },
        yAxisScaleType: 'logarithmic',
    },
};

import { type Meta, type StoryObj } from '@storybook/preact';
import { Chart, registerables } from 'chart.js';

import GsChart, { type GsChartProps } from './chart';
import { LogitScale } from '../shared/charts/LogitScale';
import { getYAxisScale } from '../shared/charts/getYAxisScale';

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
                    y: getYAxisScale('logarithmic'),
                },
            },
        },
    },
};

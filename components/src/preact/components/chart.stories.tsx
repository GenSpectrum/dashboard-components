import { Meta, StoryObj } from '@storybook/preact';
import Chart, { GsChartProps } from './chart';
import { getYAxisScale } from '../../components/charts/getYAxisScale';

const meta: Meta<GsChartProps> = {
    title: 'Component/Chart',
    component: Chart,
    parameters: { fetchMock: {} },
};

export default meta;

export const ChartStory: StoryObj<GsChartProps> = {
    render: (args) => {
        return <Chart configuration={args.configuration} yAxisScaleType={args.yAxisScaleType} />;
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

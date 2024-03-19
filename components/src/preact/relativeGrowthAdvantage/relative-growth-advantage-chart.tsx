import { useEffect, useRef } from 'preact/hooks';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { YearMonthDay } from '../../temporal';
import { getYAxisScale, ScaleType } from '../../components/charts/getYAxisScale';
import { LogitScale } from '../../components/charts/LogitScale';

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

const RelativeGrowthAdvantageChart = ({ data, yAxisScaleType }: RelativeGrowthAdvantageChartProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (canvasRef.current === null) {
            return;
        }

        const ctx = canvasRef.current.getContext('2d');
        if (ctx === null) {
            return;
        }

        Chart.register(...registerables, LogitScale);

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

        chartRef.current = new Chart(ctx, config);

        return () => {
            chartRef.current?.destroy();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- yAxisScaleType is handled in next useEffect
    }, [canvasRef, data]);

    useEffect(() => {
        if (chartRef.current) {
            // @ts-expect-error-next-line -- chart.js typings are not complete with custom scales
            chartRef.current.options.scales!.y = getYAxisScale(yAxisScaleType);
            chartRef.current.update();
        }
    }, [yAxisScaleType]);

    return (
        <div>
            <canvas ref={canvasRef} />
        </div>
    );
};

export default RelativeGrowthAdvantageChart;

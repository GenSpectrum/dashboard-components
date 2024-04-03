import { useEffect, useRef } from 'preact/hooks';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { getYAxisScale, ScaleType } from '../shared/charts/getYAxisScale';
import { LogitScale } from '../shared/charts/LogitScale';

export interface GsChartProps {
    configuration: ChartConfiguration;
    yAxisScaleType: ScaleType;
}

const GsChart = ({ configuration, yAxisScaleType }: GsChartProps) => {
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

        chartRef.current = new Chart(ctx, configuration);

        return () => {
            chartRef.current?.destroy();
        };
    }, [canvasRef, configuration]);

    useEffect(() => {
        if (chartRef.current) {
            // @ts-expect-error-next-line -- chart.js typings are not complete with custom scales
            chartRef.current.options.scales!.y = getYAxisScale(yAxisScaleType);
            chartRef.current.update();
        }
    }, [yAxisScaleType]);

    return <canvas ref={canvasRef} />;
};

export default GsChart;

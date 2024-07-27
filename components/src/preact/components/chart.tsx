import { Chart, type ChartConfiguration } from 'chart.js';
import { type MutableRef, useEffect, useRef } from 'preact/hooks';

export interface GsChartProps {
    configuration: ChartConfiguration;
}

const GsChart = ({ configuration }: GsChartProps) => {
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

        chartRef.current = new Chart(ctx, configuration);

        resizeChartAfterFullscreenChange(chartRef, ctx, configuration);

        return () => {
            chartRef.current?.destroy();
        };
    }, [canvasRef, configuration]);

    return <canvas ref={canvasRef} />;
};

export default GsChart;

const resizeChartAfterFullscreenChange = (
    chartRef: MutableRef<Chart | null>,
    ctx: CanvasRenderingContext2D,
    configuration: ChartConfiguration,
) => {
    document.addEventListener('fullscreenchange', () => {
        chartRef.current?.destroy();
        chartRef.current = new Chart(ctx, configuration);
    });
};

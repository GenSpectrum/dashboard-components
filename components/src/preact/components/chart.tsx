import { Chart, type ChartConfiguration } from 'chart.js';
import { useEffect, useRef } from 'preact/hooks';

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

        const resizeChartAfterFullscreenChange = () => {
            chartRef.current?.destroy();
            chartRef.current = new Chart(ctx, configuration);
        };
        document.addEventListener('fullscreenchange', resizeChartAfterFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', resizeChartAfterFullscreenChange);
            chartRef.current?.destroy();
        };
    }, [canvasRef, configuration]);

    return <canvas ref={canvasRef} />;
};

export default GsChart;

import { customElement, property } from 'lit/decorators.js';
import { html, LitElement } from 'lit';
import { Chart, registerables } from 'chart.js';
import { TemporalGranularity } from '../types';
import { addUnit, minusTemporal, Temporal } from '../temporal';
import { getMinMaxNumber } from '../utils';
import { getYAxisScale, ScaleType } from './container/component-scaling-selector';
import { LogitScale } from './charts/LogitScale';

@customElement('gs-prevalence-over-time-bubble-chart')
export class PrevalenceOverTimeBubbleChart extends LitElement {
    @property({ type: Array })
    data: {
        displayName: string;
        content: { dateRange: Temporal | null; prevalence: number; count: number; total: number }[];
    }[] = [];

    @property({ type: String })
    granularity: TemporalGranularity = 'day';

    @property()
    yAxisScaleType: ScaleType = 'linear';

    private chart?: Chart;

    override firstUpdated() {
        const ctx = this.renderRoot.querySelector('canvas')?.getContext('2d');
        if (!ctx) {
            return;
        }

        const firstDate = this.data[0].content[0].dateRange!;
        const total = this.data.map((graphData) => graphData.content.map((dataPoint) => dataPoint.total)).flat();
        const [minTotal, maxTotal] = getMinMaxNumber(total)!;
        const scaleBubble = (value: number) => {
            return ((value - minTotal) / (maxTotal - minTotal)) * 4.5 + 0.5;
        };

        Chart.register(...registerables, LogitScale);

        this.chart = new Chart(ctx, {
            type: 'bubble',
            data: {
                datasets: this.data.map((graphData) => ({
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
                    // chart.js typings are not complete with custom scales
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    y: getYAxisScale(this.yAxisScaleType) as any,
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
                                const dataset = this.data[context[0].datasetIndex!];
                                const data = dataset.content[context[0].dataIndex!];
                                return data.dateRange?.toString();
                            },
                            label: (context) => {
                                const dataset = this.data[context.datasetIndex!];
                                const data = dataset.content[context.dataIndex!];
                                return `${dataset.displayName}: ${(data.prevalence * 100).toFixed(2)}%, ${data.count}/${
                                    data.total
                                } samples`;
                            },
                        },
                    },
                },
            },
        });
    }

    override updated(changedProperties: Map<string | number | symbol, unknown>): void {
        if (changedProperties.has('yAxisScaleType')) {
            this.updateChartScale();
        }
    }

    updateChartScale(): void {
        if (!this.chart) return;
        // chart.js typings are not complete with custom scales
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.chart.options.scales!.y = getYAxisScale(this.yAxisScaleType) as any;
        this.chart.update();
    }

    override render() {
        return html`
            <div>
                <canvas></canvas>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-prevalence-over-time-bubble-chart': PrevalenceOverTimeBubbleChart;
    }
}

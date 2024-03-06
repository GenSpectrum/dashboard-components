import { customElement, property } from 'lit/decorators.js';
import { html, LitElement } from 'lit';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Temporal } from '../temporal';
import { getYAxisScale, ScaleType } from './container/component-scaling-selector';
import { LogitScale } from './charts/LogitScale';

@customElement('gs-prevalence-over-time-line-bar-chart')
export class PrevalenceOverTimeLineBarChart extends LitElement {
    @property({ type: Array })
    data: {
        displayName: string;
        content: { dateRange: Temporal | null; prevalence: number }[];
    }[] = [];

    @property()
    type: 'line' | 'bar' = 'bar';

    @property()
    yAxisScaleType: ScaleType = 'linear';

    private chart?: Chart;

    override firstUpdated() {
        const ctx = this.renderRoot.querySelector('canvas')?.getContext('2d');
        if (!ctx) {
            return;
        }

        Chart.register(...registerables, LogitScale);

        const config: ChartConfiguration = {
            type: this.type,
            data: {
                labels: this.data[0]?.content.map((dateRange) => dateRange.dateRange?.toString() ?? 'Unknown') || [],
                datasets: this.data.map((graphData) => ({
                    label: graphData.displayName,
                    data: graphData.content.map((dataPoint) => dataPoint.prevalence),
                    borderWidth: 1,
                    pointRadius: 0,
                })),
            },
            options: {
                animation: false,
                scales: {
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
                    },
                },
            },
        };

        this.chart = new Chart(ctx, config);
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
        'gs-prevalence-over-time-line-bar-chart': PrevalenceOverTimeLineBarChart;
    }
}

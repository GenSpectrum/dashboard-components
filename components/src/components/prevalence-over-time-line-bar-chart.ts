import { customElement, property } from 'lit/decorators.js';
import { html, LitElement } from 'lit';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Temporal } from '../temporal';
import { scaleType } from './container/component-scaling-selector';
import { LogisticScale } from './charts/LogisticScale';

Chart.register(LogisticScale);

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
    yAxisScaleType: scaleType = 'linear';

    getYAxisScale(scaleType: scaleType) {
        switch (scaleType) {
            case 'linear': {
                return { beginAtZero: true, type: 'linear' as const };
            }
            case 'logarithmic': {
                return { type: 'logarithmic' as const };
            }
            case 'logistic':
                return { type: 'logistic' as const };
            default:
                return { beginAtZero: true, type: 'linear' as const };
        }
    }

    private chart?: Chart;

    override firstUpdated() {
        const ctx = this.renderRoot.querySelector('canvas')?.getContext('2d');
        if (!ctx) return;

        Chart.register(...registerables);

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
                    y: this.getYAxisScale(this.yAxisScaleType) as any,
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
        this.chart.options.scales!.y = this.getYAxisScale(this.yAxisScaleType) as any;
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

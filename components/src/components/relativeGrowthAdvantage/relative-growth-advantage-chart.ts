import { customElement, property } from 'lit/decorators.js';
import { html, LitElement } from 'lit';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { YearMonthDay } from '../../temporal';
import { getYAxisScale, ScaleType } from '../container/component-scaling-selector';
import { LogitScale } from '../charts/LogitScale';

@customElement('gs-relative-growth-advantage-chart')
export class RelativeGrowthAdvantageChart extends LitElement {
    @property({ type: Object })
    data: {
        t: YearMonthDay[];
        proportion: number[];
        ciLower: number[];
        ciUpper: number[];
        observed: number[];
    } = {
        t: [],
        proportion: [],
        ciLower: [],
        ciUpper: [],
        observed: [],
    };

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
            type: 'line',
            data: {
                labels: this.data.t,
                datasets: [
                    {
                        type: 'line',
                        label: 'Prevalence',
                        data: this.data.proportion,
                        borderWidth: 1,
                        pointRadius: 0,
                    },
                    {
                        type: 'line',
                        label: 'CI Lower',
                        data: this.data.ciLower,
                        borderWidth: 1,
                        pointRadius: 0,
                    },
                    {
                        type: 'line',
                        label: 'CI Upper',
                        data: this.data.ciUpper,
                        borderWidth: 1,
                        pointRadius: 0,
                    },
                    {
                        type: 'scatter',
                        label: 'Observed',
                        data: this.data.observed,
                        pointRadius: 1,
                    },
                ],
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
        'gs-relative-growth-advantage-chart': RelativeGrowthAdvantageChart;
    }
}

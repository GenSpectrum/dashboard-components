import { customElement, property } from 'lit/decorators.js';
import { html, LitElement } from 'lit';
import { Chart, registerables } from 'chart.js';
import { YearMonthDay } from '../../temporal';

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

    override firstUpdated() {
        const ctx = this.renderRoot.querySelector('canvas')!.getContext('2d')!;
        Chart.register(...registerables);
        new Chart(ctx, {
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
                    y: {
                        beginAtZero: true,
                    },
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
        });
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

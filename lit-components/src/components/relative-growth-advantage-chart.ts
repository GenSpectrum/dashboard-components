import { customElement, property } from 'lit/decorators.js';
import { html, LitElement } from 'lit';
import { Chart, registerables } from 'chart.js';

@customElement('gs-relative-growth-advantage-chart')
export class RelativeGrowthAdvantageChart extends LitElement {
    @property()
    data: {
        t: number[];
        proportion: [];
        ciLower: [];
        ciUpper: [];
    } = {
        t: [],
        proportion: [],
        ciLower: [],
        ciUpper: [],
    };

    override firstUpdated() {
        const ctx = this.renderRoot.querySelector('canvas')!.getContext('2d')!;
        Chart.register(...registerables);
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.data.t,
                datasets: [
                    {
                        label: 'Prevalence',
                        data: this.data.proportion,
                        borderWidth: 1,
                        pointRadius: 0,
                    },
                    {
                        label: 'CI Lower',
                        data: this.data.ciLower,
                        borderWidth: 1,
                        pointRadius: 0,
                    },
                    {
                        label: 'CI Upper',
                        data: this.data.ciUpper,
                        borderWidth: 1,
                        pointRadius: 0,
                    },
                ],
            },
            options: {
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

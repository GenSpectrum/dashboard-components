import { customElement, property } from 'lit/decorators.js';
import { html, LitElement } from 'lit';
import { Chart, registerables } from 'chart.js';

@customElement('gs-prevalence-over-time-chart')
export class PrevalenceOverTimeChart extends LitElement {
    @property()
    data: { dateRange: number | null; prevalence: number }[] = [];

    @property()
    type: 'line' | 'bar' = 'bar';

    override firstUpdated() {
        const ctx = this.renderRoot.querySelector('canvas')!.getContext('2d')!;
        Chart.register(...registerables);
        new Chart(ctx, {
            type: this.type,
            data: {
                labels: this.data.map((d) => d.dateRange ?? 'Unknown'),
                datasets: [
                    {
                        label: 'Prevalence',
                        data: this.data.map((d) => d.prevalence),
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
        'gs-prevalence-over-time-chart': PrevalenceOverTimeChart;
    }
}

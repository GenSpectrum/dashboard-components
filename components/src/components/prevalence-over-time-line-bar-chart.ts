import { customElement, property } from 'lit/decorators.js';
import { html, LitElement } from 'lit';
import { Chart, registerables } from 'chart.js';
import { Temporal } from '../temporal';

@customElement('gs-prevalence-over-time-line-bar-chart')
export class PrevalenceOverTimeLineBarChart extends LitElement {
    @property({ type: Array })
    data: {
        displayName: string;
        content: { dateRange: Temporal | null; prevalence: number }[];
    }[] = [];

    @property()
    type: 'line' | 'bar' = 'bar';

    override firstUpdated() {
        const ctx = this.renderRoot.querySelector('canvas')!.getContext('2d')!;
        Chart.register(...registerables);
        new Chart(ctx, {
            type: this.type,
            data: {
                labels: this.data[0].content.map((dateRange) => dateRange.dateRange ?? 'Unknown'),
                datasets: this.data.map((displayName) => ({
                    label: displayName.displayName,
                    data: displayName.content.map((contentItem) => contentItem.prevalence),
                    borderWidth: 1,
                    pointRadius: 0,
                })),
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
        'gs-prevalence-over-time-line-bar-chart': PrevalenceOverTimeLineBarChart;
    }
}

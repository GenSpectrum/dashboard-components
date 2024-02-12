import { customElement, property } from 'lit/decorators.js';
import { html, LitElement } from 'lit';
import { Chart, registerables } from 'chart.js';
import { TemporalGranularity } from '../types';
import { addUnit, minusTemporal, Temporal } from '../temporal';
import { getMinMaxNumber } from '../utils';

@customElement('gs-prevalence-over-time-bubble-chart')
export class PrevalenceOverTimeBubbleChart extends LitElement {
    @property({ type: Array })
    data: {
        displayName: string;
        content: { dateRange: Temporal | null; prevalence: number; count: number; total: number }[];
    }[] = [];

    @property({ type: String })
    granularity: TemporalGranularity = 'day';

    override firstUpdated() {
        const firstDate = this.data[0].content[0].dateRange!;
        const total = this.data.map((d) => d.content.map((d2) => d2.total)).flat();
        const [minTotal, maxTotal] = getMinMaxNumber(total)!;
        const scaleBubble = (value: number) => {
            return ((value - minTotal) / (maxTotal - minTotal)) * 4.5 + 0.5;
        };
        const ctx = this.renderRoot.querySelector('canvas')!.getContext('2d')!;
        Chart.register(...registerables);
        new Chart(ctx, {
            type: 'bubble',
            data: {
                datasets: this.data.map((d) => ({
                    label: d.displayName,
                    data: d.content
                        .filter((d2) => d2.dateRange !== null)
                        .map((d2) => ({
                            x: minusTemporal(d2.dateRange!, firstDate),
                            y: d2.prevalence,
                            r: scaleBubble(d2.total),
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

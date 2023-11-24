import {customElement, property} from "lit/decorators.js";
import {html, LitElement} from "lit";
import { Chart, registerables } from "chart.js";

@customElement('prevalence-over-time-chart')
export class PrevalenceOverTimeChart extends LitElement {

  @property()
  data: { dateRange: number | null, count: number }[] = [];

  override firstUpdated() {
    const ctx = this.renderRoot.querySelector('canvas')!.getContext('2d')!;
    Chart.register(...registerables);
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.data.map(d => d.dateRange ?? 'Unknown'),
        datasets: [{
          label: 'Prevalence',
          data: this.data.map(d => d.count),
          borderWidth: 1,
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
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
    'prevalence-over-time-chart': PrevalenceOverTimeChart;
  }
}

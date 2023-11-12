import {customElement, property} from "lit/decorators.js";
import {html, LitElement} from "lit";
import { Chart, registerables } from "chart.js";

@customElement('sequences-over-time-chart')
export class SequencesOverTimeChart extends LitElement {

  @property()
  data: { year: number | null, count: number }[] = [];

  override firstUpdated() {
    const ctx = this.renderRoot.querySelector('canvas')!.getContext('2d')!;
    Chart.register(...registerables);
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.data.map(d => d.year ?? 'Unknown'),
        datasets: [{
          label: 'Number sequences',
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
    'sequences-over-time-chart': SequencesOverTimeChart;
  }
}

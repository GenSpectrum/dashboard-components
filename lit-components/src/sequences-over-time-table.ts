import {customElement, property} from "lit/decorators.js";
import {html, LitElement} from "lit";

@customElement('sequences-over-time-table')
export class SequencesOverTimeTable extends LitElement {

  @property()
  data: { year: number | null, count: number }[] = [];

  override render() {

    return html`
      <table>
        <thead>
        <tr>
          <th>Year</th>
          <th>Count</th>
        </tr>
        </thead>
        <tbody>
        ${this.data.map(d => html`
          <tr>
            <td>${d.year ?? 'Unknown'}</td>
            <td>${d.count}</td>
          </tr>
        `)}
        </tbody>
      </table>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sequences-over-time-table': SequencesOverTimeTable;
  }
}

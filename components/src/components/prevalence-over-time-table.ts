import { customElement, property } from 'lit/decorators.js';
import { html, LitElement } from 'lit';
import { TemporalGranularity } from '../types';
import { Temporal } from '../temporal';

@customElement('gs-prevalence-over-time-table')
export class PrevalenceOverTimeTable extends LitElement {
    @property({ type: Array })
    data: {
        displayName: string;
        content: { dateRange: Temporal | null; prevalence: number }[];
    }[] = [];

    @property({ type: String })
    granularity: TemporalGranularity = 'day';

    override render() {
        return html`
            <table>
                <thead>
                    <tr>
                        <th>${this.granularity}</th>
                        ${this.data.map((d) => html`<th>${d.displayName}</th>`)}
                    </tr>
                </thead>
                <tbody>
                    ${this.data[0].content.map(
                        (d, i) => html`
                            <tr>
                                <td>${d.dateRange ?? 'Unknown'}</td>
                                ${this.data.map((d2) => html`<td>${d2.content[i].prevalence.toFixed(4)}</td>`)}
                            </tr>
                        `,
                    )}
                </tbody>
            </table>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-prevalence-over-time-table': PrevalenceOverTimeTable;
    }
}

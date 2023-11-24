import { customElement, property } from 'lit/decorators.js';
import { html, LitElement } from 'lit';
import { TemporalGranularity } from './types';

@customElement('prevalence-over-time-table')
export class PrevalenceOverTimeTable extends LitElement {
    @property()
    data: { dateRange: number | null; prevalence: number }[] = [];

    @property({ type: String })
    granularity: TemporalGranularity = 'day';

    override render() {
        return html`
            <table>
                <thead>
                    <tr>
                        <th>${this.granularity}</th>
                        <th>Prevalence</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.data.map(
                        (d) => html`
                            <tr>
                                <td>${d.dateRange ?? 'Unknown'}</td>
                                <td>${d.prevalence.toFixed(4)}</td>
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
        'prevalence-over-time-table': PrevalenceOverTimeTable;
    }
}

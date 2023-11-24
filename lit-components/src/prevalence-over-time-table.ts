import { customElement, property } from 'lit/decorators.js';
import { html, LitElement } from 'lit';

@customElement('prevalence-over-time-table')
export class PrevalenceOverTimeTable extends LitElement {
    @property()
    data: { dateRange: number | null; count: number }[] = [];

    override render() {
        return html`
            <table>
                <thead>
                    <tr>
                        <th>Date range</th>
                        <th>Prevalence</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.data.map(
                        (d) => html`
                            <tr>
                                <td>${d.dateRange ?? 'Unknown'}</td>
                                <td>${d.count.toFixed(4)}</td>
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

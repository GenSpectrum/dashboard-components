import { customElement, property } from 'lit/decorators.js';
import { html } from 'lit';
import { TemporalGranularity } from '../../types';
import { PrevalenceOverTimeData } from '../../query/queryPrevalenceOverTime';
import { TailwindElement } from '../../tailwind-element';

@customElement('gs-prevalence-over-time-table')
export class PrevalenceOverTimeTable extends TailwindElement() {
    @property({ type: Array })
    data: PrevalenceOverTimeData = [];

    @property({ type: String })
    granularity: TemporalGranularity = 'day';

    override render() {
        return html`
            <table>
                <thead>
                    <tr>
                        <th>${this.granularity}</th>
                        ${this.data.map(
                            (dataset) => html`
                                <th>${dataset.displayName} prevalence</th>
                                <th>${dataset.displayName} count</th>
                            `,
                        )}
                    </tr>
                </thead>
                <tbody>
                    ${this.data[0].content.map(
                        (row, rowNumber) => html`
                            <tr>
                                <td>${row.dateRange ?? 'Unknown'}</td>
                                ${this.data.map(
                                    (dataset) => html`
                                        <td>${dataset.content[rowNumber].prevalence.toFixed(4)}</td>
                                        <td class="text-right">${dataset.content[rowNumber].count}</td>
                                    `,
                                )}
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

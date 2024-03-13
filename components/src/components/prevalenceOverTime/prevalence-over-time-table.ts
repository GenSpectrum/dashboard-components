import { customElement, property } from 'lit/decorators.js';
import { html } from 'lit';
import { TemporalGranularity } from '../../types';
import { PrevalenceOverTimeData } from '../../query/queryPrevalenceOverTime';
import { TailwindElement } from '../../tailwind-element';
import { getPrevalenceOverTimeTableData } from './getPrevalenceOverTimeTableData';

@customElement('gs-prevalence-over-time-table')
export class PrevalenceOverTimeTable extends TailwindElement() {
    @property({ type: Array })
    data: PrevalenceOverTimeData = [];

    @property({ type: String })
    granularity: TemporalGranularity = 'day';

    override render() {
        const tableData = getPrevalenceOverTimeTableData(this.data, this.granularity);

        const keys = Object.keys(tableData[0]);

        return html`
            <table class="table">
                <thead>
                    <tr>
                        ${keys.map((key) => html` <th class="text-center">${key}</th>`)}
                    </tr>
                </thead>
                <tbody>
                    ${tableData.map(
                        (row) => html`
                            <tr>
                                ${keys.map((key) => html` <td class="text-center">${row[key]}</td>`)}
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

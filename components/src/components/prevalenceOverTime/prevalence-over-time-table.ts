import { customElement, property } from 'lit/decorators.js';
import { html } from 'lit';
import { TemporalGranularity } from '../../types';
import { PrevalenceOverTimeData } from '../../query/queryPrevalenceOverTime';
import { TailwindElement } from '../../tailwind-element';
import '../container/component-table';
import { getPrevalenceOverTimeTableData } from './getPrevalenceOverTimeTableData';

@customElement('gs-prevalence-over-time-table')
export class PrevalenceOverTimeTable extends TailwindElement() {
    @property({ type: Array })
    data: PrevalenceOverTimeData = [];

    @property({ type: String })
    granularity: TemporalGranularity = 'day';

    getHeaders() {
        return [
            {
                name: this.granularity,
                sort: true,
            },
            ...this.getSplitHeaders(),
        ];
    }

    private getSplitHeaders() {
        return this.data.map((dataset) => {
            return {
                name: dataset.displayName,
                columns: [
                    {
                        name: 'prevalence',
                        sort: true,
                    },
                    {
                        name: 'count',
                        sort: true,
                    },
                ],
            };
        });
    }

    getData() {
        const dataByHeader = getPrevalenceOverTimeTableData(this.data, this.granularity);
        return Object.values(dataByHeader).map((row) => Object.values(row));
    }

    override render() {
        return html`
            <gs-component-table
                .data=${this.getData()}
                .columns=${this.getHeaders()}
                .pagination=${false}
            ></gs-component-table>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-prevalence-over-time-table': PrevalenceOverTimeTable;
    }
}

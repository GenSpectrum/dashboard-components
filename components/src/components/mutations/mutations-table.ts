import { customElement, property } from 'lit/decorators.js';
import { html } from 'lit';
import { Dataset } from '../../operator/Dataset';
import { MutationEntry } from '../../operator/FetchMutationsOperator';
import { TailwindElement } from '../../tailwind-element';
import '../container/component-table';

@customElement('gs-mutations-table')
export class MutationsTable extends TailwindElement() {
    @property({ type: Object })
    data: Dataset<MutationEntry> | null = null;

    getHeaders() {
        return [
            {
                name: 'Mutation',
                sort: true,
            },
            {
                name: 'Type',
                sort: true,
            },
            {
                name: 'Count',
                sort: true,
            },
            {
                name: 'Proportion',
                sort: true,
            },
        ];
    }

    getTableData(data: Dataset<MutationEntry>) {
        return data.content.map((mutationEntry) => {
            switch (mutationEntry.type) {
                case 'substitution':
                    return [
                        mutationEntry.mutation.toString(),
                        'Substitution',
                        mutationEntry.count,
                        mutationEntry.proportion,
                    ];
                case 'deletion':
                    return [
                        mutationEntry.mutation.toString(),
                        'Deletion',
                        mutationEntry.count,
                        mutationEntry.proportion,
                    ];
                case 'insertion':
                    return [mutationEntry.mutation.toString(), 'Insertion', mutationEntry.count, ''];
                default:
                    throw new Error('Invalid mutation entry');
            }
        });
    }

    override render() {
        if (this.data === null) {
            return html` <div>Error: No data</div>`;
        }

        return html`
            <gs-component-table
                .data=${this.getTableData(this.data)}
                .columns=${this.getHeaders()}
                .pagination=${false}
            ></gs-component-table>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-mutations-table': MutationsTable;
    }
}

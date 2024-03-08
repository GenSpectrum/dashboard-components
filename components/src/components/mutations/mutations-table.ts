import { customElement, property } from 'lit/decorators.js';
import { html } from 'lit';
import { Dataset } from '../../operator/Dataset';
import { MutationEntry } from '../../operator/FetchMutationsOperator';
import { TailwindElement } from '../../tailwind-element';

@customElement('gs-mutations-table')
export class MutationsTable extends TailwindElement() {
    @property({ type: Object })
    data: Dataset<MutationEntry> | null = null;

    override render() {
        if (this.data === null) {
            return html` <div>Error: No data</div>`;
        }

        return html`
            <table class="table">
                <thead>
                    <tr>
                        <th>Mutation</th>
                        <th>Type</th>
                        <th>Count</th>
                        <th>Proportion</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.data.content.map((mutationEntry) => {
                        if (mutationEntry.type === 'substitution') {
                            return html` <tr>
                                <td>${mutationEntry.mutation}</td>
                                <td>Substitution</td>
                                <td>${mutationEntry.count}</td>
                                <td>${mutationEntry.proportion}</td>
                            </tr>`;
                        }
                        if (mutationEntry.type === 'deletion') {
                            return html` <tr>
                                <td>${mutationEntry.mutation}</td>
                                <td>Deletion</td>
                                <td>${mutationEntry.count}</td>
                                <td>${mutationEntry.proportion}</td>
                            </tr>`;
                        }
                        if (mutationEntry.type === 'insertion') {
                            return html` <tr>
                                <td>${mutationEntry.mutation}</td>
                                <td>Insertion</td>
                                <td>${mutationEntry.count}</td>
                                <td></td>
                            </tr>`;
                        }
                        throw new Error('Invalid mutation entry');
                    })}
                </tbody>
            </table>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-mutations-table': MutationsTable;
    }
}

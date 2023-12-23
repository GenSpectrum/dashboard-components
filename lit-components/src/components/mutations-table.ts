import { customElement, property } from 'lit/decorators.js';
import { html, LitElement } from 'lit';
import { Dataset } from '../operator/Dataset';
import { MutationEntry } from '../operator/FetchMutationsOperator';

@customElement('gs-mutations-table')
export class MutationsTable extends LitElement {
    @property()
    data: Dataset<MutationEntry> | null = null;

    override render() {
        if (this.data === null) {
            return html`<div>Error: No data</div>`;
        }

        return html`
            <table>
                <thead>
                    <tr>
                        <th>Mutation</th>
                        <th>Type</th>
                        <th>Count</th>
                        <th>Proportion</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.data.content.map((d) => {
                        if (d.type === 'substitution') {
                            return html`<tr>
                                <td>${d.mutation}</td>
                                <td>Substitution</td>
                                <td>${d.count}</td>
                                <td>${d.proportion}</td>
                            </tr>`;
                        }
                        if (d.type === 'deletion') {
                            return html`<tr>
                                <td>${d.mutation}</td>
                                <td>Deletion</td>
                                <td>${d.count}</td>
                                <td>${d.proportion}</td>
                            </tr>`;
                        }
                        if (d.type === 'insertion') {
                            return html`<tr>
                                <td>${d.mutation}</td>
                                <td>Insertion</td>
                                <td>${d.count}</td>
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

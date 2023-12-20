import { customElement, property } from 'lit/decorators.js';
import { html, LitElement } from 'lit';
import { Dataset } from '../operator/Dataset';
import { MutationSet } from '../mutations';

@customElement('gs-mutations-table')
export class MutationsTable extends LitElement {
    @property()
    data: Dataset<MutationSet> | null = null;

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
                        const htmlParts = [];
                        htmlParts.push(
                            ...d.substitutions.map(
                                (s) =>
                                    html`<tr>
                                        <td>${s.substitution}</td>
                                        <td>Substitution</td>
                                        <td>${s.count}</td>
                                        <td>${s.proportion}</td>
                                    </tr>`,
                            ),
                        );
                        htmlParts.push(
                            ...d.deletions.map(
                                (s) =>
                                    html`<tr>
                                        <td>${s.deletion}</td>
                                        <td>Deletion</td>
                                        <td>${s.count}</td>
                                        <td>${s.proportion}</td>
                                    </tr>`,
                            ),
                        );
                        htmlParts.push(
                            ...d.insertions.map(
                                (s) =>
                                    html`<tr>
                                        <td>${s.insertion}</td>
                                        <td>Insertion</td>
                                        <td>${s.count}</td>
                                        <td></td>
                                    </tr>`,
                            ),
                        );
                        return htmlParts;
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

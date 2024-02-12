import { customElement, property } from 'lit/decorators.js';
import { css, html, LitElement } from 'lit';
import { Dataset } from '../operator/Dataset';
import { DeletionEntry, MutationEntry, SubstitutionEntry } from '../operator/FetchMutationsOperator';
import { SequenceType } from '../types';
import { bases } from '../mutations';

@customElement('gs-mutations-grid')
export class MutationsGrid extends LitElement {
    static override styles = css`
        table {
            table-layout: fixed;
            border-spacing: 0;
            border-collapse: collapse;
        }

        tr {
            height: 30px;
        }

        th {
            position: sticky;
            top: 0;
            background: white;
        }

        td {
            width: 60px;
            text-align: center;
            border: 1px solid gray;
        }

        td.position {
            width: unset;
            text-align: left;
            padding-right: 25px;
            position: sticky;
            left: 0;
            background: white;
        }

        td.reference {
            color: lightgray;
        }

        td.low {
            color: lightgray;
        }
    `;

    @property({ type: Object })
    data: Dataset<MutationEntry> | null = null;

    @property({ type: String })
    sequenceType: SequenceType = 'nucleotide';

    override render() {
        if (this.data === null) {
            return html` <div>Error: No data</div>`;
        }
        const bs = bases[this.sequenceType];
        const filtered = this.data.content.filter(
            (mutationEntry): mutationEntry is SubstitutionEntry | DeletionEntry => mutationEntry.type !== 'insertion',
        );
        const grouped = new Map<string, Map<string, number>>();
        const referenceBases = new Map<string, string>();
        for (const d of filtered) {
            const position = (d.mutation.segment ? d.mutation.segment + ':' : '') + d.mutation.position;
            referenceBases.set(position, d.mutation.ref);
            if (!grouped.has(position)) {
                const empty = new Map();
                bs.forEach((b) => empty.set(b, 0));
                empty.set(d.mutation.ref, 1);
                grouped.set(position, empty);
            }
            const group = grouped.get(position)!;
            let alt;
            if (d.type === 'substitution') {
                alt = d.mutation.alt;
            } else {
                alt = '-';
            }
            group.set(alt, d.proportion);
            group.set(d.mutation.ref, group.get(d.mutation.ref)! - d.proportion);
        }
        const ordered = [...grouped.entries()]
            .map(([position, proportions]) => ({ position, proportions }))
            .filter((d) => d.proportions.get(referenceBases.get(d.position)!)! < 0.95)
            .sort((a, b) => {
                const split = (s: string) => {
                    const parts = s.split(':');
                    if (parts.length === 1) {
                        return [undefined, parseInt(parts[0])] as const;
                    } else {
                        return [parts[0], parseInt(parts[1])] as const;
                    }
                };
                const [aSegment, aPosition] = split(a.position);
                const [bSegment, bPosition] = split(b.position);
                if (aSegment !== bSegment) {
                    return (aSegment ?? '').localeCompare(bSegment ?? '');
                }
                return aPosition - bPosition;
            });

        return html`
            <table>
                <thead>
                    <tr>
                        <th class="position">Pos</th>
                        ${bs.map((b) => html` <th>${b}</th>`)}
                    </tr>
                </thead>
                <tbody>
                    ${ordered.map((d) => {
                        return html`
                            <tr>
                                <td class="position">${d.position}</td>
                                ${bs.map(
                                    (b) =>
                                        html` <td
                                            class=${(referenceBases.get(d.position) === b ? 'reference ' : '') +
                                            (d.proportions.get(b)! < 0.0001 ? 'low' : '')}
                                        >
                                            ${formatProportion(d.proportions.get(b)!)}
                                        </td>`,
                                )}
                            </tr>
                        `;
                    })}
                </tbody>
            </table>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-mutations-grid': MutationsGrid;
    }
}

const formatProportion = (proportion: number) => {
    return (proportion * 100).toFixed(2) + '%';
};

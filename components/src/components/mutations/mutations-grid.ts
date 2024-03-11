import { customElement, property } from 'lit/decorators.js';
import { html } from 'lit';
import { Dataset } from '../../operator/Dataset';
import { DeletionEntry, MutationEntry, SubstitutionEntry } from '../../operator/FetchMutationsOperator';
import { SequenceType } from '../../types';
import { bases } from '../../mutations';
import '../container/component-table';
import { TailwindElement } from '../../tailwind-element';
import { tableStyle } from '../container/component-table';
import { Row } from 'gridjs';

type MutationCell = {
    isReference: boolean;
    value: number;
};

type AdditionalColumnInfo = {
    isReference: boolean;
};

@customElement('gs-mutations-grid')
export class MutationsGrid extends TailwindElement() {
    @property({ type: Object })
    data: Dataset<MutationEntry> | null = null;

    @property({ type: String })
    sequenceType: SequenceType = 'nucleotide';

    private getHeaders() {
        return [
            {
                name: 'Position',
                sort: {
                    compare: (a: string, b: string) => {
                        return this.sortPositionsWithSegments(a, b);
                    },
                },
            },
            ...this.getBasesHeaders(),
        ];
    }

    private getBasesHeaders() {
        // This is a workaround, since gridjs does not support sorting of object cells in conjunction with the formatter
        // here each presented table cell is represented by two cells,
        // one for the value and one for the reference information

        const getAdditionalInfo = (columnIndex: number, row: Row) => {
            const numberOfNonBasesColumns = 1;
            return row.cell(numberOfNonBasesColumns + 1 + 2 * columnIndex).data as AdditionalColumnInfo;
        };

        return bases[this.sequenceType]
            .map((base, index) => {
                return [
                    {
                        name: base,
                        sort: true,
                        formatter: (cell: number) => {
                            return formatProportion(cell);
                        },
                        attributes: (cell: number, row: Row) => {
                            // grid-js: the cell and row are null for header cells
                            if (row === null) {
                                return {};
                            }

                            return this.styleCells({
                                value: cell,
                                ...getAdditionalInfo(index, row),
                            });
                        },
                    },
                    { name: `additionalInfo for ${base}`, hidden: true },
                ];
            })
            .flat();
    }

    private sortPositionsWithSegments(a: string, b: string) {
        const split = (s: string) => {
            const parts = s.split(':');
            if (parts.length === 1) {
                return [undefined, parseInt(parts[0])] as const;
            } else {
                return [parts[0], parseInt(parts[1])] as const;
            }
        };
        const [aSegment, aPosition] = split(a);
        const [bSegment, bPosition] = split(b);
        if (aSegment !== bSegment) {
            return (aSegment ?? '').localeCompare(bSegment ?? '');
        }
        return aPosition - bPosition;
    }

    private styleCells(cell: MutationCell) {
        if (cell.isReference) {
            return {
                style: {
                    ...tableStyle.td,
                    color: 'gray',
                },
            };
        }

        if (cell.value < 0.0001) {
            return {
                style: {
                    ...tableStyle.td,
                    color: 'gray',
                },
            };
        }
        return {};
    }

    private getTableData(): (string | number | AdditionalColumnInfo)[][] {
        if (this.data === null) {
            return [];
        }
        const basesOfView = bases[this.sequenceType];
        const mutationsWithoutInsertions = this.data.content.filter(
            (mutationEntry): mutationEntry is SubstitutionEntry | DeletionEntry => mutationEntry.type !== 'insertion',
        );
        const positionsToProportionAtBase = new Map<string, Map<string, number>>();
        const referenceBases = new Map<string, string>();

        for (const mutationEntry of mutationsWithoutInsertions) {
            const position =
                (mutationEntry.mutation.segment ? mutationEntry.mutation.segment + ':' : '') +
                mutationEntry.mutation.position;
            referenceBases.set(position, mutationEntry.mutation.valueAtReference);

            const initiallyFillPositionsToProportionAtBase = () => {
                if (!positionsToProportionAtBase.has(position)) {
                    const empty = new Map();
                    basesOfView.forEach((base) => empty.set(base, 0));
                    empty.set(mutationEntry.mutation.valueAtReference, 1);
                    positionsToProportionAtBase.set(position, empty);
                }
            };
            initiallyFillPositionsToProportionAtBase();

            const substitutionValue =
                mutationEntry.type === 'substitution' ? mutationEntry.mutation.substitutionValue : '-';

            const subtractSubstitutionValue = () => {
                const proportionAtBase = positionsToProportionAtBase.get(position)!;
                proportionAtBase.set(substitutionValue, mutationEntry.proportion);
                proportionAtBase.set(
                    mutationEntry.mutation.valueAtReference,
                    proportionAtBase.get(mutationEntry.mutation.valueAtReference)! - mutationEntry.proportion,
                );
            };
            subtractSubstitutionValue();
        }
        const orderedPositionsToProportionAtBase = [...positionsToProportionAtBase.entries()]
            .map(([position, proportionsAtBase]) => ({ position, proportions: proportionsAtBase }))
            .sort((a, b) => {
                return this.sortPositionsWithSegments(a.position, b.position);
            });

        return orderedPositionsToProportionAtBase.map((proportionsForBaseAtPosition) => {
            return [
                proportionsForBaseAtPosition.position,
                ...bases[this.sequenceType]
                    .map((base) => {
                        return [
                            proportionsForBaseAtPosition.proportions.get(base)!,
                            { isReference: base === referenceBases.get(proportionsForBaseAtPosition.position) },
                        ];
                    })
                    .flat(),
            ];
        });
    }

    override render() {
        if (this.data === null) {
            return html` <div>Error: No data</div>`;
        }

        return html` <gs-component-table
            .data=${this.getTableData()}
            .columns=${this.getHeaders()}
            .pagination=${false}
        ></gs-component-table>`;
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

import { FunctionComponent } from 'preact';
import { Row } from 'gridjs';
import { Dataset } from '../../operator/Dataset';
import { SequenceType } from '../../types';
import { bases } from '../../utils/mutations';
import { DeletionEntry, MutationEntry, SubstitutionEntry } from '../../operator/FetchMutationsOperator';
import { Table, tableStyle } from '../components/table';
import { formatProportion } from '../shared/table/formatProportion';

type MutationCell = {
    isReference: boolean;
    value: number;
};

type AdditionalColumnInfo = {
    isReference: boolean;
};

interface MutationsGridProps {
    data: Dataset<MutationEntry>;
    sequenceType: SequenceType;
}

export const MutationsGrid: FunctionComponent<MutationsGridProps> = ({ data, sequenceType }) => {
    const getHeaders = () => {
        return [
            {
                name: 'Position',
                sort: {
                    compare: (a: string, b: string) => {
                        return sortPositionsWithSegments(a, b);
                    },
                },
            },
            ...getBasesHeaders(),
        ];
    };

    const getBasesHeaders = () => {
        // This is a workaround, since gridjs does not support sorting of object cells in conjunction with the formatter
        // here each presented table cell is represented by two cells,
        // one for the value and one for the reference information

        const getAdditionalInfo = (columnIndex: number, row: Row) => {
            const numberOfNonBasesColumns = 1;
            return row.cell(numberOfNonBasesColumns + 1 + 2 * columnIndex).data as AdditionalColumnInfo;
        };

        return bases[sequenceType]
            .map((base, index) => {
                return [
                    {
                        name: base,
                        sort: true,
                        formatter: (cell: number) => formatProportion(cell),
                        attributes: (cell: number, row: Row) => {
                            // grid-js: the cell and row are null for header cells
                            if (row === null) {
                                return {};
                            }

                            return styleCells({
                                value: cell,
                                ...getAdditionalInfo(index, row),
                            });
                        },
                    },
                    { name: `additionalInfo for ${base}`, hidden: true },
                ];
            })
            .flat();
    };

    const sortPositionsWithSegments = (a: string, b: string) => {
        const split = (s: string) => {
            const parts = s.split(':');
            if (parts.length === 1) {
                return [undefined, parseInt(parts[0], 10)] as const;
            }
            return [parts[0], parseInt(parts[1], 10)] as const;
        };
        const [aSegment, aPosition] = split(a);
        const [bSegment, bPosition] = split(b);
        if (aSegment !== bSegment) {
            return (aSegment ?? '').localeCompare(bSegment ?? '');
        }
        return aPosition - bPosition;
    };

    const styleCells = (cell: MutationCell) => {
        if (cell.isReference || cell.value < 0.0001) {
            return {
                style: {
                    ...tableStyle.td,
                    color: 'gray',
                },
            };
        }
        return {};
    };

    const getTableData = (data: Dataset<MutationEntry>, sequenceType: SequenceType) => {
        const basesOfView = bases[sequenceType];
        const mutationsWithoutInsertions = data.content.filter(
            (mutationEntry): mutationEntry is SubstitutionEntry | DeletionEntry => mutationEntry.type !== 'insertion',
        );
        const positionsToProportionAtBase = new Map<string, Map<string, number>>();
        const referenceBases = new Map<string, string>();

        for (const mutationEntry of mutationsWithoutInsertions) {
            const position =
                (mutationEntry.mutation.segment ? `${mutationEntry.mutation.segment}:` : '') +
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
                return sortPositionsWithSegments(a.position, b.position);
            });

        return orderedPositionsToProportionAtBase.map((proportionsForBaseAtPosition) => {
            return [
                proportionsForBaseAtPosition.position,
                ...bases[sequenceType]
                    .map((base) => {
                        return [
                            proportionsForBaseAtPosition.proportions.get(base)!,
                            { isReference: base === referenceBases.get(proportionsForBaseAtPosition.position) },
                        ];
                    })
                    .flat(),
            ];
        });
    };

    return <Table data={getTableData(data, sequenceType)} columns={getHeaders()} pagination={true} />;
};

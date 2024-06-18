import { type Row } from 'gridjs';
import { type FunctionComponent } from 'preact';

import { getMutationsGridData } from './getMutationsGridData';
import { type SequenceType, type SubstitutionOrDeletionEntry } from '../../types';
import { bases } from '../../utils/mutations';
import { type ProportionInterval } from '../components/proportion-selector';
import { Table, tableStyle } from '../components/table';
import { sortMutationPositions } from '../shared/sort/sortMutationPositions';
import { formatProportion } from '../shared/table/formatProportion';

interface MutationsGridProps {
    data: SubstitutionOrDeletionEntry[];
    sequenceType: SequenceType;
    proportionInterval: ProportionInterval;
    pageSize: boolean | number;
}

export type BaseCell = {
    proportion: number;
    isReference: boolean;
};

export const MutationsGrid: FunctionComponent<MutationsGridProps> = ({
    data,
    sequenceType,
    proportionInterval,
    pageSize,
}) => {
    const getHeaders = () => {
        return [
            {
                name: 'Position',
                sort: {
                    compare: (a: string, b: string) => {
                        return sortMutationPositions(a, b);
                    },
                },
            },
            ...getBasesHeaders(),
        ];
    };

    const getBasesHeaders = () => {
        return bases[sequenceType].map((base) => {
            return {
                name: base,
                sort: {
                    compare: (a: BaseCell, b: BaseCell) => {
                        const aProportion = a.proportion;
                        const bProportion = b.proportion;
                        if (aProportion < bProportion) {
                            return -1;
                        }
                        if (aProportion > bProportion) {
                            return 1;
                        }

                        return 0;
                    },
                },
                formatter: (cell: BaseCell) => formatProportion(cell.proportion),
                attributes: (cell: BaseCell, row: Row) => {
                    // grid-js: the cell and row are null for header cells
                    if (row === null) {
                        return {};
                    }

                    return styleCells(cell);
                },
            };
        });
    };

    const styleCells = (cell: BaseCell) => {
        if (cell.isReference || cell.proportion < 0.0001) {
            return {
                style: {
                    ...tableStyle.td,
                    color: 'gray',
                },
            };
        }
        return {};
    };

    const tableData = getMutationsGridData(data, sequenceType, proportionInterval).map((row) => Object.values(row));

    return <Table data={tableData} columns={getHeaders()} pageSize={pageSize} />;
};

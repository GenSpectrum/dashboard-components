import { type FunctionComponent } from 'preact';

import { getMutationsTableData } from './getMutationsTableData';
import { type SubstitutionOrDeletionEntry } from '../../types';
import type { ProportionInterval } from '../components/proportion-selector';
import { Table } from '../components/table';
import { sortSubstitutionsAndDeletions } from '../shared/sort/sortSubstitutionsAndDeletions';
import { formatProportion } from '../shared/table/formatProportion';

export interface MutationsTableProps {
    data: SubstitutionOrDeletionEntry[];
    proportionInterval: ProportionInterval;
}

const MutationsTable: FunctionComponent<MutationsTableProps> = ({ data, proportionInterval }) => {
    const getHeaders = () => {
        return [
            {
                name: 'Mutation',
                sort: {
                    compare: (a: string, b: string) => {
                        return sortSubstitutionsAndDeletions(a, b);
                    },
                },
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
                formatter: (cell: number) => formatProportion(cell),
            },
        ];
    };

    const tableData = getMutationsTableData(data, proportionInterval).map((row) => Object.values(row));

    return <Table data={tableData} columns={getHeaders()} pagination={true} />;
};

export default MutationsTable;

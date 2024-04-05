import { type FunctionComponent } from 'preact';

import { getInsertionsTableData } from './getInsertionsTableData';
import { type InsertionEntry } from '../../types';
import { Table } from '../components/table';
import { sortInsertions } from '../shared/sort/sortInsertions';

export interface InsertionsTableProps {
    data: InsertionEntry[];
}

export const InsertionsTable: FunctionComponent<InsertionsTableProps> = ({ data }) => {
    const getHeaders = () => {
        return [
            {
                name: 'Insertion',
                sort: {
                    compare: (a: string, b: string) => {
                        return sortInsertions(a, b);
                    },
                },
            },
            {
                name: 'Count',
                sort: true,
            },
        ];
    };

    const tableData = getInsertionsTableData(data).map((row) => Object.values(row));

    return <Table data={tableData} columns={getHeaders()} pagination={true} />;
};

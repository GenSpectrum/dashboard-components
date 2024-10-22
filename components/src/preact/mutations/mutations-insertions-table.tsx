import { type FunctionComponent } from 'preact';

import { getInsertionsTableData } from './getInsertionsTableData';
import { type InsertionEntry } from '../../types';
import { type InsertionClass } from '../../utils/mutations';
import { Table } from '../components/table';
import { sortInsertions } from '../shared/sort/sortInsertions';

export interface InsertionsTableProps {
    data: InsertionEntry[];
    pageSize: boolean | number;
}

export const InsertionsTable: FunctionComponent<InsertionsTableProps> = ({ data, pageSize }) => {
    const getHeaders = () => {
        return [
            {
                name: 'Insertion',
                sort: {
                    compare: (a: InsertionClass, b: InsertionClass) => {
                        return sortInsertions(a, b);
                    },
                },
                formatter: (cell: InsertionClass) => cell.toString(),
            },
            {
                name: 'Count',
                sort: true,
            },
        ];
    };

    const tableData = getInsertionsTableData(data).map((row) => Object.values(row));

    return <Table data={tableData} columns={getHeaders()} pageSize={pageSize} />;
};

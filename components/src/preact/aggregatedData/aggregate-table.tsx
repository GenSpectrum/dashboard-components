import { type FunctionComponent } from 'preact';

import { type AggregateData, compareAscending } from '../../query/queryAggregateData';
import { Table } from '../components/table';
import { formatProportion } from '../shared/table/formatProportion';

type AggregateTableProps = {
    fields: string[];
    data: AggregateData;
    pageSize: boolean | number;
};

export const AggregateTable: FunctionComponent<AggregateTableProps> = ({ data, fields, pageSize }) => {
    const headers = [
        ...fields.map((field) => {
            return {
                name: field,
                sort: {
                    compare: compareAscending,
                },
            };
        }),
        {
            name: 'count',
            sort: true,
        },
        {
            name: 'proportion',
            sort: true,
            formatter: (cell: number) => formatProportion(cell),
        },
    ];

    return <Table data={data} columns={headers} pageSize={pageSize} />;
};

import { type FunctionComponent } from 'preact';

import { type AggregateData } from '../../query/queryAggregateData';
import { Table } from '../components/table';
import { formatProportion } from '../shared/table/formatProportion';

type AggregateTableProps = {
    fields: string[];
    data: AggregateData;
};

export const AggregateTable: FunctionComponent<AggregateTableProps> = ({ data, fields }) => {
    const headers = [
        ...fields.map((field) => {
            return {
                name: field,
                sort: true,
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

    return <Table data={data} columns={headers} pagination={true} />;
};

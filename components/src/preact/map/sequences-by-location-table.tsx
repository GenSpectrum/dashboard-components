import { type FunctionComponent } from 'preact';

import { type AggregateData, compareAscending } from '../../query/queryAggregateData';
import { Table } from '../components/table';
import { formatProportion } from '../shared/table/formatProportion';

type SequencesByLocationTableProps = {
    tableData: AggregateData;
    lapisLocationField: string;
    pageSize: boolean | number;
};

export const SequencesByLocationTable: FunctionComponent<SequencesByLocationTableProps> = ({
    tableData,
    lapisLocationField,
    pageSize,
}) => {
    const headers = [
        {
            name: lapisLocationField,
            sort: {
                compare: compareAscending,
            },
        },
        {
            name: 'count',
            sort: true,
        },
        {
            name: 'proportion',
            sort: true,
            formatter: (cell: number) => formatProportion(cell),
        },
        ...('isShownOnMap' in tableData[0] ? [{ name: 'isShownOnMap', sort: true }] : []),
    ];

    return <Table data={tableData} columns={headers} pageSize={pageSize} />;
};

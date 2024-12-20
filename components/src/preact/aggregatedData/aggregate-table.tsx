import { type FunctionComponent } from 'preact';
import { useMemo } from 'preact/hooks';

import { type AggregateData, compareAscending } from '../../query/queryAggregateData';
import { Table } from '../components/table';
import { formatProportion } from '../shared/table/formatProportion';

type AggregateTableProps = {
    fields: string[];
    data: AggregateData;
    pageSize: boolean | number;
    initialSortField: string;
    initialSortDirection: 'ascending' | 'descending';
};

export const AggregateTable: FunctionComponent<AggregateTableProps> = ({
    data,
    fields,
    pageSize,
    initialSortField,
    initialSortDirection,
}) => {
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

    const sortedData = useMemo(() => {
        const validSortFields = ['count', 'proportion', ...fields];
        if (!validSortFields.includes(initialSortField)) {
            throw new Error(`InitialSort field not in fields. Valid fields are: ${validSortFields.join(', ')}`);
        }

        return data.sort((a, b) =>
            initialSortDirection === 'ascending'
                ? compareAscending(a[initialSortField], b[initialSortField])
                : compareAscending(b[initialSortField], a[initialSortField]),
        );
    }, [data, initialSortField, initialSortDirection, fields]);

    return <Table data={sortedData} columns={headers} pageSize={pageSize} />;
};

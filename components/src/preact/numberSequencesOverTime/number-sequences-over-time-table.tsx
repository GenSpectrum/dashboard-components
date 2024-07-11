import { useMemo } from 'preact/hooks';

import { getNumberOfSequencesOverTimeTableData } from './getNumberOfSequencesOverTimeTableData';
import { type NumberOfSequencesDatasets } from '../../query/queryNumberOfSequencesOverTime';
import { type TemporalGranularity } from '../../types';
import { Table } from '../components/table';

interface NumberSequencesOverTimeTableProps {
    data: NumberOfSequencesDatasets;
    granularity: TemporalGranularity;
    pageSize: boolean | number;
}

export const NumberSequencesOverTimeTable = ({ data, granularity, pageSize }: NumberSequencesOverTimeTableProps) => {
    const columns = [
        {
            name: granularity,
            sort: true,
        },
        ...data.map((dataset) => ({
            name: dataset.displayName,
            sort: true,
        })),
    ];

    const flatTableData = useMemo(() => {
        const tableData = getNumberOfSequencesOverTimeTableData(data, granularity);
        return Object.values(tableData).map((row) => Object.values(row));
    }, [data, granularity]);

    return <Table data={flatTableData} columns={columns} pageSize={pageSize} />;
};

import { getPrevalenceOverTimeTableData } from './getPrevalenceOverTimeTableData';
import { type PrevalenceOverTimeData } from '../../query/queryPrevalenceOverTime';
import { type TemporalGranularity } from '../../types';
import { Table } from '../components/table';
import { formatProportion } from '../shared/table/formatProportion';

interface PrevalenceOverTimeTableProps {
    data: PrevalenceOverTimeData;
    granularity: TemporalGranularity;
}

const PrevalenceOverTimeTable = ({ data, granularity }: PrevalenceOverTimeTableProps) => {
    const getSplitColumns = (data: PrevalenceOverTimeData) => {
        return data.map((dataset) => ({
            name: dataset.displayName,
            columns: [
                {
                    name: 'prevalence',
                    sort: true,
                    formatter: (cell: number) => formatProportion(cell),
                },
                {
                    name: 'count',
                    sort: true,
                },
            ],
        }));
    };

    const getColumns = (data: PrevalenceOverTimeData) => [
        {
            name: granularity,
            sort: true,
        },
        ...getSplitColumns(data),
    ];

    const getData = (data: PrevalenceOverTimeData, granularity: TemporalGranularity) => {
        const dataByHeader = getPrevalenceOverTimeTableData(data, granularity);
        return Object.values(dataByHeader).map((row) => Object.values(row));
    };

    return <Table data={getData(data, granularity)} columns={getColumns(data)} pagination={false} />;
};

export default PrevalenceOverTimeTable;

import { FunctionComponent } from 'preact';
import { Dataset } from '../../operator/Dataset';
import { Table } from '../components/table';
import { MutationData } from './mutation-comparison';
import { formatProportion } from '../shared/table/formatProportion';
import { getMutationComparisonTableData } from './getMutationComparisonTableData';

export interface MutationsTableProps {
    data: Dataset<MutationData>;
}

export const MutationComparisonTable: FunctionComponent<MutationsTableProps> = ({ data }) => {
    const getHeaders = () => {
        return [
            {
                name: 'Mutation',
                sort: true,
            },
            {
                name: 'Prevalence',
                columns: data.content.map((mutationData) => {
                    return {
                        name: mutationData.displayName,
                        sort: true,
                        formatter: (cell: number) => formatProportion(cell),
                    };
                }),
            },
        ];
    };

    const getData = (data: Dataset<MutationData>) => {
        return getMutationComparisonTableData(data).map((row) => Object.values(row));
    };

    return <Table data={getData(data)} columns={getHeaders()} pagination={true} />;
};

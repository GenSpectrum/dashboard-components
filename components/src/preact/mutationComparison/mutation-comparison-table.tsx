import { type FunctionComponent } from 'preact';

import { getMutationComparisonTableData } from './getMutationComparisonTableData';
import { type MutationData } from './queryMutationData';
import { type Dataset } from '../../operator/Dataset';
import { type ProportionInterval } from '../components/proportion-selector';
import { Table } from '../components/table';
import { formatProportion } from '../shared/table/formatProportion';

export interface MutationsTableProps {
    data: Dataset<MutationData>;
    proportionInterval: ProportionInterval;
}

export const MutationComparisonTable: FunctionComponent<MutationsTableProps> = ({ data, proportionInterval }) => {
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

    const tableData = getMutationComparisonTableData(data, proportionInterval).map((row) => Object.values(row));

    return <Table data={tableData} columns={getHeaders()} pagination={true} />;
};

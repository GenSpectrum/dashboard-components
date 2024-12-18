import { type FunctionComponent } from 'preact';

import { getMutationComparisonTableData } from './getMutationComparisonTableData';
import { type MutationData } from './queryMutationData';
import { type Dataset } from '../../operator/Dataset';
import { type DeletionClass, type SubstitutionClass } from '../../utils/mutations';
import { type ProportionInterval } from '../components/proportion-selector';
import { Table } from '../components/table';
import { sortSubstitutionsAndDeletions } from '../shared/sort/sortSubstitutionsAndDeletions';
import { formatProportion } from '../shared/table/formatProportion';

export interface MutationsTableProps {
    data: Dataset<MutationData>;
    proportionInterval: ProportionInterval;
    pageSize: boolean | number;
}

export const MutationComparisonTable: FunctionComponent<MutationsTableProps> = ({
    data,
    proportionInterval,
    pageSize,
}) => {
    const headers = [
        {
            name: 'Mutation',
            sort: {
                compare: sortSubstitutionsAndDeletions,
            },
            formatter: (cell: SubstitutionClass | DeletionClass) => cell.toString(),
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

    const tableData = getMutationComparisonTableData(data, proportionInterval).map((row) => Object.values(row));

    return <Table data={tableData} columns={headers} pageSize={pageSize} />;
};

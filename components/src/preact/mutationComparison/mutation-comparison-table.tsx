import { type FunctionComponent } from 'preact';

import { getMutationComparisonTableData } from './getMutationComparisonTableData';
import { type MutationData } from './queryMutationData';
import { type Dataset } from '../../operator/Dataset';
import { type Deletion, type Substitution } from '../../utils/mutations';
import { type ProportionInterval } from '../components/proportion-selector';
import { Table } from '../components/table';
import { sortSubstitutionsAndDeletions } from '../shared/sort/sortSubstitutionsAndDeletions';
import { formatProportion } from '../shared/table/formatProportion';

export interface MutationsTableProps {
    data: Dataset<MutationData>;
    proportionInterval: ProportionInterval;
}

export const MutationComparisonTable: FunctionComponent<MutationsTableProps> = ({ data, proportionInterval }) => {
    const headers = [
        {
            name: 'Mutation',
            sort: {
                compare: sortSubstitutionsAndDeletions,
            },
            formatter: (cell: Substitution | Deletion) => cell.toString(),
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

    return <Table data={tableData} columns={headers} pagination={true} />;
};

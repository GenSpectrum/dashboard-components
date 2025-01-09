import { type FunctionComponent } from 'preact';
import { useMemo } from 'preact/hooks';

import { getMutationsTableData } from './getMutationsTableData';
import { type SubstitutionOrDeletionEntry } from '../../types';
import { type DeletionClass, type SubstitutionClass } from '../../utils/mutations';
import type { ProportionInterval } from '../components/proportion-selector';
import { Table } from '../components/table';
import { sortSubstitutionsAndDeletions } from '../shared/sort/sortSubstitutionsAndDeletions';
import { formatProportion } from '../shared/table/formatProportion';

export interface MutationsTableProps {
    data: SubstitutionOrDeletionEntry[];
    baselineSubstitutionsOrDeletions: SubstitutionOrDeletionEntry[] | undefined;
    overallVariantCount: number;
    proportionInterval: ProportionInterval;
    pageSize: boolean | number;
}

const MutationsTable: FunctionComponent<MutationsTableProps> = ({
    data,
    baselineSubstitutionsOrDeletions,
    overallVariantCount,
    proportionInterval,
    pageSize,
}) => {
    const headers = [
        {
            name: 'Mutation',
            sort: {
                compare: (a: SubstitutionClass | DeletionClass, b: SubstitutionClass | DeletionClass) => {
                    return sortSubstitutionsAndDeletions(a, b);
                },
            },
            formatter: (cell: SubstitutionClass | DeletionClass) => cell.toString(),
        },
        {
            name: 'Type',
            sort: true,
        },
        {
            name: 'Count',
            sort: true,
        },
        {
            name: 'Proportion',
            sort: true,
            formatter: (cell: number) => formatProportion(cell),
        },
    ];
    if (baselineSubstitutionsOrDeletions !== undefined) {
        headers.push({
            name: 'Jaccard similarity',
            sort: true,
            formatter: (cell: number) => cell.toFixed(2),
        });
    }

    const tableData = useMemo(
        () =>
            getMutationsTableData(data, baselineSubstitutionsOrDeletions, overallVariantCount, proportionInterval).map(
                (row) => Object.values(row),
            ),
        [data, baselineSubstitutionsOrDeletions, overallVariantCount, proportionInterval],
    );

    return <Table data={tableData} columns={headers} pageSize={pageSize} />;
};

export default MutationsTable;

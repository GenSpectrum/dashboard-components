import { type FunctionComponent } from 'preact';

import { getMutationComparisonTableData } from './getMutationComparisonTableData';
import { type MutationData } from './queryMutationData';
import { type Dataset } from '../../operator/Dataset';
import type { SequenceType } from '../../types';
import { type DeletionClass, type SubstitutionClass } from '../../utils/mutations';
import { useMutationAnnotationsProvider } from '../MutationAnnotationsContext';
import { GridJsAnnotatedMutation } from '../components/annotated-mutation';
import { type ProportionInterval } from '../components/proportion-selector';
import { Table } from '../components/table';
import { sortSubstitutionsAndDeletions } from '../shared/sort/sortSubstitutionsAndDeletions';
import { formatProportion } from '../shared/table/formatProportion';

export interface MutationsTableProps {
    data: Dataset<MutationData>;
    proportionInterval: ProportionInterval;
    pageSize: boolean | number;
    sequenceType: SequenceType;
}

export const MutationComparisonTable: FunctionComponent<MutationsTableProps> = ({
    data,
    proportionInterval,
    pageSize,
    sequenceType,
}) => {
    const annotationsProvider = useMutationAnnotationsProvider();

    const headers = [
        {
            name: 'Mutation',
            sort: {
                compare: sortSubstitutionsAndDeletions,
            },
            formatter: (cell: SubstitutionClass | DeletionClass) => (
                <GridJsAnnotatedMutation
                    mutation={cell}
                    sequenceType={sequenceType}
                    annotationsProvider={annotationsProvider}
                />
            ),
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

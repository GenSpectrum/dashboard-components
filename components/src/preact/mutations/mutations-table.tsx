import { FunctionComponent } from 'preact';
import { Dataset } from '../../operator/Dataset';
import { MutationEntry, MutationType } from '../../operator/FetchMutationsOperator';
import { Table } from '../components/table';
import { TDataObjectRow } from 'gridjs/dist/src/types';
import { formatProportion } from '../shared/table/formatProportion';

export interface MutationsTableProps {
    data: Dataset<MutationEntry>;
}

const MutationsTable: FunctionComponent<MutationsTableProps> = ({ data }) => {
    const getHeaders = () => {
        return [
            {
                name: 'Mutation',
                sort: true,
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
    };

    const getTableData = (data: Dataset<MutationEntry>): TDataObjectRow[] => {
        return data.content.map((mutationEntry): TDataObjectRow => {
            return {
                mutation: mutationEntry.mutation.toString(),
                type: getMutationTypeName(mutationEntry.type),
                count: mutationEntry.count,
                proportion: getProportion(mutationEntry),
            };
        });
    };

    const getMutationTypeName = (mutationType: MutationType) => {
        switch (mutationType) {
            case 'substitution':
                return 'Substitution';
            case 'deletion':
                return 'Deletion';
            case 'insertion':
                return 'Insertion';
            default:
                throw new Error('Invalid mutation type');
        }
    };

    const getProportion = (mutationEntry: MutationEntry) => {
        if (mutationEntry.type === 'insertion') {
            return '';
        }
        return mutationEntry.proportion;
    };

    return <Table data={getTableData(data)} columns={getHeaders()} pagination={true} />;
};

export default MutationsTable;

import { FunctionComponent } from 'preact';
import { Dataset } from '../../operator/Dataset';
import { Table } from '../components/table';
import { MutationData } from './mutation-comparison';
import { formatProportion } from '../mutations/mutations-grid';

export interface MutationsTableProps {
    data: Dataset<MutationData>;
}

type Proportions = {
    [displayName: string]: number;
};

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

    const getTableData = () => {
        const mutationsToProportions = new Map<string, Proportions>();

        for (const mutationData of data.content) {
            for (const mutationEntry of mutationData.data) {
                if (mutationEntry.type === 'insertion') {
                    continue;
                }
                const mutation = mutationEntry.mutation.toString();
                const proportions = mutationsToProportions.get(mutation) || {};
                proportions[mutationData.displayName] = mutationEntry.proportion;
                mutationsToProportions.set(mutation, proportions);
            }
        }

        return [...mutationsToProportions.entries()].map(([mutation, proportions]) => {
            return [mutation, ...data.content.map((mutationData) => proportions[mutationData.displayName] || 0)];
        });
    };

    return <Table data={getTableData()} columns={getHeaders()} pagination={true} />;
};

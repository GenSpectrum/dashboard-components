import { type FunctionComponent } from 'preact';

import type { AggregateData } from '../../query/queryAggregateData';
import { AggregateTable } from '../aggregatedData/aggregate-table';

type SequencesByLocationTableProps = {
    locationData: AggregateData;
    lapisLocationField: string;
    pageSize: boolean | number;
};

export const SequencesByLocationTable: FunctionComponent<SequencesByLocationTableProps> = ({
    locationData,
    lapisLocationField,
    pageSize,
}) => {
    return <AggregateTable data={locationData} fields={[lapisLocationField]} pageSize={pageSize} />;
};

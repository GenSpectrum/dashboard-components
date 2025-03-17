import type { FunctionComponent } from 'preact';

import {
    type MutationOverTimeMutationValue,
    MUTATIONS_OVER_TIME_MIN_PROPORTION,
} from '../../query/queryMutationsOverTime';
import type { Deletion, Substitution } from '../../utils/mutations';
import { type Temporal, type TemporalClass, toTemporalClass, YearMonthDayClass } from '../../utils/temporalClass';
import { formatProportion } from '../shared/table/formatProportion';

export type MutationsOverTimeGridTooltipProps = {
    mutation: Substitution | Deletion;
    date: Temporal;
    value: MutationOverTimeMutationValue;
};

export const MutationsOverTimeGridTooltip: FunctionComponent<MutationsOverTimeGridTooltipProps> = ({
    mutation,
    date,
    value,
}: MutationsOverTimeGridTooltipProps) => {
    const dateClass = toTemporalClass(date);

    return (
        <div>
            <p>
                <span className='font-bold'>{dateClass.englishName()}</span>
            </p>
            <p>({timeIntervalDisplay(dateClass)})</p>
            <p>{mutation.code}</p>
            <TooltipValueDescription value={value} />
        </div>
    );
};

const TooltipValueDescription: FunctionComponent<{ value: MutationOverTimeMutationValue }> = ({ value }) => {
    if (value === null) {
        return <p>No data</p>;
    }

    const proportion =
        value.type === 'belowThreshold'
            ? `<${formatProportion(MUTATIONS_OVER_TIME_MIN_PROPORTION)}`
            : formatProportion(value.proportion);

    return (
        <>
            <p>Proportion: {proportion}</p>
            <TooltipValueCountsDescription value={value} />
        </>
    );
};

const TooltipValueCountsDescription: FunctionComponent<{
    value: NonNullable<MutationOverTimeMutationValue>;
}> = ({ value }) => {
    switch (value.type) {
        case 'wastewaterValue':
            return;
        case 'belowThreshold':
            return (
                <>
                    <p>{value.totalCount} samples are in the timeframe</p>
                    <p>none or less than {formatProportion(MUTATIONS_OVER_TIME_MIN_PROPORTION)} have the mutation</p>
                </>
            );
        case 'value':
            return (
                <>
                    <p>{value.totalCount} samples are in the timeframe</p>
                    <p>
                        {totalCountWithCoverage(value.count, value.proportion)} have coverage, of those {value.count}{' '}
                        have the mutation
                    </p>
                </>
            );
    }
};

function totalCountWithCoverage(count: number, proportion: number) {
    if (count === 0) {
        return 0;
    }
    return Math.round(count / proportion);
}

const timeIntervalDisplay = (date: TemporalClass) => {
    if (date instanceof YearMonthDayClass) {
        return date.toString();
    }

    return `${date.firstDay.toString()} - ${date.lastDay.toString()}`;
};

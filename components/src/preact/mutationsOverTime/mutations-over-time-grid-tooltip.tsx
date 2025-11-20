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

    const proportionText =
        value === null
            ? 'No data'
            : value.type === 'belowThreshold'
              ? `<${formatProportion(MUTATIONS_OVER_TIME_MIN_PROPORTION)}`
              : formatProportion(value.proportion);

    return (
        <div>
            <div className='flex flex-row justify-between gap-4 items-baseline'>
                <div className='flex flex-col text-left'>
                    <span className='font-bold'>{mutation.code}</span>
                    <span>{proportionText}</span>
                </div>
                <div className='flex flex-col text-right'>
                    <span className='font-bold'>{dateClass.englishName()}</span>
                    <span className='text-gray-600'>{timeIntervalDisplay(dateClass)}</span>
                </div>
            </div>
            {value === null ? (
                <p className='mt-2'>No data</p>
            ) : (
                <TooltipValueCountsDescription
                    value={value}
                    mutationCode={mutation.code}
                    mutationPosition={mutation.position}
                />
            )}
        </div>
    );
};

const TooltipValueCountsDescription: FunctionComponent<{
    value: NonNullable<MutationOverTimeMutationValue>;
    mutationCode: string;
    mutationPosition: number;
}> = ({ value, mutationCode, mutationPosition }) => {
    if (value.type === 'wastewaterValue') {
        return;
    }
    return (
        <div className='mt-2'>
            {value.type === 'belowThreshold' ? (
                <p className='text-gray-600'>
                    None or less than {formatProportion(MUTATIONS_OVER_TIME_MIN_PROPORTION)} have the mutation.
                </p>
            ) : (
                <>
                    <p>
                        {value.count} <span className='text-gray-600'>have the mutation {mutationCode} out of</span>
                    </p>
                    <p>
                        {totalCountWithCoverage(value.count, value.proportion)}{' '}
                        <span className='text-gray-600'>with coverage at position {mutationPosition}.</span>
                    </p>
                </>
            )}
            <p>
                {value.totalCount} <span className='text-gray-600'>total in this date range.</span>
            </p>
        </div>
    );
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

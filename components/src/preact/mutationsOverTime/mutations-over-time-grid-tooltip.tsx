import type { FunctionComponent } from 'preact';

import { type ProportionValue, MUTATIONS_OVER_TIME_MIN_PROPORTION } from '../../query/queryMutationsOverTime';
import type { Deletion, Substitution } from '../../utils/mutations';
import { type Temporal } from '../../utils/temporalClass';
import { OverTimeGridTooltip } from '../components/over-time-grid-tooltip';
import { formatProportion } from '../shared/table/formatProportion';

export type MutationsOverTimeGridTooltipProps = {
    mutation: Substitution | Deletion;
    date: Temporal;
    value: ProportionValue;
};

export const MutationsOverTimeGridTooltip: FunctionComponent<MutationsOverTimeGridTooltipProps> = ({
    mutation,
    date,
    value,
}: MutationsOverTimeGridTooltipProps) => {
    return (
        <OverTimeGridTooltip
            label={<span className='font-bold'>{mutation.code}</span>}
            date={date}
            value={value}
            minProportion={MUTATIONS_OVER_TIME_MIN_PROPORTION}
        >
            {value !== null && (
                <TooltipValueCountsDescription
                    value={value}
                    mutationCode={mutation.code}
                    mutationPosition={mutation.position}
                />
            )}
        </OverTimeGridTooltip>
    );
};

const TooltipValueCountsDescription: FunctionComponent<{
    value: NonNullable<ProportionValue>;
    mutationCode: string;
    mutationPosition: number;
}> = ({ value, mutationCode, mutationPosition }) => {
    if (value.type === 'wastewaterValue') {
        return;
    }
    return (
        <div className='mt-2'>
            {(() => {
                switch (value.type) {
                    case 'belowThreshold':
                        return (
                            <p className='text-gray-600'>
                                None or less than {formatProportion(MUTATIONS_OVER_TIME_MIN_PROPORTION)} have the
                                mutation.
                            </p>
                        );

                    case 'value':
                        return (
                            <>
                                <p>
                                    {value.count}{' '}
                                    <span className='text-gray-600'>have the mutation {mutationCode}.</span>
                                </p>
                                {value.proportion > 0 && (
                                    <p>
                                        {Math.round(value.count / value.proportion)}{' '}
                                        <span className='text-gray-600'>
                                            have coverage at position {mutationPosition}.
                                        </span>
                                    </p>
                                )}
                            </>
                        );

                    case 'valueWithCoverage':
                        return (
                            <>
                                <p>
                                    {value.count}{' '}
                                    <span className='text-gray-600'>have the mutation {mutationCode} out of</span>
                                </p>
                                <p>
                                    {value.coverage}{' '}
                                    <span className='text-gray-600'>with coverage at position {mutationPosition}.</span>
                                </p>
                            </>
                        );
                }
            })()}

            <p>
                {value.totalCount} <span className='text-gray-600'>total in this date range.</span>
            </p>
        </div>
    );
};

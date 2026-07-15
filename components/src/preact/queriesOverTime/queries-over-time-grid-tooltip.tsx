import type { FunctionComponent } from 'preact';

import { type ProportionValue } from '../../query/queryMutationsOverTime';
import { type Temporal } from '../../utils/temporalClass';
import { OverTimeGridTooltip } from '../components/over-time-grid-tooltip';
import { formatProportion } from '../shared/table/formatProportion';

const MIN_PROPORTION = 0.001;

export type QueriesOverTimeGridTooltipProps = {
    query: string; // displayLabel
    date: Temporal;
    value: ProportionValue;
};

export const QueriesOverTimeGridTooltip: FunctionComponent<QueriesOverTimeGridTooltipProps> = ({
    query,
    date,
    value,
}: QueriesOverTimeGridTooltipProps) => {
    return (
        <OverTimeGridTooltip label={<span className='font-bold'>{query}</span>} date={date} value={value}>
            {value !== null && <TooltipValueCountsDescription value={value} queryLabel={query} />}
        </OverTimeGridTooltip>
    );
};

const TooltipValueCountsDescription: FunctionComponent<{
    value: NonNullable<ProportionValue>;
    queryLabel: string;
}> = ({ value, queryLabel }) => {
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
                                None or less than {formatProportion(MIN_PROPORTION)} match the query.
                            </p>
                        );

                    case 'value':
                        return (
                            <>
                                <p>
                                    {value.count} <span className='text-gray-600'>match the query {queryLabel}.</span>
                                </p>
                                {value.proportion > 0 && (
                                    <p>
                                        {Math.round(value.count / value.proportion)}{' '}
                                        <span className='text-gray-600'>total with coverage.</span>
                                    </p>
                                )}
                            </>
                        );

                    case 'valueWithCoverage':
                        return (
                            <>
                                <p>
                                    {value.count}{' '}
                                    <span className='text-gray-600'>match the query {queryLabel} out of</span>
                                </p>
                                <p>
                                    {value.coverage}{' '}
                                    <span className='text-gray-600'>with coverage for this query.</span>
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

import type { FunctionComponent } from 'preact';

import { type ProportionValue } from '../../query/queryMutationsOverTime';
import { type Temporal, type TemporalClass, toTemporalClass, YearMonthDayClass } from '../../utils/temporalClass';
import { formatProportion } from '../shared/table/formatProportion';

// Use the same threshold as mutations for consistency
const QUERIES_OVER_TIME_MIN_PROPORTION = 0.001;

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
    const dateClass = toTemporalClass(date);

    let proportionText = 'No data';

    if (value !== null) {
        switch (value.type) {
            case 'belowThreshold': {
                proportionText = `<${formatProportion(QUERIES_OVER_TIME_MIN_PROPORTION)}`;
                break;
            }
            case 'value':
            case 'wastewaterValue': {
                proportionText = formatProportion(value.proportion);
                break;
            }
            case 'valueWithCoverage': {
                // value.coverage will always be non-zero if we're in this case
                proportionText = formatProportion(value.count / value.coverage);
                break;
            }
        }
    }

    return (
        <div>
            <div className='flex flex-row justify-between gap-4 items-baseline'>
                <div className='flex flex-col text-left'>
                    <span className='font-bold'>{query}</span>
                    <span>{proportionText}</span>
                </div>
                <div className='flex flex-col text-right'>
                    <span className='font-bold'>{dateClass.englishName()}</span>
                    <span className='text-gray-600'>{timeIntervalDisplay(dateClass)}</span>
                </div>
            </div>
            {value !== null && <TooltipValueCountsDescription value={value} queryLabel={query} />}
        </div>
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
                                None or less than {formatProportion(QUERIES_OVER_TIME_MIN_PROPORTION)} match the
                                query.
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
                                    {value.count} <span className='text-gray-600'>match the query {queryLabel} out of</span>
                                </p>
                                <p>
                                    {value.coverage} <span className='text-gray-600'>with coverage for this query.</span>
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

const timeIntervalDisplay = (date: TemporalClass) => {
    if (date instanceof YearMonthDayClass) {
        return date.toString();
    }

    return `${date.firstDay.toString()} - ${date.lastDay.toString()}`;
};

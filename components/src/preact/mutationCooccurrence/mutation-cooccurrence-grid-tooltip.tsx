import type { FunctionComponent } from 'preact';

import type { CooccurrencePattern } from './CooccurrenceOverTimeData';
import { type ProportionValue } from '../../query/queryMutationsOverTime';
import { type Temporal } from '../../utils/temporalClass';
import { OverTimeGridTooltip } from '../components/over-time-grid-tooltip';
import { formatProportion } from '../shared/table/formatProportion';

const MIN_PROPORTION = 0.001;

export type MutationCooccurrenceGridTooltipProps = {
    pattern: CooccurrencePattern;
    date: Temporal;
    value: ProportionValue;
};

export const MutationCooccurrenceGridTooltip: FunctionComponent<MutationCooccurrenceGridTooltipProps> = ({
    pattern,
    date,
    value,
}) => {
    const patternLabel = Object.entries(pattern.alleles)
        .map(([pos, allele]) => `${pos}:${allele ?? '?'}`)
        .join(', ');

    return (
        <OverTimeGridTooltip
            label={<span className='font-bold font-mono text-xs'>{patternLabel}</span>}
            date={date}
            value={value}
        >
            {value !== null && value.type !== 'wastewaterValue' && <TooltipValueCountsDescription value={value} />}
        </OverTimeGridTooltip>
    );
};

const TooltipValueCountsDescription: FunctionComponent<{
    value: Exclude<NonNullable<ProportionValue>, { type: 'wastewaterValue' }>;
}> = ({ value }) => {
    return (
        <div className='mt-2'>
            {value.type === 'belowThreshold' && (
                <p className='text-gray-600'>
                    None or less than {formatProportion(MIN_PROPORTION)} match this pattern.
                </p>
            )}
            {value.type === 'value' && (
                <>
                    <p>
                        {value.count} <span className='text-gray-600'>sequences match this pattern.</span>
                    </p>
                    <p>
                        {value.totalCount} <span className='text-gray-600'>total in this date range.</span>
                    </p>
                </>
            )}
            {value.type === 'valueWithCoverage' && (
                <>
                    <p>
                        {value.count} <span className='text-gray-600'>match this pattern out of</span>
                    </p>
                    <p>
                        {value.coverage} <span className='text-gray-600'>with coverage.</span>
                    </p>
                    <p>
                        {value.totalCount} <span className='text-gray-600'>total in this date range.</span>
                    </p>
                </>
            )}
        </div>
    );
};

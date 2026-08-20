import type { FunctionComponent } from 'preact';

import type { CooccurrencePattern } from './CooccurrenceOverTimeData';
import { getAlleleColor } from '../components/alleleColors';
import { MUTATIONS_OVER_TIME_MIN_PROPORTION, type ProportionValue } from '../../query/queryMutationsOverTime';
import { type Temporal } from '../../utils/temporalClass';
import { OverTimeGridTooltip } from '../components/over-time-grid-tooltip';
import { formatProportion } from '../shared/table/formatProportion';

export type MutationCooccurrenceGridTooltipProps = {
    pattern: CooccurrencePattern;
    positions: string[];
    date: Temporal;
    value: ProportionValue;
};

export const MutationCooccurrenceGridTooltip: FunctionComponent<MutationCooccurrenceGridTooltipProps> = ({
    pattern,
    positions,
    date,
    value,
}) => {
    const label = (
        <span className='font-bold font-mono text-sm tracking-wider'>
            {positions.map((pos) => {
                const allele = pattern.alleles[pos];
                const display = allele === null || allele === undefined ? '?' : allele === 'N' ? '-' : allele;
                const color = allele !== null && allele !== undefined ? getAlleleColor(pos, allele) : undefined;
                return (
                    <span key={pos} style={color ? { color } : undefined}>
                        {display}
                    </span>
                );
            })}
        </span>
    );

    return (
        <OverTimeGridTooltip label={label} date={date} value={value}>
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
                    None or less than {formatProportion(MUTATIONS_OVER_TIME_MIN_PROPORTION)} match this pattern.
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

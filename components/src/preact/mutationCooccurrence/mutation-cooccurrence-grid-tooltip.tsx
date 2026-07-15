import type { FunctionComponent } from 'preact';

import type { CooccurrencePattern } from './CooccurrenceOverTimeData';
import type { ProportionValue } from '../../query/queryMutationsOverTime';
import { type Temporal, type TemporalClass, toTemporalClass, YearMonthDayClass } from '../../utils/temporalClass';
import { formatProportion } from '../shared/table/formatProportion';

const COOCCURRENCE_MIN_PROPORTION = 0.001;

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
    const dateClass = toTemporalClass(date);

    let proportionText = 'No data';
    if (value !== null) {
        switch (value.type) {
            case 'belowThreshold':
                proportionText = `<${formatProportion(COOCCURRENCE_MIN_PROPORTION)}`;
                break;
            case 'value':
                proportionText = formatProportion(value.proportion);
                break;
            case 'valueWithCoverage':
                proportionText = formatProportion(value.count / value.coverage);
                break;
            case 'wastewaterValue':
                proportionText = formatProportion(value.proportion);
                break;
        }
    }

    const patternLabel = Object.entries(pattern.alleles)
        .map(([pos, allele]) => `${pos}:${allele ?? '?'}`)
        .join(', ');

    return (
        <div>
            <div className='flex flex-row justify-between gap-4 items-baseline'>
                <div className='flex flex-col text-left'>
                    <span className='font-bold font-mono text-xs'>{patternLabel}</span>
                    <span>{proportionText}</span>
                </div>
                <div className='flex flex-col text-right'>
                    <span className='font-bold'>{dateClass.englishName()}</span>
                    <span className='text-gray-600'>{timeIntervalDisplay(dateClass)}</span>
                </div>
            </div>
            {value !== null && value.type !== 'wastewaterValue' && (
                <div className='mt-2'>
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
                    {value.type === 'belowThreshold' && (
                        <p className='text-gray-600'>
                            None or less than {formatProportion(COOCCURRENCE_MIN_PROPORTION)} match this pattern.
                        </p>
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
            )}
        </div>
    );
};

const timeIntervalDisplay = (date: TemporalClass) => {
    if (date instanceof YearMonthDayClass) {
        return date.toString();
    }
    return `${date.firstDay.toString()} - ${date.lastDay.toString()}`;
};

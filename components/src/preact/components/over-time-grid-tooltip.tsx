import type { FunctionComponent, ReactNode } from 'preact/compat';

import { type ProportionValue } from '../../query/queryMutationsOverTime';
import { type Temporal, type TemporalClass, toTemporalClass, YearMonthDayClass } from '../../utils/temporalClass';
import { formatProportion } from '../shared/table/formatProportion';

const MIN_PROPORTION = 0.001;

type OverTimeGridTooltipProps = {
    label: ReactNode;
    date: Temporal;
    value: ProportionValue;
    minProportion?: number;
    children?: ReactNode;
};

export const OverTimeGridTooltip: FunctionComponent<OverTimeGridTooltipProps> = ({
    label,
    date,
    value,
    minProportion = MIN_PROPORTION,
    children,
}) => {
    const dateClass = toTemporalClass(date);

    let proportionText = 'No data';
    if (value !== null) {
        switch (value.type) {
            case 'belowThreshold':
                proportionText = `<${formatProportion(minProportion)}`;
                break;
            case 'value':
            case 'wastewaterValue':
                proportionText = formatProportion(value.proportion);
                break;
            case 'valueWithCoverage':
                proportionText = formatProportion(value.count / value.coverage);
                break;
        }
    }

    return (
        <div>
            <div className='flex flex-row justify-between gap-4 items-baseline'>
                <div className='flex flex-col text-left'>
                    {label}
                    <span>{proportionText}</span>
                </div>
                <div className='flex flex-col text-right'>
                    <span className='font-bold'>{dateClass.englishName()}</span>
                    <span className='text-gray-600'>{timeIntervalDisplay(dateClass)}</span>
                </div>
            </div>
            {children}
        </div>
    );
};

const timeIntervalDisplay = (date: TemporalClass) => {
    if (date instanceof YearMonthDayClass) {
        return date.toString();
    }
    return `${date.firstDay.toString()} - ${date.lastDay.toString()}`;
};

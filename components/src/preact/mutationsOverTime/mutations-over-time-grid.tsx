import { Fragment, type FunctionComponent } from 'preact';

import {
    type MutationOverTimeDataGroupedByMutation,
    type MutationOverTimeMutationValue,
} from '../../query/queryMutationsOverTime';
import { type Deletion, type Substitution } from '../../utils/mutations';
import { compareTemporal, type Temporal, YearMonthDay } from '../../utils/temporal';
import Tooltip, { type TooltipPosition } from '../components/tooltip';
import { singleGraphColorRGBByName } from '../shared/charts/colors';
import { formatProportion } from '../shared/table/formatProportion';

export interface MutationsOverTimeGridProps {
    data: MutationOverTimeDataGroupedByMutation;
}

const MAX_NUMBER_OF_GRID_ROWS = 100;

const MutationsOverTimeGrid: FunctionComponent<MutationsOverTimeGridProps> = ({ data }) => {
    const allMutations = data.getFirstAxisKeys();
    const shownMutations = allMutations.slice(0, MAX_NUMBER_OF_GRID_ROWS);

    const dates = data.getSecondAxisKeys().sort((a, b) => compareTemporal(a, b));

    return (
        <>
            {allMutations.length > MAX_NUMBER_OF_GRID_ROWS && (
                <div className='pl-2'>
                    Showing {MAX_NUMBER_OF_GRID_ROWS} of {allMutations.length} mutations. You can narrow the filter to
                    reduce the number of mutations.
                </div>
            )}
            <div
                style={{
                    display: 'grid',
                    gridTemplateRows: `repeat(${shownMutations.length}, 24px)`,
                    gridTemplateColumns: `8rem repeat(${dates.length}, minmax(1.5rem, 1fr))`,
                }}
            >
                {shownMutations.map((mutation, rowIndex) => {
                    return (
                        <Fragment key={`fragment-${mutation.toString()}`}>
                            <div
                                key={`mutation-${mutation.toString()}`}
                                style={{ gridRowStart: rowIndex + 1, gridColumnStart: 1 }}
                            >
                                <MutationCell mutation={mutation} />
                            </div>
                            {dates.map((date, columnIndex) => {
                                const value = data.get(mutation, date) ?? { proportion: 0, count: 0 };
                                const tooltipPosition = getTooltipPosition(
                                    rowIndex,
                                    shownMutations.length,
                                    columnIndex,
                                    dates.length,
                                );
                                return (
                                    <div
                                        style={{ gridRowStart: rowIndex + 1, gridColumnStart: columnIndex + 2 }}
                                        key={`${mutation.toString()}-${date.toString()}`}
                                    >
                                        <ProportionCell
                                            value={value}
                                            date={date}
                                            mutation={mutation}
                                            tooltipPosition={tooltipPosition}
                                        />
                                    </div>
                                );
                            })}
                        </Fragment>
                    );
                })}
            </div>
        </>
    );
};

function getTooltipPosition(rowIndex: number, rows: number, columnIndex: number, columns: number) {
    const tooltipX = rowIndex < rows / 2 ? 'bottom' : 'top';
    const tooltipY = columnIndex < columns / 2 ? 'start' : 'end';
    return `${tooltipX}-${tooltipY}` as const;
}

const ProportionCell: FunctionComponent<{
    value: MutationOverTimeMutationValue;
    date: Temporal;
    mutation: Substitution | Deletion;
    tooltipPosition: TooltipPosition;
}> = ({ value, mutation, date, tooltipPosition }) => {
    const tooltipContent = (
        <div>
            <p>
                <span className='font-bold'>{date.englishName()}</span> ({timeIntervalDisplay(date)})
            </p>
            <p>{mutation.code}</p>
            <p>Proportion: {formatProportion(value.proportion)}</p>
            <p>Count: {value.count}</p>
        </div>
    );

    return (
        <>
            <div className={'py-1'}>
                <Tooltip content={tooltipContent} position={tooltipPosition}>
                    <div
                        style={{
                            backgroundColor: backgroundColor(value.proportion),
                            color: textColor(value.proportion),
                        }}
                        className='text-center hover:font-bold text-xs'
                    >
                        {formatProportion(value.proportion, 0)}
                    </div>
                </Tooltip>
            </div>
        </>
    );
};

const timeIntervalDisplay = (date: Temporal) => {
    if (date instanceof YearMonthDay) {
        return date.toString();
    }

    return `${date.firstDay.toString()} - ${date.lastDay.toString()}`;
};

const backgroundColor = (proportion: number) => {
    // TODO(#353): Make minAlpha and maxAlpha configurable
    const minAlpha = 0.0;
    const maxAlpha = 1;

    const alpha = minAlpha + (maxAlpha - minAlpha) * proportion;
    return singleGraphColorRGBByName('indigo', alpha);
};

const textColor = (proportion: number) => {
    return proportion > 0.5 ? 'white' : 'black';
};

const MutationCell: FunctionComponent<{ mutation: Substitution | Deletion }> = ({ mutation }) => {
    return <div className='text-center'>{mutation.toString()}</div>;
};

export default MutationsOverTimeGrid;

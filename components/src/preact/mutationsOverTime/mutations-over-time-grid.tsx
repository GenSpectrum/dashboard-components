import { Fragment, type FunctionComponent, type RefObject } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

import { type MutationOverTimeDataMap } from './MutationOverTimeData';
import { type MutationOverTimeMutationValue } from '../../query/queryMutationsOverTime';
import { type Deletion, type Substitution } from '../../utils/mutations';
import { type Temporal, type TemporalClass, toTemporalClass, YearMonthDayClass } from '../../utils/temporalClass';
import { type ColorScale, getColorWithingScale, getTextColorForScale } from '../components/color-scale-selector';
import Tooltip, { type TooltipPosition } from '../components/tooltip';
import { formatProportion } from '../shared/table/formatProportion';

export interface MutationsOverTimeGridProps {
    data: MutationOverTimeDataMap;
    colorScale: ColorScale;
}

const MAX_NUMBER_OF_GRID_ROWS = 100;
const MUTATION_CELL_WIDTH_REM = 8;

const MutationsOverTimeGrid: FunctionComponent<MutationsOverTimeGridProps> = ({ data, colorScale }) => {
    const allMutations = data.getFirstAxisKeys();
    const shownMutations = allMutations.slice(0, MAX_NUMBER_OF_GRID_ROWS);

    const dates = data.getSecondAxisKeys();

    const [showProportionText, setShowProportionText] = useState(false);
    const gridRef = useRef<HTMLDivElement>(null);
    useShowProportion(gridRef, dates.length, setShowProportionText);

    return (
        <>
            {allMutations.length > MAX_NUMBER_OF_GRID_ROWS && (
                <div className='pl-2'>
                    Showing {MAX_NUMBER_OF_GRID_ROWS} of {allMutations.length} mutations. You can narrow the filter to
                    reduce the number of mutations.
                </div>
            )}
            {allMutations.length === 0 && (
                <div className={'flex justify-center'}>No data available for your filters.</div>
            )}
            <div
                ref={gridRef}
                style={{
                    display: 'grid',
                    gridTemplateRows: `repeat(${shownMutations.length}, 24px)`,
                    gridTemplateColumns: `${MUTATION_CELL_WIDTH_REM}rem repeat(${dates.length}, minmax(0.05rem, 1fr))`,
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
                                const value = data.get(mutation, date) ?? { proportion: 0, count: 0, totalCount: 0 };
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
                                            showProportionText={showProportionText}
                                            colorScale={colorScale}
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

function useShowProportion(
    gridRef: RefObject<HTMLDivElement>,
    girdColumns: number,
    setShowProportionText: (value: ((prevState: boolean) => boolean) | boolean) => void,
) {
    useEffect(() => {
        const checkWidth = () => {
            if (gridRef.current) {
                const width = gridRef.current.getBoundingClientRect().width;
                const widthPerDate = (width - remToPx(MUTATION_CELL_WIDTH_REM)) / girdColumns;
                const maxWidthProportionText = 28;

                setShowProportionText(widthPerDate > maxWidthProportionText);
            }
        };

        checkWidth();
        window.addEventListener('resize', checkWidth);

        return () => {
            window.removeEventListener('resize', checkWidth);
        };
    }, [girdColumns, gridRef, setShowProportionText]);
}

const remToPx = (rem: number) => rem * parseFloat(getComputedStyle(document.documentElement).fontSize);

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
    showProportionText: boolean;
    colorScale: ColorScale;
}> = ({ value, mutation, date, tooltipPosition, showProportionText, colorScale }) => {
    const dateClass = toTemporalClass(date);

    const tooltipContent = (
        <div>
            <p>
                <span className='font-bold'>{dateClass.englishName()}</span>
            </p>
            <p>({timeIntervalDisplay(dateClass)})</p>
            <p>{mutation.code}</p>
            <p>Proportion: {formatProportion(value.proportion)}</p>
            <p>
                Count: {value.count} / {value.totalCount} total
            </p>
        </div>
    );

    return (
        <div className={'py-1 w-full h-full'}>
            <Tooltip content={tooltipContent} position={tooltipPosition}>
                <div
                    style={{
                        backgroundColor: getColorWithingScale(value.proportion, colorScale),
                        color: getTextColorForScale(value.proportion, colorScale),
                    }}
                    className={`w-full h-full text-center hover:font-bold text-xs group`}
                >
                    {showProportionText ? formatProportion(value.proportion, 0) : undefined}
                </div>
            </Tooltip>
        </div>
    );
};

const timeIntervalDisplay = (date: TemporalClass) => {
    if (date instanceof YearMonthDayClass) {
        return date.toString();
    }

    return `${date.firstDay.toString()} - ${date.lastDay.toString()}`;
};

const MutationCell: FunctionComponent<{ mutation: Substitution | Deletion }> = ({ mutation }) => {
    return <div className='text-center'>{mutation.code}</div>;
};

export default MutationsOverTimeGrid;

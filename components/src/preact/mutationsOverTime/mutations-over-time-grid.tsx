import { Fragment, type FunctionComponent } from 'preact';
import { useMemo } from 'preact/hooks';

import { type MutationOverTimeDataMap } from './MutationOverTimeData';
import { type MutationOverTimeMutationValue } from '../../query/queryMutationsOverTime';
import { type SequenceType } from '../../types';
import { type Deletion, type Substitution } from '../../utils/mutations';
import { type Temporal, type TemporalClass, toTemporalClass, YearMonthDayClass } from '../../utils/temporalClass';
import { AnnotatedMutation } from '../components/annotated-mutation';
import { type ColorScale, getColorWithingScale, getTextColorForScale } from '../components/color-scale-selector';
import Tooltip, { type TooltipPosition } from '../components/tooltip';
import { formatProportion } from '../shared/table/formatProportion';
import { createColumnHelper, flexRender, getCoreRowModel, usePreactTable } from '../shared/tanstackTable/tanstackTable';

export interface MutationsOverTimeGridProps {
    data: MutationOverTimeDataMap;
    colorScale: ColorScale;
    maxNumberOfGridRows?: number;
    sequenceType: SequenceType;
}

const MAX_NUMBER_OF_GRID_ROWS = 100;
const MUTATION_CELL_WIDTH_REM = 8;

type RowType = { mutation: Substitution | Deletion; values: (MutationOverTimeMutationValue | undefined)[] };

const MutationsOverTimeGrid: FunctionComponent<MutationsOverTimeGridProps> = ({
    data,
    colorScale,
    maxNumberOfGridRows,
    sequenceType,
}) => {
    const currentMaxNumberOfGridRows = maxNumberOfGridRows ?? MAX_NUMBER_OF_GRID_ROWS;
    const allMutations = data.getFirstAxisKeys();
    const shownMutations = allMutations.slice(0, currentMaxNumberOfGridRows);

    const dates = data.getSecondAxisKeys();

    const myData = useMemo(() => {
        return data.getAsArray().map((row, index) => {
            return { mutation: allMutations[index], values: [...row] };
        });
    }, [data]);

    const columns = useMemo(() => {
        const columnHelper = createColumnHelper<RowType>();

        const dateHeaders = dates.map((date, index) => {
            return columnHelper.accessor((row) => row.values[index], {
                id: `date-${index}`,
                header: () => (
                    <div className='@container min-w-[0.05rem]'>
                        <p {...styleGridHeader(index, dates.length)}>{date.dateString}</p>
                    </div>
                ),
                cell: ({ getValue, row }) => {
                    const value = getValue();
                    return (
                        <div className={'text-center'}>
                            <ProportionCell
                                value={value ?? null}
                                date={date}
                                mutation={row.original.mutation}
                                tooltipPosition={'bottom'}
                                colorScale={colorScale}
                            />
                        </div>
                    );
                },
            });
        });

        return [
            columnHelper.accessor((row) => row.mutation, {
                id: 'mutation',
                header: () => <span>Mutation</span>,
                cell: ({ getValue }) => {
                    const value = getValue();
                    return (
                        <div className={'text-center'}>
                            <AnnotatedMutation mutation={value} sequenceType={sequenceType} />
                        </div>
                    );
                },
            }),
            ...dateHeaders,
        ];
    }, [colorScale, dates, sequenceType]);

    const table = usePreactTable({
        data: myData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        debugTable: true,
    });

    return (
        <div className='w-full'>
            <table className={'w-full'}>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id} colSpan={header.colSpan} style={{ width: `${header.getSize()}px` }}>
                                    <div onClick={header.column.getToggleSortingHandler()}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map((cell, index) => (
                                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                            ))}
                        </tr>
                    ))}
                    {table.getRowModel().rows.length === 0 && <td colSpan={2}>Nothing to show</td>}
                </tbody>
            </table>
        </div>
    );

    return (
        <>
            {allMutations.length > currentMaxNumberOfGridRows && (
                <div className='pl-2'>
                    Showing {currentMaxNumberOfGridRows} of {allMutations.length} mutations. You can narrow the filter
                    to reduce the number of mutations.
                </div>
            )}
            {allMutations.length === 0 ? (
                <div className={'flex justify-center'}>No data available for your filters.</div>
            ) : (
                <div
                    ref={gridRef}
                    style={{
                        display: 'grid',
                        gridTemplateRows: `repeat(${shownMutations.length}, 24px)`,
                        gridTemplateColumns: `${MUTATION_CELL_WIDTH_REM}rem repeat(${dates.length}, minmax(0.05rem, 1fr))`,
                    }}
                    className='text-center'
                >
                    {dates.map((date, columnIndex) => (
                        <div
                            className='@container font-semibold'
                            style={{ gridRowStart: 1, gridColumnStart: columnIndex + 2 }}
                            key={date.dateString}
                        >
                            <p {...styleGridHeader(columnIndex, dates)}>{date.dateString}</p>
                        </div>
                    ))}
                    {shownMutations.map((mutation, rowIndex) => {
                        return (
                            <Fragment key={`fragment-${mutation.code}`}>
                                <div
                                    key={`mutation-${mutation.code}`}
                                    style={{ gridRowStart: rowIndex + 2, gridColumnStart: 1 }}
                                    className='flex items-center justify-center'
                                >
                                    <AnnotatedMutation mutation={mutation} sequenceType={sequenceType} />
                                </div>
                                {dates.map((date, columnIndex) => {
                                    const value = data.get(mutation, date) ?? null;
                                    const tooltipPosition = getTooltipPosition(
                                        rowIndex,
                                        shownMutations.length,
                                        columnIndex,
                                        dates.length,
                                    );
                                    return (
                                        <div
                                            style={{ gridRowStart: rowIndex + 2, gridColumnStart: columnIndex + 2 }}
                                            key={`${mutation.code}-${date.dateString}`}
                                        >
                                            <ProportionCell
                                                value={value}
                                                date={date}
                                                mutation={mutation}
                                                tooltipPosition={tooltipPosition}
                                                colorScale={colorScale}
                                            />
                                        </div>
                                    );
                                })}
                            </Fragment>
                        );
                    })}
                </div>
            )}
        </>
    );
};

function styleGridHeader(columnIndex: number, numDateColumns: number) {
    if (columnIndex === 0) {
        return { className: 'overflow-visible text-nowrap' };
    }

    if (columnIndex === numDateColumns - 1) {
        return { className: 'overflow-visible text-nowrap', style: { direction: 'rtl' } };
    }

    return { className: 'invisible @[6rem]:visible' };
}

function getTooltipPosition(rowIndex: number, rows: number, columnIndex: number, columns: number) {
    const tooltipX = rowIndex < rows / 2 || rowIndex < 6 ? 'bottom' : 'top';
    const tooltipY = columnIndex < columns / 2 ? 'start' : 'end';
    return `${tooltipX}-${tooltipY}` as const;
}

const ProportionCell: FunctionComponent<{
    value: MutationOverTimeMutationValue;
    date: Temporal;
    mutation: Substitution | Deletion;
    tooltipPosition: TooltipPosition;
    colorScale: ColorScale;
}> = ({ value, mutation, date, tooltipPosition, colorScale }) => {
    const dateClass = toTemporalClass(date);

    const tooltipContent = (
        <div>
            <p>
                <span className='font-bold'>{dateClass.englishName()}</span>
            </p>
            <p>({timeIntervalDisplay(dateClass)})</p>
            <p>{mutation.code}</p>
            {value === null ? (
                <p>No data</p>
            ) : (
                <>
                    <p>Proportion: {formatProportion(value.proportion)}</p>
                    {value.count !== null && value.totalCount !== null && (
                        <>
                            <p>
                                {value.count} / {totalCountWithCoverage(value.count, value.proportion)} with coverage
                            </p>
                            <p>{value.totalCount} in timeframe</p>
                        </>
                    )}
                </>
            )}
        </div>
    );

    return (
        <div className={'py-1 w-full h-full'}>
            <Tooltip content={tooltipContent} position={tooltipPosition}>
                <div
                    style={{
                        backgroundColor: getColorWithingScale(value?.proportion, colorScale),
                        color: getTextColorForScale(value?.proportion, colorScale),
                    }}
                    className={`w-full h-full hover:font-bold text-xs group @container`}
                >
                    <span className='invisible @[2rem]:visible'>
                        {value === null ? '' : formatProportion(value.proportion, 0)}
                    </span>
                </div>
            </Tooltip>
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

export default MutationsOverTimeGrid;

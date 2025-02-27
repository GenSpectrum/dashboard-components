import { type PaginationState } from '@tanstack/table-core';
import { type FunctionComponent } from 'preact';
import { useMemo, useState } from 'preact/hooks';

import { type MutationOverTimeDataMap } from './MutationOverTimeData';
import { type MutationOverTimeMutationValue } from '../../query/queryMutationsOverTime';
import { type SequenceType } from '../../types';
import { type Deletion, type Substitution } from '../../utils/mutations';
import { type Temporal, type TemporalClass, toTemporalClass, YearMonthDayClass } from '../../utils/temporalClass';
import { AnnotatedMutation } from '../components/annotated-mutation';
import { type ColorScale, getColorWithingScale, getTextColorForScale } from '../components/color-scale-selector';
import Tooltip, { type TooltipPosition } from '../components/tooltip';
import { formatProportion } from '../shared/table/formatProportion';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    usePreactTable,
} from '../shared/tanstackTable/tanstackTable';

export interface MutationsOverTimeGridProps {
    data: MutationOverTimeDataMap;
    colorScale: ColorScale;
    sequenceType: SequenceType;
}

type RowType = { mutation: Substitution | Deletion; values: (MutationOverTimeMutationValue | undefined)[] };

const MutationsOverTimeGrid: FunctionComponent<MutationsOverTimeGridProps> = ({ data, colorScale, sequenceType }) => {
    const dates = useMemo(() => {
        return data.getSecondAxisKeys();
    }, [data]);

    const myData = useMemo(() => {
        const allMutations = data.getFirstAxisKeys();
        return data.getAsArray().map((row, index) => {
            return { mutation: allMutations[index], values: [...row] };
        });
    }, [data]);

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

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
                cell: ({ getValue, row, column, table }) => {
                    const value = getValue();
                    const rowIndex = row.index;
                    const columnIndex = column.getIndex();
                    const totalRows = table.getRowModel().rows.length;
                    const totalColumns = table.getAllColumns().length;

                    return (
                        <div className={'text-center'}>
                            <ProportionCell
                                value={value ?? null}
                                date={date}
                                mutation={row.original.mutation}
                                tooltipPosition={getTooltipPosition(
                                    rowIndex - pagination.pageIndex * pagination.pageSize,
                                    totalRows,
                                    columnIndex,
                                    totalColumns,
                                )}
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
    }, [colorScale, dates, pagination.pageIndex, pagination.pageSize, sequenceType]);

    const table = usePreactTable({
        data: myData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        debugTable: true,
        onPaginationChange: setPagination,
        state: {
            pagination,
        },
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
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                            ))}
                        </tr>
                    ))}
                    {table.getRowModel().rows.length === 0 && (
                        <td colSpan={table.getFlatHeaders().length}>
                            <div className={'text-center'}>Nothing to show</div>
                        </td>
                    )}
                </tbody>
            </table>
            <div className='flex items-center gap-4 justify-end mt-2 flex-wrap'>
                <div className='flex items-center gap-2'>
                    <div className={'text-nowrap'}>Rows per page:</div>
                    <select
                        className={'select'}
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => {
                            table.setPageSize(Number(e.currentTarget?.value));
                        }}
                    >
                        {[10, 20, 30, 40, 50].map((pageSize) => (
                            <option key={pageSize} value={pageSize}>
                                {pageSize}
                            </option>
                        ))}
                    </select>
                </div>

                <span className='flex items-center gap-1'>
                    <div>Page</div>
                    <strong>
                        {table.getState().pagination.pageIndex + 1} of {table.getPageCount().toLocaleString()}
                    </strong>
                </span>

                <span className='flex items-center'>
                    Go to page:
                    <input
                        type='number'
                        min='1'
                        max={table.getPageCount()}
                        defaultValue={table.getState().pagination.pageIndex + 1}
                        onChange={(e) => {
                            const page = e.currentTarget.value ? Number(e.currentTarget.value) - 1 : 0;
                            table.setPageIndex(page);
                        }}
                        className='input'
                    />
                </span>
                <div className={'join'}>
                    <button
                        className='btn btn-outline join-item btn-sm'
                        onClick={() => table.firstPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <div className='iconify mdi--chevron-left-first' />
                    </button>
                    <button
                        className='btn btn-outline join-item btn-sm'
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <div className='iconify mdi--chevron-left' />
                    </button>
                    <button
                        className='btn btn-outline join-item btn-sm'
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <div className='iconify mdi--chevron-right' />
                    </button>
                    <button
                        className='btn btn-outline join-item btn-sm'
                        onClick={() => table.lastPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <div className='iconify mdi--chevron-right-last' />
                    </button>
                </div>
            </div>
        </div>
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

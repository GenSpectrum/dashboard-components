import { type PaginationState } from '@tanstack/table-core';
import { type FunctionComponent } from 'preact';
import { useMemo, useState } from 'preact/hooks';

import { type MutationOverTimeDataMap } from './MutationOverTimeData';
import { MutationsOverTimeGridTooltip } from './mutations-over-time-grid-tooltip';
import { type MutationOverTimeMutationValue } from '../../query/queryMutationsOverTime';
import { type SequenceType } from '../../types';
import { type Deletion, type Substitution } from '../../utils/mutations';
import { type Temporal } from '../../utils/temporalClass';
import { AnnotatedMutation } from '../components/annotated-mutation';
import { type ColorScale, getColorWithinScale, getTextColorForScale } from '../components/color-scale-selector';
import Tooltip, { type TooltipPosition } from '../components/tooltip';
import { formatProportion } from '../shared/table/formatProportion';
import { type PageSizes, Pagination } from '../shared/tanstackTable/pagination';
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
    pageSizes: PageSizes;
}

type RowType = { mutation: Substitution | Deletion; values: (MutationOverTimeMutationValue | undefined)[] };

const MutationsOverTimeGrid: FunctionComponent<MutationsOverTimeGridProps> = ({
    data,
    colorScale,
    sequenceType,
    pageSizes,
}) => {
    const tableData = useMemo(() => {
        const allMutations = data.getFirstAxisKeys();
        return data.getAsArray().map((row, index) => {
            return { mutation: allMutations[index], values: [...row] };
        });
    }, [data]);

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: typeof pageSizes === 'number' ? pageSizes : (pageSizes.at(0) ?? 10),
    });

    const columns = useMemo(() => {
        const columnHelper = createColumnHelper<RowType>();
        const dates = data.getSecondAxisKeys();

        const mutationHeader = columnHelper.accessor((row) => row.mutation, {
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
        });

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
                    const numberOfRows = table.getRowModel().rows.length;
                    const numberOfColumns = table.getAllColumns().length;

                    return (
                        <div className={'text-center'}>
                            <ProportionCell
                                value={value ?? null}
                                date={date}
                                mutation={row.original.mutation}
                                tooltipPosition={getTooltipPosition(
                                    rowIndex -
                                        table.getState().pagination.pageIndex * table.getState().pagination.pageSize,
                                    numberOfRows,
                                    columnIndex,
                                    numberOfColumns,
                                )}
                                colorScale={colorScale}
                            />
                        </div>
                    );
                },
            });
        });

        return [mutationHeader, ...dateHeaders];
    }, [colorScale, data, sequenceType]);

    const table = usePreactTable({
        data: tableData,
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
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                            <div className={'text-center'}>No data available for your filters.</div>
                        </td>
                    )}
                </tbody>
            </table>
            <div className={'mt-2'}>
                <Pagination table={table} pageSizes={pageSizes} />
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
    const proportion = value?.type === 'belowThreshold' ? 0 : value?.proportion;

    return (
        <div className={'py-1 w-full h-full'}>
            <Tooltip
                content={<MutationsOverTimeGridTooltip mutation={mutation} date={date} value={value} />}
                position={tooltipPosition}
            >
                <div
                    style={{
                        backgroundColor: getColorWithinScale(proportion, colorScale),
                        color: getTextColorForScale(proportion, colorScale),
                    }}
                    className={`w-full h-full hover:font-bold text-xs group @container`}
                >
                    {value === null ? (
                        <span className='invisible'>No data</span>
                    ) : (
                        <span className='invisible @[2rem]:visible'>{formatProportion(proportion ?? 0, 0)}</span>
                    )}
                </div>
            </Tooltip>
        </div>
    );
};

export default MutationsOverTimeGrid;

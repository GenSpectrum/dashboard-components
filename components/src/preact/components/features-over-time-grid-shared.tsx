import type { Table } from '@tanstack/table-core';
import { type FunctionComponent, type JSX } from 'preact';

import { type ColorScale, getColorWithinScale, getTextColorForScale } from './color-scale-selector';
import PortalTooltip from './portal-tooltip';
import { type TooltipPosition } from './tooltip';
import { getProportion, type ProportionValue } from '../../query/queryMutationsOverTime';
import { formatProportion } from '../shared/table/formatProportion';
import { type PageSizes, Pagination } from '../shared/tanstackTable/pagination';
import { flexRender } from '../shared/tanstackTable/tanstackTable';

const NON_BREAKING_SPACE = ' ';

export const ProportionCell: FunctionComponent<{
    value: ProportionValue;
    tooltip: JSX.Element;
    tooltipPosition: TooltipPosition;
    colorScale: ColorScale;
    tooltipPortalTarget: HTMLElement | null;
}> = ({ value, tooltip, tooltipPosition, colorScale, tooltipPortalTarget }) => {
    const proportion = getProportion(value);

    return (
        <div className={'py-1 w-full h-full'}>
            <PortalTooltip content={tooltip} position={tooltipPosition} portalTarget={tooltipPortalTarget}>
                <div
                    style={{
                        backgroundColor: getColorWithinScale(proportion, colorScale),
                        color: getTextColorForScale(proportion, colorScale),
                    }}
                    className={`w-full h-full hover:font-bold text-xs group @container text-nowrap`}
                >
                    {value === null ? (
                        <span className='invisible'>No data</span>
                    ) : (
                        <span className='invisible @[2rem]:visible'>
                            {proportion !== undefined ? formatProportion(proportion, 0) : NON_BREAKING_SPACE}
                        </span>
                    )}
                </div>
            </PortalTooltip>
        </div>
    );
};

type FeaturesOverTimeGridDisplayProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    table: Table<any>;
    pageSizes: PageSizes;
    totalRows?: number;
    loadingState?:
        | {
              isLoading: boolean;
              loadingRowLabels: string[];
          }
        | { isLoading: false; loadingRowLabels?: never };
};

export function FeaturesOverTimeGridDisplay({
    table,
    pageSizes,
    loadingState,
    totalRows,
}: FeaturesOverTimeGridDisplayProps) {
    const displayedTotalRows = totalRows ?? table.getCoreRowModel().rows.length;

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
                    {loadingState?.isLoading ? (
                        loadingState.loadingRowLabels.map((label, rowIndex) => (
                            <tr key={label}>
                                <td className='text-center'>{label}</td>
                                {rowIndex === 0 && (
                                    <td
                                        rowSpan={loadingState.loadingRowLabels.length}
                                        colSpan={table.getFlatHeaders().length - 1}
                                        className='text-center'
                                    >
                                        <span className='loading loading-spinner loading-sm' />
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <>
                            {table.getRowModel().rows.map((row) => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {table.getRowModel().rows.length === 0 && (
                                <tr>
                                    <td colSpan={table.getFlatHeaders().length}>
                                        <div className={'text-center'}>No data available for your filters.</div>
                                    </td>
                                </tr>
                            )}
                        </>
                    )}
                </tbody>
            </table>
            <div className={'mt-2'}>
                <Pagination table={table} pageSizes={pageSizes} totalRows={displayedTotalRows} />
            </div>
        </div>
    );
}

export function styleGridHeader(columnIndex: number, numDateColumns: number) {
    if (columnIndex === 0) {
        return { className: 'overflow-visible text-nowrap' };
    }

    if (columnIndex === numDateColumns - 1) {
        return { className: 'overflow-visible text-nowrap', style: { direction: 'rtl' } };
    }

    return { className: 'invisible @[6rem]:visible' };
}

export function getTooltipPosition(
    rowIndex: number,
    rows: number,
    columnIndex: number,
    columns: number,
): TooltipPosition {
    const tooltipX = rowIndex < rows / 2 || rowIndex < 6 ? 'bottom' : 'top';
    const tooltipY = columnIndex < columns / 2 ? 'start' : 'end';
    return `${tooltipX}-${tooltipY}`;
}

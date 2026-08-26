import { createColumnHelper, getCoreRowModel, getPaginationRowModel } from '@tanstack/table-core';
import { type JSX } from 'preact';
import { useMemo } from 'preact/hooks';

import { type ColorScale } from './color-scale-selector';
import {
    FeaturesOverTimeGridDisplay,
    getTooltipPosition,
    ProportionCell,
    styleGridHeader,
} from './features-over-time-grid-shared';
import { type ProportionValue } from '../../query/queryMutationsOverTime';
import { type Map2d } from '../../utils/map2d';
import { type Temporal } from '../../utils/temporalClass';
import { formatSymbol, type CooccurrencePattern } from '../mutationCooccurrence/CooccurrenceOverTimeData';
import { type PageSizes } from '../shared/tanstackTable/pagination';
import { usePageSizeContext } from '../shared/tanstackTable/pagination-context';
import { usePreactTable } from '../shared/tanstackTable/tanstackTable';

type CooccurrenceRowType = {
    pattern: CooccurrencePattern;
    values: (ProportionValue | undefined)[];
};

export interface CooccurrenceOverTimeGridProps {
    data: Map2d<CooccurrencePattern, Temporal, ProportionValue>;
    positions: string[];
    colorScale: ColorScale;
    pageSizes: PageSizes;
    tooltipPortalTarget: HTMLElement | null;
    renderTooltip: (pattern: CooccurrencePattern, temporal: Temporal, value: ProportionValue) => JSX.Element;
}

export function CooccurrenceOverTimeGrid({
    data,
    positions,
    colorScale,
    pageSizes,
    tooltipPortalTarget,
    renderTooltip,
}: CooccurrenceOverTimeGridProps) {
    const tableData = useCooccurrenceTableData(data);
    const columns = useCooccurrenceColumns(
        data.getSecondAxisKeys(),
        positions,
        colorScale,
        tooltipPortalTarget,
        renderTooltip,
    );
    const { pageSize } = usePageSizeContext();

    const table = usePreactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: { pageIndex: 0, pageSize },
        },
    });

    return <FeaturesOverTimeGridDisplay table={table} pageSizes={pageSizes} />;
}

function useCooccurrenceTableData(data: Map2d<CooccurrencePattern, Temporal, ProportionValue>) {
    return useMemo(() => {
        const patterns = data.getFirstAxisKeys();
        return data.getAsArray().map(
            (row, index): CooccurrenceRowType => ({
                pattern: patterns[index],
                values: [...row],
            }),
        );
    }, [data]);
}

function useCooccurrenceColumns(
    dates: Temporal[],
    positions: string[],
    colorScale: ColorScale,
    tooltipPortalTarget: HTMLElement | null,
    renderTooltip: (pattern: CooccurrencePattern, temporal: Temporal, value: ProportionValue) => JSX.Element,
) {
    return useMemo(() => {
        const columnHelper = createColumnHelper<CooccurrenceRowType>();

        const numDateColumns = dates.length;
        const totalColumns = positions.length + numDateColumns;

        const positionColumns = positions.map((pos, posIndex) =>
            columnHelper.accessor((row) => row.pattern.symbols[pos], {
                id: `pos-${posIndex}`,
                size: 20,
                header: () => (
                    <div className='flex justify-center overflow-visible'>
                        <span
                            className='text-nowrap font-mono text-xs'
                            style={{ display: 'block', transform: 'rotate(-60deg)', transformOrigin: 'center center' }}
                        >
                            {formatPosition(pos)}
                        </span>
                    </div>
                ),
                cell: ({ getValue }) => {
                    const symbol = getValue();
                    return (
                        <div
                            className={`text-center font-mono text-xs font-bold ${symbol === null ? 'text-gray-400' : ''}`}
                        >
                            {formatSymbol(symbol)}
                        </div>
                    );
                },
            }),
        );

        const dateColumns = dates.map((date, dateIndex) =>
            columnHelper.accessor((row) => row.values[dateIndex], {
                id: `date-${dateIndex}`,
                header: () => (
                    <div className='@container min-w-[0.05rem]'>
                        <p {...styleGridHeader(dateIndex, numDateColumns)}>{date.dateString}</p>
                    </div>
                ),
                cell: ({ getValue, row, column, table }) => {
                    const valueRaw = getValue();
                    const value = valueRaw ?? null;
                    const rowIndex = row.index;
                    const columnIndex = column.getIndex();
                    const numberOfRows = table.getRowModel().rows.length;

                    const tooltip = renderTooltip(row.original.pattern, date, value);

                    return (
                        <div className='text-center'>
                            <ProportionCell
                                value={value}
                                tooltip={tooltip}
                                tooltipPosition={getTooltipPosition(
                                    rowIndex -
                                        table.getState().pagination.pageIndex * table.getState().pagination.pageSize,
                                    numberOfRows,
                                    columnIndex,
                                    totalColumns,
                                )}
                                colorScale={colorScale}
                                tooltipPortalTarget={tooltipPortalTarget}
                            />
                        </div>
                    );
                },
            }),
        );

        return [...positionColumns, ...dateColumns];
    }, [colorScale, dates, positions, tooltipPortalTarget, renderTooltip]);
}

/**
 * Formats a LAPIS position field name for display.
 * `[501]` (nucleotide position) becomes `501`.
 * `ORF1a[501]` (gene-scoped amino acid position) becomes `ORF1a: 501`.
 */
export function formatPosition(pos: string): string {
    const match = /^([^[]*)\[(\d+)\]$/.exec(pos);
    if (match === null) {
        return pos;
    }
    const [, gene, position] = match;
    return gene === '' ? position : `${gene}: ${position}`;
}

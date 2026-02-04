import { type FunctionComponent, type JSX } from 'preact';
import { useMemo } from 'preact/hooks';
import z from 'zod';

import { type ColorScale, getColorWithinScale, getTextColorForScale } from './color-scale-selector';
import PortalTooltip from './portal-tooltip';
import { type TooltipPosition } from './tooltip';
import { getProportion, type ProportionValue } from '../../query/queryMutationsOverTime';
import { type Temporal } from '../../utils/temporalClass';
import { type TemporalDataMap } from '../mutationsOverTime/MutationOverTimeData';
import { formatProportion } from '../shared/table/formatProportion';
import { type PageSizes, Pagination } from '../shared/tanstackTable/pagination';
import { usePageSizeContext } from '../shared/tanstackTable/pagination-context';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    usePreactTable,
} from '../shared/tanstackTable/tanstackTable';

const NON_BREAKING_SPACE = '\u00A0';

export const customColumnSchema = z.object({
    header: z.string(),
    values: z.record(z.string(), z.union([z.string(), z.number()])),
});
export type CustomColumn = z.infer<typeof customColumnSchema>;

export interface FeatureRenderer<D> {
    asString(value: D): string;
    renderRowLabel(value: D): JSX.Element;
    renderTooltip(value: D, temporal: Temporal, proportionValue: ProportionValue): JSX.Element;
}

export interface FeaturesOverTimeGridProps<F> {
    rowLabelHeader: string;
    data: TemporalDataMap<F>;
    colorScale: ColorScale;
    pageSizes: PageSizes;
    customColumns?: CustomColumn[];
    featureRenderer: FeatureRenderer<F>;
    tooltipPortalTarget: HTMLElement | null;
}

type RowType<F> = {
    feature: F;
    values: (ProportionValue | undefined)[];
    customValues: (string | number | undefined)[];
};

const EMPTY_COLUMNS: CustomColumn[] = [];

function FeaturesOverTimeGrid<F>({
    rowLabelHeader,
    data,
    colorScale,
    pageSizes,
    customColumns = EMPTY_COLUMNS,
    featureRenderer,
    tooltipPortalTarget,
}: FeaturesOverTimeGridProps<F>) {
    const tableData = useMemo(() => {
        const firstAxisKeys = data.getFirstAxisKeys();
        return data.getAsArray().map((row, index): RowType<F> => {
            const firstAxisKey = firstAxisKeys[index];
            const customValues = customColumns.map((col) => col.values[featureRenderer.asString(firstAxisKey)]);
            return { feature: firstAxisKey, values: [...row], customValues };
        });
    }, [data, customColumns, featureRenderer]);

    const columns = useMemo(() => {
        const columnHelper = createColumnHelper<RowType<F>>();
        const dates = data.getSecondAxisKeys();

        const featureHeader = columnHelper.accessor((row) => row.feature, {
            id: 'feature',
            header: () => <span>{rowLabelHeader}</span>,
            cell: ({ getValue }) => featureRenderer.renderRowLabel(getValue()),
        });

        const customColumnHeaders = customColumns.map((customCol, index) => {
            return columnHelper.accessor((row) => row.customValues[index], {
                id: `custom-${index}`,
                header: () => <span>{customCol.header}</span>,
                cell: ({ getValue }) => {
                    const value = getValue();
                    return <div className={'text-center'}>{value ?? ''}</div>;
                },
            });
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
                    const valueRaw = getValue();
                    const value = valueRaw ?? null;
                    const rowIndex = row.index;
                    const columnIndex = column.getIndex();
                    const numberOfRows = table.getRowModel().rows.length;
                    const numberOfColumns = table.getAllColumns().length;

                    if (valueRaw === undefined) {
                        // eslint-disable-next-line no-console -- We want to warn that something might be wrong.
                        console.error(
                            `Found undefined value for ${row.original.feature} - ${date.dateString}. This shouldn't happen.`,
                        );
                    }

                    const tooltip = featureRenderer.renderTooltip(row.original.feature, date, value);

                    return (
                        <div className={'text-center'}>
                            <ProportionCell
                                value={value ?? null}
                                tooltip={tooltip}
                                tooltipPosition={getTooltipPosition(
                                    rowIndex -
                                        table.getState().pagination.pageIndex * table.getState().pagination.pageSize,
                                    numberOfRows,
                                    columnIndex,
                                    numberOfColumns,
                                )}
                                colorScale={colorScale}
                                tooltipPortalTarget={tooltipPortalTarget}
                            />
                        </div>
                    );
                },
            });
        });

        return [featureHeader, ...customColumnHeaders, ...dateHeaders];
    }, [colorScale, data, customColumns, tooltipPortalTarget, featureRenderer, rowLabelHeader]);

    const { pageSize } = usePageSizeContext();
    const table = usePreactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageIndex: 0,
                pageSize,
            },
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
}

function styleGridHeader(columnIndex: number, numDateColumns: number) {
    if (columnIndex === 0) {
        return { className: 'overflow-visible text-nowrap' };
    }

    if (columnIndex === numDateColumns - 1) {
        return { className: 'overflow-visible text-nowrap', style: { direction: 'rtl' } };
    }

    return { className: 'invisible @[6rem]:visible' };
}

function getTooltipPosition(rowIndex: number, rows: number, columnIndex: number, columns: number): TooltipPosition {
    const tooltipX = rowIndex < rows / 2 || rowIndex < 6 ? 'bottom' : 'top';
    const tooltipY = columnIndex < columns / 2 ? 'start' : 'end';
    return `${tooltipX}-${tooltipY}`;
}

const ProportionCell: FunctionComponent<{
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

export default FeaturesOverTimeGrid;

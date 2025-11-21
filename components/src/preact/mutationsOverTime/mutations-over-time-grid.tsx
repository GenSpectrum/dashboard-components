import { type FunctionComponent } from 'preact';
import { useMemo } from 'preact/hooks';
import z from 'zod';

import { type MutationOverTimeDataMap } from './MutationOverTimeData';
import { MutationsOverTimeGridTooltip } from './mutations-over-time-grid-tooltip';
import { getProportion, type MutationOverTimeMutationValue } from '../../query/queryMutationsOverTime';
import { type SequenceType } from '../../types';
import { type Deletion, type Substitution } from '../../utils/mutations';
import { type Temporal } from '../../utils/temporalClass';
import { AnnotatedMutation } from '../components/annotated-mutation';
import { type ColorScale, getColorWithinScale, getTextColorForScale } from '../components/color-scale-selector';
import PortalTooltip from '../components/portal-tooltip';
import { type TooltipPosition } from '../components/tooltip';
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

export interface MutationsOverTimeGridProps {
    data: MutationOverTimeDataMap;
    colorScale: ColorScale;
    sequenceType: SequenceType;
    pageSizes: PageSizes;
    customColumns?: CustomColumn[];
    tooltipPortalTarget: HTMLElement | null;
}

type RowType = {
    mutation: Substitution | Deletion;
    values: (MutationOverTimeMutationValue | undefined)[];
    customValues: (string | number | undefined)[];
};

const EMPTY_COLUMNS: CustomColumn[] = [];

const MutationsOverTimeGrid: FunctionComponent<MutationsOverTimeGridProps> = ({
    data,
    colorScale,
    sequenceType,
    pageSizes,
    customColumns = EMPTY_COLUMNS,
    tooltipPortalTarget,
}) => {
    const tableData = useMemo(() => {
        const allMutations = data.getFirstAxisKeys();
        return data.getAsArray().map((row, index): RowType => {
            const mutation = allMutations[index];
            const customValues = customColumns.map((col) => col.values[mutation.code]);
            return { mutation, values: [...row], customValues };
        });
    }, [data, customColumns]);

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
                                tooltipPortalTarget={tooltipPortalTarget}
                            />
                        </div>
                    );
                },
            });
        });

        return [mutationHeader, ...customColumnHeaders, ...dateHeaders];
    }, [colorScale, data, sequenceType, customColumns, tooltipPortalTarget]);

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

function getTooltipPosition(rowIndex: number, rows: number, columnIndex: number, columns: number): TooltipPosition {
    const tooltipX = rowIndex < rows / 2 || rowIndex < 6 ? 'bottom' : 'top';
    const tooltipY = columnIndex < columns / 2 ? 'start' : 'end';
    return `${tooltipX}-${tooltipY}`;
}

const ProportionCell: FunctionComponent<{
    value: MutationOverTimeMutationValue;
    date: Temporal;
    mutation: Substitution | Deletion;
    tooltipPosition: TooltipPosition;
    colorScale: ColorScale;
    tooltipPortalTarget: HTMLElement | null;
}> = ({ value, mutation, date, tooltipPosition, colorScale, tooltipPortalTarget }) => {
    const proportion = getProportion(value);

    return (
        <div className={'py-1 w-full h-full'}>
            <PortalTooltip
                content={<MutationsOverTimeGridTooltip mutation={mutation} date={date} value={value} />}
                position={tooltipPosition}
                portalTarget={tooltipPortalTarget}
            >
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

export default MutationsOverTimeGrid;

import type { Table } from '@tanstack/table-core';
import z from 'zod'; // eslint-disable-next-line @typescript-eslint/no-explicit-any

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PaginationProps = { table: Table<any> };
export const pageSizesSchema = z.union([z.array(z.number()), z.number()]);
export type PageSizes = z.infer<typeof pageSizesSchema>;

export function Pagination({
    table,
    pageSizes,
}: PaginationProps & {
    pageSizes: PageSizes;
}) {
    return (
        <div className='@container'>
            <div className='flex items-center gap-x-6 gap-y-2 flex-wrap @xl:justify-end justify-center'>
                <PageSizeSelector table={table} pageSizes={pageSizes} />
                <PageIndicator table={table} />
                <div className='@xl:block hidden'>
                    <GotoPageSelector table={table} />
                </div>
                <SelectPageButtons table={table} />
            </div>
        </div>
    );
}

function PageIndicator({ table }: PaginationProps) {
    if (table.getRowModel().rows.length <= 1) {
        return null;
    }

    const minRow = table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1;
    const maxRow = minRow + table.getRowModel().rows.length - 1;
    const numRows = table.getCoreRowModel().rows.length;

    return (
        <span className='text-sm'>
            {minRow} - {maxRow} of {numRows}
        </span>
    );
}

const heightForSmallerLines = 'h-[calc(var(--size)*0.7)]';

function PageSizeSelector({
    table,
    pageSizes,
}: PaginationProps & {
    pageSizes: PageSizes;
}) {
    if (typeof pageSizes === 'number' || pageSizes.length <= 1) {
        return null;
    }

    return (
        <label className='flex items-center'>
            <div className={'text-nowrap text-sm'}>Rows per page:</div>
            <select
                className={`select select-ghost select-sm ${heightForSmallerLines}`}
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                    table.setPageSize(Number(e.currentTarget?.value));
                }}
                aria-label='Select number of rows per page'
            >
                {pageSizes.map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                        {pageSize}
                    </option>
                ))}
            </select>
        </label>
    );
}

function GotoPageSelector({ table }: PaginationProps) {
    if (table.getRowModel().rows.length === 0) {
        return null;
    }

    return (
        <label className='items-center flex'>
            <span className='text-nowrap text-sm'>Go to page:</span>
            <input
                type='number'
                min='1'
                max={table.getPageCount()}
                defaultValue={table.getState().pagination.pageIndex + 1}
                onChange={(e) => {
                    const page = e.currentTarget.value ? Number(e.currentTarget.value) - 1 : 0;
                    table.setPageIndex(page);
                }}
                className={`input input-ghost input-sm ${heightForSmallerLines}`}
                aria-label='Enter page number to go to'
            />
        </label>
    );
}

function SelectPageButtons({ table }: PaginationProps) {
    return (
        <div className={'join'} role='group' aria-label='Pagination controls'>
            <button
                className='btn btn-outline join-item btn-sm'
                onClick={() => table.firstPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label='First page'
            >
                <div className='iconify mdi--chevron-left-first' />
            </button>
            <button
                className='btn btn-outline join-item btn-sm'
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label='Previous page'
            >
                <div className='iconify mdi--chevron-left' />
            </button>
            <button
                className='btn btn-outline join-item btn-sm'
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label='Next page'
            >
                <div className='iconify mdi--chevron-right' />
            </button>
            <button
                className='btn btn-outline join-item btn-sm'
                onClick={() => table.lastPage()}
                disabled={!table.getCanNextPage()}
                aria-label='Last page'
            >
                <div className='iconify mdi--chevron-right-last' />
            </button>
        </div>
    );
}

import type { Table } from '@tanstack/table-core';

type PaginationProps<RowType> = { table: Table<RowType> };

export function Pagination<RowType>({ table }: PaginationProps<RowType>) {
    return (
        <div className='flex items-center gap-4 justify-end flex-wrap'>
            <PageSizeSelector table={table} />
            <PageIndicator table={table} />
            <GotoPageSelector table={table} />
            <SelectPageButtons table={table} />
        </div>
    );
}

function PageIndicator<RowType>({ table }: PaginationProps<RowType>) {
    return (
        <span className='flex items-center gap-1'>
            <div>Page</div>
            <strong>
                {table.getState().pagination.pageIndex + 1} of {table.getPageCount().toLocaleString()}
            </strong>
        </span>
    );
}

function PageSizeSelector<RowType>({ table }: PaginationProps<RowType>) {
    return (
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
    );
}

function GotoPageSelector<RowType>({ table }: PaginationProps<RowType>) {
    return (
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
    );
}

function SelectPageButtons<RowType>({ table }: PaginationProps<RowType>) {
    return (
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
    );
}

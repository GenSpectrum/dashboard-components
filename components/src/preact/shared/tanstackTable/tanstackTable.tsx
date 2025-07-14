import { createTable, type RowData, type TableOptions, type TableOptionsResolved } from '@tanstack/table-core';
import { type ComponentType, type VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { usePageSizeContext } from './pagination-context';

export * from '@tanstack/table-core';

export type Renderable<TProps> = VNode<TProps> | ComponentType<TProps> | undefined | null | string | number | boolean;

/*
 * Adapted from https://github.com/TanStack/table/blob/55ea94863b6b6e6d17bd51ecda61c6a6a1262c88/packages/preact-table/src/FlexRender.tsx
 */
export function flexRender<TProps extends object>(Comp: Renderable<TProps>, props: TProps) {
    return !Comp ? null : typeof Comp === 'function' ? <Comp {...props} /> : Comp;
}

/*
 * Taken from https://github.com/TanStack/table/blob/f7bf6f1adfa4f8b28b9968b29745f2452d4be9d8/packages/react-table/src/index.tsx
 */
export function usePreactTable<TData extends RowData>(options: TableOptions<TData>) {
    const resolvedOptions: TableOptionsResolved<TData> = {
        state: {},
        onStateChange: () => {},
        renderFallbackValue: null,
        ...options,
    };

    const [tableRef] = useState(() => ({
        current: createTable<TData>(resolvedOptions),
    }));

    const [state, setState] = useState(() => tableRef.current.initialState);

    tableRef.current.setOptions((prev) => ({
        ...prev,
        ...options,
        state: {
            ...state,
            ...options.state,
        },
        onStateChange: (updater) => {
            setState(updater);
            options.onStateChange?.(updater);
        },
    }));

    const { pageSize } = usePageSizeContext();
    useEffect(
        () => {
            tableRef.current.setPageSize(pageSize);
        },
        [pageSize], // eslint-disable-line react-hooks/exhaustive-deps -- only run this when the pageSize changes
    );

    return tableRef.current;
}

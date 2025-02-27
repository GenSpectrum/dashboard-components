import { createTable, type RowData, type TableOptions, type TableOptionsResolved } from '@tanstack/table-core';
import { type ComponentType, h, type VNode } from 'preact';
import { useState } from 'preact/hooks';

export * from '@tanstack/table-core';

// Adapted from https://github.com/TanStack/table/blob/55ea94863b6b6e6d17bd51ecda61c6a6a1262c88/packages/preact-table/src/FlexRender.tsx

export type Renderable<TProps> = VNode<TProps> | ComponentType<TProps> | undefined | null | string | number | boolean;

export function flexRender<TProps extends object>(Comp: Renderable<TProps>, props: TProps) {
    return !Comp ? null : typeof Comp === 'function' ? <Comp {...props} /> : Comp;
}

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

    return tableRef.current;
}

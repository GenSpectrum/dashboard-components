import { Grid } from 'gridjs';
import { type OneDArray, type TColumn, type TData } from 'gridjs/dist/src/types';
import { type ComponentChild } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

import 'gridjs/dist/theme/mermaid.css';

export const tableStyle = {
    table: {
        fontSize: '12px',
    },
    th: {
        padding: '4px',
        textAlign: 'center',
    },
    td: {
        textAlign: 'center',
        padding: '8px',
    },
    footer: {
        fontSize: '12px',
    },
};

export interface TableProps {
    data: TData;
    columns: OneDArray<TColumn | string | ComponentChild>;
    pageSize: number | boolean;
}

export const Table = ({ data, columns, pageSize }: TableProps) => {
    const pagination = typeof pageSize === 'number' ? { limit: pageSize } : pageSize;

    const wrapper = useRef(null);

    useEffect(() => {
        if (wrapper.current === null) {
            return;
        }
        const grid = new Grid({
            columns,
            data,
            style: tableStyle,
            pagination,
        }).render(wrapper.current);

        return () => {
            grid.destroy();
        };
    });

    return <div ref={wrapper} />;
};
